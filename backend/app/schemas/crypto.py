from pydantic import BaseModel, Field

class TextEncryptRequest(BaseModel):
    plaintext: str = Field(..., min_length=1)
    algorithm: str = Field("AES-256-GCM")

class TextEncryptResponse(BaseModel):
    version: str = "1.0"
    ciphertext: str       # base64 encoded ciphertext
    nonce: str            # base64 encoded 96-bit nonce
    tag: str              # base64 encoded 128-bit authentication tag
    wrapped_dek: str      # base64 encoded KEK-wrapped DEK
    algorithm: str = "AES-256-GCM"
    sha256_hash: str      # hex SHA-256 of plaintext

class TextDecryptRequest(BaseModel):
    ciphertext: str       # base64 encoded
    nonce: str            # base64 encoded
    tag: str              # base64 encoded
    wrapped_dek: str      # base64 encoded wrapped DEK

class TextDecryptResponse(BaseModel):
    plaintext: str
    sha256_hash: str
    verified: bool = True
