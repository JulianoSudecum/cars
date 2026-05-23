"""Schemas do endpoint otimizado para consumo do front-end.

Os itens de carro espelham as chaves dos JSONs externos de referência
(`wswork.com.br/cars.json` e `cars_by_brand.json`) — `valor`, `brand`,
`nome_modelo`, `timestamp_cadastro` em epoch — para consumo intercambiável.
Valores monetários são serializados como número (ver schemas.common.Money).
"""

from pydantic import BaseModel

from app.schemas.common import Money


class FrontendCarItem(BaseModel):
    id: int
    timestamp_cadastro: int  # epoch (segundos), como nos JSONs externos
    modelo_id: int
    ano: int
    combustivel: str
    num_portas: int
    cor: str
    nome_modelo: str
    valor: Money  # espelha valor_anuncio
    brand: int  # espelha marca_id


class ModelGroup(BaseModel):
    modelo_id: int
    nome_modelo: str
    valor_fipe: Money
    cars: list[FrontendCarItem]


class BrandGroup(BaseModel):
    brand: int
    nome_marca: str
    models: list[ModelGroup]


class FrontendModelsResponse(BaseModel):
    brands: list[BrandGroup]


class FlatCarsResponse(BaseModel):
    """Formato plano, idêntico ao `cars_by_brand.json` externo."""

    cars: list[FrontendCarItem]
