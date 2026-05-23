#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-cars}"

echo "Aguardando o banco de dados em ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
  sleep 1
done
echo "Banco disponível."

echo "Aplicando migrations..."
alembic upgrade head

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Populando dados (seed)..."
  python -m scripts.seed
fi

echo "Iniciando a API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
