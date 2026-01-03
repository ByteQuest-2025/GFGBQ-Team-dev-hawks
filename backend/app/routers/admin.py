from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

from pydantic import BaseModel

class AssignRequest(BaseModel):
    officer_id: int

@router.patch("/grievance/{grievance_id}/assign", response_model=schemas.Grievance)
def assign_grievance(
    grievance_id: int,
    assign_request: AssignRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify admin
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    db_grievance = db.query(models.Grievance).filter(models.Grievance.id == grievance_id).first()
    if not db_grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    officer = db.query(models.User).filter(models.User.id == assign_request.officer_id).first()
    if not officer or officer.role != models.UserRole.FIELD_OFFICER:
        raise HTTPException(status_code=400, detail="Invalid officer selected")

    # Enforce matching rules
    # If grievance has a department, it must match officer's department
    if db_grievance.department_id and officer.department_id != db_grievance.department_id:
        raise HTTPException(status_code=400, detail="Officer department does not match grievance department")
    
    # State and District Check
    if db_grievance.state and officer.state and db_grievance.state != officer.state:
        raise HTTPException(status_code=400, detail="Officer state does not match grievance state")
        
    if db_grievance.district and officer.district and db_grievance.district != officer.district:
        raise HTTPException(status_code=400, detail="Officer district does not match grievance district")

    # Legacy Region Check (fallback)
    if (not db_grievance.state or not officer.state) and (not db_grievance.district or not officer.district):
        if db_grievance.region_id and officer.region_id and officer.region_id != db_grievance.region_id:
            raise HTTPException(status_code=400, detail="Officer region does not match grievance region")
        elif db_grievance.region_code and officer.region_code and officer.region_code != db_grievance.region_code:
            # Fallback to code if ID not present
            raise HTTPException(status_code=400, detail="Officer region does not match grievance region")

    db_grievance.assignee_id = officer.id
    db_grievance.status = models.GrievanceStatus.ASSIGNED
    
    # Update department if it was missing
    if not db_grievance.department_id:
        db_grievance.department_id = officer.department_id

    # Timeline
    db_timeline = models.Timeline(
        grievance_id=db_grievance.id,
        status=models.GrievanceStatus.ASSIGNED,
        remark=f"Assigned to {officer.full_name}"
    )
    db.add(db_timeline)

    db.commit()
    db.refresh(db_grievance)
    return db_grievance

from sqlalchemy import func, desc

@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    total = db.query(models.Grievance).count()
    open_count = db.query(models.Grievance).filter(models.Grievance.status != models.GrievanceStatus.RESOLVED).count()
    resolved_count = db.query(models.Grievance).filter(models.Grievance.status == models.GrievanceStatus.RESOLVED).count()
    critical_count = db.query(models.Grievance).filter(models.Grievance.priority == models.Priority.CRITICAL).count()
    
    # Calculate hotspots
    # Group by District and State for grievances that are NOT resolved
    hotspots_query = (
        db.query(
            models.Grievance.district,
            models.Grievance.state,
            func.count(models.Grievance.id).label("count")
        )
        .filter(models.Grievance.status != models.GrievanceStatus.RESOLVED)
        .filter(models.Grievance.district != None)
        .group_by(models.Grievance.district, models.Grievance.state)
        .order_by(desc("count"))
        .limit(4)
        .all()
    )

    top_hotspots = [
        {"name": f"{h.district}, {h.state}" if h.state else h.district, "count": h.count}
        for h in hotspots_query
    ]

    return {
        "total_grievances": total,
        "open_grievances": open_count,
        "resolved_grievances": resolved_count,
        "critical_grievances": critical_count,
        "top_hotspots": top_hotspots
    }

@router.get("/officers", response_model=List[schemas.User])
def get_officers(
    department_id: Optional[int] = None,
    region_id: Optional[int] = None,
    region_code: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = db.query(models.User).filter(models.User.role == models.UserRole.FIELD_OFFICER)
    
    if department_id:
        query = query.filter(models.User.department_id == department_id)
        
    if region_id:
        query = query.filter(models.User.region_id == region_id)
        
    if region_code:
        query = query.filter(models.User.region_code == region_code)

    if state:
        query = query.filter(models.User.state == state)

    if district:
        query = query.filter(models.User.district == district)

    return query.all()



@router.patch("/grievance/{grievance_id}/verify", response_model=schemas.Grievance)
def verify_grievance(
    grievance_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_grievance = db.query(models.Grievance).filter(models.Grievance.id == grievance_id).first()
    if not db_grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
        
    if db_grievance.status != models.GrievanceStatus.PENDING_VERIFICATION:
        raise HTTPException(status_code=400, detail="Grievance is not pending verification")
        
    db_grievance.status = models.GrievanceStatus.RESOLVED
    
    # Timeline
    db_timeline = models.Timeline(
        grievance_id=db_grievance.id,
        status=models.GrievanceStatus.RESOLVED,
        remark="Resolution verified by Admin"
    )
    db.add(db_timeline)
    
    db.commit()
    db.refresh(db_grievance)
    return db_grievance

class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    weight: float
    count: int

@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap_data(db: Session = Depends(database.get_db)):
    """
    Get grievance locations for heatmap visualization.
    Returns aggregated data points with coordinates and weights.
    """
    grievances = db.query(models.Grievance).filter(
        models.Grievance.region_id.isnot(None)
    ).all()
    
    # Group by region and aggregate
    region_data = {}
    for g in grievances:
        if g.region and g.region.lat and g.region.lng:
            region_key = f"{g.region.lat},{g.region.lng}"
            if region_key not in region_data:
                region_data[region_key] = {
                    "lat": g.region.lat,
                    "lng": g.region.lng,
                    "count": 0,
                    "total_severity": 0.0
                }
            region_data[region_key]["count"] += 1
            if g.severity_ai:
                region_data[region_key]["total_severity"] += g.severity_ai
    
    # Convert to heatmap points
    heatmap_points = []
    for key, data in region_data.items():
        weight = data["total_severity"] / data["count"] if data["count"] > 0 else 0.5
        heatmap_points.append(HeatmapPoint(
            lat=data["lat"],
            lng=data["lng"],
            weight=weight,
            count=data["count"]
        ))
    
    return heatmap_points