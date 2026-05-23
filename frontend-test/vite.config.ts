import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // Carrega o .env (todas as chaves, sem prefixo) para alinhar a porta do proxy
  // com a porta do BFF, mesmo quando PORT é definido apenas no .env.
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT ?? '3001';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Em desenvolvimento o front (Vite) e o BFF (Express) rodam separados;
      // o proxy encaminha /api para o servidor que detém a ANTHROPIC_API_KEY.
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.types.ts'],
      },
    },
  };
});
