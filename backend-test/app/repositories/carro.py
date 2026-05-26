"""Repository da entidade Carro."""

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.carro import Carro
from app.models.modelo import Modelo
from app.repositories.base import BaseRepository

# Eager loading de modelo→marca, evitando N+1 e lazy-load (proibido em async).
_RELATIONS = selectinload(Carro.modelo).selectinload(Modelo.marca)


class CarroRepository(BaseRepository[Carro]):
    model = Carro

    async def get_with_relations(self, carro_id: int) -> Carro | None:
        stmt = select(Carro).options(_RELATIONS).where(Carro.id == carro_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_with_relations(
        self, skip: int = 0, limit: int = 50
    ) -> Sequence[Carro]:
        stmt = (
            select(Carro)
            .options(_RELATIONS)
            .order_by(Carro.id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
