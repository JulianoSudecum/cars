import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

let seq = 0;
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para contextos não-seguros (HTTP por IP) ou navegadores antigos.
  return `toast-${Date.now()}-${seq++}`;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({ toasts: [...state.toasts, { id: generateId(), ...toast }] })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Helper imperativo para disparar toasts de qualquer lugar. */
export function toast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}): void {
  useToastStore.getState().add({ variant: 'default', ...input });
}
