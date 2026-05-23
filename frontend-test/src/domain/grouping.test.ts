import { describe, expect, it } from 'vitest';
import { groupCars } from './grouping';
import type { NormalizedCar } from './types';

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

describe('groupCars', () => {
  it('agrupa por marca e ordena alfabeticamente', () => {
    const groups = groupCars([
      makeCar({ id: 1, brandName: 'Volkswagen' }),
      makeCar({ id: 2, brandName: 'Chevrolet' }),
    ]);
    expect(groups.map((g) => g.key)).toEqual(['Chevrolet', 'Volkswagen']);
  });

  it('coloca "Marca não informada" sempre por último', () => {
    const groups = groupCars([
      makeCar({ id: 1, brandName: 'Marca não informada' }),
      makeCar({ id: 2, brandName: 'Audi' }),
    ]);
    expect(groups[groups.length - 1].key).toBe('Marca não informada');
  });

  it('com groupBy "none" retorna um único grupo', () => {
    const groups = groupCars([makeCar({ id: 1 }), makeCar({ id: 2 })], 'none');
    expect(groups).toHaveLength(1);
    expect(groups[0].cars).toHaveLength(2);
  });

  it('aceita função de agrupamento customizada', () => {
    const groups = groupCars(
      [makeCar({ id: 1, combustivel: 'FLEX' }), makeCar({ id: 2, combustivel: 'DIESEL' })],
      (car) => car.combustivel,
    );
    expect(groups.map((g) => g.key)).toEqual(['DIESEL', 'FLEX']);
  });
});
