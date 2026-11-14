import os
import base64
import hashlib
from typing import Tuple, Dict, Any, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding, hashes, hmac
from cryptography.exceptions import InvalidTag, InvalidSignature
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
    def derive_custom_key(passphrase: str, salt: bytes) -> bytes:
        """Derive 256-bit symmetric key from user passphrase using PBKDF2-HMAC-SHA256 (100,000 rounds)."""
        return hashlib.pbkdf2_hmac("sha256", passphrase.encode("utf-8"), salt, 100_000)

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
            del dek

    @staticmethod
    def encrypt_text(
        text: str,
        algorithm: str = "AES-256-GCM",
        custom_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Encrypt UTF-8 string with selected cipher (AES-256-GCM, ChaCha20-Poly1305, AES-256-CBC)
        supporting either Server Master KEK envelope or User-Defined Custom Secret Key.
        """
        data = text.encode("utf-8")
        clean_algo = algorithm.strip().upper() if algorithm else "AES-256-GCM"

        # Determine key derivation mode
        if custom_key and custom_key.strip():
            key_mode = "custom"
            salt = os.urandom(16)
            dek = CryptoService.derive_custom_key(custom_key.strip(), salt)
            wrapped_dek_b64 = None
            salt_b64 = base64.b64encode(salt).decode("ascii")
        else:
            key_mode = "server"
            salt_b64 = None
            dek = AESGCM.generate_key(bit_length=256)
            wrapped_dek = wrap_dek(dek)
            wrapped_dek_b64 = base64.b64encode(wrapped_dek).decode("ascii")

        try:
            if clean_algo == "CHACHA20-POLY1305":
                nonce = os.urandom(12) # 96-bit
                chacha = ChaCha20Poly1305(dek)
                ct_and_tag = chacha.encrypt(nonce, data, None)
                ciphertext = ct_and_tag[:-16]
                tag = ct_and_tag[-16:]
                used_algo = "ChaCha20-Poly1305"
            elif clean_algo in ("AES-256-CBC", "AES-CBC"):
                nonce = os.urandom(16) # 128-bit IV
                padder = padding.PKCS7(128).padder()
                padded = padder.update(data) + padder.finalize()
                cipher = Cipher(algorithms.AES(dek), modes.CBC(nonce))
                enc = cipher.encryptor()
                ciphertext = enc.update(padded) + enc.finalize()
                # Encrypt-then-MAC with HMAC-SHA256
                h = hmac.HMAC(dek, hashes.SHA256())
                h.update(nonce + ciphertext)
                tag = h.finalize()
                used_algo = "AES-256-CBC"
            else: # Default AES-256-GCM
                nonce = os.urandom(12) # 96-bit
                aesgcm = AESGCM(dek)
                ct_and_tag = aesgcm.encrypt(nonce, data, None)
                ciphertext = ct_and_tag[:-16]
                tag = ct_and_tag[-16:]
                used_algo = "AES-256-GCM"

            sha256_hash = CryptoService.calculate_sha256(data)

            return {
                "version": "1.0",
                "algorithm": used_algo,
                "key_mode": key_mode,
                "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
                "nonce": base64.b64encode(nonce).decode("ascii"),
                "tag": base64.b64encode(tag).decode("ascii"),
                "wrapped_dek": wrapped_dek_b64,
                "salt": salt_b64,
                "sha256_hash": sha256_hash,
            }
        finally:
            del dek

    @staticmethod
    def decrypt_text(
        ciphertext_b64: str,
        nonce_b64: str,
        tag_b64: str,
        wrapped_dek_b64: Optional[str] = None,
        algorithm: Optional[str] = "AES-256-GCM",
        custom_key: Optional[str] = None,
        salt_b64: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Decrypt ciphertext envelope with chosen algorithm and key mode.
        """
        clean_algo = (algorithm or "AES-256-GCM").strip().upper()

        try:
            ciphertext = base64.b64decode(ciphertext_b64)
            nonce = base64.b64decode(nonce_b64)
            tag = base64.b64decode(tag_b64)
        except Exception as e:
            raise CryptographicError("Invalid base64 encoding in cryptographic payload") from e

        # Resolve DEK
        if custom_key and custom_key.strip():
            if not salt_b64:
                raise CryptographicError("Salt is required to derive key from custom passphrase")
            try:
                salt = base64.b64decode(salt_b64)
            except Exception as e:
                raise CryptographicError("Invalid base64 encoding in salt") from e
            dek = CryptoService.derive_custom_key(custom_key.strip(), salt)
        elif wrapped_dek_b64:
            try:
                wrapped_dek = base64.b64decode(wrapped_dek_b64)
            except Exception as e:
                raise CryptographicError("Invalid base64 encoding in wrapped DEK") from e
            try:
                dek = unwrap_dek(wrapped_dek)
            except InvalidUnwrap as e:
                raise CryptographicIntegrityError("Key unwrap failed: wrapped key is invalid or tampered") from e
            except Exception as e:
                raise CryptographicError(f"Failed to unwrap DEK: {str(e)}") from e
        else:
            raise CryptographicError("Either wrapped_dek or custom_key + salt must be provided")

        try:
            if clean_algo == "CHACHA20-POLY1305":
                try:
                    chacha = ChaCha20Poly1305(dek)
                    plaintext_bytes = chacha.decrypt(nonce, ciphertext + tag, None)
                except InvalidTag as e:
                    raise CryptographicIntegrityError(
                        "ChaCha20-Poly1305 authentication failed: incorrect key or tampered payload"
                    ) from e
            elif clean_algo in ("AES-256-CBC", "AES-CBC"):
                # Verify HMAC-SHA256 tag first (Encrypt-then-MAC)
                try:
                    h = hmac.HMAC(dek, hashes.SHA256())
                    h.update(nonce + ciphertext)
                    h.verify(tag)
                except InvalidSignature as e:
                    raise CryptographicIntegrityError(
                        "AES-256-CBC HMAC verification failed: incorrect key or tampered payload"
                    ) from e

                cipher = Cipher(algorithms.AES(dek), modes.CBC(nonce))
                dec = cipher.decryptor()
                padded = dec.update(ciphertext) + dec.finalize()
                try:
                    unpadder = padding.PKCS7(128).unpadder()
                    plaintext_bytes = unpadder.update(padded) + unpadder.finalize()
                except Exception as e:
                    raise CryptographicIntegrityError("Padding corrupted or incorrect key") from e
            else: # Default AES-256-GCM
                try:
                    aesgcm = AESGCM(dek)
                    plaintext_bytes = aesgcm.decrypt(nonce, ciphertext + tag, None)
                except InvalidTag as e:
                    raise CryptographicIntegrityError(
                        "AES-256-GCM authentication failed: incorrect key or tampered payload"
                    ) from e

            sha256_hash = CryptoService.calculate_sha256(plaintext_bytes)

            try:
                return plaintext_bytes.decode("utf-8"), sha256_hash
            except UnicodeDecodeError as e:
                raise CryptographicError("Decrypted bytes are not valid UTF-8 text") from e
        finally:
            del dek
