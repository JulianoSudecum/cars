"""Engine e fábrica de sessões assíncronas do SQLAlchemy."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    future=True,
)

# expire_on_commit=False evita round-trips extras (e MissingGreenlet) ao ler
# atributos de um objeto após o commit, comportamento desejável em async.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Context-manager de sessão para uso fora do FastAPI (seed, scripts)."""
    async with AsyncSessionLocal() as session:
        yield session
