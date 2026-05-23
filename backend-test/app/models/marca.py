"""Model da entidade Marca."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.modelo import Modelo


class Marca(Base):
    __tablename__ = "marcas"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome_marca: Mapped[str] = mapped_column(String(120), unique=True, index=True)

    modelos: Mapped[list[Modelo]] = relationship(
        back_populates="marca", passive_deletes=True
    )
