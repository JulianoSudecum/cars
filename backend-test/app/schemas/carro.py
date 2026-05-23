"""Schemas da entidade Carro."""

from datetime import UTC, datetime
from decimal import Decimal
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import Combustivel
from app.schemas.common import Money, RejectNullMixin
from app.schemas.modelo import ModeloReadWithMarca

_MAX_ANO_OFFSET = 1  # permite o ano-modelo do próximo ano


def _max_ano() -> int:
    return datetime.now(UTC).year + _MAX_ANO_OFFSET


class CarroBase(BaseModel):
    # use_enum_values garante que combustivel seja persistido/serializado como
    # o valor string ("FLEX") e não como o membro do enum.
    model_config = ConfigDict(use_enum_values=True)

    modelo_id: int
    ano: int = Field(ge=1900)
    combustivel: Combustivel
    num_portas: int = Field(ge=1, le=8)
    cor: str = Field(min_length=1, max_length=40)
    quilometragem: int = Field(default=0, ge=0)
    valor_anuncio: Money
    descricao: str | None = None

    @field_validator("ano")
    @classmethod
    def _validate_ano(cls, value: int) -> int:
        if value > _max_ano():
            raise ValueError(f"ano não pode ser maior que {_max_ano()}")
        return value


class CarroCreate(CarroBase):
    # Quando True e houver ANTHROPIC_API_KEY, gera a descrição via Claude após criar.
    generate_description: bool = False


class CarroUpdate(RejectNullMixin):
    model_config = ConfigDict(use_enum_values=True)
    _non_nullable_fields: ClassVar[frozenset[str]] = frozenset(
        {
            "modelo_id",
            "ano",
            "combustivel",
            "num_portas",
            "cor",
            "quilometragem",
            "valor_anuncio",
        }
    )

    modelo_id: int | None = None
    ano: int | None = Field(default=None, ge=1900)
    combustivel: Combustivel | None = None
    num_portas: int | None = Field(default=None, ge=1, le=8)
    cor: str | None = Field(default=None, min_length=1, max_length=40)
    quilometragem: int | None = Field(default=None, ge=0)
    valor_anuncio: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    descricao: str | None = None

    @field_validator("ano")
    @classmethod
    def _validate_ano(cls, value: int | None) -> int | None:
        if value is not None and value > _max_ano():
            raise ValueError(f"ano não pode ser maior que {_max_ano()}")
        return value


class CarroRead(CarroBase):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    timestamp_cadastro: datetime


class CarroReadWithModelo(CarroRead):
    """Inclui o modelo (e marca) aninhados."""

    modelo: ModeloReadWithMarca
