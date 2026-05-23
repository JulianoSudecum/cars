"""Aguarda o banco aceitar conexões antes de migrar e subir a API.

Usa a ``DATABASE_URL`` da aplicação (já normalizada para asyncpg), o que torna
o boot portável entre o docker-compose e plataformas gerenciadas (Render etc.)
sem depender de variáveis separadas de host/porta como o ``pg_isready``.
"""

from __future__ import annotations

import asyncio
import sys

from sqlalchemy import text

from app.db.session import engine

MAX_ATTEMPTS = 60
DELAY_SECONDS = 1.0


async def wait_for_db() -> None:
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print(f"Banco disponível (tentativa {attempt}).")
            await engine.dispose()
            return
        except Exception as exc:  # noqa: BLE001 - espera resiliente no boot
            print(f"Banco indisponível (tentativa {attempt}/{MAX_ATTEMPTS}): {exc}")
            await asyncio.sleep(DELAY_SECONDS)

    await engine.dispose()
    print("Timeout aguardando o banco de dados.", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    asyncio.run(wait_for_db())
