import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';
import { handleProfileRecommend } from '../server/ai/handler';
import { MissingApiKeyError } from '../server/ai/anthropic';

/**
 * `POST /api/profile-recommend` — serverless function (Vercel).
 *
 * Assistente de IA: recebe perfil + catálogo, chama o modelo (Claude) com a
 * chave que vive apenas no servidor e devolve recomendações estruturadas. Mesmo
 * núcleo (`handleProfileRecommend`) usado pelo BFF Express em desenvolvimento.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  try {
    const result = await handleProfileRecommend(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      res
        .status(503)
        .json({ error: 'O assistente de IA não está configurado. Defina ANTHROPIC_API_KEY no servidor.' });
    } else if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos para a recomendação.' });
    } else {
      console.error('[api/profile-recommend]', error);
      res.status(502).json({ error: 'Não foi possível gerar recomendações no momento. Tente novamente.' });
    }
  }
}
