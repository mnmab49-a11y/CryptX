from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash, verify_password

class AuthService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def register(db: Session, full_name: str, email: str, password: str) -> User:
        user = User(
            full_name=full_name.strip(),
            email=email.lower().strip(),
            password_hash=get_password_hash(password),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = AuthService.get_by_email(db, email)
        if not user or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
