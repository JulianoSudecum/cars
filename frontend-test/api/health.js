/* eslint-disable */
// ============================================================
// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE À MÃO.
// Fonte: functions/*.ts
// Gerador: scripts/build-vercel-api.mjs (rode `npm run build:functions`).
// ============================================================

// functions/health.ts
function handler(_req, res) {
  res.status(200).json({ status: "ok", ai: Boolean(process.env.ANTHROPIC_API_KEY?.trim()) });
}
export {
  handler as default
};
