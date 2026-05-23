import { ArrowRight, Calendar, DoorOpen, Fuel, Gauge, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { brandGradient, brandInitials } from '@/lib/brandVisual';
import { cn } from '@/lib/cn';
import { formatCurrency, formatKm } from '@/lib/formatters';
import type { NormalizedCar } from '@/domain/types';

export interface VehicleCardProps {
  car: NormalizedCar;
  onSelect?: (car: NormalizedCar) => void;
  /** Realça o card (ex.: recomendações da IA). */
  highlight?: boolean;
  className?: string;
}

export function VehicleCard({ car, onSelect, highlight, className }: VehicleCardProps) {
  const clickable = Boolean(onSelect);

  return (
    <article
      onClick={clickable ? () => onSelect?.(car) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(car);
              }
            }
          : undefined
      }
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Ver detalhes de ${car.brandName} ${car.nomeModelo}` : undefined}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all',
        clickable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
        highlight && 'ring-2 ring-brand-500',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex h-28 items-center justify-center bg-linear-to-br',
          brandGradient(car.brandName),
        )}
      >
        <span className="font-display text-3xl font-bold tracking-tight text-white/95" aria-hidden>
          {brandInitials(car.brandName)}
        </span>
        {car.source === 'local' && (
          <Badge className="absolute right-3 top-3 bg-white/90 text-brand-700">Meu cadastro</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{car.brandName}</p>
        <h3 className="mt-0.5 text-base font-semibold text-slate-900">{car.nomeModelo}</h3>

        <ul className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" aria-hidden /> {car.ano || '—'}
          </li>
          <li className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4 text-slate-400" aria-hidden /> {car.combustivel || '—'}
          </li>
          <li className="flex items-center gap-1.5">
            <DoorOpen className="h-4 w-4 text-slate-400" aria-hidden />{' '}
            {car.numPortas ? `${car.numPortas} portas` : '—'}
          </li>
          <li className="flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-slate-400" aria-hidden /> {car.cor || '—'}
          </li>
          {car.quilometragem !== undefined && (
            <li className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-slate-400" aria-hidden /> {formatKm(car.quilometragem)}
            </li>
          )}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-lg font-bold text-brand-700">{formatCurrency(car.valor)}</span>
          {clickable && (
            <span
              aria-hidden
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:text-brand-700"
            >
              Ver detalhes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
