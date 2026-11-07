from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/me", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.full_name:
        current_user.full_name = payload.full_name.strip()

    if payload.email and payload.email.lower() != current_user.email:
        # Check if new email is taken
        existing = db.query(User).filter(User.email == payload.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another account.",
            )
        current_user.email = payload.email.lower().strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    ActivityService.log_activity(
        db,
        user_id=current_user.id,
        operation_type="UPDATE_PROFILE",
        resource_name=current_user.email,
        details="User profile information updated",
    )

    return current_user

@router.post("/me/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long.",
        )

    current_user.password_hash = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()

    ActivityService.log_activity(
        db,
        user_id=current_user.id,
        operation_type="PASSWORD_CHANGE",
        resource_name=current_user.email,
        details="Password successfully changed",
    )

    return {"message": "Password changed successfully."}
