import type { ReactNode } from 'react';
import type { GroupBy } from '@/domain/grouping';
import type { NormalizedCar } from '@/domain/types';

export type VehicleListColumns = 1 | 2 | 3 | 4;

export interface VehicleListProps {
  /** Lista de veículos já normalizados a serem exibidos. */
  cars: NormalizedCar[];
  /** Estratégia de agrupamento. Padrão: `'brand'`. */
  groupBy?: GroupBy;
  /** Número máximo de colunas no grid (responsivo). Padrão: `3`. */
  columns?: VehicleListColumns;
  /** Exibe esqueletos de carregamento quando `true`. */
  loading?: boolean;
  /** Quantidade de skeletons exibidos durante o loading. Padrão: `6`. */
  skeletonCount?: number;
  /** Conteúdo de erro; quando definido, tem precedência sobre tudo. */
  error?: ReactNode;
  /** Conteúdo exibido quando não há carros (e não está carregando). */
  emptyState?: ReactNode;
  /** Renderização customizada do card. Padrão: `<VehicleCard>`. */
  renderCard?: (car: NormalizedCar) => ReactNode;
  /** Cabeçalho customizado de cada grupo. */
  groupHeader?: (groupKey: string, cars: NormalizedCar[]) => ReactNode;
  /** Callback ao selecionar um card (repassado ao card padrão). */
  onSelect?: (car: NormalizedCar) => void;
  className?: string;
}
