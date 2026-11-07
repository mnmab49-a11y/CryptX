from datetime import datetime
from typing import Optional
import re
from pydantic import BaseModel, Field, ConfigDict, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

class UserBase(BaseModel):
    email: str
    full_name: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if not EMAIL_REGEX.match(v_clean):
            raise ValueError("Invalid email address format")
        return v_clean

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v_clean = v.strip().lower()
        if not EMAIL_REGEX.match(v_clean):
            raise ValueError("Invalid email address format")
        return v_clean

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
