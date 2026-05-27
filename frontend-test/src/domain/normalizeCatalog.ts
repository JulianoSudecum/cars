import { z } from 'zod';
import { curatedBrandName, inferBrandFromModel } from './brands';
import { UNKNOWN_BRAND_LABEL } from './constants';
import { parseJsonLenient } from './jsonRepair';
import type { NormalizedCar, RawCar, RawCarByBrand } from './types';

/**
 * Schema do registro cru dos endpoints. Permanece tolerante (coerções e
 * defaults) para não rejeitar a wswork por trivialidades como `valor` em
 * string — mas exige `id` válido, sem o qual a normalização não faz sentido.
 */
const rawCarSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  timestamp_cadastro: z.coerce.number().optional(),
  modelo_id: z.coerce.number().default(0),
  ano: z.coerce.number().default(0),
  combustivel: z.string().default(''),
  num_portas: z.coerce.number().default(0),
  cor: z.string().default(''),
  nome_modelo: z.string().default(''),
  valor: z.coerce.number().default(0),
  brand: z.coerce.number().optional(),
});

const payloadSchema = z
  .object({ cars: z.array(z.unknown()).default([]) })
  .catch({ cars: [] });

/**
 * Função pura (sem rede): recebe o texto cru dos dois endpoints, repara o
 * JSON, normaliza e resolve a marca em cascata
 * (`brand` explícito → join por id → inferência por modelo → "não informada").
 */
export function normalizeCatalog(carsText: string, byBrandText: string): NormalizedCar[] {
  const carsList = parseRawCars(carsText);
  const byBrandList = parseRawCars(byBrandText);

  const brandByCarId = new Map<number, number>();
  for (const car of byBrandList) {
    if ('brand' in car && typeof car.brand === 'number') {
      brandByCarId.set(car.id, car.brand);
    }
  }

  // by-brand pode conter carros ausentes em cars.json — fazemos união por id.
  const byId = new Map<number, RawCar | RawCarByBrand>();
  for (const car of carsList) byId.set(car.id, car);
  for (const car of byBrandList) if (!byId.has(car.id)) byId.set(car.id, car);

  return Array.from(byId.values())
    .map((raw) => normalizeCar(raw, brandByCarId))
    .sort((a, b) => a.brandName.localeCompare(b.brandName, 'pt-BR'));
}

/**
 * Faz o parse defensivo do envelope e de cada item. Itens individuais
 * inválidos são descartados (com aviso no console), preservando o restante do
 * catálogo — falha-aberta é melhor do que tela em branco.
 */
function parseRawCars(text: string): Array<RawCar | RawCarByBrand> {
  let parsed: unknown;
  try {
    parsed = parseJsonLenient(text);
  } catch (error) {
    console.warn('[normalizeCatalog] payload não é JSON válido', error);
    return [];
  }
  const envelope = payloadSchema.safeParse(parsed);
  if (!envelope.success) return [];

  const valid: Array<RawCar | RawCarByBrand> = [];
  for (const item of envelope.data.cars) {
    const result = rawCarSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data as RawCar | RawCarByBrand);
    } else {
      console.warn('[normalizeCatalog] item inválido descartado', result.error.issues);
    }
  }
  return valid;
}

function normalizeCar(raw: RawCar | RawCarByBrand, brandByCarId: Map<number, number>): NormalizedCar {
  const { brandId, brandName } = resolveBrand(raw, brandByCarId);

  return {
    id: raw.id,
    modeloId: raw.modelo_id,
    nomeModelo: (raw.nome_modelo ?? '').trim() || 'Modelo desconhecido',
    ano: toInt(raw.ano),
    combustivel: (raw.combustivel ?? '').trim().toUpperCase(),
    numPortas: toInt(raw.num_portas),
    cor: capitalize(raw.cor ?? ''),
    valor: normalizeRemoteValue(raw.valor),
    timestampCadastro: raw.timestamp_cadastro,
    brandId,
    brandName,
    source: 'remote',
  };
}

/**
 * Ordem: id curado → inferência por modelo → id não-curado ("Marca {id}") →
 * "não informada". Um id presente porém desconhecido não deve bloquear a
 * inferência pelo nome do modelo.
 */
function resolveBrand(
  raw: RawCar | RawCarByBrand,
  brandByCarId: Map<number, number>,
): { brandId: number | null; brandName: string } {
  const explicitBrand = 'brand' in raw && typeof raw.brand === 'number' ? raw.brand : undefined;
  const candidateId = explicitBrand ?? brandByCarId.get(raw.id) ?? null;

  if (candidateId != null) {
    const curated = curatedBrandName(candidateId);
    if (curated) return { brandId: candidateId, brandName: curated };
  }

  const inferred = inferBrandFromModel(raw.nome_modelo ?? '');
  if (inferred) return { brandId: inferred.id, brandName: inferred.name };

  if (candidateId != null) return { brandId: candidateId, brandName: `Marca ${candidateId}` };
  return { brandId: null, brandName: UNKNOWN_BRAND_LABEL };
}

function toInt(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/**
 * Os endpoints trazem preços no formato brasileiro de milhar (ex.: 50.000),
 * que o JSON.parse converte para 50.0. Reinterpretamos valores < 1000 como
 * milhares — premissa documentada no README.
 */
function normalizeRemoteValue(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return n > 0 && n < 1000 ? Math.round(n * 1000) : Math.round(n);
}

function capitalize(value: string): string {
  const t = value.trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}
