"""CRUD de Marcas. Escrita protegida por JWT; leitura pública."""

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, PaginationParams, get_current_user
from app.schemas.common import Page, paginated
from app.schemas.marca import MarcaCreate, MarcaRead, MarcaUpdate
from app.services.marca_service import MarcaService

router = APIRouter()


@router.get("", response_model=Page[MarcaRead])
async def list_marcas(db: DbSession, pagination: PaginationParams) -> dict:
    items, total = await MarcaService(db).list(pagination.skip, pagination.limit)
    return paginated(items, total, pagination.skip, pagination.limit)


@router.get("/{marca_id}", response_model=MarcaRead)
async def get_marca(marca_id: int, db: DbSession):
    return await MarcaService(db).get(marca_id)


@router.post(
    "",
    response_model=MarcaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
async def create_marca(data: MarcaCreate, db: DbSession):
    return await MarcaService(db).create(data)


@router.put(
    "/{marca_id}",
    response_model=MarcaRead,
    dependencies=[Depends(get_current_user)],
)
async def update_marca(marca_id: int, data: MarcaUpdate, db: DbSession):
    return await MarcaService(db).update(marca_id, data)


@router.delete(
    "/{marca_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_user)],
)
async def delete_marca(marca_id: int, db: DbSession) -> None:
    await MarcaService(db).delete(marca_id)
