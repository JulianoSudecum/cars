const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

const kmFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

/** Formata um valor numérico como moeda brasileira (ex.: R$ 50.000). */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return brlFormatter.format(value);
}

/** Formata quilometragem (ex.: 45.000 km). */
export function formatKm(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—';
  return `${kmFormatter.format(value)} km`;
}

/**
 * Normaliza o `timestamp_cadastro` dos dados, que vem inconsistente:
 * a maioria em segundos (10 díg.), e há outliers corrompidos.
 * Retorna `null` quando a data resultante é implausível.
 */
export function parseTimestamp(timestamp: number | undefined): Date | null {
  if (timestamp === undefined || !Number.isFinite(timestamp)) return null;
  // < 1e11 -> tratamos como segundos; caso contrário, milissegundos.
  const ms = timestamp < 1e11 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  const year = date.getFullYear();
  const maxYear = new Date().getFullYear() + 1;
  if (Number.isNaN(date.getTime()) || year < 2000 || year > maxYear) return null;
  return date;
}

/** Formata o timestamp de cadastro como data legível, ou '—' se inválido. */
export function formatTimestamp(timestamp: number | undefined): string {
  const date = parseTimestamp(timestamp);
  return date ? dateFormatter.format(date) : '—';
}
