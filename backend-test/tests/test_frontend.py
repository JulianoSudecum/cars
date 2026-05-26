from sqlalchemy import select

from app.db.seed import seed
from app.models.marca import Marca


async def test_frontend_grouped(client):
    await seed()
    r = await client.get("/api/v1/frontend/models")
    assert r.status_code == 200
    body = r.json()
    assert "brands" in body

    nomes = {b["nome_marca"] for b in body["brands"]}
    assert {"TOYOTA", "CHEVROLET", "VOLKSWAGEN"} <= nomes

    for brand in body["brands"]:
        for modelo in brand["models"]:
            assert "valor_fipe" in modelo
            for car in modelo["cars"]:
                # itens espelham as chaves do JSON externo
                assert car["brand"] == brand["brand"]
                assert car["nome_modelo"] == modelo["nome_modelo"]
                assert "valor" in car
                assert isinstance(car["timestamp_cadastro"], int)


async def test_frontend_flat(client):
    await seed()
    r = await client.get("/api/v1/frontend/cars")
    assert r.status_code == 200
    body = r.json()
    assert "cars" in body
    assert len(body["cars"]) == 5
    ids = [c["id"] for c in body["cars"]]
    assert ids == sorted(ids)


async def test_frontend_cars_filter_by_marca(client, db_session):
    from sqlalchemy import select

    from app.models.marca import Marca

    await seed()
    result = await db_session.execute(
        select(Marca).where(Marca.nome_marca == "TOYOTA")
    )
    marca = result.scalar_one()

    r = await client.get(f"/api/v1/frontend/cars?marca_id={marca.id}")
    assert r.status_code == 200
    body = r.json()
    assert all(c["brand"] == marca.id for c in body["cars"])


async def test_frontend_filter_by_marca(client, db_session):
    await seed()
    result = await db_session.execute(
        select(Marca).where(Marca.nome_marca == "CHEVROLET")
    )
    marca = result.scalar_one()

    r = await client.get(f"/api/v1/frontend/models?marca_id={marca.id}")
    assert r.status_code == 200
    body = r.json()
    assert len(body["brands"]) == 1
    assert body["brands"][0]["nome_marca"] == "CHEVROLET"


async def test_frontend_empty(client):
    r = await client.get("/api/v1/frontend/models")
    assert r.status_code == 200
    assert r.json() == {"brands": []}
