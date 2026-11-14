import io
import hashlib
import pytest
from app.core.config import settings

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

# 1. Test PNG roundtrip and bit-exact SHA-256
def test_image_png_encryption_roundtrip(client, auth_headers):
    # Valid PNG binary header + image payload
    png_header = b"\x89PNG\r\n\x1a\n"
    png_data = png_header + bytes([i % 256 for i in range(10000)])
    original_hash = compute_sha256(png_data)

    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("test_diagram.png", io.BytesIO(png_data), "image/png")},
        data={"category": "image"},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    meta = upload_res.json()
    assert meta["original_filename"] == "test_diagram.png"
    assert meta["category"] == "image"
    assert meta["encryption_algorithm"] == "AES-256-GCM"
    assert meta["sha256_hash"] == original_hash
    assert meta["file_size"] == len(png_data)
    assert meta["nonce"]
    assert meta["authentication_tag"]

    # Decrypt
    dec_res = client.post(
        f"/api/v1/crypto/files/{meta['id']}/decrypt",
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == png_data
    assert compute_sha256(dec_res.content) == original_hash
    assert "test_diagram.png" in dec_res.headers["Content-Disposition"]

# 2. Test JPEG roundtrip and bit-exact SHA-256
def test_image_jpeg_encryption_roundtrip(client, auth_headers):
    # Valid JPEG SOI marker (FF D8) + payload + EOI marker (FF D9)
    jpeg_data = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + bytes([i % 251 for i in range(8000)]) + b"\xff\xd9"
    original_hash = compute_sha256(jpeg_data)

    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("photo_highres.jpg", io.BytesIO(jpeg_data), "image/jpeg")},
        data={"category": "image"},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    meta = upload_res.json()
    assert meta["original_filename"] == "photo_highres.jpg"
    assert meta["category"] == "image"
    assert meta["sha256_hash"] == original_hash

    # Decrypt
    dec_res = client.post(
        f"/api/v1/crypto/files/{meta['id']}/decrypt",
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == jpeg_data
    assert compute_sha256(dec_res.content) == original_hash

# 3. Test WEBP roundtrip and bit-exact SHA-256
def test_image_webp_encryption_roundtrip(client, auth_headers):
    # Valid WEBP header RIFF....WEBPVP8
    webp_data = b"RIFF\x18\x00\x00\x00WEBPVP8 " + bytes([i % 241 for i in range(6000)])
    original_hash = compute_sha256(webp_data)

    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("graphic_asset.webp", io.BytesIO(webp_data), "image/webp")},
        data={"category": "image"},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    meta = upload_res.json()
    assert meta["original_filename"] == "graphic_asset.webp"
    assert meta["sha256_hash"] == original_hash

    # Decrypt
    dec_res = client.post(
        f"/api/v1/crypto/files/{meta['id']}/decrypt",
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == webp_data
    assert compute_sha256(dec_res.content) == original_hash

# 4. Test BMP roundtrip and bit-exact SHA-256
def test_image_bmp_encryption_roundtrip(client, auth_headers):
    # BMP magic number BM (42 4D) + header + pixel array
    bmp_data = b"BM" + (54).to_bytes(4, byteorder="little") + b"\x00\x00\x00\x00\x36\x00\x00\x00" + bytes([i % 233 for i in range(5000)])
    original_hash = compute_sha256(bmp_data)

    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("legacy_scan.bmp", io.BytesIO(bmp_data), "image/bmp")},
        data={"category": "image"},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    meta = upload_res.json()
    assert meta["original_filename"] == "legacy_scan.bmp"
    assert meta["sha256_hash"] == original_hash

    # Decrypt
    dec_res = client.post(
        f"/api/v1/crypto/files/{meta['id']}/decrypt",
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == bmp_data
    assert compute_sha256(dec_res.content) == original_hash

# 5. Test Unauthenticated Request Rejection
def test_image_encryption_unauthenticated_rejection(client):
    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("unauth.png", io.BytesIO(b"\x89PNG\r\n\x1a\n"), "image/png")},
    )
    assert upload_res.status_code == 401
    assert "credentials" in upload_res.json().get("detail", "").lower()

# 6. Test 50MB Limit Enforcement
def test_image_encryption_size_limit_enforced(client, auth_headers):
    # Simulate oversized file (> 50 MB)
    oversized_bytes = b"X" * ((settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024) + 1024)
    res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("oversized.jpg", io.BytesIO(oversized_bytes), "image/jpeg")},
        headers=auth_headers,
    )
    assert res.status_code == 413
    assert "exceeds maximum allowed size" in res.json()["detail"]
