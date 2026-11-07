import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class EncryptedFile(Base):
    __tablename__ = "encrypted_files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True, index=True)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)           # original plaintext size in bytes
    encrypted_size = Column(Integer, nullable=False)      # encrypted ciphertext size in bytes
    category = Column(String(50), nullable=False, default="file") # file, image, document

    # Cryptographic Metadata
    encryption_algorithm = Column(String(50), nullable=False, default="AES-256-GCM")
    nonce = Column(String(64), nullable=False)            # base64 encoded 12-byte (96-bit) IV/nonce
    authentication_tag = Column(String(64), nullable=False) # base64 encoded 16-byte (128-bit) GCM tag
    wrapped_dek = Column(String(128), nullable=False)     # base64 encoded KEK-wrapped 256-bit DEK
    sha256_hash = Column(String(64), nullable=False)      # SHA-256 hex digest of plaintext

    storage_path = Column(String(512), nullable=False)    # relative or absolute path on disk

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="encrypted_files")
