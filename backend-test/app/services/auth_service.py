"""Regras de negócio de autenticação (registro e login)."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import UserCreate


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = UserRepository(session)

    async def register(self, data: UserCreate) -> User:
        if await self.repo.get_by_email(data.email) is not None:
            raise ConflictError("E-mail já cadastrado")
        user = User(email=data.email, hashed_password=hash_password(data.password))
        try:
            await self.repo.add(user)
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError("E-mail já cadastrado") from exc
        return user

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.repo.get_by_email(email)
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
