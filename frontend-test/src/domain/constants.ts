/** Opções de combustível usadas em filtros e no formulário. */
export const FUEL_OPTIONS = [
  'FLEX',
  'GASOLINA',
  'ETANOL',
  'DIESEL',
  'ELÉTRICO',
  'HÍBRIDO',
  'GNV',
] as const;

export type FuelOption = (typeof FUEL_OPTIONS)[number];

/** Opções de número de portas. */
export const DOOR_OPTIONS = [2, 3, 4, 5] as const;

/** Rótulo amigável para o grupo de carros sem marca identificada. */
export const UNKNOWN_BRAND_LABEL = 'Marca não informada';
