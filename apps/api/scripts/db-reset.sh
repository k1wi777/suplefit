#!/usr/bin/env bash
# Resetea la BD suplefit: borra tablas, aplica schema.sql y ejecuta seed.
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
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-suplefit}"
DB_PASSWORD="${DB_PASSWORD:?Falta DB_PASSWORD en .env.local}"
DB_NAME="${DB_NAME:-suplefit}"

MYSQL=(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "-p${DB_PASSWORD}")

echo "→ Reseteando tablas en ${DB_NAME}..."
"${MYSQL[@]}" "$DB_NAME" < db/reset.sql

echo "→ Aplicando schema.sql..."
"${MYSQL[@]}" "$DB_NAME" < db/schema.sql

echo "→ Aplicando rutinas almacenadas (003_stored_routines.sql)..."
"${MYSQL[@]}" "$DB_NAME" < db/migrations/003_stored_routines.sql

echo "→ Unificando collation (004_collation_unicode.sql)..."
"${MYSQL[@]}" "$DB_NAME" < db/migrations/004_collation_unicode.sql

echo "→ Ejecutando seed (categorías, productos, admin)..."
npx ts-node -r dotenv/config src/seed.ts dotenv_config_path=.env.local 2>/dev/null \
  || npx ts-node src/seed.ts

echo "→ Verificando tablas..."
"${MYSQL[@]}" "$DB_NAME" -e "SHOW TABLES;"

echo "✓ Base de datos lista."
