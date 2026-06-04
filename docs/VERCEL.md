# Despliegue en Vercel (frontend)

El frontend vive en el monorepo en **`apps/web`** (Next.js). Vercel debe usar el repositorio completo y apuntar el **Root Directory** a esa carpeta.

## Archivos de configuración

| Archivo | Uso |
|---------|-----|
| `apps/web/vercel.json` | Instala dependencias desde la raíz del monorepo (`pnpm`) y construye Next.js |
| `apps/web/.env.example` | Variables de entorno de referencia |
| `apps/web/next.config.ts` | `outputFileTracingRoot` para trazado en monorepo |

## Pasos en Vercel

### 1. Importar proyecto

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importa el repo `k1wi777/suplefit` desde GitHub.
2. En **Configure Project**:

| Campo | Valor |
|-------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | (dejar vacío o usar el de `vercel.json`) |
| **Install Command** | (dejar vacío o usar el de `vercel.json`) |

3. Activa **Include source files outside of the Root Directory in the Build Step** (monorepo): en **Settings** → **General** → *Root Directory* suele aparecer la opción al editar el directorio raíz.

### 2. Variables de entorno

En **Settings** → **Environment Variables**:

| Variable | Ejemplo (producción) |
|----------|----------------------|
| `NEXT_PUBLIC_API_URL` | `https://tu-api.railway.app` (URL pública del API, **sin** `/api` al final) |

Copia los nombres desde `apps/web/.env.example`.

### 3. Despliegue

- Cada push a `main` que toque `apps/web` o dependencias del workspace puede disparar un deploy (según *Ignored Build Step* por defecto).
- Preview deployments en PRs si conectas GitHub.

### 4. Comprobar localmente antes

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Edita NEXT_PUBLIC_API_URL si el API no es localhost:4000
pnpm build:web
```

## Relación API + web

- **API**: Railway u otro host (`docs/RAILWAY.md`).
- **Web**: Vercel sirve el Next.js estático/SSR; todas las llamadas van a `NEXT_PUBLIC_API_URL`.

CORS en el API debe permitir el dominio `*.vercel.app` y tu dominio custom si lo añades.
