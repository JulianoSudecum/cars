"""Implementação de DescriptionGenerator usando a Claude API (SDK anthropic)."""

import logging

from anthropic import AnthropicError, AsyncAnthropic

from app.core.exceptions import AIServiceUnavailableError
from app.services.ai.base import CarDescriptionInput
from app.services.ai.prompts import SYSTEM_PROMPT, build_user_message

logger = logging.getLogger(__name__)


class AnthropicDescriptionGenerator:
    """Gera descrições via Claude. O system prompt usa prompt caching."""

    def __init__(self, api_key: str, model: str, max_tokens: int) -> None:
        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model
        self._max_tokens = max_tokens

    async def generate(self, data: CarDescriptionInput) -> str:
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=self._max_tokens,
                system=[
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": build_user_message(data)}],
            )
        except AnthropicError as exc:
            # AnthropicError é a base de todos os erros do SDK (API, conexão,
            # timeout, rate-limit, autenticação, etc.). Loga o detalhe internamente
            # e devolve mensagem genérica (não expõe o upstream ao cliente).
            logger.warning("Falha ao gerar descrição via Claude API: %s", exc)
            raise AIServiceUnavailableError(
                "Serviço de geração de descrição indisponível no momento."
            ) from exc

        texto = "".join(
            block.text for block in response.content if block.type == "text"
        ).strip()
        if not texto:
            raise AIServiceUnavailableError("A IA não retornou texto de descrição.")
        return texto


class UnavailableDescriptionGenerator:
    """Provider usado quando não há ANTHROPIC_API_KEY: sempre indisponível."""

    async def generate(self, data: CarDescriptionInput) -> str:
        raise AIServiceUnavailableError(
            "Serviço de IA indisponível: ANTHROPIC_API_KEY não configurada."
        )
