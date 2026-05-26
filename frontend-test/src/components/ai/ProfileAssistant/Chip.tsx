import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** Pílula selecionável usada nas perguntas do assistente. */
export function Chip({ selected, onClick, children }: ChipProps) {
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
