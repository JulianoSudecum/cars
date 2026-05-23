"""Serviço do endpoint otimizado para consumo do front-end."""

from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.carro import Carro
from app.models.modelo import Modelo
from app.repositories.modelo import ModeloRepository
from app.schemas.frontend import (
    BrandGroup,
    FlatCarsResponse,
    FrontendCarItem,
    FrontendModelsResponse,
    ModelGroup,
)


def _to_epoch(dt: datetime) -> int:
    """Epoch em segundos; trata datetime naive como UTC (defensivo)."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return int(dt.timestamp())


class FrontendService:
    def __init__(self, session: AsyncSession) -> None:
        self.modelo_repo = ModeloRepository(session)

    @staticmethod
    def _to_item(carro: Carro, modelo: Modelo) -> FrontendCarItem:
        # Usa o `modelo` do laço (já carregado) para não acessar carro.modelo
        # (lazy-load proibido em async).
        return FrontendCarItem(
            id=carro.id,
            timestamp_cadastro=_to_epoch(carro.timestamp_cadastro),
            modelo_id=modelo.id,
            ano=carro.ano,
            combustivel=carro.combustivel,
            num_portas=carro.num_portas,
            cor=carro.cor,
            nome_modelo=modelo.nome,
            valor=carro.valor_anuncio,
            brand=modelo.marca_id,
        )

    async def list_grouped(self, marca_id: int | None = None) -> FrontendModelsResponse:
        modelos = await self.modelo_repo.list_all_for_frontend(marca_id)
        brands: dict[int, BrandGroup] = {}
        for modelo in modelos:
            marca = modelo.marca
            group = brands.get(marca.id)
            if group is None:
                group = BrandGroup(
                    brand=marca.id, nome_marca=marca.nome_marca, models=[]
                )
                brands[marca.id] = group
            group.models.append(
                ModelGroup(
                    modelo_id=modelo.id,
                    nome_modelo=modelo.nome,
                    valor_fipe=modelo.valor_fipe,
                    cars=[self._to_item(c, modelo) for c in modelo.carros],
                )
            )
        return FrontendModelsResponse(brands=list(brands.values()))

    async def list_flat(self, marca_id: int | None = None) -> FlatCarsResponse:
        modelos = await self.modelo_repo.list_all_for_frontend(marca_id)
        items: list[FrontendCarItem] = []
        for modelo in modelos:
            items.extend(self._to_item(c, modelo) for c in modelo.carros)
        items.sort(key=lambda item: item.id)
        return FlatCarsResponse(cars=items)
