import os
import base64
import pytest
from pydantic import ValidationError
from app.core.config import Settings
from app.core.security import get_master_key

def test_config_rejects_missing_jwt_secret():
    """Verify that omitting JWT_SECRET_KEY fails startup with ValidationError."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            _env_file=None,
            JWT_SECRET_KEY="",
            CRYPTX_MASTER_KEY="Q3J5cHRYLVRlc3QtTWFzdGVyLUtFSy0zMkJ5dGVzISE=",
        )
    assert "JWT_SECRET_KEY" in str(exc_info.value)

def test_config_rejects_short_jwt_secret():
    """Verify that a JWT_SECRET_KEY shorter than 32 characters is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            _env_file=None,
            JWT_SECRET_KEY="too-short-secret-key",
            CRYPTX_MASTER_KEY="Q3J5cHRYLVRlc3QtTWFzdGVyLUtFSy0zMkJ5dGVzISE=",
        )
    assert "minimum length of 32 characters" in str(exc_info.value)

def test_config_rejects_missing_master_key():
    """Verify that omitting CRYPTX_MASTER_KEY fails startup."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            _env_file=None,
            JWT_SECRET_KEY="cryptx-valid-secret-key-that-is-at-least-32-chars-long",
            CRYPTX_MASTER_KEY="",
        )
    assert "CRYPTX_MASTER_KEY" in str(exc_info.value)

def test_config_rejects_invalid_base64_master_key():
    """Verify that non-base64 string for master key is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            _env_file=None,
            JWT_SECRET_KEY="cryptx-valid-secret-key-that-is-at-least-32-chars-long",
            CRYPTX_MASTER_KEY="!!!NotValidBase64String!!!",
        )
    assert "valid Base64-encoded" in str(exc_info.value)

def test_config_rejects_non_32_byte_master_key():
    """Verify that a master key decoding to 16 bytes (128-bit) instead of 32 bytes (256-bit) is rejected."""
    sixteen_bytes = base64.b64encode(b"16-bytes-key!!!!").decode()
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            _env_file=None,
            JWT_SECRET_KEY="cryptx-valid-secret-key-that-is-at-least-32-chars-long",
            CRYPTX_MASTER_KEY=sixteen_bytes,
        )
    assert "exactly 32 bytes" in str(exc_info.value)

def test_config_valid_keys_succeed():
    """Verify that compliant 32+ char JWT secret and 32-byte Base64 KEK succeed."""
    valid_kek = base64.b64encode(b"ValidMasterKEK32BytesLongKey!202").decode()
    cfg = Settings(
        _env_file=None,
        JWT_SECRET_KEY="a" * 32,
        CRYPTX_MASTER_KEY=valid_kek,
    )
    assert len(cfg.JWT_SECRET_KEY) == 32
    assert cfg.CRYPTX_MASTER_KEY == valid_kek

def test_get_master_key_returns_32_bytes():
    """Verify get_master_key returns exact 32 bytes for current settings."""
    kek = get_master_key()
    assert isinstance(kek, bytes)
    assert len(kek) == 32
