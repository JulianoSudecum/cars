"""Dependências compartilhadas dos endpoints (injeção do FastAPI)."""

from collections.abc import AsyncGenerator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.repositories.user import UserRepository
from app.services.ai.anthropic_provider import (
    AnthropicDescriptionGenerator,
    UnavailableDescriptionGenerator,
)
from app.services.ai.base import DescriptionGenerator


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Fornece uma sessão de banco por request, encerrada ao fim."""
    async with AsyncSessionLocal() as session:
        yield session


DbSession = Annotated[AsyncSession, Depends(get_db)]


class Pagination:
    """Parâmetros de paginação (?skip=&limit=)."""

    def __init__(
        self,
        skip: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=200)] = 50,
    ) -> None:
        self.skip = skip
        self.limit = limit


PaginationParams = Annotated[Pagination, Depends(Pagination)]


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: DbSession
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
        user_id = int(subject)
    except (jwt.PyJWTError, ValueError, TypeError) as exc:
        raise credentials_exception from exc

    user = await UserRepository(db).get(user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_ai_service() -> DescriptionGenerator:
    """Provider de geração de descrição. Sem API key, retorna um provider que
    sempre responde indisponível (→ 503), sem derrubar a aplicação."""
    if not settings.anthropic_api_key:
        return UnavailableDescriptionGenerator()
    return AnthropicDescriptionGenerator(
        api_key=settings.anthropic_api_key,
        model=settings.anthropic_model,
        max_tokens=settings.anthropic_max_tokens,
    )


AiService = Annotated[DescriptionGenerator, Depends(get_ai_service)]
