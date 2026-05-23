import { create } from 'zustand';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'year-desc';

export const ALL = 'all';

interface FiltersState {
  search: string;
  brand: string; // ALL | nome da marca
  fuel: string; // ALL | combustível
  sort: SortOption;
  setSearch: (value: string) => void;
  setBrand: (value: string) => void;
  setFuel: (value: string) => void;
  setSort: (value: SortOption) => void;
  reset: () => void;
}

const initial = { search: '', brand: ALL, fuel: ALL, sort: 'relevance' as SortOption };

export const useFiltersStore = create<FiltersState>((set) => ({
  ...initial,
  setSearch: (search) => set({ search }),
  setBrand: (brand) => set({ brand }),
  setFuel: (fuel) => set({ fuel }),
  setSort: (sort) => set({ sort }),
  reset: () => set(initial),
}));
