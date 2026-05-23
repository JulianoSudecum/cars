#!/usr/bin/env bash
set -euo pipefail

# Espera o banco via DATABASE_URL (portável entre docker-compose e Render).
echo "Aguardando o banco de dados..."
python -m scripts.wait_for_db

echo "Aplicando migrations..."
alembic upgrade head

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Populando dados (seed)..."
  python -m scripts.seed
fi

# Render injeta PORT; localmente cai no 8000.
echo "Iniciando a API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
