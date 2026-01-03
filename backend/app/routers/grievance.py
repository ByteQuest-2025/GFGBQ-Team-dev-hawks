from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
from .. import models, schemas, database, auth
from ..services.ai_service import AIService

router = APIRouter(
    prefix="/grievance",
    tags=["grievance"]
)

@router.post("/", response_model=schemas.Grievance)
def create_grievance(
    title: str = Form(...),
    description: str = Form(...),
    location: Optional[str] = Form(None),
    region_code: Optional[str] = Form(None),
    privacy_consent: bool = Form(False),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # AI Classification
    ai_result = AIService.classify_grievance(title, description)
    
    # Priority mapping
    severity = ai_result["severity_score"]
    if severity >= 0.8:
        priority = models.Priority.CRITICAL
    elif severity >= 0.6:
        priority = models.Priority.HIGH
    elif severity >= 0.4:
        priority = models.Priority.MEDIUM
    else:
        priority = models.Priority.LOW

    # Department Suggestion
    dept_code = AIService.suggest_department(ai_result["category"])
    department = db.query(models.Department).filter(models.Department.code == dept_code).first()
    department_id = department.id if department else None

    # Create Grievance
    db_grievance = models.Grievance(
        title=title,
        description=description,
        citizen_id=current_user.id,
        department_id=department_id,
        assignee_id=None,
        status=models.GrievanceStatus.NEW,
        priority=priority,
        category=ai_result["category"],
        category_ai=ai_result["category"],
        severity_ai=severity,
        is_spam=ai_result["is_spam"],
        ai_summary=ai_result["summary"],
        location=location,
        region_code=region_code,
        privacy_consent=privacy_consent
    )
    
    db.add(db_grievance)
    db.flush() # To get ID

    # Handle Image
    if image:
        file_extension = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_url = f"/uploads/{filename}"
        db_grievance.image_url = image_url # Keep legacy field for now
        
        db_media = models.Media(
            grievance_id=db_grievance.id,
            url=image_url,
            uploader_id=current_user.id,
            type="image"
        )
        db.add(db_media)

    # Create Initial Timeline
    db_timeline = models.Timeline(
        grievance_id=db_grievance.id,
        status=models.GrievanceStatus.NEW,
        remark="Grievance submitted by citizen"
    )
    db.add(db_timeline)

    db.commit()
    db.refresh(db_grievance)
    return db_grievance

from pydantic import BaseModel

class StatusUpdate(BaseModel):
    status: models.GrievanceStatus

@router.patch("/{grievance_id}/status", response_model=schemas.Grievance)
def update_grievance_status(
    grievance_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_grievance = db.query(models.Grievance).filter(models.Grievance.id == grievance_id).first()
    if not db_grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    # Authorization
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.FIELD_OFFICER]:
        raise HTTPException(status_code=403, detail="Not authorized to update status")
        
    if current_user.role == models.UserRole.FIELD_OFFICER and db_grievance.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this grievance")

    old_status = db_grievance.status
    db_grievance.status = status_update.status
    
    # Timeline
    if old_status != status_update.status:
        db_timeline = models.Timeline(
            grievance_id=db_grievance.id,
            status=status_update.status,
            remark=f"Status updated from {old_status} to {status_update.status} by {current_user.role}"
        )
        db.add(db_timeline)

    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@router.post("/{grievance_id}/feedback", response_model=schemas.Feedback)
def create_feedback(grievance_id: int, feedback: schemas.FeedbackCreate, db: Session = Depends(database.get_db)):
    db_grievance = db.query(models.Grievance).filter(models.Grievance.id == grievance_id).first()
    if not db_grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    if db_grievance.status != models.GrievanceStatus.RESOLVED:
         raise HTTPException(status_code=400, detail="Can only give feedback on resolved grievances")

    db_feedback = models.Feedback(
        grievance_id=grievance_id,
        rating=feedback.rating,
        comment=feedback.comment
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.put("/{grievance_id}/resolve", response_model=schemas.Grievance)
def resolve_grievance(
    grievance_id: int, 
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_grievance = db.query(models.Grievance).filter(models.Grievance.id == grievance_id).first()
    if not db_grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    db_grievance.status = models.GrievanceStatus.PENDING_VERIFICATION
    
    if image:
        file_extension = image.filename.split(".")[-1]
        filename = f"resolution-{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/{filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        # Add to Media
        db_media = models.Media(
            grievance_id=db_grievance.id,
            url=f"/uploads/{filename}",
            uploader_id=current_user.id,
            type="resolution_image"
        )
        db.add(db_media)

    # Timeline
    db_timeline = models.Timeline(
        grievance_id=db_grievance.id,
        status=models.GrievanceStatus.PENDING_VERIFICATION,
        remark="Grievance resolution submitted for verification"
    )
    db.add(db_timeline)

    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@router.get("/assigned/me", response_model=List[schemas.Grievance])
def read_assigned_grievances(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    grievances = db.query(models.Grievance).filter(models.Grievance.assignee_id == current_user.id).all()
    return grievances

@router.get("/my", response_model=List[schemas.Grievance])
def read_my_grievances(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    grievances = db.query(models.Grievance).filter(models.Grievance.citizen_id == current_user.id).all()
    return grievances

@router.get("/{grievance_id}", response_model=schemas.Grievance)
def read_grievance(grievance_id: int, db: Session = Depends(database.get_db)):
    db_grievance = db.query(models.Grievance).filter(models.Grievance.id == grievance_id).first()
    if db_grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return db_grievance

@router.get("/", response_model=List[schemas.Grievance])
def read_grievances(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Grievance)
    if status:
        query = query.filter(models.Grievance.status == status)
    
    grievances = query.offset(skip).limit(limit).all()
    return grievances
