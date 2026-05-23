async def test_create_marca_requires_auth(client):
    r = await client.post("/api/v1/marcas", json={"nome_marca": "FORD"})
    assert r.status_code == 401


async def test_crud_marca(client, auth_headers):
    r = await client.post(
        "/api/v1/marcas", json={"nome_marca": "FORD"}, headers=auth_headers
    )
    assert r.status_code == 201
    marca_id = r.json()["id"]

    r = await client.get(f"/api/v1/marcas/{marca_id}")
    assert r.status_code == 200
    assert r.json()["nome_marca"] == "FORD"

    r = await client.get("/api/v1/marcas")
    assert r.status_code == 200
    assert r.json()["total"] == 1

    r = await client.put(
        f"/api/v1/marcas/{marca_id}",
        json={"nome_marca": "FORD MOTORS"},
        headers=auth_headers,
    )
    assert r.status_code == 200
    assert r.json()["nome_marca"] == "FORD MOTORS"

    r = await client.delete(f"/api/v1/marcas/{marca_id}", headers=auth_headers)
    assert r.status_code == 204

    r = await client.get(f"/api/v1/marcas/{marca_id}")
    assert r.status_code == 404


async def test_create_duplicate_marca(client, auth_headers):
    await client.post("/api/v1/marcas", json={"nome_marca": "VW"}, headers=auth_headers)
    r = await client.post(
        "/api/v1/marcas", json={"nome_marca": "VW"}, headers=auth_headers
    )
    assert r.status_code == 409


async def test_get_marca_not_found(client):
    r = await client.get("/api/v1/marcas/9999")
    assert r.status_code == 404


async def test_delete_marca_with_modelo_conflict(client, auth_headers, modelo):
    r = await client.delete(
        f"/api/v1/marcas/{modelo.marca_id}", headers=auth_headers
    )
    assert r.status_code == 409
