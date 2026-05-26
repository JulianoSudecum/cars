/* eslint-disable */
// ============================================================
// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE À MÃO.
// Fonte: functions/*.ts
// Gerador: scripts/build-vercel-api.mjs (rode `npm run build:functions`).
// ============================================================

// src/domain/constants.ts
var UNKNOWN_BRAND_LABEL = "Marca n\xE3o informada";

// src/domain/brands.ts
var BRAND_NAMES = {
  1: "Toyota",
  2: "Chevrolet",
  3: "Volkswagen"
};
var MODEL_TO_BRAND = {
  ETIOS: { id: 1, name: "Toyota" },
  COROLLA: { id: 1, name: "Toyota" },
  "HILUX SW4": { id: 1, name: "Toyota" },
  "HILLUX SW4": { id: 1, name: "Toyota" },
  ONIX: { id: 2, name: "Chevrolet" },
  "ONIX PLUS": { id: 2, name: "Chevrolet" },
  JETTA: { id: 3, name: "Volkswagen" }
};
function curatedBrandName(id) {
  return BRAND_NAMES[id];
}
function inferBrandFromModel(nomeModelo) {
  const key = nomeModelo.trim().toUpperCase();
  return MODEL_TO_BRAND[key] ?? null;
}

// src/domain/jsonRepair.ts
function repairJson(text) {
  return text.replace(
    /(:\s*(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null))(\s*\r?\n\s*")/g,
    "$1,$2"
  );
}
function parseJsonLenient(text) {
  try {
    return JSON.parse(text);
  } catch (originalError) {
    try {
      return JSON.parse(repairJson(text));
    } catch {
      throw originalError;
    }
  }
}

// src/domain/normalizeCatalog.ts
function normalizeCatalog(carsText, byBrandText) {
  const carsPayload = parseJsonLenient(carsText);
  const byBrandPayload = parseJsonLenient(byBrandText);
  const carsList = Array.isArray(carsPayload.cars) ? carsPayload.cars : [];
  const byBrandList = Array.isArray(byBrandPayload.cars) ? byBrandPayload.cars : [];
  const brandByCarId = /* @__PURE__ */ new Map();
  for (const car of byBrandList) {
    if (typeof car.id === "number" && typeof car.brand === "number") {
      brandByCarId.set(car.id, car.brand);
    }
  }
  const byId = /* @__PURE__ */ new Map();
  for (const car of carsList) byId.set(car.id, car);
  for (const car of byBrandList) if (!byId.has(car.id)) byId.set(car.id, car);
  return Array.from(byId.values()).map((raw) => normalizeCar(raw, brandByCarId)).sort((a, b) => a.brandName.localeCompare(b.brandName, "pt-BR"));
}
function normalizeCar(raw, brandByCarId) {
  const { brandId, brandName } = resolveBrand(raw, brandByCarId);
  return {
    id: raw.id,
    modeloId: raw.modelo_id,
    nomeModelo: (raw.nome_modelo ?? "").trim() || "Modelo desconhecido",
    ano: toInt(raw.ano),
    combustivel: (raw.combustivel ?? "").trim().toUpperCase(),
    numPortas: toInt(raw.num_portas),
    cor: capitalize(raw.cor ?? ""),
    valor: normalizeRemoteValue(raw.valor),
    timestampCadastro: raw.timestamp_cadastro,
    brandId,
    brandName,
    source: "remote"
  };
}
function resolveBrand(raw, brandByCarId) {
  const explicitBrand = "brand" in raw && typeof raw.brand === "number" ? raw.brand : void 0;
  const candidateId = explicitBrand ?? brandByCarId.get(raw.id) ?? null;
  if (candidateId != null) {
    const curated = curatedBrandName(candidateId);
    if (curated) return { brandId: candidateId, brandName: curated };
  }
  const inferred = inferBrandFromModel(raw.nome_modelo ?? "");
  if (inferred) return { brandId: inferred.id, brandName: inferred.name };
  if (candidateId != null) return { brandId: candidateId, brandName: `Marca ${candidateId}` };
  return { brandId: null, brandName: UNKNOWN_BRAND_LABEL };
}
function toInt(value) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}
function normalizeRemoteValue(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return n > 0 && n < 1e3 ? Math.round(n * 1e3) : Math.round(n);
}
function capitalize(value) {
  const t = value.trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

// server/cars/catalog.ts
var CARS_URL = "https://wswork.com.br/cars.json";
var CARS_BY_BRAND_URL = "https://wswork.com.br/cars_by_brand.json";
var CACHE_TTL_MS = 5 * 60 * 1e3;
var cache = null;
var inflight = null;
async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AutoCatalogo/1.0; +https://github.com/JulianoSudecum/cars)",
      Accept: "application/json, text/plain, */*"
    }
  });
  if (!res.ok) throw new Error(`Falha ao buscar ${url} (HTTP ${res.status}).`);
  return res.text();
}
async function fetchAndNormalize() {
  const [carsText, byBrandText] = await Promise.all([
    fetchText(CARS_URL),
    // O endpoint by-brand é tolerável a falhas: seguimos com cars.json + inferência.
    fetchText(CARS_BY_BRAND_URL).catch(() => '{"cars":[]}')
  ]);
  const data = normalizeCatalog(carsText, byBrandText);
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}
async function loadCatalog() {
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  if (inflight) return inflight;
  inflight = fetchAndNormalize().finally(() => {
    inflight = null;
  });
  return inflight;
}

// functions/cars.ts
async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "M\xE9todo n\xE3o permitido." });
    return;
  }
  try {
    const cars = await loadCatalog();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json(cars);
  } catch (error) {
    console.error("[api/cars]", error);
    res.status(502).json({ error: "N\xE3o foi poss\xEDvel carregar o cat\xE1logo de ve\xEDculos." });
  }
}
export {
  handler as default
};
