import { curatedBrandName, inferBrandFromModel } from './brands';
import { UNKNOWN_BRAND_LABEL } from './constants';
import { parseJsonLenient } from './jsonRepair';
import type { NormalizedCar, RawCar, RawCarByBrand } from './types';

interface CarsPayload {
  cars: RawCar[];
}
interface CarsByBrandPayload {
  cars: RawCarByBrand[];
}

/**
 * Função pura (sem rede) que recebe o texto cru dos dois endpoints, repara o
 * JSON inválido, normaliza e faz o join por marca em três estratégias:
 * `brand` explícito → join por id → inferência por modelo → "não informada".
 *
 * Vive em `domain` para ser compartilhada entre o BFF (que faz o fetch
 * server-side, contornando o CORS dos endpoints) e os testes unitários.
 */
export function normalizeCatalog(carsText: string, byBrandText: string): NormalizedCar[] {
  const carsPayload = parseJsonLenient<CarsPayload>(carsText);
  const byBrandPayload = parseJsonLenient<CarsByBrandPayload>(byBrandText);

  const carsList = Array.isArray(carsPayload.cars) ? carsPayload.cars : [];
  const byBrandList = Array.isArray(byBrandPayload.cars) ? byBrandPayload.cars : [];

  // Estratégia primária de join: carId -> brandId
  const brandByCarId = new Map<number, number>();
  for (const car of byBrandList) {
    if (typeof car.id === 'number' && typeof car.brand === 'number') {
      brandByCarId.set(car.id, car.brand);
    }
  }

  // União dos dois endpoints (by-brand pode conter carros ausentes em cars.json).
  const byId = new Map<number, RawCar | RawCarByBrand>();
  for (const car of carsList) byId.set(car.id, car);
  for (const car of byBrandList) if (!byId.has(car.id)) byId.set(car.id, car);

  return Array.from(byId.values())
    .map((raw) => normalizeCar(raw, brandByCarId))
    .sort((a, b) => a.brandName.localeCompare(b.brandName, 'pt-BR'));
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
 * Resolve a marca em ordem: id curado → inferência por modelo → id não-curado
 * ("Marca {id}") → "não informada". Assim, um id presente porém desconhecido
 * não bloqueia a inferência pelo nome do modelo.
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
 * que o JSON.parse converte para 50.0. Reinterpretamos valores "pequenos"
 * (< 1000) como milhares — premissa documentada no README.
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
