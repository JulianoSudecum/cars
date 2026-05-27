import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';
import { loadCatalog } from './cars/catalog';
import { handleProfileRecommend } from './ai/handler';
import { MissingApiKeyError } from './ai/anthropic';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ai: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.get('/api/cars', async (_req, res) => {
  try {
    const cars = await loadCatalog();
    res.json(cars);
  } catch (error) {
    console.error('[api/cars]', error);
    res.status(502).json({ error: 'Não foi possível carregar o catálogo de veículos.' });
  }
});

app.post('/api/profile-recommend', async (req, res) => {
  try {
    const result = await handleProfileRecommend(req.body);
    res.json(result);
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
});

// /api não tratada retorna 404 JSON em vez de cair no fallback de SPA.
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Rota da API não encontrada.' });
});

// Em produção, o mesmo servidor entrega o build estático + fallback de SPA.
if (isProd) {
  const distDir = path.resolve(dirname, '../dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[BFF] ouvindo em http://localhost:${PORT} (${isProd ? 'produção' : 'dev'})`);
});
