import io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.encrypted_file import EncryptedFile
from app.schemas.crypto import TextEncryptRequest, TextEncryptResponse, TextDecryptRequest, TextDecryptResponse
from app.schemas.vault import FileMetadataResponse
from app.services.crypto_service import CryptoService, CryptographicError, CryptographicIntegrityError
from app.services.storage_service import storage_service
from app.services.steganography_service import steganography_service
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/crypto", tags=["Cryptography"])

@router.post("/text/encrypt", response_model=TextEncryptResponse)
def encrypt_text(
    payload: TextEncryptRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = CryptoService.encrypt_text(
            text=payload.plaintext,
            algorithm=payload.algorithm,
            custom_key=payload.custom_key,
        )

        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="ENCRYPT_TEXT",
            resource_name="Text snippet",
            details=f"Algorithm: {result['algorithm']}, KeyMode: {result['key_mode']}, size: {len(payload.plaintext)} chars",
            ip_address=request.client.host if request.client else None,
        )

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text encryption failed: {str(e)}",
        )

@router.post("/text/decrypt", response_model=TextDecryptResponse)
def decrypt_text(
    payload: TextDecryptRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        plaintext, sha256_hash = CryptoService.decrypt_text(
            ciphertext_b64=payload.ciphertext,
            nonce_b64=payload.nonce,
            tag_b64=payload.tag,
            wrapped_dek_b64=payload.wrapped_dek,
            algorithm=payload.algorithm,
            custom_key=payload.custom_key,
            salt_b64=payload.salt,
        )

        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="DECRYPT_TEXT",
            resource_name="Text snippet",
            details=f"Decryption successful with {payload.algorithm or 'AES-256-GCM'} tag verification",
            ip_address=request.client.host if request.client else None,
        )

        return {
            "plaintext": plaintext,
            "sha256_hash": sha256_hash,
            "verified": True,
        }
    except CryptographicIntegrityError as e:
        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="DECRYPT_TEXT",
            resource_name="Text snippet",
            status="FAILED",
            details=f"Integrity check failed: {str(e)}",
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except CryptographicError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decryption failed: {str(e)}",
        )

@router.post("/files/encrypt", response_model=FileMetadataResponse, status_code=status.HTTP_201_CREATED)
async def encrypt_file(
    request: Request,
    file: UploadFile = File(...),
    category: str = Form("file"), # "file", "image", "document"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Read file content
    contents = await file.read()
    file_size = len(contents)

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot encrypt an empty file.",
        )

    try:
        # Perform real AES-256-GCM encryption
        crypto_res = CryptoService.encrypt_bytes(contents)

        # Base64 encode metadata for DB storage
        import base64
        nonce_b64 = base64.b64encode(crypto_res["nonce_bytes"]).decode("ascii")
        tag_b64 = base64.b64encode(crypto_res["tag_bytes"]).decode("ascii")
        wrapped_dek_b64 = base64.b64encode(crypto_res["wrapped_dek_bytes"]).decode("ascii")

        # Determine category if not explicitly provided
        content_type = file.content_type or "application/octet-stream"
        cat = category
        if content_type.startswith("image/"):
            cat = "image"

        # Save ciphertext bytes to disk with standardized container extension (.img.cptx / .cptx)
        container_suffix = ".img.cptx" if cat == "image" else ".cptx"
        stored_filename = storage_service.save_file(crypto_res["ciphertext_bytes"], suffix=container_suffix)

        db_file = EncryptedFile(
            user_id=current_user.id,
            original_filename=file.filename or "unnamed_file",
            stored_filename=stored_filename,
            file_type=content_type,
            file_size=file_size,
            encrypted_size=crypto_res["ciphertext_size"],
            category=cat,
            encryption_algorithm="AES-256-GCM",
            nonce=nonce_b64,
            authentication_tag=tag_b64,
            wrapped_dek=wrapped_dek_b64,
            sha256_hash=crypto_res["sha256_hash"],
            storage_path=stored_filename,
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)

        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="ENCRYPT_FILE",
            resource_name=db_file.original_filename,
            details=f"Algorithm: AES-256-GCM, size: {file_size} bytes, SHA-256: {crypto_res['sha256_hash'][:8]}...",
            ip_address=request.client.host if request.client else None,
        )

        return db_file
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File encryption failed: {str(e)}",
        )

