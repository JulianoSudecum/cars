import { forwardRef } from 'react';
import { Input, type InputProps } from '@/components/ui/Input';

const numberFormatter = new Intl.NumberFormat('pt-BR');

interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: number;
  onChange: (value: number | undefined) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(function CurrencyInput(
  { value, onChange, ...props },
  ref,
) {
  const display = value != null && Number.isFinite(value) ? `R$ ${numberFormatter.format(value)}` : '';

  return (
    <Input
      ref={ref}
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '');
        onChange(digits === '' ? undefined : Number(digits));
      }}
      placeholder="R$ 0"
      {...props}
    />
  );
});
