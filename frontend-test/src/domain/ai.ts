/* Contrato compartilhado entre o cliente (aiClient) e o BFF (server/ai). */

export interface UserProfile {
  /** Uso principal (cidade, estrada, família, trabalho, primeiro carro…). */
  usage: string;
  /** Faixa de orçamento (rótulo legível). */
  budget: string;
  /** Prioridades do cliente (economia, espaço, conforto, preço…). */
  priorities: string[];
  /** Combustível preferido (opcional). */
  fuelPreference?: string;
  /** Quantidade de pessoas transportadas com frequência (opcional). */
  passengers?: string;
  /** Observações em texto livre (opcional). */
  notes?: string;
}

/** Item do catálogo enviado ao modelo (formato enxuto). */
export interface CatalogItem {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  combustivel: string;
  portas: number;
  cor: string;
  valor: number;
}

export interface Recommendation {
  carId: number;
  /** Adequação ao perfil, de 0 a 100. */
  score: number;
  /** Justificativa personalizada em português. */
  reason: string;
}

export interface ProfileRecommendRequest {
  profile: UserProfile;
  catalog: CatalogItem[];
}

export interface ProfileRecommendResponse {
  recommendations: Recommendation[];
  /** Modelo usado (informativo para a UI). */
  model: string;
}
