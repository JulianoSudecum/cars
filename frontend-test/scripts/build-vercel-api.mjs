// Bundla as serverless functions do Vercel a partir de `functions/*.ts`.
//
// Necessário porque o projeto é ESM (`"type": "module"`) e o runtime do Vercel
// não resolve imports relativos sem extensão (ERR_MODULE_NOT_FOUND). O esbuild
// inlina toda a cadeia local (server/, src/) num único arquivo por function;
// as dependências de node_modules ficam externas (resolvidas por nome em runtime).
import { build } from 'esbuild';
import { rmSync, mkdirSync } from 'node:fs';

const functions = ['cars', 'profile-recommend', 'health'];

rmSync('api', { recursive: true, force: true });
mkdirSync('api', { recursive: true });

await build({
  entryPoints: functions.map((name) => `functions/${name}.ts`),
  outdir: 'api',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  banner: {
    js: '/* eslint-disable */\n// GERADO por scripts/build-vercel-api.mjs a partir de functions/. Nao edite.',
  },
  logLevel: 'info',
});

console.log(`OK: ${functions.length} serverless functions bundladas em api/.`);
