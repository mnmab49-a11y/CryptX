from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import base64
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from cryptography.hazmat.primitives.keywrap import aes_key_wrap, aes_key_unwrap, InvalidUnwrap

from app.core.config import settings

# Argon2id password hasher
pwd_hasher = PasswordHasher()

def get_password_hash(password: str) -> str:
    """Hash password using Argon2id."""
    return pwd_hasher.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against Argon2id hash."""
    try:
        return pwd_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.PyJWTError:
        return None

def get_master_key() -> bytes:
    """Get the 32-byte (256-bit) Master Key Encryption Key (KEK)."""
    try:
        raw = base64.b64decode(settings.CRYPTX_MASTER_KEY, validate=True)
    except Exception as e:
        raise ValueError("Invalid Base64 format for CRYPTX_MASTER_KEY") from e

    if len(raw) != 32:
        raise ValueError(
            f"CRYPTX_MASTER_KEY must be exactly 32 bytes (256-bit), received {len(raw)} bytes"
        )
    return raw

def wrap_dek(dek: bytes) -> bytes:
    """
    Wrap a 256-bit DEK using the Server Master KEK via NIST AES Key Wrap (RFC 3394).
    Returns wrapped DEK bytes (40 bytes for a 32-byte input).
    """
    kek = get_master_key()
    return aes_key_wrap(kek, dek)

def unwrap_dek(wrapped_dek: bytes) -> bytes:
    """
    Unwrap a wrapped DEK using the Server Master KEK.
    Raises InvalidUnwrap if integrity verification fails.
    """
    kek = get_master_key()
    return aes_key_unwrap(kek, wrapped_dek)
