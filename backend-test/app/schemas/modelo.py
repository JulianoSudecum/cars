"""Schemas da entidade Modelo."""

from decimal import Decimal
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Money, RejectNullMixin
from app.schemas.marca import MarcaRead


class ModeloBase(BaseModel):
    marca_id: int
    nome: str = Field(min_length=1, max_length=120)
    valor_fipe: Money


class ModeloCreate(ModeloBase):
    pass


class ModeloUpdate(RejectNullMixin):
    _non_nullable_fields: ClassVar[frozenset[str]] = frozenset(
        {"marca_id", "nome", "valor_fipe"}
    )

    marca_id: int | None = None
    nome: str | None = Field(default=None, min_length=1, max_length=120)
    valor_fipe: Decimal | None = Field(
        default=None, ge=0, max_digits=12, decimal_places=2
    )


class ModeloRead(ModeloBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ModeloReadWithMarca(ModeloRead):
    """Inclui a marca aninhada (para respostas mais ricas)."""

    marca: MarcaRead
