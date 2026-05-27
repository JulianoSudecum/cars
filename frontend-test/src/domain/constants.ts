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

export const DOOR_OPTIONS = [2, 3, 4, 5] as const;

export const UNKNOWN_BRAND_LABEL = 'Marca não informada';
