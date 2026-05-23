"""Fixtures de teste.

Estratégia: os testes rodam contra um Postgres real (banco `cars_test`), criado
automaticamente se ausente. O schema é criado uma vez por sessão e cada teste é
isolado por TRUNCATE. A configuração de banco é forçada via variáveis de ambiente
ANTES de importar a aplicação, de modo que o engine global aponte para o banco de
teste.
"""

import os
from urllib.parse import urlparse

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", "postgresql+asyncpg://cars:cars@localhost:5433/cars_test"
)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["ANTHROPIC_API_KEY"] = ""  # garante o caminho "IA indisponível" por padrão
os.environ["JWT_SECRET"] = "test-secret-com-no-minimo-32-bytes-aaaaaaaaaa"

import asyncpg  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.api.deps import get_ai_service  # noqa: E402
from app.core.exceptions import AIServiceUnavailableError  # noqa: E402
from app.core.security import create_access_token, hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import AsyncSessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models.carro import Carro  # noqa: E402
from app.models.marca import Marca  # noqa: E402
from app.models.modelo import Modelo  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.ai.base import CarDescriptionInput  # noqa: E402

_TABLES = "carros, modelos, marcas, users"


async def _ensure_test_database() -> None:
    parsed = urlparse(TEST_DATABASE_URL.replace("+asyncpg", ""))
    dbname = parsed.path.lstrip("/")
    conn = await asyncpg.connect(
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        database="postgres",
    )
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", dbname
        )
        if not exists:
            await conn.execute(f'CREATE DATABASE "{dbname}"')
    finally:
        await conn.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _setup_schema():
    await _ensure_test_database()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _clean_tables():
    yield
    async with engine.begin() as conn:
        await conn.execute(text(f"TRUNCATE {_TABLES} RESTART IDENTITY CASCADE"))


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


@pytest_asyncio.fixture
async def db_session():
    async with AsyncSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def auth_headers(db_session) -> dict[str, str]:
    user = User(
        email="tester@example.com",
        hashed_password=hash_password("password123"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return {"Authorization": f"Bearer {create_access_token(subject=str(user.id))}"}


# ---- Fixtures de dados de domínio ----


@pytest_asyncio.fixture
async def marca(db_session) -> Marca:
    m = Marca(nome_marca="TOYOTA")
    db_session.add(m)
    await db_session.commit()
    await db_session.refresh(m)
    return m


@pytest_asyncio.fixture
async def modelo(db_session, marca) -> Modelo:
    from decimal import Decimal

    mo = Modelo(marca_id=marca.id, nome="COROLLA", valor_fipe=Decimal("120000.00"))
    db_session.add(mo)
    await db_session.commit()
    await db_session.refresh(mo)
    return mo


@pytest_asyncio.fixture
async def carro(db_session, modelo) -> Carro:
    from decimal import Decimal

    c = Carro(
        modelo_id=modelo.id,
        ano=2020,
        combustivel="FLEX",
        num_portas=4,
        cor="PRATA",
        quilometragem=10000,
        valor_anuncio=Decimal("95000.00"),
    )
    db_session.add(c)
    await db_session.commit()
    await db_session.refresh(c)
    return c


# ---- Overrides do serviço de IA ----


@pytest_asyncio.fixture
def mock_ai_ok():
    class _StubOK:
        async def generate(self, data: CarDescriptionInput) -> str:
            return f"{data.nome_marca} {data.nome_modelo} {data.ano}: ótimo estado."

    app.dependency_overrides[get_ai_service] = lambda: _StubOK()
    yield
    app.dependency_overrides.pop(get_ai_service, None)


@pytest_asyncio.fixture
def mock_ai_unavailable():
    class _StubUnavailable:
        async def generate(self, data: CarDescriptionInput) -> str:
            raise AIServiceUnavailableError("indisponível (teste)")

    app.dependency_overrides[get_ai_service] = lambda: _StubUnavailable()
    yield
    app.dependency_overrides.pop(get_ai_service, None)
