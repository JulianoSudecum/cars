"""Seed do banco a partir dos JSONs de referência (app/data/*.json).

Idempotente: pode ser executado várias vezes sem duplicar registros.

Decisões de normalização (a origem é um dataset de teste com inconsistências):
- `valor` vem em notação de milhar com ponto (ex.: 36.000), que o JSON decodifica
  como 36.0; multiplicamos por 1000 para obter o valor em reais (→ valor_anuncio).
- `nome_marca` e `valor_fipe` não existem nos arquivos: a marca é inferida pelo
  nome do modelo (o `brand` da origem é um placeholder = 1 para todos) e o
  valor_fipe é sintetizado (~5% acima do anúncio).
- Timestamps inválidos (ano > 2100, como o "16965354321") caem para o horário atual.
- Vírgulas faltantes no cars_by_brand.json são corrigidas antes do parse.
"""

import json
import re
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.carro import Carro
from app.models.marca import Marca
from app.models.modelo import Modelo

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

# A marca é inferida pelo nome do modelo (conhecimento de domínio).
MARCA_POR_MODELO = {
    "ONIX PLUS": "CHEVROLET",
    "JETTA": "VOLKSWAGEN",
    "HILLUX SW4": "TOYOTA",
    "ETIOS": "TOYOTA",
    "COROLLA": "TOYOTA",
}
MARCA_PADRAO = "OUTRAS"

# Allowlist estática de tabelas com sequence de id (nunca recebe entrada de usuário).
_SEQUENCE_TABLES = ("marcas", "modelos", "carros")

# Corrige vírgula faltante entre o fim de um valor e a próxima chave ("...4\n "cor"").
_MISSING_COMMA = re.compile(r'([0-9"\]}])(\s*\n\s*)(")')


def _sanitize(raw: str) -> str:
    return _MISSING_COMMA.sub(r"\1,\2\3", raw)


def _load_cars(filename: str) -> list[dict]:
    raw = (DATA_DIR / filename).read_text(encoding="utf-8")
    return json.loads(_sanitize(raw))["cars"]


def merge_cars() -> list[dict]:
    """Consolida os carros dos dois arquivos, deduplicando por id."""
    by_id: dict[int, dict] = {}
    for car in _load_cars("cars.json"):
        by_id[car["id"]] = car
    for car in _load_cars("cars_by_brand.json"):
        by_id.setdefault(car["id"], car)
    return sorted(by_id.values(), key=lambda c: c["id"])


def valor_em_reais(valor: float) -> Decimal:
    return (Decimal(str(valor)) * 1000).quantize(Decimal("0.01"))


def parse_timestamp(ts: int) -> datetime:
    try:
        dt = datetime.fromtimestamp(int(ts), tz=UTC)
    except (OverflowError, OSError, ValueError):
        return datetime.now(UTC)
    return dt if dt.year <= 2100 else datetime.now(UTC)


async def _get_or_create_marca(
    session: AsyncSession, cache: dict[str, Marca], nome: str
) -> Marca:
    if nome in cache:
        return cache[nome]
    result = await session.execute(select(Marca).where(Marca.nome_marca == nome))
    marca = result.scalar_one_or_none()
    if marca is None:
        marca = Marca(nome_marca=nome)
        session.add(marca)
        await session.flush()
    cache[nome] = marca
    return marca


async def _get_or_create_modelo(
    session: AsyncSession,
    cache: dict[int, Modelo],
    modelo_id: int,
    nome: str,
    marca: Marca,
    valor_anuncio: Decimal,
) -> Modelo:
    if modelo_id in cache:
        return cache[modelo_id]
    modelo = await session.get(Modelo, modelo_id)
    if modelo is None:
        valor_fipe = (valor_anuncio * Decimal("1.05")).quantize(Decimal("0.01"))
        modelo = Modelo(
            id=modelo_id, nome=nome, marca_id=marca.id, valor_fipe=valor_fipe
        )
        session.add(modelo)
        await session.flush()
    cache[modelo_id] = modelo
    return modelo


async def _create_carro_if_absent(
    session: AsyncSession, car: dict, modelo: Modelo
) -> bool:
    if await session.get(Carro, car["id"]) is not None:
        return False
    session.add(
        Carro(
            id=car["id"],
            modelo_id=modelo.id,
            timestamp_cadastro=parse_timestamp(car["timestamp_cadastro"]),
            ano=car["ano"],
            combustivel=car["combustivel"],
            num_portas=car["num_portas"],
            cor=car["cor"],
            quilometragem=car.get("quilometragem", 0),
            valor_anuncio=valor_em_reais(car["valor"]),
        )
    )
    return True


async def _reset_sequences(session: AsyncSession) -> None:
    """Ajusta as sequences após inserts com id explícito (evita colisão em POSTs)."""
    for table in _SEQUENCE_TABLES:
        await session.execute(
            text(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM {table}), 1), "
                f"(SELECT COUNT(*) FROM {table}) > 0)"
            )
        )


async def seed() -> dict[str, int]:
    cars = merge_cars()
    marca_cache: dict[str, Marca] = {}
    modelo_cache: dict[int, Modelo] = {}
    carros_criados = 0
    async with AsyncSessionLocal() as session:
        for car in cars:
            nome_modelo = car["nome_modelo"]
            marca_nome = MARCA_POR_MODELO.get(nome_modelo, MARCA_PADRAO)
            marca = await _get_or_create_marca(session, marca_cache, marca_nome)
            modelo = await _get_or_create_modelo(
                session,
                modelo_cache,
                car["modelo_id"],
                nome_modelo,
                marca,
                valor_em_reais(car["valor"]),
            )
            if await _create_carro_if_absent(session, car, modelo):
                carros_criados += 1
        # Um único commit (inserts + reset de sequences na mesma transação),
        # evitando estado parcial caso o reset falhe.
        await session.flush()  # torna os inserts visíveis para setval()
        await _reset_sequences(session)
        await session.commit()
    return {
        "marcas": len(marca_cache),
        "modelos": len(modelo_cache),
        "carros_criados": carros_criados,
    }
