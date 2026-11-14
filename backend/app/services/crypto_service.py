import os
import base64
import hashlib
from typing import Tuple, Dict, Any, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.keywrap import InvalidUnwrap

from app.core.security import wrap_dek, unwrap_dek

class CryptographicError(Exception):
    """Base exception for cryptographic failures."""
    pass

class CryptographicIntegrityError(CryptographicError):
    """Raised when authentication tag or key unwrap integrity check fails (tampering/corruption)."""
    pass

class CryptoService:
    CHUNK_SIZE: int = 64 * 1024  # 64 KiB chunk size for streaming encryption
    MAGIC_HEADER: bytes = b"CPTX"  # CryptX unified container signature
    CONTAINER_VERSION: int = 1     # Version 1.0 container format

    @staticmethod
    def calculate_sha256(data: bytes) -> str:
        """Compute SHA-256 hex digest of data."""
        hasher = hashlib.sha256()
        hasher.update(data)
        return hasher.hexdigest()

    @staticmethod
    def encrypt_bytes(
        data: bytes,
        associated_data: Optional[bytes] = None,
    ) -> Dict[str, Any]:
        """
        Encrypt arbitrary bytes using AES-256-GCM with optional Associated Authenticated Data (AAD).
        - Generates fresh 256-bit DEK
        - Generates fresh 96-bit (12-byte) random nonce
        - Authenticated encryption produces ciphertext + 128-bit tag
        - Binds associated_data (AAD) into AEAD tag to prevent metadata tampering
        - Wraps DEK using server Master KEK (NIST RFC 3394 AES Key Wrap)
        - Computes SHA-256 checksum of plaintext
        - Zeroizes raw ephemeral DEK
        """
        # 1. Generate unique 256-bit DEK per operation
        dek = AESGCM.generate_key(bit_length=256)

        try:
            # 2. Generate random 96-bit nonce
            nonce = os.urandom(12)

            # 3. Encrypt data with AES-256-GCM (binding AAD if provided)
            aesgcm = AESGCM(dek)
            ct_and_tag = aesgcm.encrypt(nonce, data, associated_data)

            ciphertext = ct_and_tag[:-16]
            tag = ct_and_tag[-16:]

            # 4. Wrap DEK with Server Master KEK (RFC 3394)
            wrapped_dek = wrap_dek(dek)

            # 5. Compute SHA-256 integrity hash of original data
            sha256_hash = CryptoService.calculate_sha256(data)

            return {
                "ciphertext_bytes": ciphertext,
                "nonce_bytes": nonce,
                "tag_bytes": tag,
                "wrapped_dek_bytes": wrapped_dek,
                "sha256_hash": sha256_hash,
                "plaintext_size": len(data),
                "ciphertext_size": len(ciphertext),
                "algorithm": "AES-256-GCM",
            }
        finally:
            # Explicit key zeroization attempt
            del dek

    @staticmethod
    def decrypt_bytes(
        ciphertext: bytes,
        nonce: bytes,
        tag: bytes,
        wrapped_dek: bytes,
        associated_data: Optional[bytes] = None,
    ) -> bytes:
        """
        Decrypt ciphertext using wrapped DEK and AES-256-GCM authentication.
        Raises CryptographicIntegrityError if authentication tag fails, key wrap is tampered,
        or Associated Authenticated Data (AAD) has been modified.
        """
        # 1. Unwrap DEK using Server Master KEK
        try:
            dek = unwrap_dek(wrapped_dek)
        except InvalidUnwrap as e:
            raise CryptographicIntegrityError("Key unwrap failed: wrapped key is invalid or tampered") from e
        except Exception as e:
            raise CryptographicError(f"Failed to unwrap DEK: {str(e)}") from e

        try:
            # 2. Reassemble ciphertext + 16-byte authentication tag
            ct_and_tag = ciphertext + tag

            # 3. Authenticate and decrypt with AES-256-GCM (verifying AAD)
            aesgcm = AESGCM(dek)
            plaintext = aesgcm.decrypt(nonce, ct_and_tag, associated_data)
            return plaintext
        except InvalidTag as e:
            raise CryptographicIntegrityError(
                "Authentication tag verification failed: data or associated metadata has been altered or corrupted"
            ) from e
        except Exception as e:
            raise CryptographicError(f"Decryption failed: {str(e)}") from e
        finally:
            # Memory zeroization
            del dek

    @staticmethod
    def encrypt_text(text: str) -> Dict[str, str]:
        """Encrypt UTF-8 string and return versioned base64-encoded envelope components."""
        data = text.encode("utf-8")
        result = CryptoService.encrypt_bytes(data)
        return {
            "version": "1.0",
            "ciphertext": base64.b64encode(result["ciphertext_bytes"]).decode("ascii"),
            "nonce": base64.b64encode(result["nonce_bytes"]).decode("ascii"),
            "tag": base64.b64encode(result["tag_bytes"]).decode("ascii"),
            "wrapped_dek": base64.b64encode(result["wrapped_dek_bytes"]).decode("ascii"),
            "algorithm": result["algorithm"],
            "sha256_hash": result["sha256_hash"],
        }

    @staticmethod
    def decrypt_text(
        ciphertext_b64: str,
        nonce_b64: str,
        tag_b64: str,
        wrapped_dek_b64: str,
    ) -> Tuple[str, str]:
        """Decrypt base64-encoded ciphertext envelope and return UTF-8 string and SHA-256."""
        try:
            ciphertext = base64.b64decode(ciphertext_b64)
            nonce = base64.b64decode(nonce_b64)
            tag = base64.b64decode(tag_b64)
            wrapped_dek = base64.b64decode(wrapped_dek_b64)
        except Exception as e:
            raise CryptographicError("Invalid base64 encoding in cryptographic payload") from e

        plaintext_bytes = CryptoService.decrypt_bytes(ciphertext, nonce, tag, wrapped_dek)
        sha256_hash = CryptoService.calculate_sha256(plaintext_bytes)

        try:
            return plaintext_bytes.decode("utf-8"), sha256_hash
        except UnicodeDecodeError as e:
            raise CryptographicError("Decrypted bytes are not valid UTF-8 text") from e
