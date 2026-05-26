"""CRUD de Carros + geração de descrição via IA.

Escrita protegida por JWT; leitura pública.
"""

from fastapi import APIRouter, Depends, status

from app.api.deps import AiService, DbSession, PaginationParams, get_current_user
from app.core.exceptions import AIServiceUnavailableError
from app.schemas.carro import CarroCreate, CarroReadWithModelo, CarroUpdate
from app.schemas.common import Page, paginated
from app.services.carro_service import CarroService

router = APIRouter()


@router.get("", response_model=Page[CarroReadWithModelo])
async def list_carros(db: DbSession, pagination: PaginationParams) -> dict:
    items, total = await CarroService(db).list(pagination.skip, pagination.limit)
    return paginated(items, total, pagination.skip, pagination.limit)


@router.get("/{carro_id}", response_model=CarroReadWithModelo)
async def get_carro(carro_id: int, db: DbSession):
    return await CarroService(db).get(carro_id)


@router.post(
    "",
    response_model=CarroReadWithModelo,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
async def create_carro(data: CarroCreate, db: DbSession, ai: AiService):
    service = CarroService(db)
    carro = await service.create(data)
    # Geração opcional: se a IA estiver indisponível, o carro permanece criado
    # (sem descrição) em vez de falhar o POST.
    if data.generate_description:
        try:
            carro = await service.generate_description(carro.id, ai)
        except AIServiceUnavailableError:
            pass
    return carro


@router.put(
    "/{carro_id}",
    response_model=CarroReadWithModelo,
    dependencies=[Depends(get_current_user)],
)
async def update_carro(carro_id: int, data: CarroUpdate, db: DbSession):
    return await CarroService(db).update(carro_id, data)


@router.post(
    "/{carro_id}/description",
    response_model=CarroReadWithModelo,
    dependencies=[Depends(get_current_user)],
    summary="Gera (ou regenera) a descrição de venda via IA (Claude)",
)
async def generate_carro_description(carro_id: int, db: DbSession, ai: AiService):
    return await CarroService(db).generate_description(carro_id, ai)


@router.delete(
    "/{carro_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_user)],
)
async def delete_carro(carro_id: int, db: DbSession) -> None:
    await CarroService(db).delete(carro_id)
