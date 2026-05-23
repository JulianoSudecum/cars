def _payload(modelo_id: int, **overrides) -> dict:
    base = {
        "modelo_id": modelo_id,
        "ano": 2021,
        "combustivel": "FLEX",
        "num_portas": 4,
        "cor": "PRETO",
        "quilometragem": 5000,
        "valor_anuncio": "80000.00",
    }
    base.update(overrides)
    return base


async def test_create_carro(client, auth_headers, modelo):
    r = await client.post(
        "/api/v1/carros", json=_payload(modelo.id), headers=auth_headers
    )
    assert r.status_code == 201
    body = r.json()
    assert body["modelo"]["nome"] == "COROLLA"
    assert body["modelo"]["marca"]["nome_marca"] == "TOYOTA"
    assert body["valor_anuncio"] == 80000.0  # serializado como número
    assert body["combustivel"] == "FLEX"
    assert body["descricao"] is None


async def test_create_carro_modelo_inexistente(client, auth_headers):
    r = await client.post(
        "/api/v1/carros", json=_payload(9999), headers=auth_headers
    )
    assert r.status_code == 404


async def test_create_carro_ano_invalido(client, auth_headers, modelo):
    r = await client.post(
        "/api/v1/carros", json=_payload(modelo.id, ano=3000), headers=auth_headers
    )
    assert r.status_code == 422


async def test_create_carro_combustivel_invalido(client, auth_headers, modelo):
    r = await client.post(
        "/api/v1/carros",
        json=_payload(modelo.id, combustivel="PLASMA"),
        headers=auth_headers,
    )
    assert r.status_code == 422


async def test_get_update_delete_carro(client, auth_headers, carro):
    r = await client.get(f"/api/v1/carros/{carro.id}")
    assert r.status_code == 200

    r = await client.put(
        f"/api/v1/carros/{carro.id}", json={"cor": "BRANCO"}, headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["cor"] == "BRANCO"

    r = await client.delete(f"/api/v1/carros/{carro.id}", headers=auth_headers)
    assert r.status_code == 204

    r = await client.get(f"/api/v1/carros/{carro.id}")
    assert r.status_code == 404


async def test_create_carro_requires_auth(client, modelo):
    r = await client.post("/api/v1/carros", json=_payload(modelo.id))
    assert r.status_code == 401
