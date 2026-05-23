/* ──────────────────────────────────────────────────────────────
   Tipos crus (formato exato dos endpoints wswork)
   ────────────────────────────────────────────────────────────── */

/** Registro como vem de https://wswork.com.br/cars.json */
export interface RawCar {
  id: number;
  timestamp_cadastro: number;
  modelo_id: number;
  ano: number;
  combustivel: string;
  num_portas: number;
  cor: string;
  nome_modelo: string;
  valor: number;
}

/** Registro como vem de https://wswork.com.br/cars_by_brand.json (inclui `brand`). */
export interface RawCarByBrand extends RawCar {
  brand: number;
}

/* ──────────────────────────────────────────────────────────────
   Tipo normalizado usado por toda a aplicação
   ────────────────────────────────────────────────────────────── */

/** Origem do registro: catálogo remoto ou cadastro local do usuário. */
export type CarSource = 'remote' | 'local';

export interface NormalizedCar {
  id: number;
  modeloId: number;
  nomeModelo: string;
  ano: number;
  combustivel: string;
  numPortas: number;
  cor: string;
  /** Valor do anúncio em reais (inteiro). */
  valor: number;
  /** Quilometragem (apenas em cadastros locais; os endpoints não trazem). */
  quilometragem?: number;
  /** Descrição/observações (apenas em cadastros locais). */
  descricao?: string;
  timestampCadastro?: number;
  brandId: number | null;
  brandName: string;
  source: CarSource;
}
