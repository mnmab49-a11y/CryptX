from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.activity import Activity

class ActivityService:
    @staticmethod
    def log_activity(
        db: Session,
        user_id: str,
        operation_type: str,
        resource_name: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Activity:
        """Create and persist an activity log entry."""
        activity = Activity(
            user_id=user_id,
            operation_type=operation_type,
            resource_name=resource_name,
            status=status,
            details=details,
            ip_address=ip_address,
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_activities(
        db: Session,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Activity], int]:
        """Fetch paginated activity log entries for a user."""
        query = db.query(Activity).filter(Activity.user_id == user_id).order_by(Activity.created_at.desc())
        total = query.count()
        items = query.offset(offset).limit(limit).all()
        return items, total
