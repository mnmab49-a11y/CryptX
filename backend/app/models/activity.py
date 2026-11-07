import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    operation_type = Column(String(50), nullable=False) # ENCRYPT_TEXT, DECRYPT_TEXT, ENCRYPT_FILE, etc.
    resource_name = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False, default="SUCCESS") # SUCCESS, FAILED
    details = Column(String(512), nullable=True)
    ip_address = Column(String(45), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="activities")
