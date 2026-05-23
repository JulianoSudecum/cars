"""Regras de negócio da entidade Modelo."""

from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.modelo import Modelo
from app.repositories.marca import MarcaRepository
from app.repositories.modelo import ModeloRepository
from app.schemas.modelo import ModeloCreate, ModeloUpdate


class ModeloService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = ModeloRepository(session)
        self.marca_repo = MarcaRepository(session)

    async def _ensure_marca(self, marca_id: int) -> None:
        if await self.marca_repo.get(marca_id) is None:
            raise NotFoundError(f"Marca {marca_id} não encontrada")

    async def get(self, modelo_id: int) -> Modelo:
        modelo = await self.repo.get_with_marca(modelo_id)
        if modelo is None:
            raise NotFoundError(f"Modelo {modelo_id} não encontrado")
        return modelo

    async def list(self, skip: int, limit: int) -> tuple[Sequence[Modelo], int]:
        items = await self.repo.list_with_marca(skip, limit)
        total = await self.repo.count()
        return items, total

    async def create(self, data: ModeloCreate) -> Modelo:
        await self._ensure_marca(data.marca_id)
        modelo = Modelo(**data.model_dump())
        await self.repo.add(modelo)
        await self.session.commit()
        return await self.get(modelo.id)

    async def update(self, modelo_id: int, data: ModeloUpdate) -> Modelo:
        modelo = await self.get(modelo_id)
        updates = data.model_dump(exclude_unset=True)
        if "marca_id" in updates:
            await self._ensure_marca(updates["marca_id"])
        for field, value in updates.items():
            setattr(modelo, field, value)
        await self.session.commit()
        return await self.get(modelo_id)

    async def delete(self, modelo_id: int) -> None:
        modelo = await self.get(modelo_id)
        if await self.repo.count_carros(modelo_id) > 0:
            raise ConflictError(
                "Não é possível remover um modelo com carros vinculados"
            )
        await self.repo.delete(modelo)
        await self.session.commit()
