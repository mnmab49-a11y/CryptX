def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Alice Cipher",
            "email": "alice@cryptx.io",
            "password": "SuperSecretPassword123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alice@cryptx.io"
    assert data["user"]["full_name"] == "Alice Cipher"

def test_register_duplicate_email(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "dupe@cryptx.io",
        "password": "Password123!",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Bob Crypt",
            "email": "bob@cryptx.io",
            "password": "SecurePassword123!",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "bob@cryptx.io",
            "password": "SecurePassword123!",
        },
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "bob@cryptx.io"

def test_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Charlie",
            "email": "charlie@cryptx.io",
            "password": "SecurePassword123!",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "charlie@cryptx.io",
            "password": "WrongPassword!",
        },
    )
    assert login_res.status_code == 401

def test_me_unauthorized(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401

def test_me_authorized(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "testuser@cryptx.io"
