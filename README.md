# SupleFit (Prototipo funcional)

Aplicación web para **recomendaciones de suplementos deportivos personalizadas** según el perfil físico y el objetivo del usuario.

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js (React) + TailwindCSS |
| Backend | Express + TypeScript |
| Autenticación | JWT |
| Base de datos | PostgreSQL |
| ORM | Drizzle ORM + driver `postgres` (`postgres-js`) |

---

## Guía rápida (local)

```bash
# 1) Clonar e instalar dependencias
git clone <URL_DEL_REPOSITORIO> suplefit
cd suplefit
pnpm install

# 2) Crear base de datos PostgreSQL (ver sección "Base de datos")
createdb -U postgres suplefit

# 3) Variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edita apps/api/.env con tu usuario/contraseña de PostgreSQL

# 4) Aplicar schema + datos de prueba
pnpm db:reset

# 5) Levantar backend (terminal 1)
pnpm dev:api

# 6) Levantar frontend (terminal 2)
pnpm dev:web
```

Abre **http://localhost:3000**

---

## Ejecución local (instructivo completo)

### 1. Requisitos previos

Instala en tu máquina:

| Herramienta | Versión recomendada | Para qué sirve |
|-------------|---------------------|----------------|
| **Node.js** | 18 LTS o superior (20+ recomendado) | Ejecutar frontend y backend |
| **pnpm** | 8+ | Gestor de paquetes del monorepo |
| **PostgreSQL** | 14+ (16+ recomendado) | Persistencia de usuarios, catálogo y recomendaciones |
| **Git** | Cualquier versión reciente | Clonar el repositorio |

Comprueba que todo esté instalado:

```bash
node -v    # debe mostrar v18.x o superior
pnpm -v
psql --version
git --version
```

#### Instalar pnpm (si no lo tienes)

```bash
npm install -g pnpm
```

#### Instalar PostgreSQL

