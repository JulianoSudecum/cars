"""Exceções de domínio e handlers que as mapeiam para respostas HTTP."""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class DomainError(Exception):
    """Base para erros de negócio mapeáveis a um status HTTP."""

    status_code: int = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


class NotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(DomainError):
    """Violação de regra/integridade (ex.: apagar pai com filhos, e-mail duplicado)."""

    status_code = status.HTTP_409_CONFLICT


class AIServiceUnavailableError(DomainError):
    """Serviço de IA indisponível (sem API key, timeout, rate-limit, etc.)."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code, content={"detail": exc.detail}
        )

    @app.exception_handler(IntegrityError)
    async def _integrity_error_handler(_: Request, exc: IntegrityError) -> JSONResponse:
        # Rede de segurança: qualquer violação de integridade (FK/unique/NOT NULL)
        # que escape das checagens de domínio vira 409 em vez de 500.
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "Violação de restrição de integridade dos dados"},
        )
