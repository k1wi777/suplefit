# Despliegue en Railway (API + MySQL)

Guía para desplegar el backend SupleFit desde el **mismo monorepo** (`apps/api` + base de datos MySQL como servicio Railway).

## Archivos de configuración

| Archivo | Uso |
|---------|-----|
| `apps/api/railway.toml` | Build, pre-deploy (migraciones), start, healthcheck |
| `apps/api/railway.json` | Mismo contenido (formato JSON, opcional) |
| `apps/api/nixpacks.toml` | Instala cliente `mysql` para migraciones SQL |
| `apps/api/scripts/railway-migrate.sh` | Aplica `schema.sql` + migraciones `003` y `004` |
| `apps/api/railway.env.example` | Variables a configurar en el panel |
| `railway.template.json` | Plantilla opcional (API + plugin MySQL) |

## Pasos en Railway

### 1. Proyecto y MySQL

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → repo `suplefit`.
2. **+ New** → **Database** → **MySQL**.
3. Espera estado **Active**.

### 2. Servicio API

1. **+ New** → **GitHub Repo** (mismo repositorio) o duplica el servicio del repo.
2. **Settings** del servicio API:

| Campo | Valor |
|-------|--------|
| **Root Directory** | `apps/api` |
| **Config file path** | `/apps/api/railway.toml` |

3. **Networking** → **Generate Domain** (URL pública del API).

### 3. Variables de entorno (API)

En el servicio API → **Variables** → **Add Reference** al servicio MySQL y mapea:

```
DB_HOST     → MYSQLHOST
DB_PORT     → MYSQLPORT
DB_USER     → MYSQLUSER
DB_PASSWORD → MYSQLPASSWORD
DB_NAME     → MYSQLDATABASE
```

Añade manualmente (ver `apps/api/railway.env.example`):

```
JWT_SECRET=<secreto largo>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-frontend.vercel.app
DB_SSL=1
SEED_DEMO=1
ADMIN_EMAIL=admin@suplefit.com
ADMIN_PASSWORD=<contraseña segura>
```

No fijes `PORT`: Railway lo inyecta automáticamente.

### 4. Despliegue automático

En cada deploy Railway ejecuta:

1. **Build:** `npm install && npm run build`
2. **Pre-deploy:** `sh scripts/railway-migrate.sh` (tablas + funciones/procedimientos)
3. **Start:** `node dist/server.js`
4. **Healthcheck:** `GET /health`

Si `SEED_DEMO=1`, al arrancar se cargan categorías, productos demo y usuario admin (solo si faltan).

### 5. Comprobar

```text
https://<tu-dominio-railway>.up.railway.app/health
→ {"ok":true}
```

Login admin:

```text
POST https://<dominio>/api/auth/login
{ "correo": "admin@suplefit.com", "password": "<ADMIN_PASSWORD>" }
```

## Frontend (Vercel)

Mismo repo, **Root Directory:** `apps/web`

```env
NEXT_PUBLIC_API_URL=https://<tu-dominio-railway>
```

Y en Railway API actualiza `CORS_ORIGIN` con la URL de Vercel.

## Plantilla rápida (opcional)

Si Railway soporta importar `railway.template.json` desde el repo, crea el proyecto con API + MySQL preenlazados. Si no, sigue los pasos manuales anteriores (mismo resultado).

## Troubleshooting

| Problema | Solución |
|----------|----------|
| API no arranca: `Missing env var` | Revisa `JWT_SECRET` y todas las `DB_*` |
| Error conexión MySQL | Activa `DB_SSL=1`; API y MySQL en el **mismo proyecto** |
| `Not found` en rutas nuevas | Redeploy tras `git push` (build debe incluir último código) |
| Migraciones fallan en pre-deploy | Logs → fase pre-deploy; comprueba que MySQL esté Active |
| Collation mix | Asegura que se ejecutó `004_collation_unicode.sql` |

## Local vs producción

| Entorno | Comando BD |
|---------|------------|
| Local reset completo | `pnpm db:reset` (borra datos) |
| Railway / CI | `pnpm --dir apps/api migrate:deploy` (idempotente, sin borrar) |
