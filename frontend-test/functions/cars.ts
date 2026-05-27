import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadCatalog } from '../server/cars/catalog';

// Fonte do `api/cars.js` publicado pela Vercel. O build (scripts/build-vercel-api.mjs)
// bundla este arquivo em `api/*.js` self-contained.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  try {
    const cars = await loadCatalog();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(cars);
  } catch (error) {
    console.error('[api/cars]', error);
    res.status(502).json({ error: 'Não foi possível carregar o catálogo de veículos.' });
  }
}
