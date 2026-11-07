import io

def test_file_encrypt_decrypt_roundtrip(client, auth_headers):
    file_bytes = b"Hello CryptX! This is a test file for authenticated AES-256-GCM encryption."

    # 1. Upload & Encrypt
    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("secret_report.txt", io.BytesIO(file_bytes), "text/plain")},
        data={"category": "document"},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    file_meta = upload_res.json()
    file_id = file_meta["id"]
    assert file_meta["original_filename"] == "secret_report.txt"
    assert file_meta["encryption_algorithm"] == "AES-256-GCM"
    assert file_meta["category"] == "document"

    # 2. Decrypt & Download
    dec_res = client.post(
        f"/api/v1/crypto/files/{file_id}/decrypt",
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == file_bytes
    assert "attachment; filename=\"secret_report.txt\"" in dec_res.headers["Content-Disposition"]

def test_image_encrypt_byte_exact_preservation(client, auth_headers):
    # Create fake binary image bytes (PNG header: 89 50 4E 47 0D 0A 1A 0A + random payload)
    png_header = b"\x89PNG\r\n\x1a\n"
    image_payload = png_header + bytes([i % 256 for i in range(2048)])

    # Upload & Encrypt
    upload_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("photo.png", io.BytesIO(image_payload), "image/png")},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    meta = upload_res.json()
    assert meta["category"] == "image"

    # Decrypt
    dec_res = client.post(
        f"/api/v1/crypto/files/{meta['id']}/decrypt",
        headers=auth_headers,
    )
    assert dec_res.status_code == 200
    assert dec_res.content == image_payload
    assert len(dec_res.content) == len(image_payload)

def test_user_vault_isolation(client, auth_headers, second_user_headers):
    # User 1 uploads file
    u1_res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("user1_private.pdf", io.BytesIO(b"Private to User 1"), "application/pdf")},
        headers=auth_headers,
    )
    assert u1_res.status_code == 201
    file_id = u1_res.json()["id"]

    # User 2 attempts to decrypt User 1's file -> 404
    u2_dec_res = client.post(
        f"/api/v1/crypto/files/{file_id}/decrypt",
        headers=second_user_headers,
    )
    assert u2_dec_res.status_code == 404

    # User 2 attempts to view User 1's file metadata -> 404
    u2_meta_res = client.get(
        f"/api/v1/vault/files/{file_id}",
        headers=second_user_headers,
    )
    assert u2_meta_res.status_code == 404

    # User 2 file list should NOT include User 1's file
    u2_list = client.get("/api/v1/vault/files", headers=second_user_headers).json()
    assert not any(f["id"] == file_id for f in u2_list)

def test_vault_summary_and_delete(client, auth_headers):
    # Upload a file
    res = client.post(
        "/api/v1/crypto/files/encrypt",
        files={"file": ("to_delete.txt", io.BytesIO(b"Ephemeral data"), "text/plain")},
        headers=auth_headers,
    )
    file_id = res.json()["id"]

    # Check summary
    summary_res = client.get("/api/v1/vault/summary", headers=auth_headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_files"] >= 1
    assert summary["total_storage_bytes"] > 0
    assert summary["total_operations"] >= 1

    # Delete file
    del_res = client.delete(f"/api/v1/vault/files/{file_id}", headers=auth_headers)
    assert del_res.status_code == 204

    # Verify 404 after deletion
    get_res = client.get(f"/api/v1/vault/files/{file_id}", headers=auth_headers)
    assert get_res.status_code == 404
