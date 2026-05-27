import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import type { CatalogItem } from '@/domain/ai';
import type { NormalizedCar } from '@/domain/types';
import { useProfileRecommendation } from '@/hooks/useProfileRecommendation';
import { RecommendationCard } from '../RecommendationCard';
import { ProfileForm } from './ProfileForm';
import { EmptyResult, Results } from './Results';
import { useProfileForm } from './useProfileForm';

interface ProfileAssistantProps {
  cars: NormalizedCar[];
  onSelectCar?: (car: NormalizedCar) => void;
}

function toCatalogItem(car: NormalizedCar): CatalogItem {
  return {
    id: car.id,
    marca: car.brandName,
    modelo: car.nomeModelo,
    ano: car.ano,
    combustivel: car.combustivel,
    portas: car.numPortas,
    cor: car.cor,
    valor: car.valor,
  };
}

/**
 * Orquestrador do assistente: cabeia o estado do formulário, a mutation do
 * React Query e o painel de resultados. A UI fica em `ProfileForm` e
 * `Results`; aqui só vive a cola entre eles.
 */
export function ProfileAssistant({ cars, onSelectCar }: ProfileAssistantProps) {
  const form = useProfileForm();
  const mutation = useProfileRecommendation();

  const carsById = useMemo(() => new Map(cars.map((c) => [c.id, c])), [cars]);
  const catalog = useMemo(() => cars.map(toCatalogItem), [cars]);
  const canSubmit = form.canSubmit && cars.length > 0;

  const run = () => {
    if (!canSubmit) return;
    mutation.mutate({
      profile: form.toProfile(),
      catalog,
    });
  };

  const result = mutation.data;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <ProfileForm form={form} submitting={mutation.isPending} onSubmit={run} />

      <div className="lg:col-span-3">
        <Results
          status={mutation.status}
          errorMessage={mutation.error instanceof Error ? mutation.error.message : undefined}
          onRetry={canSubmit ? run : undefined}
        >
          {result &&
            (result.recommendations.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4 text-brand-500" aria-hidden />
                  {result.recommendations.length} recomendações geradas para o seu perfil
                </div>
                {result.recommendations.map((rec, index) => {
                  const car = carsById.get(rec.carId);
                  if (!car) return null;
                  return (
                    <RecommendationCard
                      key={rec.carId}
                      car={car}
                      score={rec.score}
                      reason={rec.reason}
                      rank={index + 1}
                      onSelect={onSelectCar}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyResult />
            ))}
        </Results>
      </div>
    </div>
  );
}
