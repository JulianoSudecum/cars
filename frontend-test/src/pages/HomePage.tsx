import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { VehicleDetailDialog } from '@/components/vehicle/VehicleDetailDialog';
import { VehicleFilters } from '@/components/vehicle/VehicleFilters';
import { VehicleList } from '@/components/vehicle/VehicleList';
import { UNKNOWN_BRAND_LABEL } from '@/domain/constants';
import type { NormalizedCar } from '@/domain/types';
import { useFilteredCars } from '@/hooks/useFilteredCars';
import { useMergedCars } from '@/hooks/useMergedCars';
import { useFiltersStore } from '@/store/filtersStore';

export default function HomePage() {
  const { cars, isLoading, isError, refetch } = useMergedCars();
  const filtered = useFilteredCars(cars);
  const resetFilters = useFiltersStore((s) => s.reset);
  const sort = useFiltersStore((s) => s.sort);
  const [selected, setSelected] = useState<NormalizedCar | null>(null);

  // Ao ordenar por preço/ano, a lista vira um ranking global (sem agrupar por
  // marca), para a ordenação ser visível entre marcas — não só dentro delas.
  const groupBy = sort === 'relevance' ? 'brand' : 'none';

  const brands = useMemo(() => {
    const unique = Array.from(new Set(cars.map((c) => c.brandName)));
    return unique.sort((a, b) => {
      if (a === UNKNOWN_BRAND_LABEL) return 1;
      if (b === UNKNOWN_BRAND_LABEL) return -1;
      return a.localeCompare(b, 'pt-BR');
    });
  }, [cars]);

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-800 px-6 py-10 text-white sm:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Encontre o carro certo para você</h1>
          <p className="mt-3 text-brand-100">
            Explore o catálogo por marca ou deixe o assistente de IA recomendar veículos de acordo
            com o seu perfil.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-700 shadow-sm hover:bg-brand-50"
            >
              <Link to="/assistente">
                <Sparkles className="h-5 w-5" aria-hidden /> Falar com o assistente
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link to="/cadastrar">
                <Plus className="h-5 w-5" aria-hidden /> Cadastrar veículo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <VehicleFilters brands={brands} resultCount={filtered.length} />

      <VehicleList
        cars={filtered}
        groupBy={groupBy}
        loading={isLoading}
        onSelect={setSelected}
        error={
          isError ? (
            <ErrorState
              description="Não foi possível carregar o catálogo de veículos. Verifique sua conexão e tente novamente."
              onRetry={() => void refetch()}
            />
          ) : undefined
        }
        emptyState={
          <EmptyState
            icon={<Car className="h-10 w-10" aria-hidden />}
            title="Nenhum veículo encontrado"
            description="Tente ajustar a busca ou os filtros aplicados."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Limpar filtros
              </Button>
            }
          />
        }
      />

      <VehicleDetailDialog
        car={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
