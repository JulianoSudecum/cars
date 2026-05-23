"""Prompts da geração de descrição de venda."""

from app.services.ai.base import CarDescriptionInput

SYSTEM_PROMPT = (
    "Você é um redator publicitário especializado em anúncios de venda de "
    "veículos usados no Brasil. Escreva uma descrição de anúncio atraente, "
    "fluida e honesta, em português do Brasil, com 2 a 4 frases curtas. "
    "Destaque os pontos fortes do veículo a partir dos dados fornecidos "
    "(modelo, ano, cor, combustível, quilometragem, número de portas e preço). "
    "Não invente informações que não foram fornecidas, não use emojis e não "
    "inclua títulos ou marcadores — retorne apenas o texto corrido da descrição."
)


def build_user_message(data: CarDescriptionInput) -> str:
    linhas = [
        "Gere a descrição de venda para o veículo com os seguintes dados:",
        f"- Marca: {data.nome_marca}",
        f"- Modelo: {data.nome_modelo}",
        f"- Ano: {data.ano}",
        f"- Cor: {data.cor}",
        f"- Combustível: {data.combustivel}",
        f"- Número de portas: {data.num_portas}",
        f"- Quilometragem: {data.quilometragem} km",
        f"- Valor do anúncio: R$ {data.valor_anuncio:,.2f}",
    ]
    if data.valor_fipe is not None:
        linhas.append(f"- Valor de referência FIPE: R$ {data.valor_fipe:,.2f}")
    return "\n".join(linhas)
