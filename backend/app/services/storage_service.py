import os
import uuid
from pathlib import Path
from typing import BinaryIO
from app.core.config import settings

class StorageService:
    def __init__(self, base_dir: str = settings.STORAGE_DIR):
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_safe_path(self, filename: str) -> Path:
        """Resolve path and guard against directory traversal attacks."""
        resolved = (self.base_dir / filename).resolve()
        if not str(resolved).startswith(str(self.base_dir)):
            raise ValueError("Invalid storage path: traversal attempt detected")
        return resolved

    def save_file(self, data: bytes, suffix: str = ".enc") -> str:
        """
        Save binary data to a unique stored filename.
        Returns the stored_filename (e.g. 'c2b4e8...enc').
        """
        stored_filename = f"{uuid.uuid4().hex}{suffix}"
        file_path = self._resolve_safe_path(stored_filename)
        with open(file_path, "wb") as f:
            f.write(data)
        return stored_filename

    def read_file(self, stored_filename: str) -> bytes:
        """Read binary data from stored filename."""
        file_path = self._resolve_safe_path(stored_filename)
        if not file_path.exists():
            raise FileNotFoundError(f"Stored file {stored_filename} not found")
        with open(file_path, "rb") as f:
            return f.read()

    def delete_file(self, stored_filename: str) -> bool:
        """Delete stored file from disk."""
        try:
            file_path = self._resolve_safe_path(stored_filename)
            if file_path.exists():
                file_path.unlink()
                return True
        except Exception:
            pass
        return False

storage_service = StorageService()
