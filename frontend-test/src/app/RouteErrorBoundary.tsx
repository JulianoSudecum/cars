import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Boundary global associado à rota raiz via `errorElement`. Captura erros
 * lançados durante renderização, loaders/actions e em qualquer descendente —
 * evita que o usuário fique com tela em branco se algo escapar dos try/catch
 * das queries e mutations.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const { title, description } = describe(error);

  if (import.meta.env.DEV) {
    console.error('[RouteErrorBoundary]', error);
  }

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center"
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => window.location.reload()}>
          <RotateCw className="h-4 w-4" aria-hidden /> Recarregar
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao catálogo</Link>
        </Button>
      </div>
    </div>
  );
}

function describe(error: unknown): { title: string; description: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: `Erro ${error.status}`,
      description: error.statusText || 'A rota solicitada não pôde ser processada.',
    };
  }
  if (error instanceof Error && error.message) {
    return {
      title: 'Algo deu errado',
      description: error.message,
    };
  }
  return {
    title: 'Algo deu errado',
    description:
      'Ocorreu um erro inesperado na aplicação. Recarregue a página ou volte ao catálogo.',
  };
}
