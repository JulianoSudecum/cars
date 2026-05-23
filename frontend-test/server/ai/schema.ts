import { z } from 'zod';

const catalogItemSchema = z.object({
  id: z.number(),
  marca: z.string(),
  modelo: z.string(),
  ano: z.number(),
  combustivel: z.string(),
  portas: z.number(),
  cor: z.string(),
  valor: z.number(),
});

const profileSchema = z.object({
  usage: z.string().min(1),
  budget: z.string().min(1),
  priorities: z.array(z.string()).default([]),
  fuelPreference: z.string().optional(),
  passengers: z.string().optional(),
  notes: z.string().max(500).optional(),
});

/** Valida o corpo recebido em POST /api/profile-recommend. */
export const recommendRequestSchema = z.object({
  profile: profileSchema,
  catalog: z.array(catalogItemSchema).min(1).max(200),
});

/** Valida a saída estruturada (tool_use) retornada pelo modelo. */
export const toolOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      carId: z.number(),
      score: z.number(),
      reason: z.string(),
    }),
  ),
});
