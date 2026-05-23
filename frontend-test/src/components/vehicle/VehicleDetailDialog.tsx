import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { brandGradient, brandInitials } from '@/lib/brandVisual';
import { cn } from '@/lib/cn';
import { formatCurrency, formatKm, formatTimestamp } from '@/lib/formatters';
import type { NormalizedCar } from '@/domain/types';

interface VehicleDetailDialogProps {
  car: NormalizedCar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleDetailDialog({ car, open, onOpenChange }: VehicleDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {car && (
        <DialogContent className="p-0">
          <div
            className={cn(
              'flex h-32 items-center justify-center rounded-t-2xl bg-linear-to-br',
              brandGradient(car.brandName),
            )}
          >
            <span className="font-display text-4xl font-bold text-white/95" aria-hidden>
              {brandInitials(car.brandName)}
            </span>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{car.brandName}</Badge>
              {car.source === 'local' && <Badge variant="success">Meu cadastro</Badge>}
            </div>
            <DialogTitle className="mt-2 text-xl">{car.nomeModelo}</DialogTitle>
            <DialogDescription>
              Ano {car.ano || '—'} · {car.combustivel || '—'}
            </DialogDescription>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Spec label="Ano" value={car.ano ? String(car.ano) : '—'} />
              <Spec label="Combustível" value={car.combustivel || '—'} />
              <Spec label="Portas" value={car.numPortas ? `${car.numPortas} portas` : '—'} />
              <Spec label="Cor" value={car.cor || '—'} />
              {car.quilometragem !== undefined && (
                <Spec label="Quilometragem" value={formatKm(car.quilometragem)} />
              )}
              <Spec label="Cadastrado em" value={formatTimestamp(car.timestampCadastro)} />
            </dl>

            {car.descricao && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Descrição
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{car.descricao}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Valor do anúncio</span>
              <span className="text-2xl font-bold text-brand-700">{formatCurrency(car.valor)}</span>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
