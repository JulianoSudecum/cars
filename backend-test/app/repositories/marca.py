"""Repository da entidade Marca."""

from sqlalchemy import func, select

from app.models.marca import Marca
from app.models.modelo import Modelo
from app.repositories.base import BaseRepository


class MarcaRepository(BaseRepository[Marca]):
    model = Marca

    async def count_modelos(self, marca_id: int) -> int:
        stmt = select(func.count()).select_from(Modelo).where(Modelo.marca_id == marca_id)
        result = await self.session.execute(stmt)
        return result.scalar_one()
