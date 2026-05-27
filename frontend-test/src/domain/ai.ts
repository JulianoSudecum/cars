/** Contrato compartilhado entre o cliente (aiClient) e o BFF (server/ai). */

export interface UserProfile {
  usage: string;
  budget: string;
  priorities: string[];
  fuelPreference?: string;
  passengers?: string;
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
  reason: string;
}

export interface ProfileRecommendRequest {
  profile: UserProfile;
  catalog: CatalogItem[];
}

export interface ProfileRecommendResponse {
  recommendations: Recommendation[];
  model: string;
}
