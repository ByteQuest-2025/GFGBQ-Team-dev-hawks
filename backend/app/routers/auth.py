from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = auth.get_password_hash(user.password)
        
        # Convert role to string if it's an enum
        role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
        
        new_user = models.User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=role_value,
            department_id=user.department_id,
            region_id=user.region_id,
            region_code=user.region_code
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create account: {str(e)}")

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}
