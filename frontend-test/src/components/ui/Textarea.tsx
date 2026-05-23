import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'min-h-[88px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
        'transition-colors focus:border-brand-500',
        invalid ? 'border-red-400 focus:border-red-500' : 'border-slate-300',
        'disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
});
