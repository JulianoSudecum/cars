import { useMemo } from 'react';
import { groupCars } from '@/domain/grouping';
import type { NormalizedCar } from '@/domain/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { VehicleCard } from '../VehicleCard';
import type { VehicleListColumns, VehicleListProps } from './VehicleList.types';

const columnClasses: Record<VehicleListColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

/**
 * Listagem de veículos agrupada e responsiva. Componente *apresentacional*:
 * não busca dados — recebe tudo via props, o que o torna reutilizável em
 * qualquer tela. Veja `docs/VehicleList.md`.
 */
export function VehicleList({
  cars,
  groupBy = 'brand',
  columns = 3,
  loading = false,
  skeletonCount = 6,
  error,
  emptyState,
  renderCard,
  groupHeader,
  onSelect,
  className,
}: VehicleListProps) {
  const groups = useMemo(() => groupCars(cars, groupBy), [cars, groupBy]);

  if (error) return <>{error}</>;

  if (loading) {
    return (
      <div
        className={cn('grid gap-4', columnClasses[columns], className)}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return <>{emptyState ?? <EmptyState title="Nenhum veículo encontrado" />}</>;
  }

  const renderGrid = (items: NormalizedCar[]) => (
    <ul className={cn('grid list-none gap-4', columnClasses[columns])}>
      {items.map((car) => (
        <li key={`${car.source}-${car.id}`}>
          {renderCard ? renderCard(car) : <VehicleCard car={car} onSelect={onSelect} />}
        </li>
      ))}
    </ul>
  );

  if (groupBy === 'none') {
    return <div className={className}>{renderGrid(cars)}</div>;
  }

  return (
    <div className={cn('flex flex-col gap-10', className)}>
      {groups.map((group) => (
        <section key={group.key} aria-label={group.key}>
          {groupHeader ? (
            groupHeader(group.key, group.cars)
          ) : (
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{group.key}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {group.cars.length} {group.cars.length === 1 ? 'veículo' : 'veículos'}
              </span>
            </div>
          )}
          {renderGrid(group.cars)}
        </section>
      ))}
    </div>
  );
}
