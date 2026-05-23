"""Ponto de entrada da aplicação FastAPI."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router, health
from app.core.config import settings
from app.core.exceptions import register_exception_handlers

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description=(
        "API REST de catálogo de veículos (Marca → Modelo → Carro) com CRUD, "
        "autenticação JWT, geração de descrição de venda via Claude e um "
        "endpoint otimizado para consumo do front-end."
    ),
)

# CORS — front-end pode estar hospedado em outro domínio.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

register_exception_handlers(app)

# Health na raiz (usado pelo healthcheck do container) e recursos sob /api/v1.
app.include_router(health.router)
app.include_router(api_router, prefix=settings.api_v1_prefix)
