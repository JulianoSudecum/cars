"""Repository da entidade Modelo."""

from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.carro import Carro
from app.models.modelo import Modelo
from app.repositories.base import BaseRepository


class ModeloRepository(BaseRepository[Modelo]):
    model = Modelo

    async def get_with_marca(self, modelo_id: int) -> Modelo | None:
        stmt = (
            select(Modelo)
            .options(selectinload(Modelo.marca))
            .where(Modelo.id == modelo_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_with_marca(self, skip: int = 0, limit: int = 50) -> Sequence[Modelo]:
        stmt = (
            select(Modelo)
            .options(selectinload(Modelo.marca))
            .order_by(Modelo.id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count_carros(self, modelo_id: int) -> int:
        stmt = select(func.count()).select_from(Carro).where(Carro.modelo_id == modelo_id)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def list_all_for_frontend(
        self, marca_id: int | None = None
    ) -> Sequence[Modelo]:
        """Modelos com marca e carros (eager) para o endpoint de front-end."""
        stmt = (
            select(Modelo)
            .options(selectinload(Modelo.marca), selectinload(Modelo.carros))
            .order_by(Modelo.marca_id, Modelo.id)
        )
        if marca_id is not None:
            stmt = stmt.where(Modelo.marca_id == marca_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()
