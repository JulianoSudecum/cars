import type { NormalizedCar } from '@/domain/types';

/**
 * Consome o catálogo já normalizado pelo BFF (`GET /api/cars`). O servidor
 * busca os endpoints oficiais da wswork server-side (contornando a ausência de
 * CORS) e aplica reparo/normalização compartilhados via `normalizeCatalog`.
 */
export async function fetchCars(signal?: AbortSignal): Promise<NormalizedCar[]> {
  const res = await fetch('/api/cars', { signal });
  if (!res.ok) throw new Error(`Falha ao carregar o catálogo (HTTP ${res.status}).`);
  return (await res.json()) as NormalizedCar[];
}
