/* eslint-disable */
// GERADO por scripts/build-vercel-api.mjs a partir de functions/. Nao edite.

// functions/health.ts
function handler(_req, res) {
  res.status(200).json({ status: "ok", ai: Boolean(process.env.ANTHROPIC_API_KEY?.trim()) });
}
export {
  handler as default
};
