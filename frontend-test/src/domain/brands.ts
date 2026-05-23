import { UNKNOWN_BRAND_LABEL } from './constants';

/**
 * Os endpoints só trazem o ID numérico da marca (campo `brand`), nunca o nome.
 * Mantemos um mapa curado dos IDs que conseguimos identificar a partir dos
 * modelos presentes nos dados, com fallback "Marca {id}" para os demais.
 */
const BRAND_NAMES: Record<number, string> = {
  1: 'Toyota',
  2: 'Chevrolet',
  3: 'Volkswagen',
};

/**
 * Mapa modelo → marca, usado como estratégia secundária de join quando um
 * carro não possui `brand` (cars.json não traz marca). As chaves cobrem
 * inclusive as grafias divergentes encontradas nos dados (ex.: "HILLUX SW4").
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

/** Retorna o nome da marca a partir do ID, com fallback amigável. */
export function getBrandName(id: number | null | undefined): string {
  if (id == null) return UNKNOWN_BRAND_LABEL;
  return BRAND_NAMES[id] ?? `Marca ${id}`;
}

/** Nome da marca apenas se o ID for curado/conhecido; caso contrário `undefined`. */
export function curatedBrandName(id: number): string | undefined {
  return BRAND_NAMES[id];
}

/** Tenta inferir a marca pelo nome do modelo (estratégia secundária de join). */
export function inferBrandFromModel(nomeModelo: string): { id: number; name: string } | null {
  const key = nomeModelo.trim().toUpperCase();
  return MODEL_TO_BRAND[key] ?? null;
}
