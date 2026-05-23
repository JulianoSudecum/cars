import { describe, expect, it } from 'vitest';
import { parseJsonLenient, repairJson } from './jsonRepair';

describe('repairJson', () => {
  it('insere a vírgula faltante entre um valor e a próxima chave', () => {
    const broken = '{\n  "num_portas": 4\n  "cor": "BRANCA"\n}';
    expect(JSON.parse(repairJson(broken))).toEqual({ num_portas: 4, cor: 'BRANCA' });
  });

  it('não altera um JSON já válido', () => {
    const valid = '{"a":1,"b":2}';
    expect(repairJson(valid)).toBe(valid);
  });

  it('preserva vírgulas existentes (não duplica)', () => {
    const valid = '{\n  "a": 1,\n  "b": 2\n}';
    expect(JSON.parse(repairJson(valid))).toEqual({ a: 1, b: 2 });
  });
});

describe('parseJsonLenient', () => {
  it('faz parse de JSON válido normalmente', () => {
    expect(parseJsonLenient('{"x":1}')).toEqual({ x: 1 });
  });

  it('repara o defeito real do cars_by_brand antes do parse', () => {
    const broken = '{"cars":[{"num_portas": 4\n"cor": "BRANCA","valor": 36.0}]}';
    expect(parseJsonLenient(broken)).toEqual({
      cars: [{ num_portas: 4, cor: 'BRANCA', valor: 36.0 }],
    });
  });
});
