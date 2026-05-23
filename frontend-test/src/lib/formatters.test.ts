import { describe, expect, it } from 'vitest';
import { formatCurrency, formatKm, parseTimestamp } from './formatters';

describe('formatCurrency', () => {
  it('formata como moeda brasileira', () => {
    expect(formatCurrency(50000)).toContain('50.000');
  });

  it('retorna "—" para valores inválidos', () => {
    expect(formatCurrency(Number.NaN)).toBe('—');
  });
});

describe('formatKm', () => {
  it('formata quilometragem com sufixo', () => {
    expect(formatKm(45000)).toContain('45.000');
    expect(formatKm(45000)).toContain('km');
  });

  it('retorna "—" quando indefinido', () => {
    expect(formatKm(undefined)).toBe('—');
  });
});

describe('parseTimestamp', () => {
  it('interpreta timestamp em segundos (unix)', () => {
    expect(parseTimestamp(1696539488)?.getFullYear()).toBe(2023);
  });

  it('retorna null para timestamp corrompido fora de faixa plausível', () => {
    expect(parseTimestamp(16965354321)).toBeNull();
  });

  it('retorna null para entrada indefinida', () => {
    expect(parseTimestamp(undefined)).toBeNull();
  });
});
