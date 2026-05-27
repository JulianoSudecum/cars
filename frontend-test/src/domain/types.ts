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

export type CarSource = 'remote' | 'local';

export interface NormalizedCar {
  id: number;
  modeloId: number;
  nomeModelo: string;
  ano: number;
  combustivel: string;
  numPortas: number;
  cor: string;
  valor: number;
  /** Apenas em cadastros locais; os endpoints não trazem. */
  quilometragem?: number;
  /** Apenas em cadastros locais. */
  descricao?: string;
  timestampCadastro?: number;
  brandId: number | null;
  brandName: string;
  source: CarSource;
}
