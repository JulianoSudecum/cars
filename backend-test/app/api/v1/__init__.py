"""Agregador dos routers de recursos da v1 da API.

O `health` é registrado à parte, na raiz da aplicação (ver app/main.py).
"""

from fastapi import APIRouter

from app.api.v1 import auth, carros, frontend, marcas, modelos

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(marcas.router, prefix="/marcas", tags=["marcas"])
api_router.include_router(modelos.router, prefix="/modelos", tags=["modelos"])
api_router.include_router(carros.router, prefix="/carros", tags=["carros"])
api_router.include_router(frontend.router, prefix="/frontend", tags=["frontend"])
