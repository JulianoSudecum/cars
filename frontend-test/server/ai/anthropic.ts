import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompt';

/** Lançado quando a chave da API não está configurada. */
export class MissingApiKeyError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY não configurada.');
    this.name = 'MissingApiKeyError';
  }
}

/** Modelo padrão (configurável por env). Veja a skill claude-api. */
export const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  // .trim() torna a leitura robusta a espaços/quebras de linha acidentais na
  // variável de ambiente (ex.: um \r ao configurar a chave via CLI no Windows).
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new MissingApiKeyError();
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

/** Tool de saída estruturada — força o modelo a responder no formato esperado. */
const RECOMMEND_TOOL: Anthropic.Tool = {
  name: 'recommend_vehicles',
  description:
    'Registra a lista de veículos recomendados para o perfil do cliente, do mais ao menos adequado.',
  input_schema: {
    type: 'object',
    properties: {
      recommendations: {
        type: 'array',
        description: 'Veículos recomendados, ordenados do mais para o menos adequado.',
        items: {
          type: 'object',
          properties: {
            carId: { type: 'number', description: 'id do veículo no catálogo' },
            score: { type: 'number', description: 'Adequação ao perfil, de 0 a 100' },
            reason: {
              type: 'string',
              description: 'Justificativa personalizada em português (1 a 2 frases)',
            },
          },
          required: ['carId', 'score', 'reason'],
        },
      },
    },
    required: ['recommendations'],
  },
};

/**
 * Chama o modelo com tool_choice forçado e prompt caching:
 * breakpoint 1 no system (tools + instruções estáveis), breakpoint 2 no
 * catálogo (estável entre consultas); o perfil fica após o último breakpoint.
 */
export async function callRecommend(
  catalogText: string,
  profileText: string,
): Promise<unknown> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [RECOMMEND_TOOL],
    tool_choice: { type: 'tool', name: RECOMMEND_TOOL.name },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: catalogText, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: profileText },
        ],
      },
    ],
  });

  if (message.stop_reason === 'max_tokens') {
    console.warn(
      '[profile-recommend] resposta truncada por max_tokens; recomendações podem ficar incompletas.',
    );
  }

  const toolUse = message.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('O modelo não retornou recomendações estruturadas.');
  }
  return toolUse.input;
}
