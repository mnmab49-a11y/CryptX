from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.services.activity_service import ActivityService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    existing = AuthService.get_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = AuthService.register(
        db,
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
    )

    ActivityService.log_activity(
        db,
        user_id=user.id,
        operation_type="REGISTER",
        resource_name=user.email,
        details="User account successfully created",
        ip_address=request.client.host if request.client else None,
    )

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }

@router.post("/login", response_model=Token)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = AuthService.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    ActivityService.log_activity(
        db,
        user_id=user.id,
        operation_type="LOGIN",
        resource_name=user.email,
        details="Successful login",
        ip_address=request.client.host if request.client else None,
    )

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
