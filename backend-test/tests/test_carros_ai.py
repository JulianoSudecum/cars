async def test_generate_description_ok(client, auth_headers, carro, mock_ai_ok):
    r = await client.post(
        f"/api/v1/carros/{carro.id}/description", headers=auth_headers
    )
    assert r.status_code == 200
    descricao = r.json()["descricao"]
    assert "COROLLA" in descricao


async def test_generate_description_unavailable(
    client, auth_headers, carro, mock_ai_unavailable
):
    r = await client.post(
        f"/api/v1/carros/{carro.id}/description", headers=auth_headers
    )
    assert r.status_code == 503


async def test_generate_description_default_no_key(client, auth_headers, carro):
    # Sem ANTHROPIC_API_KEY (padrão dos testes) o provider real é o "indisponível".
    r = await client.post(
        f"/api/v1/carros/{carro.id}/description", headers=auth_headers
    )
    assert r.status_code == 503


async def test_generate_description_requires_auth(client, carro):
    r = await client.post(f"/api/v1/carros/{carro.id}/description")
    assert r.status_code == 401


async def test_create_carro_with_generate_description(
    client, auth_headers, modelo, mock_ai_ok
):
    payload = {
        "modelo_id": modelo.id,
        "ano": 2021,
        "combustivel": "FLEX",
        "num_portas": 4,
        "cor": "PRETO",
        "quilometragem": 5000,
        "valor_anuncio": "80000.00",
        "generate_description": True,
    }
    r = await client.post("/api/v1/carros", json=payload, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["descricao"] is not None
    assert "COROLLA" in r.json()["descricao"]


async def test_create_carro_generate_description_unavailable_keeps_carro(
    client, auth_headers, modelo, mock_ai_unavailable
):
    payload = {
        "modelo_id": modelo.id,
        "ano": 2021,
        "combustivel": "FLEX",
        "num_portas": 4,
        "cor": "PRETO",
        "quilometragem": 5000,
        "valor_anuncio": "80000.00",
        "generate_description": True,
    }
    r = await client.post("/api/v1/carros", json=payload, headers=auth_headers)
    # IA falhou, mas o carro é criado mesmo assim (sem descrição).
    assert r.status_code == 201
    assert r.json()["descricao"] is None
