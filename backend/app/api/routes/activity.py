from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.activity import ActivityListResponse
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activity", tags=["Audit & Activity Logs"])

@router.get("", response_model=ActivityListResponse)
def get_user_activity(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = ActivityService.get_activities(db, user_id=current_user.id, limit=limit, offset=skip)
    return {
        "items": items,
        "total": total,
    }
