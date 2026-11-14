import io
import base64
import pytest
from app.services.crypto_service import CryptoService, CryptographicIntegrityError

def test_crypto_service_direct_roundtrip():
    secret_text = b"Antigravity CryptX Secure Engine Test Payload 2025!"

    # Encrypt
    result = CryptoService.encrypt_bytes(secret_text)
    assert result["ciphertext_bytes"] != secret_text
    assert len(result["nonce_bytes"]) == 12 # 96-bit
    assert len(result["tag_bytes"]) == 16   # 128-bit
    assert result["algorithm"] == "AES-256-GCM"

    # Decrypt
    decrypted = CryptoService.decrypt_bytes(
        ciphertext=result["ciphertext_bytes"],
        nonce=result["nonce_bytes"],
        tag=result["tag_bytes"],
        wrapped_dek=result["wrapped_dek_bytes"],
    )
    assert decrypted == secret_text

def test_crypto_service_tampered_tag():
    secret_text = b"Sensitive Financial Transaction Record"
    result = CryptoService.encrypt_bytes(secret_text)

    # Tamper with the authentication tag
    tampered_tag = bytearray(result["tag_bytes"])
    tampered_tag[0] ^= 0xFF

    with pytest.raises(CryptographicIntegrityError) as exc_info:
        CryptoService.decrypt_bytes(
            ciphertext=result["ciphertext_bytes"],
            nonce=result["nonce_bytes"],
            tag=bytes(tampered_tag),
            wrapped_dek=result["wrapped_dek_bytes"],
        )
    assert "tag verification failed" in str(exc_info.value).lower()

def test_crypto_service_tampered_ciphertext():
    secret_text = b"Original Message Before Tampering"
    result = CryptoService.encrypt_bytes(secret_text)

    # Tamper with the ciphertext
    tampered_ct = bytearray(result["ciphertext_bytes"])
    tampered_ct[0] ^= 0x01

    with pytest.raises(CryptographicIntegrityError) as exc_info:
        CryptoService.decrypt_bytes(
            ciphertext=bytes(tampered_ct),
            nonce=result["nonce_bytes"],
            tag=result["tag_bytes"],
            wrapped_dek=result["wrapped_dek_bytes"],
        )
    assert "tag verification failed" in str(exc_info.value).lower()

