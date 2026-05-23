async def test_register_and_login(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.com", "password": "password123"},
    )
    assert r.status_code == 201
    assert r.json()["email"] == "a@b.com"

    r = await client.post(
        "/api/v1/auth/login",
        data={"username": "a@b.com", "password": "password123"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


async def test_register_duplicate(client):
    payload = {"email": "dup@b.com", "password": "password123"}
    await client.post("/api/v1/auth/register", json=payload)
    r = await client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 409


async def test_login_invalid_credentials(client):
    r = await client.post(
        "/api/v1/auth/login",
        data={"username": "ghost@b.com", "password": "wrongpass"},
    )
    assert r.status_code == 401


async def test_me(client, auth_headers):
    r = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "tester@example.com"


async def test_me_without_token(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


async def test_invalid_token(client):
    r = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer not-a-valid-token"}
    )
    assert r.status_code == 401
