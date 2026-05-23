import { useMemo } from 'react';
import type { NormalizedCar } from '@/domain/types';
import { ALL, useFiltersStore } from '@/store/filtersStore';
import { useDebounce } from './useDebounce';

/** Aplica busca textual, filtros e ordenação do `filtersStore` sobre a lista. */
export function useFilteredCars(cars: NormalizedCar[]): NormalizedCar[] {
  const search = useFiltersStore((s) => s.search);
  const brand = useFiltersStore((s) => s.brand);
  const fuel = useFiltersStore((s) => s.fuel);
  const sort = useFiltersStore((s) => s.sort);
  const debouncedSearch = useDebounce(search, 250);

  return useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    const filtered = cars.filter((car) => {
      if (brand !== ALL && car.brandName !== brand) return false;
      if (fuel !== ALL && car.combustivel !== fuel) return false;
      if (term) {
        const haystack = `${car.nomeModelo} ${car.brandName} ${car.cor}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    switch (sort) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.valor - b.valor);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.valor - a.valor);
      case 'year-desc':
        return [...filtered].sort((a, b) => b.ano - a.ano);
      default:
        return filtered;
    }
  }, [cars, debouncedSearch, brand, fuel, sort]);
}
