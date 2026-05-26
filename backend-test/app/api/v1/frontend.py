"""Endpoints otimizados para consumo do front-end."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.frontend import FlatCarsResponse, FrontendModelsResponse
from app.services.frontend_service import FrontendService

router = APIRouter()


@router.get(
    "/models",
    response_model=FrontendModelsResponse,
    summary="Listagem de modelos agrupada por marca (com seus carros)",
)
async def list_models(
    db: DbSession,
    marca_id: Annotated[int | None, Query(description="Filtra por marca")] = None,
) -> FrontendModelsResponse:
    return await FrontendService(db).list_grouped(marca_id)


@router.get(
    "/cars",
    response_model=FlatCarsResponse,
    summary="Listagem plana de carros (compatível com cars_by_brand.json)",
)
async def list_cars(
    db: DbSession,
    marca_id: Annotated[int | None, Query(description="Filtra por marca")] = None,
) -> FlatCarsResponse:
    return await FrontendService(db).list_flat(marca_id)