@router.post("/files/{file_id}/decrypt")
def decrypt_file(
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encrypted file not found or unauthorized access",
        )

    try:
        import base64
        ciphertext = storage_service.read_file(db_file.stored_filename)
        nonce = base64.b64decode(db_file.nonce)
        tag = base64.b64decode(db_file.authentication_tag)
        wrapped_dek = base64.b64decode(db_file.wrapped_dek)

        plaintext = CryptoService.decrypt_bytes(
            ciphertext=ciphertext,
            nonce=nonce,
            tag=tag,
            wrapped_dek=wrapped_dek,
        )

        # Integrity check
        current_hash = CryptoService.calculate_sha256(plaintext)
        if current_hash != db_file.sha256_hash:
            raise CryptographicIntegrityError("SHA-256 hash mismatch: file integrity corrupted")

        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="DECRYPT_FILE",
            resource_name=db_file.original_filename,
            details="Decrypted successfully with authenticated tag verification",
            ip_address=request.client.host if request.client else None,
        )

        headers = {
            "Content-Disposition": f'attachment; filename="{db_file.original_filename}"',
            "X-SHA256-Checksum": db_file.sha256_hash,
            "Access-Control-Expose-Headers": "Content-Disposition, X-SHA256-Checksum",
        }

        return Response(
            content=plaintext,
            media_type=db_file.file_type or "application/octet-stream",
            headers=headers,
        )

    except CryptographicIntegrityError as e:
        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="DECRYPT_FILE",
            resource_name=db_file.original_filename,
            status="FAILED",
            details=f"Integrity check failed: {str(e)}",
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File decryption failed: {str(e)}",
        )

@router.get("/files/{file_id}/carrier")
def download_carrier_image(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download the encrypted asset packaged inside a valid, viewable Steganographic Carrier PNG image.
    - For documents: Generates a sleek dark cybersecurity Vault Asset Carrier Badge PNG.
    - For images: Generates a visual cryptographic cipher noise image PNG.
    """
    db_file = db.query(EncryptedFile).filter(
        EncryptedFile.id == file_id,
        EncryptedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encrypted file not found or unauthorized access",
        )

    import json, base64
    ciphertext = storage_service.read_file(db_file.stored_filename)

    envelope = {
        "magic": "CPTX",
        "version": "1.0",
        "file_id": db_file.id,
        "original_filename": db_file.original_filename,
        "file_type": db_file.file_type,
        "sha256_hash": db_file.sha256_hash,
        "nonce": db_file.nonce,
        "tag": db_file.authentication_tag,
        "wrapped_dek": db_file.wrapped_dek,
        "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
    }
    envelope_bytes = json.dumps(envelope).encode("utf-8")

    if db_file.category == "image":
        carrier_bytes = steganography_service.create_image_cipher_carrier(
            original_filename=db_file.original_filename,
            encrypted_payload=envelope_bytes,
        )
        carrier_filename = f"{db_file.original_filename}.img.cptx.png"
    else:
        carrier_bytes = steganography_service.create_file_carrier_image(
            original_filename=db_file.original_filename,
            file_size=db_file.file_size,
            sha256_hash=db_file.sha256_hash,
            encrypted_payload=envelope_bytes,
        )
        carrier_filename = f"{db_file.original_filename}.cptx.png"

    headers = {
        "Content-Disposition": f'attachment; filename="{carrier_filename}"',
        "Access-Control-Expose-Headers": "Content-Disposition",
    }
    return Response(content=carrier_bytes, media_type="image/png", headers=headers)

@router.post("/files/decrypt-carrier")
async def decrypt_carrier_file(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Directly decrypt an uploaded Steganographic Carrier PNG Image and reconstruct the exact original file.
    """
    contents = await file.read()
    if not steganography_service.is_carrier_image(contents):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid CryptX Steganographic Carrier Image (.png)",
        )

    import json, base64
    try:
        payload_bytes = steganography_service.extract_payload(contents)
        if not payload_bytes:
            raise ValueError("Failed to extract sealed cryptographic envelope")

        env = json.loads(payload_bytes.decode("utf-8"))
        ciphertext = base64.b64decode(env["ciphertext"])
        nonce = base64.b64decode(env["nonce"])
        tag = base64.b64decode(env["tag"])
        wrapped_dek = base64.b64decode(env["wrapped_dek"])

        plaintext = CryptoService.decrypt_bytes(
            ciphertext=ciphertext,
            nonce=nonce,
            tag=tag,
            wrapped_dek=wrapped_dek,
        )

        current_hash = CryptoService.calculate_sha256(plaintext)
        if current_hash != env["sha256_hash"]:
            raise CryptographicIntegrityError("SHA-256 hash mismatch: file integrity corrupted")

        ActivityService.log_activity(
            db,
            user_id=current_user.id,
            operation_type="DECRYPT_CARRIER",
            resource_name=env["original_filename"],
            details="Carrier image extracted and decrypted with 100% SHA-256 match",
            ip_address=request.client.host if request.client else None,
        )

        headers = {
            "Content-Disposition": f'attachment; filename="{env["original_filename"]}"',
            "X-SHA256-Checksum": env["sha256_hash"],
            "Access-Control-Expose-Headers": "Content-Disposition, X-SHA256-Checksum",
        }
        return Response(
            content=plaintext,
            media_type=env.get("file_type") or "application/octet-stream",
            headers=headers,
        )
    except CryptographicIntegrityError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Carrier decryption failed: {str(e)}",
        )
