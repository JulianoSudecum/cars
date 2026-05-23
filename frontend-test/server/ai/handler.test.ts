import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocka a chamada ao modelo — testamos apenas a lógica do handler.
vi.mock('./anthropic', () => ({
  callRecommend: vi.fn(),
  MODEL: 'claude-test',
  MissingApiKeyError: class MissingApiKeyError extends Error {},
}));

import { callRecommend } from './anthropic';
import { handleProfileRecommend } from './handler';

const mockedCall = vi.mocked(callRecommend);

const baseBody = {
  profile: { usage: 'Cidade', budget: 'Até 40 mil', priorities: ['Economia'] },
  catalog: [
    { id: 1, marca: 'Toyota', modelo: 'Etios', ano: 2014, combustivel: 'FLEX', portas: 4, cor: 'Branca', valor: 36000 },
    { id: 2, marca: 'Volkswagen', modelo: 'Jetta', ano: 2014, combustivel: 'FLEX', portas: 4, cor: 'Azul', valor: 49000 },
  ],
};

describe('handleProfileRecommend', () => {
  beforeEach(() => {
    mockedCall.mockReset();
  });

  it('descarta carIds que não existem no catálogo (anti-alucinação)', async () => {
    mockedCall.mockResolvedValue({
      recommendations: [
        { carId: 1, score: 90, reason: 'ok' },
        { carId: 999, score: 80, reason: 'alucinado' },
      ],
    });
    const result = await handleProfileRecommend(baseBody);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].carId).toBe(1);
  });

  it('ordena por score decrescente e faz clamp para 0–100', async () => {
    mockedCall.mockResolvedValue({
      recommendations: [
        { carId: 1, score: 50, reason: 'a' },
        { carId: 2, score: 150, reason: 'b' },
      ],
    });
    const result = await handleProfileRecommend(baseBody);
    expect(result.recommendations.map((r) => r.carId)).toEqual([2, 1]);
    expect(result.recommendations[0].score).toBe(100);
  });

  it('retorna lista vazia quando a saída do modelo é inválida', async () => {
    mockedCall.mockResolvedValue({ foo: 'bar' });
    const result = await handleProfileRecommend(baseBody);
    expect(result.recommendations).toEqual([]);
  });

  it('rejeita corpo inválido (validação Zod)', async () => {
    await expect(handleProfileRecommend({ profile: {}, catalog: [] })).rejects.toThrow();
  });
});
