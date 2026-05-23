/* eslint-disable */
// GERADO por scripts/build-vercel-api.mjs a partir de functions/. Nao edite.

// functions/profile-recommend.ts
import { ZodError } from "zod";

// server/ai/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";

// server/ai/prompt.ts
var SYSTEM_PROMPT = `Voc\xEA \xE9 um consultor automotivo brasileiro especialista em ajudar clientes a escolher o carro ideal.

Sua tarefa: analisar o perfil do cliente e recomendar os ve\xEDculos mais adequados ESTRITAMENTE a partir do cat\xE1logo fornecido.

Regras:
- Recomende apenas ve\xEDculos presentes no cat\xE1logo, referenciando o id exato.
- Atribua a cada recomenda\xE7\xE3o um score de 0 a 100 indicando o quanto o ve\xEDculo combina com o perfil.
- Leve em conta or\xE7amento, uso principal, prioridades e prefer\xEAncias declaradas.
- Escreva a justificativa (reason) em portugu\xEAs, de forma calorosa e personalizada, em 1 a 2 frases, explicando por que aquele ve\xEDculo combina com este cliente.
- Selecione de 3 a 6 ve\xEDculos, do mais ao menos recomendado. Se poucos se encaixam no perfil, recomende menos.
- Responda sempre por meio da ferramenta recommend_vehicles.`;
function buildCatalogText(catalog) {
  const lines = catalog.slice().sort((a, b) => a.id - b.id).map(
    (c) => `- id:${c.id} | ${c.marca} ${c.modelo} ${c.ano} | ${c.combustivel} | ${c.portas} portas | cor ${c.cor} | R$ ${c.valor.toLocaleString("pt-BR")}`
  );
  return `Cat\xE1logo de ve\xEDculos dispon\xEDveis (recomende somente estes id):
${lines.join("\n")}`;
}
function buildProfileText(profile) {
  const parts = [
    `Uso principal: ${profile.usage}`,
    `Or\xE7amento: ${profile.budget}`,
    `Prioridades: ${profile.priorities.length ? profile.priorities.join(", ") : "n\xE3o informadas"}`
  ];
  if (profile.fuelPreference) parts.push(`Combust\xEDvel preferido: ${profile.fuelPreference}`);
  if (profile.passengers) parts.push(`Costuma transportar: ${profile.passengers}`);
  if (profile.notes) parts.push(`Observa\xE7\xF5es: ${profile.notes}`);
  return `Perfil do cliente:
${parts.join("\n")}

Analise o perfil e recomende os ve\xEDculos mais adequados do cat\xE1logo, com score (0-100) e uma justificativa personalizada para cada um.`;
}

// server/ai/anthropic.ts
var MissingApiKeyError = class extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY n\xE3o configurada.");
    this.name = "MissingApiKeyError";
  }
};
var MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
var client = null;
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new MissingApiKeyError();
  if (!client) client = new Anthropic({ apiKey });
  return client;
}
var RECOMMEND_TOOL = {
  name: "recommend_vehicles",
  description: "Registra a lista de ve\xEDculos recomendados para o perfil do cliente, do mais ao menos adequado.",
  input_schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        description: "Ve\xEDculos recomendados, ordenados do mais para o menos adequado.",
        items: {
          type: "object",
          properties: {
            carId: { type: "number", description: "id do ve\xEDculo no cat\xE1logo" },
            score: { type: "number", description: "Adequa\xE7\xE3o ao perfil, de 0 a 100" },
            reason: {
              type: "string",
              description: "Justificativa personalizada em portugu\xEAs (1 a 2 frases)"
            }
          },
          required: ["carId", "score", "reason"]
        }
      }
    },
    required: ["recommendations"]
  }
};
async function callRecommend(catalogText, profileText) {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [RECOMMEND_TOOL],
    tool_choice: { type: "tool", name: RECOMMEND_TOOL.name },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: catalogText, cache_control: { type: "ephemeral" } },
          { type: "text", text: profileText }
        ]
      }
    ]
  });
  if (message.stop_reason === "max_tokens") {
    console.warn(
      "[profile-recommend] resposta truncada por max_tokens; recomenda\xE7\xF5es podem ficar incompletas."
    );
  }
  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("O modelo n\xE3o retornou recomenda\xE7\xF5es estruturadas.");
  }
  return toolUse.input;
}

// server/ai/schema.ts
import { z } from "zod";
var catalogItemSchema = z.object({
  id: z.number(),
  marca: z.string(),
  modelo: z.string(),
  ano: z.number(),
  combustivel: z.string(),
  portas: z.number(),
  cor: z.string(),
  valor: z.number()
});
var profileSchema = z.object({
  usage: z.string().min(1),
  budget: z.string().min(1),
  priorities: z.array(z.string()).default([]),
  fuelPreference: z.string().optional(),
  passengers: z.string().optional(),
  notes: z.string().max(500).optional()
});
var recommendRequestSchema = z.object({
  profile: profileSchema,
  catalog: z.array(catalogItemSchema).min(1).max(200)
});
var toolOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      carId: z.number(),
      score: z.number(),
      reason: z.string()
    })
  )
});

// server/ai/handler.ts
var MAX_RECOMMENDATIONS = 6;
async function handleProfileRecommend(body) {
  const { profile, catalog } = recommendRequestSchema.parse(body);
  const raw = await callRecommend(buildCatalogText(catalog), buildProfileText(profile));
  const parsed = toolOutputSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "[profile-recommend] sa\xEDda do modelo n\xE3o corresponde ao schema esperado:",
      parsed.error.issues
    );
    return { recommendations: [], model: MODEL };
  }
  const validIds = new Set(catalog.map((c) => c.id));
  const recommendations = parsed.data.recommendations.filter((r) => validIds.has(r.carId)).map((r) => ({ ...r, score: clampScore(r.score) })).sort((a, b) => b.score - a.score).slice(0, MAX_RECOMMENDATIONS);
  return { recommendations, model: MODEL };
}
function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// functions/profile-recommend.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "M\xE9todo n\xE3o permitido." });
    return;
  }
  try {
    const result = await handleProfileRecommend(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      res.status(503).json({ error: "O assistente de IA n\xE3o est\xE1 configurado. Defina ANTHROPIC_API_KEY no servidor." });
    } else if (error instanceof ZodError) {
      res.status(400).json({ error: "Dados inv\xE1lidos para a recomenda\xE7\xE3o." });
    } else {
      console.error("[api/profile-recommend]", error);
      res.status(502).json({ error: "N\xE3o foi poss\xEDvel gerar recomenda\xE7\xF5es no momento. Tente novamente." });
    }
  }
}
export {
  handler as default
};
