import type { CatalogItem, UserProfile } from '../../src/domain/ai';

/** System prompt fixo (estável → bom para prompt caching). */
export const SYSTEM_PROMPT = `Você é um consultor automotivo brasileiro especialista em ajudar clientes a escolher o carro ideal.

Sua tarefa: analisar o perfil do cliente e recomendar os veículos mais adequados ESTRITAMENTE a partir do catálogo fornecido.

Regras:
- Recomende apenas veículos presentes no catálogo, referenciando o id exato.
- Atribua a cada recomendação um score de 0 a 100 indicando o quanto o veículo combina com o perfil.
- Leve em conta orçamento, uso principal, prioridades e preferências declaradas.
- Escreva a justificativa (reason) em português, de forma calorosa e personalizada, em 1 a 2 frases, explicando por que aquele veículo combina com este cliente.
- Selecione de 3 a 6 veículos, do mais ao menos recomendado. Se poucos se encaixam no perfil, recomende menos.
- Responda sempre por meio da ferramenta recommend_vehicles.`;

/** Serializa o catálogo de forma determinística (ordenado por id → cache estável). */
export function buildCatalogText(catalog: CatalogItem[]): string {
  const lines = catalog
    .slice()
    .sort((a, b) => a.id - b.id)
    .map(
      (c) =>
        `- id:${c.id} | ${c.marca} ${c.modelo} ${c.ano} | ${c.combustivel} | ${c.portas} portas | cor ${c.cor} | R$ ${c.valor.toLocaleString('pt-BR')}`,
    );
  return `Catálogo de veículos disponíveis (recomende somente estes id):\n${lines.join('\n')}`;
}

/** Descreve o perfil do cliente em linguagem natural (conteúdo volátil). */
export function buildProfileText(profile: UserProfile): string {
  const parts = [
    `Uso principal: ${profile.usage}`,
    `Orçamento: ${profile.budget}`,
    `Prioridades: ${profile.priorities.length ? profile.priorities.join(', ') : 'não informadas'}`,
  ];
  if (profile.fuelPreference) parts.push(`Combustível preferido: ${profile.fuelPreference}`);
  if (profile.passengers) parts.push(`Costuma transportar: ${profile.passengers}`);
  if (profile.notes) parts.push(`Observações: ${profile.notes}`);

  return `Perfil do cliente:\n${parts.join('\n')}\n\nAnalise o perfil e recomende os veículos mais adequados do catálogo, com score (0-100) e uma justificativa personalizada para cada um.`;
}
