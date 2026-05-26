"""Testes de regressão das correções apontadas na revisão de código."""

import pytest
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.core.config import _DEFAULT_JWT_SECRET, Settings
from app.core.security import hash_password
from app.models.user import User


# JWT secret fail-closed: fora de dev/test, secret default/fraco impede o boot
def test_jwt_secret_required_outside_dev():
    with pytest.raises(ValidationError):
        Settings(environment="production", jwt_secret=_DEFAULT_JWT_SECRET)
    with pytest.raises(ValidationError):
        Settings(environment="staging", jwt_secret="curto")


def test_jwt_secret_default_tolerated_in_dev():
    s = Settings(environment="development", jwt_secret=_DEFAULT_JWT_SECRET)
    assert s.environment == "development"


# bcrypt: senha > 72 bytes não deve causar 500 (pré-hash SHA-256)
async def test_long_password_register_and_login(client):
    senha = "a" * 100
    r = await client.post(
        "/api/v1/auth/register", json={"email": "long@b.com", "password": senha}
    )
    assert r.status_code == 201
    r = await client.post(
        "/api/v1/auth/login", data={"username": "long@b.com", "password": senha}
    )
    assert r.status_code == 200
    assert r.json()["access_token"]


# login de usuário inativo deve ser rejeitado (401), sem emitir token
async def test_login_inactive_user(client, db_session):
    db_session.add(
        User(
            email="inactive@b.com",
            hashed_password=hash_password("password123"),
            is_active=False,
        )
    )
    await db_session.commit()
    r = await client.post(
        "/api/v1/auth/login",
        data={"username": "inactive@b.com", "password": "password123"},
    )
    assert r.status_code == 401


# PUT com campo NOT NULL = null deve retornar 422 (não 500/409)
async def test_put_carro_null_field_rejected(client, auth_headers, carro):
    r = await client.put(
        f"/api/v1/carros/{carro.id}", json={"cor": None}, headers=auth_headers
    )
    assert r.status_code == 422


async def test_put_modelo_null_field_rejected(client, auth_headers, modelo):
    r = await client.put(
        f"/api/v1/modelos/{modelo.id}", json={"nome": None}, headers=auth_headers
    )
    assert r.status_code == 422


async def test_put_marca_null_field_rejected(client, auth_headers, marca):
    r = await client.put(
        f"/api/v1/marcas/{marca.id}", json={"nome_marca": None}, headers=auth_headers
    )
    assert r.status_code == 422


# update parcial (omitindo campos) continua funcionando
async def test_put_carro_partial_still_works(client, auth_headers, carro):
    r = await client.put(
        f"/api/v1/carros/{carro.id}", json={"cor": "BRANCO"}, headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["cor"] == "BRANCO"


# CHECK constraint no banco rejeita combustivel fora do enum
async def test_combustivel_check_constraint(db_session, modelo):
    with pytest.raises(IntegrityError):
        await db_session.execute(
            text(
                "INSERT INTO carros "
                "(modelo_id, ano, combustivel, num_portas, cor, quilometragem, valor_anuncio) "
                "VALUES (:m, 2020, 'PLASMA', 4, 'X', 0, 1.0)"
            ),
            {"m": modelo.id},
        )
        await db_session.flush()
    await db_session.rollback()


# valores monetários são serializados como número (não string)
async def test_money_serialized_as_number(client, carro):
    r = await client.get(f"/api/v1/carros/{carro.id}")
    assert r.status_code == 200
    assert isinstance(r.json()["valor_anuncio"], (int, float))
    assert r.json()["valor_anuncio"] == 95000.0


# PUT com vários campos NOT NULL = null deve listar todos na mensagem (não apenas o primeiro)
async def test_put_carro_multiple_null_fields_listed(client, auth_headers, carro):
    r = await client.put(
        f"/api/v1/carros/{carro.id}",
        json={"cor": None, "ano": None, "num_portas": None},
        headers=auth_headers,
    )
    assert r.status_code == 422
    msg = r.text
    assert "ano" in msg and "cor" in msg and "num_portas" in msg


# Paginação: skip/limit devolvem a fatia correta e o total é o do banco inteiro
async def test_pagination_skip_limit(client, auth_headers, marca):
    for i in range(5):
        r = await client.post(
            "/api/v1/modelos",
            json={
                "marca_id": marca.id,
                "nome": f"MODELO-{i}",
                "valor_fipe": "10000.00",
            },
            headers=auth_headers,
        )
        assert r.status_code == 201

    r = await client.get("/api/v1/modelos?skip=1&limit=2")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 5
    assert body["skip"] == 1
    assert body["limit"] == 2
    assert len(body["items"]) == 2
    nomes = [m["nome"] for m in body["items"]]
    assert nomes == ["MODELO-1", "MODELO-2"]


# Paginação: limit > total devolve todos; skip além do total devolve lista vazia
async def test_pagination_edge_cases(client, auth_headers, marca):
    for i in range(3):
        await client.post(
            "/api/v1/modelos",
            json={
                "marca_id": marca.id,
                "nome": f"M-{i}",
                "valor_fipe": "1.00",
            },
            headers=auth_headers,
        )

    r = await client.get("/api/v1/modelos?skip=0&limit=100")
    assert r.json()["total"] == 3 and len(r.json()["items"]) == 3

    r = await client.get("/api/v1/modelos?skip=10&limit=10")
    assert r.json()["total"] == 3 and r.json()["items"] == []


# Paginação: parâmetros inválidos viram 422 (skip < 0, limit fora de 1..200)
async def test_pagination_invalid_params(client):
    assert (await client.get("/api/v1/modelos?skip=-1")).status_code == 422
    assert (await client.get("/api/v1/modelos?limit=0")).status_code == 422
    assert (await client.get("/api/v1/modelos?limit=999")).status_code == 422
