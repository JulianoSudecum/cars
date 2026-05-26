import { useCallback, useState } from 'react';
import type { UserProfile } from '@/domain/ai';

/**
 * Estado controlado do questionário do assistente. Concentra os setters e a
 * derivação `canSubmit` num único lugar para o componente orquestrador ficar
 * fino e os arquivos de UI permanecerem puramente apresentacionais.
 */
export function useProfileForm() {
  const [usage, setUsage] = useState('');
  const [budget, setBudget] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [fuel, setFuel] = useState('');
  const [notes, setNotes] = useState('');

  const togglePriority = useCallback((value: string) => {
    setPriorities((current) =>
      current.includes(value) ? current.filter((p) => p !== value) : [...current, value],
    );
  }, []);

  const toProfile = useCallback(
    (): UserProfile => ({
      usage,
      budget,
      priorities,
      fuelPreference: fuel && fuel !== 'Tanto faz' ? fuel : undefined,
      notes: notes.trim() || undefined,
    }),
    [usage, budget, priorities, fuel, notes],
  );

  return {
    values: { usage, budget, priorities, fuel, notes },
    setUsage,
    setBudget,
    togglePriority,
    setFuel,
    setNotes,
    canSubmit: usage !== '' && budget !== '',
    toProfile,
  };
}
