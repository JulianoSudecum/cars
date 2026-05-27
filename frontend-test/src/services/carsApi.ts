import type { NormalizedCar } from '@/domain/types';

export async function fetchCars(signal?: AbortSignal): Promise<NormalizedCar[]> {
  const res = await fetch('/api/cars', { signal });
  if (!res.ok) throw new Error(`Falha ao carregar o catálogo (HTTP ${res.status}).`);
  return (await res.json()) as NormalizedCar[];
}
