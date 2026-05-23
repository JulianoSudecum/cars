"""Model da entidade Carro."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import Combustivel
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.modelo import Modelo

_COMBUSTIVEL_VALUES = ", ".join(f"'{c.value}'" for c in Combustivel)


class Carro(Base):
    __tablename__ = "carros"
    __table_args__ = (
        CheckConstraint(
            f"combustivel IN ({_COMBUSTIVEL_VALUES})",
            name="combustivel",  # naming_convention prefixa -> ck_carros_combustivel
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    modelo_id: Mapped[int] = mapped_column(
        ForeignKey("modelos.id", ondelete="RESTRICT"), index=True
    )
    timestamp_cadastro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    ano: Mapped[int] = mapped_column(Integer)
    combustivel: Mapped[str] = mapped_column(String(20))
    num_portas: Mapped[int] = mapped_column(Integer)
    cor: Mapped[str] = mapped_column(String(40))
    quilometragem: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0")
    )
    valor_anuncio: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)

    modelo: Mapped[Modelo] = relationship(back_populates="carros")
