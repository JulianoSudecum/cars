import { UNKNOWN_BRAND_LABEL } from './constants';

/**
 * Os endpoints só trazem o ID numérico da marca (campo `brand`), nunca o nome.
 * Mapa curado dos IDs identificáveis a partir dos modelos presentes nos dados.
 */
const BRAND_NAMES: Record<number, string> = {
  1: 'Toyota',
  2: 'Chevrolet',
  3: 'Volkswagen',
};

/**
 * Estratégia secundária de join: cars.json não traz `brand`. Inclui grafias
 * divergentes presentes nos dados (ex.: "HILLUX SW4").
 */
const MODEL_TO_BRAND: Record<string, { id: number; name: string }> = {
  ETIOS: { id: 1, name: 'Toyota' },
  COROLLA: { id: 1, name: 'Toyota' },
  'HILUX SW4': { id: 1, name: 'Toyota' },
  'HILLUX SW4': { id: 1, name: 'Toyota' },
  ONIX: { id: 2, name: 'Chevrolet' },
  'ONIX PLUS': { id: 2, name: 'Chevrolet' },
  JETTA: { id: 3, name: 'Volkswagen' },
};

export function getBrandName(id: number | null | undefined): string {
  if (id == null) return UNKNOWN_BRAND_LABEL;
  return BRAND_NAMES[id] ?? `Marca ${id}`;
}

export function curatedBrandName(id: number): string | undefined {
  return BRAND_NAMES[id];
}

export function inferBrandFromModel(nomeModelo: string): { id: number; name: string } | null {
  const key = nomeModelo.trim().toUpperCase();
  return MODEL_TO_BRAND[key] ?? null;
}