- **Linux (Debian/Ubuntu):** `sudo apt install postgresql postgresql-client`
- **Windows:** [PostgreSQL Installer](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql@16`

Asegúrate de que el servicio esté activo:

```bash
# Linux (systemd)
sudo systemctl start postgresql
sudo systemctl status postgresql
```

En desarrollo local suele usarse el usuario `postgres`. Si conectas por TCP (`localhost`), necesitas asignarle contraseña:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu_password';"
```

---

### 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO> suplefit
cd suplefit
```

Estructura del proyecto:

```
suplefit/
├── apps/
│   ├── api/                    # Backend Express + TypeScript
│   │   ├── db/
│   │   │   ├── postgres/       # schema.sql, reset.sql (PostgreSQL)
│   │   │   └── migrations/     # legacy MySQL
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── db/schema.ts    # schema Drizzle
│   │       │   └── postgres.ts     # conexión ORM
│   │       └── modules/
│   └── web/                    # Frontend Next.js
├── package.json                # Scripts raíz (pnpm)
├── pnpm-workspace.yaml
└── README.md
```

Estructura de las features de la API:

```
src/modules/user/
  ├── user.routes.ts              # solo declara rutas
  ├── user.controller.ts          # maneja req/res, valida, llama al service
  ├── user.service.ts             # lógica de negocio
  ├── user.repository.ts          # acceso a datos (interfaz)
  ├── postgres-user.repository.ts # implementación PostgreSQL (activa)
  └── mysql-user.repository.ts    # implementación MySQL (legacy)
```

El controller elige qué implementación usar. Por defecto todos los módulos usan los repositorios `postgres-*`.

---

### Patrón de manejo de errores de la API

| Capa | Responsabilidad |
|------|-----------------|
| Controller | Validación → CommonErrors / asyncHandler; sin try/catch |
| Service | Lógica de negocio → *Errors del módulo |
| Repository | Datos / resultados, sin CustomError |
| errorHandler | Respuesta HTTP unificada |

---

### 3. Instalar dependencias (`pnpm install`)

Desde la **raíz** del proyecto:

```bash
pnpm install
```

Esto instala dependencias de `apps/api` y `apps/web` gracias al workspace de pnpm.

> Usa **pnpm**, no npm, para los scripts del monorepo (`pnpm db:reset`, `pnpm dev:api`, etc.).

---

### 4. Base de datos PostgreSQL

#### 4.1 Qué necesitas

- Servidor PostgreSQL en ejecución (`localhost`, puerto por defecto **5432**).
- Usuario y contraseña con permiso para crear tablas e insertar datos.
- Base de datos llamada **`suplefit`** (o el nombre que definas en `.env`).

#### 4.2 Crear la base de datos

```bash
createdb -U postgres suplefit
```

O desde `psql`:

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE suplefit;
\q
```

#### 4.3 Aplicar schema y seed (recomendado)

Desde la raíz del proyecto:

```bash
pnpm db:reset
```

Ese comando hace:

1. Borra tablas existentes (`db/postgres/reset.sql`)
2. Aplica el schema (`db/postgres/schema.sql`)
3. Ejecuta el seed (categorías, productos, admin)

**Solo schema** (sin borrar ni seedear):

```bash
cd apps/api
export PGPASSWORD="tu_password"
psql -h localhost -p 5432 -U postgres -d suplefit -v ON_ERROR_STOP=1 -f db/postgres/schema.sql
```

Verifica que las tablas existan:

```bash
psql -U postgres -d suplefit -c "\dt"
```

Deberías ver: `usuarios`, `administradores`, `categorias`, `suplementos`, `recomendaciones`, `pedidos`, `pedido_items`, `seguimiento_peso`, `habitos_diarios`, `reglas_objetivo_categoria`.

#### 4.4 Datos de prueba (seed)

Con `SEED_DEMO=1` en `.env`, el seed también corre al arrancar la API.

Para forzar solo el seed:

```bash
pnpm seed
```

#### 4.5 Drizzle (opcional)

El schema TypeScript está en `apps/api/src/lib/db/schema.ts`. Scripts útiles:

```bash
cd apps/api
pnpm db:generate   # generar migraciones desde el schema Drizzle
pnpm db:push       # sincronizar schema con la BD
pnpm db:studio     # UI visual de Drizzle
```

---

### 5. Configurar variables de entorno

#### 5.1 Backend — `apps/api/.env`

El backend usa **dotenv** y lee el archivo **`apps/api/.env`**.

```bash
cp apps/api/.env.example apps/api/.env
```

Edita `apps/api/.env`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=cambia-esto-por-un-secreto-largo
JWT_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_POSTGRES
DB_NAME=suplefit

# Opcional: URL completa (si no se define, se construye desde DB_*)
# DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/suplefit

SEED_DEMO=1
ADMIN_EMAIL=admin@suplefit.com
ADMIN_PASSWORD=Admin12345
```

| Variable | Descripción |
|----------|-------------|
| `DB_*` | Conexión a PostgreSQL |
| `DATABASE_URL` | URL completa (opcional; tiene prioridad si se define) |
| `DB_SSL` | `1` para conexiones SSL (Railway, Supabase, etc.) |
| `JWT_SECRET` | Clave para firmar tokens (cámbiala en producción) |
| `CORS_ORIGIN` | Origen permitido del frontend (`http://localhost:3000`) |
| `SEED_DEMO` | `1` = insertar categorías, productos y admin al arrancar |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del usuario administrador de prueba |

#### 5.2 Frontend — `apps/web/.env.local`

```bash
cp apps/web/.env.example apps/web/.env.local
```

Contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> Importante: la URL **no** debe terminar en `/api`. El cliente ya llama rutas como `/api/auth/login`.

---

### 6. Desplegar / ejecutar el backend (API)

Desde la raíz:

```bash
pnpm dev:api
```

O desde la carpeta del API:

```bash
cd apps/api
pnpm dev
```

Si todo está bien verás:

```text
SupleFit API running on http://localhost:4000
```

**Comprobar que responde:**

```bash
curl http://localhost:4000/health
# Respuesta esperada: {"ok":true}
```

**Modo producción (opcional):**

```bash
pnpm build:api
pnpm start:api
```

---

### 7. Desplegar / ejecutar el frontend (Web)

En **otra terminal**, desde la raíz:

```bash
pnpm dev:web
```

O:

```bash
cd apps/web
pnpm dev
```

Abre en el navegador: **http://localhost:3000**

**Modo producción (opcional):**

```bash
pnpm build:web
pnpm start:web
```

---

### 8. Probar el flujo en local

1. **Landing:** http://localhost:3000  
2. **Registro:** http://localhost:3000/register — completa datos físicos y objetivo.  
3. **Login:** http://localhost:3000/login  
4. **Dashboard:** recomendaciones según tu objetivo.  
5. **Catálogo:** http://localhost:3000/catalog  
6. **Admin:** http://localhost:3000/admin (solo con usuario admin)

**Credenciales admin por defecto** (si usas `.env.example` sin cambios):

| Campo | Valor |
|-------|--------|
| Correo | `admin@suplefit.com` |
| Contraseña | `Admin12345` |

---

### 9. Solución de problemas frecuentes

| Problema | Posible causa | Qué hacer |
|----------|---------------|-----------|
| `Missing env var: JWT_SECRET` | Falta `apps/api/.env` | Copia `.env.example` → `.env` y completa valores |
| `ERR_PNPM_IGNORED_BUILDS` | Build scripts bloqueados en pnpm | Revisa `pnpm-workspace.yaml` → `allowBuilds` con `true` |
| Error de autenticación PostgreSQL | Contraseña no asignada al usuario | `ALTER USER postgres PASSWORD '...'` y coincide con `DB_PASSWORD` |
| Conexión rechazada puerto 3306 | Variable `DB_PORT` de MySQL en el entorno | Usa `DB_PORT=5432` en `.env` o `unset DB_PORT` |
| `ECONNREFUSED` en el frontend | API no levantada | Ejecuta `pnpm dev:api` antes de usar la web |
| CORS / fetch bloqueado | `CORS_ORIGIN` distinto al puerto del front | Debe ser `http://localhost:3000` |
| Catálogo vacío | Seed no corrió | Ejecuta `pnpm db:reset` o pon `SEED_DEMO=1` y reinicia la API |
| 404 en rutas `/api/api/...` | URL mal configurada | `NEXT_PUBLIC_API_URL` debe ser `http://localhost:4000` (sin `/api`) |

---

## Base de datos — referencia

### Stack

- **PostgreSQL** como motor de base de datos.
- **Drizzle ORM** para acceso tipado desde TypeScript.
- **Driver `postgres`** (`postgres-js`) como cliente de conexión.
- La lógica de negocio (pedidos, recomendaciones, peso, etc.) vive en la capa de repositorios TypeScript con transacciones Drizzle.

### Tablas principales

**`usuarios`** — id, nombre, correo (unique), password_hash, edad, peso, altura, sexo, nivel_actividad, objetivo

**`administradores`** — id, user_id (unique) → `usuarios.id`

**`categorias`** — id, nombre, slug (unique)

**`suplementos`** — id, nombre, descripcion, beneficios, modo_uso, advertencias, imagen_url, categoria_id, precio, stock

**`recomendaciones`** — id, user_id, supplement_id, objetivo, created_at

**`pedidos`** / **`pedido_items`** — comercio y líneas de pedido

**`seguimiento_peso`** / **`habitos_diarios`** — tracking del usuario

**`reglas_objetivo_categoria`** — reglas de recomendación por objetivo

### Relaciones

- 1 usuario → muchas recomendaciones, pedidos y registros de seguimiento  
- 1 categoría → muchos suplementos  
- 1 suplemento → muchas filas en historial de recomendaciones  

El schema SQL está en `apps/api/db/postgres/schema.sql`.  
El schema Drizzle (fuente de verdad para el ORM) está en `apps/api/src/lib/db/schema.ts`.

### Implementación legacy MySQL

Los archivos en `apps/api/db/schema.sql`, `apps/api/db/migrations/` y los repositorios `mysql-*.repository.ts` se conservan por compatibilidad. Para volver a MySQL basta con cambiar la implementación en el controller de cada módulo.

### Despliegue en Railway (API + PostgreSQL)

Configuración automática: `apps/api/railway.toml` y guía paso a paso en **[`docs/RAILWAY.md`](docs/RAILWAY.md)**.  
> Nota: la guía de Railway puede referirse aún a MySQL; adapta las variables a PostgreSQL (`DATABASE_URL`, `DB_SSL=1`).

### Despliegue en Vercel (frontend Next.js)

El frontend está en `apps/web` dentro del monorepo. En Vercel, **Root Directory** = `apps/web`. Guía: **[`docs/VERCEL.md`](docs/VERCEL.md)**.

---

## Lógica de negocio (resumen)

### Registro y login

- `POST /api/auth/register` — crea usuario con perfil físico y objetivo.  
- `POST /api/auth/login` — devuelve JWT; marca `isAdmin` si existe en `administradores`.  
- Header en rutas protegidas: `Authorization: Bearer <token>`.

### Recomendaciones (reglas, no IA real)

- `GET /api/recommendations` (protegido).  
- Lee el `objetivo` del usuario y aplica reglas desde `reglas_objetivo_categoria`.  
- Ejemplo: **ganar masa muscular** → creatina, whey protein, mass gainer.  
- Guarda historial en `recomendaciones` (regenera las del día actual).

### Catálogo

- `GET /api/supplements` — filtros: `categorySlug`, `search`, `minPrice`, `maxPrice`.  
- `GET /api/supplements/:id` — detalle.

### Panel administrador

- Requiere JWT de usuario en tabla `administradores`.  
- CRUD: `GET/POST/PUT/DELETE` bajo `/api/admin/supplements`.  
- `GET /api/admin/stats` — estadísticas globales.  
- `POST /api/admin/orders/:id/confirm` — confirma pedido y descuenta stock.

---

## Scripts disponibles

### Raíz del monorepo

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instala dependencias de api + web |
| `pnpm dev:api` | Backend en desarrollo (puerto 4000) |
| `pnpm dev:web` | Frontend en desarrollo (puerto 3000) |
| `pnpm build:api` | Compila TypeScript del backend |
| `pnpm build:web` | Build de producción de Next.js |
| `pnpm start:api` | Backend compilado (`dist/`) |
| `pnpm start:web` | Next.js en modo producción |
| `pnpm seed` | Ejecuta seed manual |
| `pnpm db:reset` | Reset PostgreSQL + schema + seed |

### API (`apps/api`)

| Comando | Descripción |
|---------|-------------|
| `pnpm db:reset` | Reset completo PostgreSQL |
| `pnpm db:reset:mysql` | Reset MySQL (legacy) |
| `pnpm db:generate` | Generar migraciones Drizzle |
| `pnpm db:push` | Sincronizar schema Drizzle con la BD |
| `pnpm db:studio` | Abrir Drizzle Studio |

---

## Próximas mejoras

- Subida real de imágenes (multipart).  
- Endpoint público de categorías.  
- Docker Compose (PostgreSQL + api + web) para un solo comando de arranque.  
- Actualizar `docs/BASE_DE_DATOS.md` y `docs/RAILWAY.md` a PostgreSQL.
