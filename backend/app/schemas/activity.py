from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class ActivityResponse(BaseModel):
    id: str
    operation_type: str
    resource_name: Optional[str] = None
    status: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ActivityListResponse(BaseModel):
    items: List[ActivityResponse]
    total: int
