import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * `GET /api/health` — liveness simples; informa se a IA está configurada
 * (sem expor a chave). Espelha a rota do BFF Express.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ status: 'ok', ai: Boolean(process.env.ANTHROPIC_API_KEY?.trim()) });
}
