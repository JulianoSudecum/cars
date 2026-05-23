"""CRUD de Modelos. Escrita protegida por JWT; leitura pública."""

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, PaginationParams, get_current_user
from app.schemas.common import Page
from app.schemas.modelo import ModeloCreate, ModeloReadWithMarca, ModeloUpdate
from app.services.modelo_service import ModeloService

router = APIRouter()


@router.get("", response_model=Page[ModeloReadWithMarca])
async def list_modelos(db: DbSession, pagination: PaginationParams) -> dict:
    items, total = await ModeloService(db).list(pagination.skip, pagination.limit)
    return {"items": items, "total": total, "skip": pagination.skip, "limit": pagination.limit}


@router.get("/{modelo_id}", response_model=ModeloReadWithMarca)
async def get_modelo(modelo_id: int, db: DbSession):
    return await ModeloService(db).get(modelo_id)


@router.post(
    "",
    response_model=ModeloReadWithMarca,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
async def create_modelo(data: ModeloCreate, db: DbSession):
    return await ModeloService(db).create(data)


@router.put(
    "/{modelo_id}",
    response_model=ModeloReadWithMarca,
    dependencies=[Depends(get_current_user)],
)
async def update_modelo(modelo_id: int, data: ModeloUpdate, db: DbSession):
    return await ModeloService(db).update(modelo_id, data)


@router.delete(
    "/{modelo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_user)],
)
async def delete_modelo(modelo_id: int, db: DbSession) -> None:
    await ModeloService(db).delete(modelo_id)
