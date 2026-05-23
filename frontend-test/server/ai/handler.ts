import type { ProfileRecommendResponse } from '../../src/domain/ai';
import { callRecommend, MODEL } from './anthropic';
import { buildCatalogText, buildProfileText } from './prompt';
import { recommendRequestSchema, toolOutputSchema } from './schema';

const MAX_RECOMMENDATIONS = 6;

/**
 * Núcleo agnóstico de framework: valida a entrada, chama o modelo, valida a
 * saída estruturada e descarta carIds que não existem no catálogo (anti-alucinação).
 */
export async function handleProfileRecommend(body: unknown): Promise<ProfileRecommendResponse> {
  const { profile, catalog } = recommendRequestSchema.parse(body);

  const raw = await callRecommend(buildCatalogText(catalog), buildProfileText(profile));

  const parsed = toolOutputSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      '[profile-recommend] saída do modelo não corresponde ao schema esperado:',
      parsed.error.issues,
    );
    return { recommendations: [], model: MODEL };
  }

  const validIds = new Set(catalog.map((c) => c.id));
  const recommendations = parsed.data.recommendations
    .filter((r) => validIds.has(r.carId))
    .map((r) => ({ ...r, score: clampScore(r.score) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECOMMENDATIONS);

  return { recommendations, model: MODEL };
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}
