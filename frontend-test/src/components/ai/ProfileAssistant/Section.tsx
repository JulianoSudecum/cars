import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

/** Fieldset semântico para cada grupo de perguntas. */
export function Section({ title, hint, children }: SectionProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">{title}</legend>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
