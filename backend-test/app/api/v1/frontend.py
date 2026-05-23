"""Endpoint otimizado para consumo do front-end (listagem de modelos)."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.frontend import FlatCarsResponse, FrontendModelsResponse
from app.services.frontend_service import FrontendService

router = APIRouter()


@router.get(
    "/models",
    response_model=FrontendModelsResponse | FlatCarsResponse,
    summary="Listagem de modelos agrupada por marca (com seus carros)",
)
async def list_models(
    db: DbSession,
    marca_id: Annotated[int | None, Query(description="Filtra por marca")] = None,
    flat: Annotated[
        bool,
        Query(description="Formato plano {cars:[...]} compatível com cars_by_brand.json"),
    ] = False,
):
    service = FrontendService(db)
    if flat:
        return await service.list_flat(marca_id)
    return await service.list_grouped(marca_id)
