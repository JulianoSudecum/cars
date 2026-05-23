"""Schemas utilitários compartilhados."""

from decimal import Decimal
from typing import Annotated, ClassVar, Generic, TypeVar

from pydantic import BaseModel, Field, PlainSerializer, model_validator

T = TypeVar("T")

# Valor monetário: validado como Decimal(12,2) na entrada e serializado como
# número (float) no JSON de saída — compatível com os JSONs externos do front,
# que usam `valor` numérico.
Money = Annotated[
    Decimal,
    Field(ge=0, max_digits=12, decimal_places=2),
    PlainSerializer(lambda v: float(v), return_type=float, when_used="json"),
]


class Page(BaseModel, Generic[T]):
    """Envelope de listagem paginada."""

    items: list[T]
    total: int
    skip: int
    limit: int


class Message(BaseModel):
    detail: str


class RejectNullMixin(BaseModel):
    """Rejeita (422) campos enviados explicitamente como null quando mapeiam
    colunas NOT NULL — distinguindo 'omitido' (ok em update parcial) de
    'null explícito' (inválido). Subclasses definem `_non_nullable_fields`.
    """

    _non_nullable_fields: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="before")
    @classmethod
    def _reject_explicit_null(cls, data: object) -> object:
        if isinstance(data, dict):
            nulled = sorted(
                f for f in cls._non_nullable_fields if f in data and data[f] is None
            )
            if nulled:
                raise ValueError("Campos não podem ser nulos: " + ", ".join(nulled))
        return data
