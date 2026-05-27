/**
 * Conserta um defeito real do endpoint `cars_by_brand.json`: falta vírgula
 * entre um valor e a próxima propriedade, ex.:
 *
 *   "num_portas": 4
 *   "cor": "BRANCA",
 */
export function repairJson(text: string): string {
  return text.replace(
    /(:\s*(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null))(\s*\r?\n\s*")/g,
    '$1,$2',
  );
}

export function parseJsonLenient<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (originalError) {
    try {
      return JSON.parse(repairJson(text)) as T;
    } catch {
      // Propaga a causa raiz (ex.: HTML de erro, corpo vazio) em vez do erro
      // sobre o texto já modificado.
      throw originalError;
    }
  }
}
