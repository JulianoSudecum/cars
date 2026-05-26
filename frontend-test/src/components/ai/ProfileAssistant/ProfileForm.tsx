import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Chip } from './Chip';
import { Section } from './Section';
import { BUDGET_OPTIONS, FUEL_PREF_OPTIONS, PRIORITY_OPTIONS, USAGE_OPTIONS } from './options';
import type { useProfileForm } from './useProfileForm';

interface ProfileFormProps {
  form: ReturnType<typeof useProfileForm>;
  submitting: boolean;
  onSubmit: () => void;
}

/** Painel esquerdo do assistente: questionário de perfil. */
export function ProfileForm({ form, submitting, onSubmit }: ProfileFormProps) {
  const { values, setUsage, setBudget, togglePriority, setFuel, setNotes, canSubmit } = form;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
    >
      <Section title="Como você vai usar o carro?">
        {USAGE_OPTIONS.map((option) => (
          <Chip key={option} selected={values.usage === option} onClick={() => setUsage(option)}>
            {option}
          </Chip>
        ))}
      </Section>

      <Section title="Qual o seu orçamento?">
        {BUDGET_OPTIONS.map((option) => (
          <Chip key={option} selected={values.budget === option} onClick={() => setBudget(option)}>
            {option}
          </Chip>
        ))}
      </Section>

      <Section title="O que é mais importante?" hint="Selecione quantas quiser">
        {PRIORITY_OPTIONS.map((option) => (
          <Chip
            key={option}
            selected={values.priorities.includes(option)}
            onClick={() => togglePriority(option)}
          >
            {option}
          </Chip>
        ))}
      </Section>

      <Section title="Combustível preferido" hint="Opcional">
        {FUEL_PREF_OPTIONS.map((option) => (
          <Chip key={option} selected={values.fuel === option} onClick={() => setFuel(option)}>
            {option}
          </Chip>
        ))}
      </Section>

      <div>
        <label htmlFor="assistant-notes" className="text-sm font-semibold text-slate-800">
          Algo mais que devemos saber?
        </label>
        <Textarea
          id="assistant-notes"
          value={values.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex.: tenho dois filhos pequenos e faço viagens longas no fim de semana."
          className="mt-2"
          maxLength={500}
        />
      </div>

      <Button type="submit" loading={submitting} disabled={!canSubmit} size="lg">
        <Wand2 className="h-5 w-5" aria-hidden /> Gerar recomendações
      </Button>
    </form>
  );
}
