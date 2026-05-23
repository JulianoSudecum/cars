"""Declarative base do SQLAlchemy.

Centraliza a `MetaData` com uma convenção de nomes determinística (importante
para que o autogenerate do Alembic produza nomes de constraints estáveis) e
reexporta todos os models, de modo que `Base.metadata` conheça todas as tabelas.
"""

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# Importa os models para registrá-los em Base.metadata (usado pelo Alembic).
# Os imports ficam ao final para evitar dependência circular com este módulo.
from app.models import carro, marca, modelo, user  # noqa: E402,F401
