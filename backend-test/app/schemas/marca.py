"""Schemas da entidade Marca."""

from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import RejectNullMixin


class MarcaBase(BaseModel):
    nome_marca: str = Field(min_length=1, max_length=120)


class MarcaCreate(MarcaBase):
    pass


class MarcaUpdate(RejectNullMixin):
    _non_nullable_fields: ClassVar[frozenset[str]] = frozenset({"nome_marca"})

    nome_marca: str | None = Field(default=None, min_length=1, max_length=120)


class MarcaRead(MarcaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
