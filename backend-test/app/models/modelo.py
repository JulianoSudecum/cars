"""Model da entidade Modelo."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.carro import Carro
    from app.models.marca import Marca


class Modelo(Base):
    __tablename__ = "modelos"

    id: Mapped[int] = mapped_column(primary_key=True)
    marca_id: Mapped[int] = mapped_column(
        ForeignKey("marcas.id", ondelete="RESTRICT"), index=True
    )
    nome: Mapped[str] = mapped_column(String(120), index=True)
    valor_fipe: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    marca: Mapped[Marca] = relationship(back_populates="modelos")
    carros: Mapped[list[Carro]] = relationship(
        back_populates="modelo", passive_deletes=True
    )
