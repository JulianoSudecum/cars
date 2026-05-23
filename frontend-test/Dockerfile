# ── Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Apenas dependências de produção (inclui tsx, que executa o BFF em TS).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Artefatos necessários em runtime: build estático, BFF e domínio compartilhado.
COPY --from=build /app/dist ./dist
COPY server ./server
COPY src/domain ./src/domain
COPY tsconfig.json ./

EXPOSE 3001
CMD ["npm", "start"]
