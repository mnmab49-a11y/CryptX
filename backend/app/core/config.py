import os
import base64
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CryptX Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security & JWT (Strictly Required - No Insecure Defaults)
    JWT_SECRET_KEY: str = Field(
        ...,
        description="Cryptographic secret key for signing JWT tokens. Minimum length 32 characters.",
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Master Key Encryption Key (KEK) (Strictly Required - No Insecure Defaults)
    CRYPTX_MASTER_KEY: str = Field(
        ...,
        description="Master Key Encryption Key (KEK). Must be exactly 32 bytes (256-bit) Base64 encoded.",
    )

    # Database
    DATABASE_URL: str = "sqlite:///./cryptx.db"

    # Storage
    STORAGE_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "storage",
        "uploads",
    )
    MAX_UPLOAD_SIZE_MB: int = 50

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret_key(cls, v: str) -> str:
        if not v or len(v.strip()) < 32:
            raise ValueError(
                "JWT_SECRET_KEY is required and must have a minimum length of 32 characters."
            )
        return v.strip()

    @field_validator("CRYPTX_MASTER_KEY")
    @classmethod
    def validate_master_key(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("CRYPTX_MASTER_KEY is required and cannot be empty.")
        clean_v = v.strip()
        try:
            decoded = base64.b64decode(clean_v, validate=True)
        except Exception as e:
            raise ValueError(
                "CRYPTX_MASTER_KEY must be a valid Base64-encoded string."
            ) from e
        if len(decoded) != 32:
            raise ValueError(
                f"CRYPTX_MASTER_KEY must decode to exactly 32 bytes (256 bits). Received {len(decoded)} bytes."
            )
        return clean_v

    @property
    def cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            clean = self.CORS_ORIGINS.strip()
            if clean.startswith("[") and clean.endswith("]"):
                import json
                try:
                    return json.loads(clean)
                except Exception:
                    pass
            return [origin.strip() for origin in clean.split(",") if origin.strip()]
        return ["http://localhost:5173"]

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()
