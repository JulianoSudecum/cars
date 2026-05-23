import { describe, expect, it } from 'vitest';
import { normalizeCatalog } from './normalizeCatalog';

// cars.json: ONIX PLUS sem marca (será inferida por modelo)
const carsJson = JSON.stringify({
  cars: [
    {
      id: 1,
      timestamp_cadastro: 1696539488,
      modelo_id: 12,
      ano: 2015,
      combustivel: 'FLEX',
      num_portas: 4,
      cor: 'BEGE',
      nome_modelo: 'ONIX PLUS',
      valor: 50.0,
    },
  ],
});

// cars_by_brand.json com o defeito real (vírgula faltando após num_portas) + brand
const byBrandBroken =
  '{"cars":[{"id":55,"timestamp_cadastro":1696549488,"modelo_id":88,"ano":2014,"combustivel":"FLEX","num_portas":4\n"cor":"BRANCA","nome_modelo":"ETIOS","valor":36.0,"brand":1}]}';

describe('normalizeCatalog', () => {
  it('repara o JSON malformado e inclui o carro do endpoint by-brand', () => {
    const cars = normalizeCatalog(carsJson, byBrandBroken);
    const etios = cars.find((c) => c.id === 55);
    expect(etios).toBeDefined();
    expect(etios?.brandId).toBe(1);
    expect(etios?.brandName).toBe('Toyota');
    expect(etios?.valor).toBe(36000);
  });

  it('infere a marca pelo modelo quando não há brand (ONIX PLUS → Chevrolet)', () => {
    const cars = normalizeCatalog(carsJson, '{"cars":[]}');
    expect(cars.find((c) => c.id === 1)?.brandName).toBe('Chevrolet');
  });

  it('reinterpreta valores pequenos como milhares (50 → 50000)', () => {
    const cars = normalizeCatalog(carsJson, '{"cars":[]}');
    expect(cars.find((c) => c.id === 1)?.valor).toBe(50000);
  });

  it('normaliza cor (capitaliza) e combustível (maiúsculas)', () => {
    const onix = normalizeCatalog(carsJson, '{"cars":[]}').find((c) => c.id === 1);
    expect(onix?.cor).toBe('Bege');
    expect(onix?.combustivel).toBe('FLEX');
    expect(onix?.source).toBe('remote');
  });

  it('infere a marca por modelo mesmo com brandId presente porém não-curado', () => {
    const byBrand =
      '{"cars":[{"id":1,"modelo_id":1,"ano":2014,"combustivel":"FLEX","num_portas":4,"cor":"PRATA","nome_modelo":"COROLLA","valor":120.0,"brand":4}]}';
    const corolla = normalizeCatalog('{"cars":[]}', byBrand).find((c) => c.id === 1);
    expect(corolla?.brandName).toBe('Toyota'); // inferido por modelo, não "Marca 4"
  });

  it('tolera by-brand vazio e payload sem array', () => {
    expect(normalizeCatalog('{}', '{}')).toEqual([]);
  });
});
