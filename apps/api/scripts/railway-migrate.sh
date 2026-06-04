#!/usr/bin/env sh
# Migraciones idempotentes para Railway (sin borrar datos).
# Requiere: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (+ DB_PORT opcional)
set -eu

if [ -z "${DB_HOST:-}" ] || [ -z "${DB_USER:-}" ] || [ -z "${DB_PASSWORD:-}" ] || [ -z "${DB_NAME:-}" ]; then
  echo "⚠ Variables DB_* incompletas; se omiten migraciones (revisa railway.env.example)."
  exit 0
fi

DB_PORT="${DB_PORT:-3306}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v mysql >/dev/null 2>&1; then
  echo "✗ Cliente mysql no encontrado. Añade nixpacks.toml con mariadb-client."
  exit 1
fi

MYSQL=(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "-p${DB_PASSWORD}" --default-character-set=utf8mb4)

echo "→ Conectando a ${DB_HOST}:${DB_PORT}/${DB_NAME} ..."
"${MYSQL[@]}" -e "SELECT 1" "$DB_NAME" >/dev/null

echo "→ Aplicando db/schema.sql"
"${MYSQL[@]}" "$DB_NAME" < db/schema.sql

echo "→ Aplicando db/migrations/003_stored_routines.sql"
"${MYSQL[@]}" "$DB_NAME" < db/migrations/003_stored_routines.sql

echo "→ Aplicando db/migrations/004_collation_unicode.sql"
"${MYSQL[@]}" "$DB_NAME" < db/migrations/004_collation_unicode.sql

echo "✓ Migraciones Railway completadas."
