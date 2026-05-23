import { useMemo, useState, type ReactNode } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import type { CatalogItem } from '@/domain/ai';
import type { NormalizedCar } from '@/domain/types';
import { useProfileRecommendation } from '@/hooks/useProfileRecommendation';
import { cn } from '@/lib/cn';
import { RecommendationCard } from '../RecommendationCard';

const USAGE_OPTIONS = [
  'Cidade no dia a dia',
  'Viagens e estrada',
  'Família',
  'Trabalho',
  'Primeiro carro',
];
const BUDGET_OPTIONS = [
  'Até R$ 40 mil',
  'R$ 40 a 70 mil',
  'R$ 70 a 120 mil',
  'Acima de R$ 120 mil',
  'Sem limite definido',
];
const PRIORITY_OPTIONS = [
  'Economia de combustível',
  'Espaço interno',
  'Conforto',
  'Desempenho',
  'Preço baixo',
  'Baixa quilometragem',
];
const FUEL_PREF_OPTIONS = ['Tanto faz', 'Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico'];

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

export function ProfileAssistant({ cars, onSelectCar }: ProfileAssistantProps) {
  const [usage, setUsage] = useState('');
  const [budget, setBudget] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [fuel, setFuel] = useState('');
  const [notes, setNotes] = useState('');
  const mutation = useProfileRecommendation();

  const carsById = useMemo(() => new Map(cars.map((c) => [c.id, c])), [cars]);
  const canSubmit = usage !== '' && budget !== '' && cars.length > 0;

  const togglePriority = (value: string) =>
    setPriorities((current) =>
      current.includes(value) ? current.filter((p) => p !== value) : [...current, value],
    );

  const runRecommendation = () => {
    if (!canSubmit) return;
    mutation.mutate({
      profile: {
        usage,
        budget,
        priorities,
        fuelPreference: fuel && fuel !== 'Tanto faz' ? fuel : undefined,
        notes: notes.trim() || undefined,
      },
      catalog: cars.map(toCatalogItem),
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runRecommendation();
  };

  const result = mutation.data;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
      >
        <Section title="Como você vai usar o carro?">
          {USAGE_OPTIONS.map((option) => (
            <Chip key={option} selected={usage === option} onClick={() => setUsage(option)}>
              {option}
            </Chip>
          ))}
        </Section>

        <Section title="Qual o seu orçamento?">
          {BUDGET_OPTIONS.map((option) => (
            <Chip key={option} selected={budget === option} onClick={() => setBudget(option)}>
              {option}
            </Chip>
          ))}
        </Section>

        <Section title="O que é mais importante?" hint="Selecione quantas quiser">
          {PRIORITY_OPTIONS.map((option) => (
            <Chip
              key={option}
              selected={priorities.includes(option)}
              onClick={() => togglePriority(option)}
            >
              {option}
            </Chip>
          ))}
        </Section>

        <Section title="Combustível preferido" hint="Opcional">
          {FUEL_PREF_OPTIONS.map((option) => (
            <Chip key={option} selected={fuel === option} onClick={() => setFuel(option)}>
              {option}
            </Chip>
          ))}
        </Section>

        <div>
          <label htmlFor="assistant-notes" className="text-sm font-semibold text-slate-800">
            Algo mais que devemos saber?
          </label>
          <Textarea
            id="assistant-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: tenho dois filhos pequenos e faço viagens longas no fim de semana."
            className="mt-2"
            maxLength={500}
          />
        </div>

        <Button type="submit" loading={mutation.isPending} disabled={!canSubmit} size="lg">
          <Wand2 className="h-5 w-5" aria-hidden /> Gerar recomendações
        </Button>
      </form>

      <div className="lg:col-span-3">
        <Results
          state={mutation.status}
          errorMessage={mutation.error instanceof Error ? mutation.error.message : undefined}
          onRetry={canSubmit ? runRecommendation : undefined}
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

function Results({
  state,
  errorMessage,
  onRetry,
  children,
}: {
  state: 'idle' | 'pending' | 'error' | 'success';
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (state === 'idle') {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Vamos encontrar seu carro ideal</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Responda às perguntas ao lado e a IA analisará o catálogo para recomendar os veículos que
          mais combinam com o seu perfil.
        </p>
      </div>
    );
  }

  if (state === 'pending') {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Spinner className="h-8 w-8" />
        <p className="mt-4 text-sm font-medium text-slate-700">Analisando o seu perfil…</p>
        <p className="mt-1 text-sm text-slate-500">Comparando com os veículos do catálogo.</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <ErrorState
        title="Não foi possível gerar recomendações"
        description={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}

function EmptyResult() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-base font-semibold text-slate-900">
        Nenhum veículo se encaixou no perfil
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Tente ajustar o orçamento ou as prioridades e gerar novamente.
      </p>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">{title}</legend>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-brand-600 bg-brand-50 text-brand-700'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  );
}
