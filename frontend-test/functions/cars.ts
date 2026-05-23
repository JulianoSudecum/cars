import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadCatalog } from '../server/cars/catalog';

/**
 * `GET /api/cars` — serverless function (Vercel).
 *
 * Equivalente à rota homônima do BFF Express (`server/index.ts`): busca os
 * endpoints da wswork server-side (resolvendo o CORS do navegador) e devolve o
 * catálogo já normalizado. A lógica vive em `loadCatalog`, compartilhada com o
 * BFF de desenvolvimento.
 *
 * Esta pasta (`functions/`) é a FONTE; o build (`scripts/build-vercel-api.mjs`)
 * bundla cada arquivo num `api/*.js` self-contained que o Vercel publica.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  try {
    const cars = await loadCatalog();
    // Cache na CDN da Vercel: serve do edge por 5 min e revalida em background.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(cars);
  } catch (error) {
    console.error('[api/cars]', error);
    res.status(502).json({ error: 'Não foi possível carregar o catálogo de veículos.' });
  }
}
