import { Search, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { FUEL_OPTIONS } from '@/domain/constants';
import { ALL, useFiltersStore, type SortOption } from '@/store/filtersStore';

interface VehicleFiltersProps {
  brands: string[];
  resultCount: number;
}

const sortLabels: Record<SortOption, string> = {
  relevance: 'Relevância',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  'year-desc': 'Mais novos',
};

export function VehicleFilters({ brands, resultCount }: VehicleFiltersProps) {
  const { search, brand, fuel, sort } = useFiltersStore(
    useShallow((s) => ({ search: s.search, brand: s.brand, fuel: s.fuel, sort: s.sort })),
  );
  const setSearch = useFiltersStore((s) => s.setSearch);
  const setBrand = useFiltersStore((s) => s.setBrand);
  const setFuel = useFiltersStore((s) => s.setFuel);
  const setSort = useFiltersStore((s) => s.setSort);
  const reset = useFiltersStore((s) => s.reset);
  const hasActiveFilters =
    search !== '' || brand !== ALL || fuel !== ALL || sort !== 'relevance';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por modelo, marca ou cor…"
            className="pl-9"
            aria-label="Buscar veículos"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger aria-label="Filtrar por marca" className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as marcas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fuel} onValueChange={setFuel}>
            <SelectTrigger aria-label="Filtrar por combustível" className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os combustíveis</SelectItem>
              {FUEL_OPTIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
            <SelectTrigger aria-label="Ordenar resultados" className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-slate-500" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'veículo encontrado' : 'veículos encontrados'}
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="h-4 w-4" aria-hidden /> Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
