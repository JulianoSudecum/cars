import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes condicionais (clsx) resolvendo conflitos do Tailwind
 * (tailwind-merge). Ex.: cn('p-2', condição && 'p-4') -> 'p-4'.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
