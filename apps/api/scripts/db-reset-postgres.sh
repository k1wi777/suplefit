#!/usr/bin/env bash
# Resetea la BD PostgreSQL suplefit: borra tablas, aplica schema y ejecuta seed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
elif [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:?Falta DB_PASSWORD en .env}"
DB_NAME="${DB_NAME:-suplefit}"

export PGPASSWORD="$DB_PASSWORD"
PSQL=(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -v ON_ERROR_STOP=1)

echo "→ Reseteando tablas en ${DB_NAME}..."
"${PSQL[@]}" -d "$DB_NAME" -f db/postgres/reset.sql

echo "→ Aplicando schema PostgreSQL..."
"${PSQL[@]}" -d "$DB_NAME" -f db/postgres/schema.sql

echo "→ Ejecutando seed (categorías, productos, admin)..."
npx ts-node -r dotenv/config src/seed.ts dotenv_config_path=.env.local 2>/dev/null \
  || npx ts-node src/seed.ts

echo "→ Verificando tablas..."
"${PSQL[@]}" -d "$DB_NAME" -c "\dt"

echo "✓ Base de datos PostgreSQL lista."
