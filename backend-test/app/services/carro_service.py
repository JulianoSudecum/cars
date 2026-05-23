"""Regras de negócio da entidade Carro."""

from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.carro import Carro
from app.repositories.carro import CarroRepository
from app.repositories.modelo import ModeloRepository
from app.schemas.carro import CarroCreate, CarroUpdate
from app.services.ai.base import CarDescriptionInput, DescriptionGenerator


class CarroService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = CarroRepository(session)
        self.modelo_repo = ModeloRepository(session)

    async def _ensure_modelo(self, modelo_id: int) -> None:
        if await self.modelo_repo.get(modelo_id) is None:
            raise NotFoundError(f"Modelo {modelo_id} não encontrado")

    async def get(self, carro_id: int) -> Carro:
        carro = await self.repo.get_with_relations(carro_id)
        if carro is None:
            raise NotFoundError(f"Carro {carro_id} não encontrado")
        return carro

    async def list(self, skip: int, limit: int) -> tuple[Sequence[Carro], int]:
        items = await self.repo.list_with_relations(skip, limit)
        total = await self.repo.count()
        return items, total

    async def create(self, data: CarroCreate) -> Carro:
        await self._ensure_modelo(data.modelo_id)
        # generate_description não é coluna; é tratado no router (geração via IA).
        payload = data.model_dump(exclude={"generate_description"})
        carro = Carro(**payload)
        await self.repo.add(carro)
        await self.session.commit()
        return await self.get(carro.id)

    async def update(self, carro_id: int, data: CarroUpdate) -> Carro:
        carro = await self.get(carro_id)
        updates = data.model_dump(exclude_unset=True)
        if "modelo_id" in updates:
            await self._ensure_modelo(updates["modelo_id"])
        for field, value in updates.items():
            setattr(carro, field, value)
        await self.session.commit()
        return await self.get(carro_id)

    async def generate_description(
        self, carro_id: int, ai: DescriptionGenerator
    ) -> Carro:
        """Gera a descrição de venda via IA e persiste no carro."""
        carro = await self.get(carro_id)  # carrega modelo + marca (eager)
        payload = CarDescriptionInput(
            nome_marca=carro.modelo.marca.nome_marca,
            nome_modelo=carro.modelo.nome,
            ano=carro.ano,
            cor=carro.cor,
            combustivel=carro.combustivel,
            num_portas=carro.num_portas,
            quilometragem=carro.quilometragem,
            valor_anuncio=carro.valor_anuncio,
            valor_fipe=carro.modelo.valor_fipe,
        )
        carro.descricao = await ai.generate(payload)
        await self.session.commit()
        return await self.get(carro_id)

    async def delete(self, carro_id: int) -> None:
        carro = await self.get(carro_id)
        await self.repo.delete(carro)
        await self.session.commit()
