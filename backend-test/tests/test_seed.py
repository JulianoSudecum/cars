import json
from decimal import Decimal

from app.db.seed import (
    _sanitize,
    merge_cars,
    parse_timestamp,
    seed,
    valor_em_reais,
)


def test_valor_em_reais():
    assert valor_em_reais(50.0) == Decimal("50000.00")
    assert valor_em_reais(36.0) == Decimal("36000.00")
    assert valor_em_reais(47.5) == Decimal("47500.00")


def test_parse_timestamp_valido():
    assert parse_timestamp(1696539488).year == 2023


def test_parse_timestamp_invalido_cai_para_atual():
    # 16965354321 corresponde a ~ano 2507 (typo do dataset original)
    assert parse_timestamp(16965354321).year <= 2100


def test_sanitize_insere_virgula_faltante():
    raw = '{\n  "a": 4\n  "b": 5\n}'
    assert json.loads(_sanitize(raw)) == {"a": 4, "b": 5}


def test_merge_cars_deduplica_por_id():
    cars = merge_cars()
    ids = {c["id"] for c in cars}
    assert ids == {1, 2, 3, 23, 55}


async def test_seed_idempotente(client):
    primeiro = await seed()
    assert primeiro["carros_criados"] == 5
    assert primeiro["marcas"] == 3
    assert primeiro["modelos"] == 5

    segundo = await seed()
    assert segundo["carros_criados"] == 0
