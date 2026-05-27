import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/toast/toastStore';
import { DOOR_OPTIONS, FUEL_OPTIONS } from '@/domain/constants';
import type { NormalizedCar } from '@/domain/types';
import { createUserCar } from '@/services/carsRepository';
import { useUserCarsStore } from '@/store/userCarsStore';
import { carFormSchema, type CarFormValues } from './carFormSchema';
import { CurrencyInput } from './CurrencyInput';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface CarFormProps {
  onSuccess?: (car: NormalizedCar) => void;
}

const toNumberOrUndefined = (v: unknown) => {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export function CarForm({ onSuccess }: CarFormProps) {
  const addCar = useUserCarsStore((s) => s.addCar);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    mode: 'onBlur',
    defaultValues: {
      marca: '',
      nomeModelo: '',
      ano: undefined,
      valor: undefined,
      combustivel: '',
      numPortas: undefined,
      cor: '',
      quilometragem: undefined,
      descricao: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Persistência fake para exercitar o estado de carregamento do botão.
      await delay(500);
      const car = createUserCar(values);
      addCar(car);
      toast({
        title: 'Veículo cadastrado!',
        description: `${car.brandName} ${car.nomeModelo} foi adicionado ao catálogo.`,
        variant: 'success',
      });
      reset();
      onSuccess?.(car);
    } catch {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível salvar o veículo. Tente novamente.',
        variant: 'error',
      });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Marca" required error={errors.marca?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              placeholder="Ex.: Toyota"
              {...register('marca')}
            />
          )}
        </Field>

        <Field label="Modelo" required error={errors.nomeModelo?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              placeholder="Ex.: Corolla"
              {...register('nomeModelo')}
            />
          )}
        </Field>

        <Field label="Ano" required error={errors.ano?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              inputMode="numeric"
              placeholder="Ex.: 2020"
              {...register('ano', { setValueAs: toNumberOrUndefined })}
            />
          )}
        </Field>

        <Field label="Valor" required error={errors.valor?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="valor"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          )}
        </Field>

        <Field label="Combustível" required error={errors.combustivel?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="combustivel"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger id={id} aria-describedby={describedBy} invalid={invalid}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </Field>

        <Field label="Nº de portas" required error={errors.numPortas?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="numPortas"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value != null ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger id={id} aria-describedby={describedBy} invalid={invalid}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOOR_OPTIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} portas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </Field>

        <Field label="Cor" required error={errors.cor?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              placeholder="Ex.: Prata"
              {...register('cor')}
            />
          )}
        </Field>

        <Field label="Quilometragem" hint="Opcional" error={errors.quilometragem?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              inputMode="numeric"
              placeholder="Ex.: 45000"
              {...register('quilometragem', { setValueAs: toNumberOrUndefined })}
            />
          )}
        </Field>
      </div>

      <Field label="Descrição" hint="Opcional · até 500 caracteres" error={errors.descricao?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            placeholder="Detalhes do veículo, itens e estado de conservação…"
            {...register('descricao')}
          />
        )}
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={() => reset()} disabled={isSubmitting}>
          Limpar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          <Save className="h-4 w-4" aria-hidden /> Cadastrar veículo
        </Button>
      </div>
    </form>
  );
}
