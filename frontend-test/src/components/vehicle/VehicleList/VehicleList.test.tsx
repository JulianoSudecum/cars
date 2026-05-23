import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NormalizedCar } from '@/domain/types';
import { VehicleList } from './VehicleList';

function makeCar(partial: Partial<NormalizedCar>): NormalizedCar {
  return {
    id: 1,
    modeloId: 0,
    nomeModelo: 'Modelo',
    ano: 2020,
    combustivel: 'FLEX',
    numPortas: 4,
    cor: 'Preto',
    valor: 50000,
    brandId: 1,
    brandName: 'Toyota',
    source: 'remote',
    ...partial,
  };
}

describe('VehicleList', () => {
  it('agrupa por marca exibindo um cabeçalho por grupo', () => {
    render(
      <VehicleList
        cars={[
          makeCar({ id: 1, brandName: 'Toyota', nomeModelo: 'Corolla' }),
          makeCar({ id: 2, brandName: 'Fiat', nomeModelo: 'Uno' }),
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Fiat' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Toyota' })).toBeInTheDocument();
    expect(screen.getByText('Corolla')).toBeInTheDocument();
    expect(screen.getByText('Uno')).toBeInTheDocument();
  });

  it('exibe esqueletos durante o loading', () => {
    const { container } = render(<VehicleList cars={[]} loading skeletonCount={3} />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('exibe o emptyState quando não há carros', () => {
    render(<VehicleList cars={[]} emptyState={<p>Nada por aqui</p>} />);
    expect(screen.getByText('Nada por aqui')).toBeInTheDocument();
  });

  it('exibe o conteúdo de erro quando fornecido (tem precedência)', () => {
    render(<VehicleList cars={[makeCar({ id: 1 })]} error={<p>Deu erro</p>} />);
    expect(screen.getByText('Deu erro')).toBeInTheDocument();
    expect(screen.queryByText('Modelo')).not.toBeInTheDocument();
  });

  it('usa o renderCard customizado quando informado', () => {
    render(
      <VehicleList
        cars={[makeCar({ id: 1, nomeModelo: 'Personalizado' })]}
        renderCard={(car) => <div>card-{car.nomeModelo}</div>}
      />,
    );
    expect(screen.getByText('card-Personalizado')).toBeInTheDocument();
  });

  it('dispara onSelect ao acionar "Ver detalhes"', async () => {
    const onSelect = vi.fn();
    render(<VehicleList cars={[makeCar({ id: 1, nomeModelo: 'Corolla' })]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /ver detalhes/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
