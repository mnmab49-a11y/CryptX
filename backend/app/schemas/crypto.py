from typing import Optional
from pydantic import BaseModel, Field

class TextEncryptRequest(BaseModel):
    plaintext: str = Field(..., min_length=1)
    algorithm: str = Field("AES-256-GCM")
    custom_key: Optional[str] = Field(None, description="Optional user-provided custom passphrase/key")

class TextEncryptResponse(BaseModel):
    version: str = "1.0"
    algorithm: str = "AES-256-GCM"
    key_mode: str = "server" # "server" or "custom"
    ciphertext: str       # base64 encoded ciphertext
    nonce: str            # base64 encoded nonce/IV
    tag: str              # base64 encoded authentication tag
    wrapped_dek: Optional[str] = None # base64 encoded KEK-wrapped DEK (if server mode)
    salt: Optional[str] = None        # base64 encoded salt (if custom key mode)
    sha256_hash: str      # hex SHA-256 of plaintext

class TextDecryptRequest(BaseModel):
    ciphertext: str       # base64 encoded
    nonce: str            # base64 encoded
    tag: str              # base64 encoded
    wrapped_dek: Optional[str] = None # base64 encoded wrapped DEK
    algorithm: Optional[str] = "AES-256-GCM"
    custom_key: Optional[str] = None
    salt: Optional[str] = None

class TextDecryptResponse(BaseModel):
    plaintext: str
    sha256_hash: str
    verified: bool = True
