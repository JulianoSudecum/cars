import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';

type Status = 'idle' | 'pending' | 'error' | 'success';

interface ResultsProps {
  status: Status;
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Painel direito do assistente. Renderiza o estado adequado (vazio inicial,
 * carregando, erro com retry) ou os filhos quando há resultado.
 */
export function Results({ status, errorMessage, onRetry, children }: ResultsProps) {
  if (status === 'idle') {
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

  if (status === 'pending') {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Spinner className="h-8 w-8" />
        <p className="mt-4 text-sm font-medium text-slate-700">Analisando o seu perfil…</p>
        <p className="mt-1 text-sm text-slate-500">Comparando com os veículos do catálogo.</p>
      </div>
    );
  }

  if (status === 'error') {
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

export function EmptyResult() {
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
