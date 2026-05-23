import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { brandGradient, brandInitials } from '@/lib/brandVisual';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatters';
import type { NormalizedCar } from '@/domain/types';

interface RecommendationCardProps {
  car: NormalizedCar;
  score: number;
  reason: string;
  rank: number;
  onSelect?: (car: NormalizedCar) => void;
}

export function RecommendationCard({ car, score, reason, rank, onSelect }: RecommendationCardProps) {
  return (
    <article className="flex animate-fade-in-up gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={cn(
          'relative hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-linear-to-br sm:flex',
          brandGradient(car.brandName),
        )}
      >
        <span className="font-display text-2xl font-bold text-white/95" aria-hidden>
          {brandInitials(car.brandName)}
        </span>
        <span className="absolute -left-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
          #{rank}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {car.brandName}
            </p>
            <h3 className="text-base font-semibold text-slate-900">
              {car.nomeModelo} · {car.ano || '—'}
            </h3>
          </div>
          <Badge variant="brand" className="shrink-0">
            <Sparkles className="h-3 w-3" aria-hidden /> {score}%
          </Badge>
        </div>

        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Compatibilidade com o perfil"
        >
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${score}%` }} />
        </div>

        <p className="mt-3 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Por que combina: </span>
          {reason}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-brand-700">{formatCurrency(car.valor)}</span>
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(car)}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ver detalhes
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
