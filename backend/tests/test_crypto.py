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
    assert "tag verification failed" in dec_res.json()["detail"].lower()
