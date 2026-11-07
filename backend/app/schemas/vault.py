from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class FileMetadataResponse(BaseModel):
    id: str
    original_filename: str
    stored_filename: str
    file_type: str
    file_size: int
    encrypted_size: int
    category: str
    encryption_algorithm: str
    nonce: str
    authentication_tag: str
    sha256_hash: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VaultSummaryResponse(BaseModel):
    total_files: int
    total_storage_bytes: int
    total_operations: int
    recent_files: List[FileMetadataResponse]
