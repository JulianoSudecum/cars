import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
        'transition-colors focus:border-brand-500',
        invalid ? 'border-red-400 focus:border-red-500' : 'border-slate-300',
        'disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
});