def test_crypto_api_text_roundtrip(client, auth_headers):
    original_text = "This is a confidential message encrypted through CryptX API."

    # 1. Encrypt
    enc_res = client.post(
        "/api/v1/crypto/text/encrypt",
        json={"plaintext": original_text, "algorithm": "AES-256-GCM"},
        headers=auth_headers,
    )
    assert enc_res.status_code == 200
    enc_data = enc_res.json()
    assert "ciphertext" in enc_data
    assert "nonce" in enc_data
    assert "tag" in enc_data
    assert "wrapped_dek" in enc_data
    assert enc_data["algorithm"] == "AES-256-GCM"

    # 2. Decrypt
    dec_res = client.post(
        "/api/v1/crypto/text/decrypt",
        json={
            "ciphertext": enc_data["ciphertext"],
            "nonce": enc_data["nonce"],
            "tag": enc_data["tag"],
            "wrapped_dek": enc_data["wrapped_dek"],
        },
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    dec_data = dec_res.json()
    assert dec_data["plaintext"] == original_text
    assert dec_data["verified"] is True

def test_crypto_api_text_decrypt_tampered_payload(client, auth_headers):
    # Valid encryption
    enc_res = client.post(
        "/api/v1/crypto/text/encrypt",
        json={"plaintext": "Data to be tampered", "algorithm": "AES-256-GCM"},
        headers=auth_headers,
    )
    enc_data = enc_res.json()

    # Tamper the base64 ciphertext
    raw_ct = bytearray(base64.b64decode(enc_data["ciphertext"]))
    raw_ct[0] ^= 0x55
    tampered_b64 = base64.b64encode(raw_ct).decode("ascii")

    dec_res = client.post(
        "/api/v1/crypto/text/decrypt",
        json={
            "ciphertext": tampered_b64,
            "nonce": enc_data["nonce"],
            "tag": enc_data["tag"],
            "wrapped_dek": enc_data["wrapped_dek"],
        },
        headers=auth_headers,
    )
    assert dec_res.status_code == 400
    detail = dec_res.json()["detail"].lower()
    assert "authentication failed" in detail or "tag verification failed" in detail

def test_crypto_service_aad_tamper_fails():
    secret_text = b"Classified Payload Bound to Metadata"
    metadata_aad = b"filename=report.pdf;version=1.0;algo=AES-256-GCM"

    # Encrypt with AAD
    result = CryptoService.encrypt_bytes(secret_text, associated_data=metadata_aad)

    # Decrypt with matching AAD -> succeeds
    decrypted = CryptoService.decrypt_bytes(
        ciphertext=result["ciphertext_bytes"],
        nonce=result["nonce_bytes"],
        tag=result["tag_bytes"],
        wrapped_dek=result["wrapped_dek_bytes"],
        associated_data=metadata_aad,
    )
    assert decrypted == secret_text

    # Decrypt with tampered AAD -> fails
    tampered_aad = b"filename=report_modified.pdf;version=1.0;algo=AES-256-GCM"
    with pytest.raises(CryptographicIntegrityError) as exc_info:
        CryptoService.decrypt_bytes(
            ciphertext=result["ciphertext_bytes"],
            nonce=result["nonce_bytes"],
            tag=result["tag_bytes"],
            wrapped_dek=result["wrapped_dek_bytes"],
            associated_data=tampered_aad,
        )
    assert "verification failed" in str(exc_info.value).lower()

def test_crypto_text_response_includes_version(client, auth_headers):
    enc_res = client.post(
        "/api/v1/crypto/text/encrypt",
        json={"plaintext": "Test payload with versioning", "algorithm": "AES-256-GCM"},
        headers=auth_headers,
    )
    assert enc_res.status_code == 200
    enc_data = enc_res.json()
    assert "version" in enc_data
    assert enc_data["version"] == "1.0"

def test_crypto_text_chacha20_roundtrip(client, auth_headers):
    original_text = "ChaCha20-Poly1305 High Performance Stream Encryption!"
    enc_res = client.post(
        "/api/v1/crypto/text/encrypt",
        json={"plaintext": original_text, "algorithm": "ChaCha20-Poly1305"},
        headers=auth_headers,
    )
    assert enc_res.status_code == 200
    enc_data = enc_res.json()
    assert enc_data["algorithm"] == "ChaCha20-Poly1305"

    # Decrypt
    dec_res = client.post(
        "/api/v1/crypto/text/decrypt",
        json={
            "ciphertext": enc_data["ciphertext"],
            "nonce": enc_data["nonce"],
            "tag": enc_data["tag"],
            "wrapped_dek": enc_data["wrapped_dek"],
            "algorithm": "ChaCha20-Poly1305",
        },
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.json()["plaintext"] == original_text

def test_crypto_text_aes_cbc_roundtrip(client, auth_headers):
    original_text = "AES-256-CBC with HMAC-SHA256 Encrypt-then-MAC!"
    enc_res = client.post(
        "/api/v1/crypto/text/encrypt",
        json={"plaintext": original_text, "algorithm": "AES-256-CBC"},
        headers=auth_headers,
    )
    assert enc_res.status_code == 200
    enc_data = enc_res.json()
    assert enc_data["algorithm"] == "AES-256-CBC"

    # Decrypt
    dec_res = client.post(
        "/api/v1/crypto/text/decrypt",
        json={
            "ciphertext": enc_data["ciphertext"],
            "nonce": enc_data["nonce"],
            "tag": enc_data["tag"],
            "wrapped_dek": enc_data["wrapped_dek"],
            "algorithm": "AES-256-CBC",
        },
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.json()["plaintext"] == original_text

def test_crypto_text_custom_key_roundtrip(client, auth_headers):
    original_text = "Top Secret Credentials Protected with User Custom Key"
    my_key = "MySuperSecretCustomPassphrase#2026!"

    # Encrypt with custom key
    enc_res = client.post(
        "/api/v1/crypto/text/encrypt",
        json={
            "plaintext": original_text,
            "algorithm": "AES-256-GCM",
            "custom_key": my_key,
        },
        headers=auth_headers,
    )
    assert enc_res.status_code == 200
    enc_data = enc_res.json()
    assert enc_data["key_mode"] == "custom"
    assert enc_data["salt"] is not None

    # Decrypt with correct custom key -> succeeds
    dec_res = client.post(
        "/api/v1/crypto/text/decrypt",
        json={
            "ciphertext": enc_data["ciphertext"],
            "nonce": enc_data["nonce"],
            "tag": enc_data["tag"],
            "salt": enc_data["salt"],
            "custom_key": my_key,
            "algorithm": "AES-256-GCM",
        },
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.json()["plaintext"] == original_text

    # Decrypt with WRONG custom key -> fails
    dec_bad = client.post(
        "/api/v1/crypto/text/decrypt",
        json={
            "ciphertext": enc_data["ciphertext"],
            "nonce": enc_data["nonce"],
            "tag": enc_data["tag"],
            "salt": enc_data["salt"],
            "custom_key": "WrongPassword999!",
            "algorithm": "AES-256-GCM",
        },
        headers=auth_headers,
    )
    assert dec_bad.status_code == 400
    assert "authentication failed" in dec_bad.json()["detail"].lower()

def test_carrier_image_download_and_decrypt_flow(client, auth_headers):
    import io
    doc_content = b"%PDF-1.5 University CryptX Security Certificate"
    
    # 1. Encrypt file
    enc_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("certificate.pdf", io.BytesIO(doc_content), "application/pdf")},
        data={"category": "document"},
        headers=auth_headers,
    )
    assert enc_res.status_code == 201
    file_id = enc_res.json()["id"]

    # 2. Download Carrier PNG
    carrier_res = client.get(
        f"/api/v1/crypto/files/{file_id}/carrier",
        headers=auth_headers,
    )
    assert carrier_res.status_code == 200
    assert carrier_res.headers["content-type"] == "image/png"
    assert "certificate.pdf.carrier.png" in carrier_res.headers["content-disposition"] or "carrier.png" in carrier_res.headers["content-disposition"]
    carrier_bytes = carrier_res.content

    # 3. Direct Decrypt the Carrier PNG via /decrypt-carrier
    dec_res = client.post(
        "/api/v1/crypto/files/decrypt-carrier",
        files={"file": ("certificate.pdf.carrier.png", io.BytesIO(carrier_bytes), "image/png")},
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == doc_content
    assert "certificate.pdf" in dec_res.headers["content-disposition"]


def test_image_decoy_cover_scenic_and_cyber_roundtrip(client, auth_headers):
    # 1. Upload a secret original PNG image
    secret_img_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff"
        b"?\x00\x05\xfe\x02\xfe\xa7V\xfe\xae\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    enc_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("secret_blueprint.png", io.BytesIO(secret_img_bytes), "image/png")},
        data={"category": "image"},
        headers=auth_headers,
    )
    assert enc_res.status_code == 201
    file_id = enc_res.json()["id"]

    # 2. Download with scenic decoy style
    scenic_res = client.get(
        f"/api/v1/crypto/files/{file_id}/carrier?style=scenic",
        headers=auth_headers,
    )
    assert scenic_res.status_code == 200
    assert scenic_res.headers["content-type"] == "image/png"
    assert len(scenic_res.content) > len(secret_img_bytes)

    # 3. Decrypt the scenic decoy image -> restores secret image byte-for-byte
    dec_scenic = client.post(
        "/api/v1/crypto/files/decrypt-carrier",
        files={"file": ("secret_blueprint.carrier.png", io.BytesIO(scenic_res.content), "image/png")},
        headers=auth_headers,
    )
    assert dec_scenic.status_code == 200
    assert dec_scenic.content == secret_img_bytes

    # 4. Download with cyber decoy style
    cyber_res = client.get(
        f"/api/v1/crypto/files/{file_id}/carrier?style=cyber",
        headers=auth_headers,
    )
    assert cyber_res.status_code == 200
    assert cyber_res.headers["content-type"] == "image/png"

    # 5. Decrypt the cyber decoy image -> also restores secret image byte-for-byte
    dec_cyber = client.post(
        "/api/v1/crypto/files/decrypt-carrier",
        files={"file": ("secret_blueprint.carrier.png", io.BytesIO(cyber_res.content), "image/png")},
        headers=auth_headers,
    )
    assert dec_cyber.status_code == 200
    assert dec_cyber.content == secret_img_bytes


