/**
 * Como os dados não trazem imagens, derivamos uma identidade visual estável
 * por marca (gradiente + iniciais) a partir de um hash do nome. A paleta usa
 * tons profundos e sóbrios (estilo editorial), legíveis com texto claro.
 */
const PALETTE = [
  'from-stone-600 to-stone-800',
  'from-emerald-800 to-emerald-950',
  'from-amber-700 to-amber-900',
  'from-orange-800 to-orange-950',
  'from-rose-800 to-rose-950',
  'from-teal-800 to-teal-950',
  'from-cyan-800 to-cyan-950',
  'from-lime-800 to-lime-950',
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Classe de gradiente Tailwind estável para a marca. */
export function brandGradient(name: string): string {
  return PALETTE[hash(name) % PALETTE.length];
}

/** Iniciais (até 2 letras) para o "selo" da marca. */
export function brandInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
