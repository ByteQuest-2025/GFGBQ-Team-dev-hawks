from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    CITIZEN = "Citizen"
    FIELD_OFFICER = "FieldOfficer"
    ADMIN = "Admin"
    ZONAL_OFFICER = "ZonalOfficer"
    POLICY_MAKER = "PolicyMaker"
    AUDITOR = "Auditor"

class GrievanceStatus(str, Enum):
    NEW = "New"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    PENDING_VERIFICATION = "Pending Verification"
    RESOLVED = "Resolved"
    CLOSED = "Closed"
    ESCALATED = "Escalated"
    REJECTED = "Rejected"
    SPAM = "Spam"

class Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.CITIZEN
    department_id: Optional[int] = None
    region_code: Optional[str] = None
    region_id: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None

class FeedbackBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    grievance_id: int

class Feedback(FeedbackBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MediaBase(BaseModel):
    url: str
    type: str

class Media(MediaBase):
    id: int
    grievance_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TimelineBase(BaseModel):
    status: str
    remark: Optional[str] = None

class Timeline(TimelineBase):
    id: int
    grievance_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Department(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True

class Region(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True

class GrievanceBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    region_code: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    image_url: Optional[str] = None
    privacy_consent: bool = False

class GrievanceCreate(GrievanceBase):
    pass

class Grievance(GrievanceBase):
    id: int
    citizen_id: int
    department_id: Optional[int] = None
    assignee_id: Optional[int] = None
    region_id: Optional[int] = None
    status: GrievanceStatus
    priority: Priority
    category: Optional[str] = None
    
    # AI Fields
    category_ai: Optional[str] = None
    severity_ai: Optional[float] = None
    is_spam: bool = False
    
    created_at: datetime
    sentiment_score: Optional[float] = None
    ai_summary: Optional[str] = None
    feedback: Optional[Feedback] = None
    timeline: List[Timeline] = []
    media: List[Media] = []

    class Config:
        from_attributes = True

class Hotspot(BaseModel):
    name: str
    count: int

class DashboardStats(BaseModel):
    total_grievances: int
    open_grievances: int
    resolved_grievances: int
    critical_grievances: int
    top_hotspots: List[Hotspot] = []

class DepartmentBase(BaseModel):
    name: str
    code: str

class Department(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

class RegionBase(BaseModel):
    name: str
    code: str

class Region(RegionBase):
    id: int

    class Config:
        from_attributes = True
