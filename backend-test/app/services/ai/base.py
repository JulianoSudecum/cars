"""Interface (porta) da geração de descrição por IA e seu DTO de entrada.

Os endpoints/serviços dependem da interface `DescriptionGenerator`, nunca de
uma implementação concreta — o que permite injetar o provider real ou um mock
nos testes via `app.dependency_overrides`.
"""

from decimal import Decimal
from typing import Protocol

from pydantic import BaseModel


class CarDescriptionInput(BaseModel):
    """Atributos do veículo usados para gerar a descrição de venda."""

    nome_marca: str
    nome_modelo: str
    ano: int
    cor: str
    combustivel: str
    num_portas: int
    quilometragem: int
    valor_anuncio: Decimal
    valor_fipe: Decimal | None = None


class DescriptionGenerator(Protocol):
    async def generate(self, data: CarDescriptionInput) -> str:
        """Gera e retorna a descrição de venda. Levanta AIServiceUnavailableError
        em caso de indisponibilidade do serviço de IA."""
        ...
