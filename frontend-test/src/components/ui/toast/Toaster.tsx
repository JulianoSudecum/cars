import * as ToastPrimitive from '@radix-ui/react-toast';
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToastStore, type ToastVariant } from './toastStore';

const icons: Record<ToastVariant, LucideIcon> = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

const accentClasses: Record<ToastVariant, string> = {
  default: 'text-slate-500',
  info: 'text-brand-600',
  success: 'text-emerald-600',
  error: 'text-red-600',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration ?? 4500}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg',
              'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0',
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', accentClasses[t.variant])} aria-hidden />
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold text-slate-900">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-sm text-slate-500">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm list-none flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  );
}
