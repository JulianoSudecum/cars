import { normalizeCatalog } from '../../src/domain/normalizeCatalog';
import type { NormalizedCar } from '../../src/domain/types';

const CARS_URL = 'https://wswork.com.br/cars.json';
const CARS_BY_BRAND_URL = 'https://wswork.com.br/cars_by_brand.json';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: NormalizedCar[]; expiresAt: number } | null = null;
let inflight: Promise<NormalizedCar[]> | null = null;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar ${url} (HTTP ${res.status}).`);
  return res.text();
}

async function fetchAndNormalize(): Promise<NormalizedCar[]> {
  const [carsText, byBrandText] = await Promise.all([
    fetchText(CARS_URL),
    // O endpoint by-brand é tolerável a falhas: seguimos com cars.json + inferência.
    fetchText(CARS_BY_BRAND_URL).catch(() => '{"cars":[]}'),
  ]);
  const data = normalizeCatalog(carsText, byBrandText);
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}

/**
 * Busca os endpoints oficiais server-side, normaliza e cacheia em memória.
 * O cache evita rebuscar a cada request; uma promise in-flight compartilhada
 * coalesce requisições concorrentes (evita "thundering herd" no miss).
 */
export async function loadCatalog(): Promise<NormalizedCar[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  if (inflight) return inflight;

  inflight = fetchAndNormalize().finally(() => {
    inflight = null;
  });
  return inflight;
}
