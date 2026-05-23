async def test_create_modelo(client, auth_headers, marca):
    r = await client.post(
        "/api/v1/modelos",
        json={"marca_id": marca.id, "nome": "CIVIC", "valor_fipe": "100000.00"},
        headers=auth_headers,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["nome"] == "CIVIC"
    assert body["marca"]["id"] == marca.id
    assert body["valor_fipe"] == 100000.0  # serializado como número


async def test_create_modelo_marca_inexistente(client, auth_headers):
    r = await client.post(
        "/api/v1/modelos",
        json={"marca_id": 9999, "nome": "X", "valor_fipe": "1.00"},
        headers=auth_headers,
    )
    assert r.status_code == 404


async def test_create_modelo_requires_auth(client, marca):
    r = await client.post(
        "/api/v1/modelos",
        json={"marca_id": marca.id, "nome": "X", "valor_fipe": "1.00"},
    )
    assert r.status_code == 401


async def test_delete_modelo_with_carro_conflict(client, auth_headers, carro):
    r = await client.delete(
        f"/api/v1/modelos/{carro.modelo_id}", headers=auth_headers
    )
    assert r.status_code == 409
