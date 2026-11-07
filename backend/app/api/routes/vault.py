from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.encrypted_file import EncryptedFile
from app.models.activity import Activity
from app.schemas.vault import FileMetadataResponse, VaultSummaryResponse
from app.services.storage_service import storage_service
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/vault", tags=["Vault"])

@router.get("/files", response_model=List[FileMetadataResponse])
def list_files(
    category: Optional[str] = Query(None, description="Filter by category (file, image, document)"),
    search: Optional[str] = Query(None, description="Search by original filename"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(EncryptedFile).filter(EncryptedFile.user_id == current_user.id)

    if category and category.lower() != "all":
        query = query.filter(EncryptedFile.category == category.lower())

    if search:
        query = query.filter(EncryptedFile.original_filename.ilike(f"%{search}%"))

    return query.order_by(EncryptedFile.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/files/{file_id}", response_model=FileMetadataResponse)
def get_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(EncryptedFile).filter(
        EncryptedFile.id == file_id,
        EncryptedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return db_file

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(EncryptedFile).filter(
        EncryptedFile.id == file_id,
        EncryptedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Delete physical ciphertext file from storage
    storage_service.delete_file(db_file.stored_filename)

    filename = db_file.original_filename
    db.delete(db_file)
    db.commit()

    ActivityService.log_activity(
        db,
        user_id=current_user.id,
        operation_type="DELETE_FILE",
        resource_name=filename,
        details="Encrypted file and metadata deleted from vault",
        ip_address=request.client.host if request.client else None,
    )
    return None

@router.get("/summary", response_model=VaultSummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total files
    total_files = db.query(func.count(EncryptedFile.id)).filter(
        EncryptedFile.user_id == current_user.id
    ).scalar() or 0

    # Total storage used (in bytes)
    total_storage = db.query(func.sum(EncryptedFile.encrypted_size)).filter(
        EncryptedFile.user_id == current_user.id
    ).scalar() or 0

    # Total activities / operations
    total_ops = db.query(func.count(Activity.id)).filter(
        Activity.user_id == current_user.id
    ).scalar() or 0

    # Recent files (top 5)
    recent = db.query(EncryptedFile).filter(
        EncryptedFile.user_id == current_user.id
    ).order_by(EncryptedFile.created_at.desc()).limit(5).all()

    return {
        "total_files": total_files,
        "total_storage_bytes": int(total_storage),
        "total_operations": total_ops,
        "recent_files": recent,
    }
