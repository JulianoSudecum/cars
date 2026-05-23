"""CLI para popular o banco com os dados de referência.

Uso: python -m scripts.seed
"""

import asyncio

from app.db.seed import seed
from app.db.session import engine


async def _main() -> None:
    result = await seed()
    print(f"Seed concluído: {result}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(_main())
