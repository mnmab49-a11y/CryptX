def test_cors_preflight_vercel_origin(client):
    response = client.options(
        "/api/v1/auth/register",
        headers={
            "Origin": "https://crypt-x1.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://crypt-x1.vercel.app"
    assert "POST" in response.headers.get("access-control-allow-methods", "")

def test_cors_preflight_vercel_preview_regex(client):
    response = client.options(
        "/api/v1/vault/summary",
        headers={
            "Origin": "https://cryptx-mnmab49-a11y.vercel.app",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://cryptx-mnmab49-a11y.vercel.app"

def test_cors_disallowed_origin(client):
    response = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://unauthorized-domain.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
