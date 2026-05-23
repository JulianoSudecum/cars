import { describe, expect, it } from 'vitest';
import { createUserCar } from './carsRepository';

describe('createUserCar', () => {
  it('mapeia os dados do formulário para um NormalizedCar local', () => {
    const car = createUserCar({
      marca: 'honda',
      nomeModelo: 'Civic',
      ano: 2020,
      valor: 90000,
      combustivel: 'FLEX',
      numPortas: 4,
      cor: 'preto',
      quilometragem: 30000,
      descricao: '  ótimo estado  ',
    });

    expect(car.source).toBe('local');
    expect(car.brandName).toBe('Honda'); // Title Case
    expect(car.cor).toBe('Preto');
    expect(car.valor).toBe(90000);
    expect(car.brandId).toBeNull();
    expect(car.descricao).toBe('ótimo estado'); // trim
    expect(typeof car.id).toBe('number');
  });

  it('trata campos opcionais vazios como undefined', () => {
    const car = createUserCar({
      marca: 'Fiat',
      nomeModelo: 'Uno',
      ano: 2019,
      valor: 40000,
      combustivel: 'FLEX',
      numPortas: 2,
      cor: 'Branco',
    });

    expect(car.descricao).toBeUndefined();
    expect(car.quilometragem).toBeUndefined();
  });
});
