/**
 * Conserta um defeito real do endpoint `cars_by_brand.json`: falta a vírgula
 * entre um valor e a próxima propriedade, ex.:
 *
 *   "num_portas": 4
 *   "cor": "BRANCA",
 *
 * A regex localiza um valor (string, número, boolean ou null) logo após `:`
 * seguido de quebra de linha e de uma nova chave `"..."`, e insere a vírgula
 * faltante. Casos já válidos não são tocados.
 */
export function repairJson(text: string): string {
  return text.replace(
    /(:\s*(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null))(\s*\r?\n\s*")/g,
    '$1,$2',
  );
}

/**
 * Faz JSON.parse tolerante: tenta o parse normal e, se falhar, aplica o reparo
 * e tenta de novo. Se ainda assim falhar, o erro é propagado para tratamento
 * na camada de dados.
 */
export function parseJsonLenient<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (originalError) {
    try {
      return JSON.parse(repairJson(text)) as T;
    } catch {
      // Se o reparo também falha, propaga a causa raiz (ex.: HTML de erro,
      // corpo vazio) em vez do erro sobre o texto já modificado.
      throw originalError;
    }
  }
}
