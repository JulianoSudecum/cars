import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProfileAssistant } from '@/components/ai/ProfileAssistant/ProfileAssistant';
import { VehicleDetailDialog } from '@/components/vehicle/VehicleDetailDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { NormalizedCar } from '@/domain/types';
import { useMergedCars } from '@/hooks/useMergedCars';

export default function AssistantPage() {
  const { cars, isLoading, isError, refetch } = useMergedCars();
  const [selected, setSelected] = useState<NormalizedCar | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assistente de perfil</h1>
          <p className="text-slate-500">
            Responda a algumas perguntas e a IA recomenda os veículos ideais para você.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        </div>
      ) : isError ? (
        <ErrorState
          description="Não foi possível carregar o catálogo para o assistente."
          onRetry={() => void refetch()}
        />
      ) : (
        <ProfileAssistant cars={cars} onSelectCar={setSelected} />
      )}

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
