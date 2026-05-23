"""Regras de negócio da entidade Marca."""

from collections.abc import Sequence

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.marca import Marca
from app.repositories.marca import MarcaRepository
from app.schemas.marca import MarcaCreate, MarcaUpdate


class MarcaService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = MarcaRepository(session)

    async def get(self, marca_id: int) -> Marca:
        marca = await self.repo.get(marca_id)
        if marca is None:
            raise NotFoundError(f"Marca {marca_id} não encontrada")
        return marca

    async def list(self, skip: int, limit: int) -> tuple[Sequence[Marca], int]:
        items = await self.repo.list(skip, limit)
        total = await self.repo.count()
        return items, total

    async def create(self, data: MarcaCreate) -> Marca:
        marca = Marca(**data.model_dump())
        try:
            await self.repo.add(marca)
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError("Já existe uma marca com esse nome") from exc
        return marca

    async def update(self, marca_id: int, data: MarcaUpdate) -> Marca:
        marca = await self.get(marca_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(marca, field, value)
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError("Já existe uma marca com esse nome") from exc
        return marca

    async def delete(self, marca_id: int) -> None:
        marca = await self.get(marca_id)
        if await self.repo.count_modelos(marca_id) > 0:
            raise ConflictError(
                "Não é possível remover uma marca com modelos vinculados"
            )
        await self.repo.delete(marca)
        await self.session.commit()
