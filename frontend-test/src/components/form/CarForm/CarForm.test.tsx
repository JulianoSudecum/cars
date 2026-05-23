import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUserCarsStore } from '@/store/userCarsStore';
import { CarForm } from './CarForm';

describe('CarForm', () => {
  beforeEach(() => {
    useUserCarsStore.getState().reset();
  });

  it('exibe mensagens de validação ao enviar o formulário vazio', async () => {
    render(<CarForm />);
    await userEvent.click(screen.getByRole('button', { name: /cadastrar veículo/i }));

    expect(await screen.findByText('Informe a marca')).toBeInTheDocument();
    expect(screen.getByText('Informe o modelo')).toBeInTheDocument();
    expect(screen.getByText('Informe a cor')).toBeInTheDocument();
  });

  it('não persiste nada quando o formulário é inválido', async () => {
    render(<CarForm />);
    await userEvent.click(screen.getByRole('button', { name: /cadastrar veículo/i }));
    await screen.findByText('Informe a marca');

    expect(useUserCarsStore.getState().cars).toHaveLength(0);
  });

  it('valida o ano fora da faixa permitida', async () => {
    render(<CarForm />);
    await userEvent.type(screen.getByLabelText(/ano/i), '1800');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar veículo/i }));

    expect(await screen.findByText('Ano muito antigo')).toBeInTheDocument();
  });
});
