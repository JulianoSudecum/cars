const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

const kmFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return brlFormatter.format(value);
}

export function formatKm(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—';
  return `${kmFormatter.format(value)} km`;
}

/**
 * Os dados trazem `timestamp_cadastro` em segundos na maioria dos casos, mas
 * há outliers em milissegundos e valores corrompidos fora da faixa plausível.
 */
export function parseTimestamp(timestamp: number | undefined): Date | null {
  if (timestamp === undefined || !Number.isFinite(timestamp)) return null;
  const ms = timestamp < 1e11 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  const year = date.getFullYear();
  const maxYear = new Date().getFullYear() + 1;
  if (Number.isNaN(date.getTime()) || year < 2000 || year > maxYear) return null;
  return date;
}

export function formatTimestamp(timestamp: number | undefined): string {
  const date = parseTimestamp(timestamp);
  return date ? dateFormatter.format(date) : '—';
}
