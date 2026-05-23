import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Algo deu errado',
  description,
  onRetry,
  retryLabel = 'Tentar novamente',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-16 text-center',
        className,
      )}
    >
      <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden />
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6">
          <RotateCw className="h-4 w-4" aria-hidden />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
