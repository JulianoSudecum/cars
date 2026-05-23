"""Configuração central da aplicação, carregada de variáveis de ambiente / .env."""

from functools import lru_cache
from typing import Annotated

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

_DEFAULT_JWT_SECRET = "troque-este-segredo-em-producao"
# Ambientes em que o segredo default é tolerado. Qualquer outro valor (incl.
# "production", "prod", "staging" ou typos) exige um segredo forte — fail-closed.
_DEV_ENVIRONMENTS = {"development", "dev", "test", "testing", "local"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Aplicação
    app_name: str = "Cars API"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"

    # Banco de dados
    database_url: str = "postgresql+asyncpg://cars:cars@localhost:5432/cars"

    # Autenticação (JWT)
    jwt_secret: str = _DEFAULT_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Claude API
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-haiku-4-5"
    anthropic_max_tokens: int = 600

    # CORS — NoDecode evita o JSON-decode automático do pydantic-settings,
    # deixando o validator abaixo tratar o valor como CSV.
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: object) -> object:
        """Aceita CORS_ORIGINS como CSV (`http://a,http://b`)."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("database_url", mode="after")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        """Normaliza a URL para o driver assíncrono (asyncpg).

        Plataformas gerenciadas (Render, Heroku, Railway) injetam a URL como
        ``postgres://`` ou ``postgresql://`` (driver síncrono); o SQLAlchemy
        async exige ``postgresql+asyncpg://``. Também remove ``sslmode`` da
        query — o asyncpg não reconhece esse parâmetro (usa ``ssl=...``).
        """
        if value.startswith("postgres://"):
            value = "postgresql+asyncpg://" + value[len("postgres://") :]
        elif value.startswith("postgresql://"):
            value = "postgresql+asyncpg://" + value[len("postgresql://") :]

        if "?" in value:
            base, _, query = value.partition("?")
            kept = [
                part
                for part in query.split("&")
                if part and not part.lower().startswith("sslmode=")
            ]
            value = base + ("?" + "&".join(kept) if kept else "")
        return value

    @model_validator(mode="after")
    def _validate_production_secrets(self) -> "Settings":
        """Fail-closed: fora de ambientes de desenvolvimento/teste, exige um
        JWT_SECRET forte (não-default e com >= 32 bytes)."""
        is_dev = self.environment.strip().lower() in _DEV_ENVIRONMENTS
        if not is_dev and (
            self.jwt_secret == _DEFAULT_JWT_SECRET or len(self.jwt_secret) < 32
        ):
            raise ValueError(
                "JWT_SECRET deve ser configurado com um valor forte (>= 32 bytes) "
                "fora de ambientes de desenvolvimento/teste"
            )
        return self

    @property
    def ai_enabled(self) -> bool:
        return bool(self.anthropic_api_key)


@lru_cache
def get_settings() -> Settings:
    """Instância única de Settings (cacheada)."""
    return Settings()


settings = get_settings()
