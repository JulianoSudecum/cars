import { UNKNOWN_BRAND_LABEL } from './constants';
import type { NormalizedCar } from './types';

/** Estratégia de agrupamento aceita pelo VehicleList. */
export type GroupBy = 'brand' | 'none' | ((car: NormalizedCar) => string);

export interface CarGroup {
  key: string;
  cars: NormalizedCar[];
}

/**
 * Agrupa a lista de carros conforme a estratégia. `brand` agrupa por nome de
 * marca; `none` retorna um único grupo; uma função permite chave customizada.
 * Grupos são ordenados alfabeticamente, com "Marca não informada" sempre por último.
 */
export function groupCars(cars: NormalizedCar[], groupBy: GroupBy = 'brand'): CarGroup[] {
  if (groupBy === 'none') {
    return cars.length ? [{ key: '', cars }] : [];
  }

  const keyFn = groupBy === 'brand' ? (car: NormalizedCar) => car.brandName : groupBy;
  const groups = new Map<string, NormalizedCar[]>();

  for (const car of cars) {
    const key = keyFn(car) || 'Outros';
    const existing = groups.get(key);
    if (existing) existing.push(car);
    else groups.set(key, [car]);
  }

  return Array.from(groups.entries())
    .map(([key, items]) => ({ key, cars: items }))
    .sort((a, b) => {
      if (a.key === UNKNOWN_BRAND_LABEL) return 1;
      if (b.key === UNKNOWN_BRAND_LABEL) return -1;
      return a.key.localeCompare(b.key, 'pt-BR');
    });
}
