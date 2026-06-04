# SupleFit (Prototipo funcional)

Aplicación web para **recomendaciones de suplementos deportivos personalizadas** según el perfil físico y el objetivo del usuario.

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js (React) + TailwindCSS |
| Backend | Express + TypeScript |
| Autenticación | JWT |
| Base de datos | MySQL |

---

## Guía rápida (local)

```bash
# 1) Clonar e instalar dependencias
git clone <URL_DEL_REPOSITORIO> suplefit
cd suplefit
pnpm install

# 2) Crear base de datos MySQL (ver sección "Base de datos")
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS suplefit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p suplefit < apps/api/db/schema.sql
mysql -u root -p suplefit < apps/api/db/migrations/003_stored_routines.sql

# 3) Variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edita apps/api/.env con tu usuario/contraseña de MySQL

# 4) Levantar backend (terminal 1)
pnpm dev:api

# 5) Levantar frontend (terminal 2)
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
| **MySQL** | 8.0+ (o MariaDB 10.6+ compatible) | Persistencia de usuarios, catálogo y recomendaciones |
| **Git** | Cualquier versión reciente | Clonar el repositorio |

Comprueba que todo esté instalado:

```bash
node -v    # debe mostrar v18.x o superior
pnpm -v
mysql --version
git --version
```

#### Instalar pnpm (si no lo tienes)

```bash
npm install -g pnpm
```

#### Instalar MySQL

- **Linux (Debian/Ubuntu):** `sudo apt install mysql-server`
- **Windows:** [MySQL Installer](https://dev.mysql.com/downloads/installer/)
- **macOS:** `brew install mysql` o MySQL desde el instalador oficial

Asegúrate de que el servicio esté activo:

```bash
# Linux (systemd)
sudo systemctl start mysql
sudo systemctl status mysql
```

Necesitarás un usuario con permisos sobre la base `suplefit` (puede ser `root` en desarrollo local).

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
│   ├── api/          # Backend Express + TypeScript
│   │   ├── db/       # schema.sql
│   │   └── src/
│   └── web/          # Frontend Next.js
├── package.json      # Scripts raíz (pnpm)
├── pnpm-workspace.yaml
└── README.md
```

---

### 3. Instalar dependencias (`pnpm install`)

Desde la **raíz** del proyecto:

```bash
pnpm install
```

Esto instala dependencias de `apps/api` y `apps/web` gracias al workspace de pnpm.

> **Alternativa con npm:** si prefieres npm, instala en cada app por separado:
> ```bash
> cd apps/api && npm install
> cd ../web && npm install
> ```

---

### 4. Base de datos MySQL

#### 4.1 Qué necesitas

- Servidor MySQL en ejecución (`localhost`, puerto por defecto **3306**).
- Usuario y contraseña con permiso para crear tablas e insertar datos.
- Base de datos llamada **`suplefit`** (o el nombre que definas en `.env`).

#### 4.2 Crear la base de datos

Entra al cliente MySQL:

```bash
mysql -u root -p
```

Ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS suplefit
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Opcional: usuario dedicado (recomendado fuera de desarrollo)
-- CREATE USER 'suplefit'@'localhost' IDENTIFIED BY 'tu_password_seguro';
-- GRANT ALL PRIVILEGES ON suplefit.* TO 'suplefit'@'localhost';
-- FLUSH PRIVILEGES;

EXIT;
```

#### 4.3 Crear tablas (esquema)

Desde la raíz del proyecto, **fuera** del cliente MySQL:

```bash
mysql -u root -p suplefit < apps/api/db/schema.sql
mysql -u root -p suplefit < apps/api/db/migrations/003_stored_routines.sql
```

Verifica que las tablas existan:

```bash
mysql -u root -p -e "USE suplefit; SHOW TABLES;"
```

Deberías ver: `usuarios`, `administradores`, `categorias`, `suplementos`, `recomendaciones`.

#### 4.4 Datos de prueba (seed automático)

Al iniciar el backend con `SEED_DEMO=1` (valor por defecto en `.env.example`), se cargan automáticamente:

- Categorías (creatina, whey, mass gainer, etc.)
- Suplementos de ejemplo
- Usuario administrador

No hace falta ejecutar un script manual; basta con levantar la API la primera vez.

Para forzar solo el seed (opcional):

```bash
pnpm seed
```

---

### 5. Configurar variables de entorno

#### 5.1 Backend — `apps/api/.env`

El backend usa **dotenv** y lee el archivo **`apps/api/.env`** (no `.env.local`).

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
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=suplefit

SEED_DEMO=1
ADMIN_EMAIL=admin@suplefit.com
ADMIN_PASSWORD=Admin12345
```

| Variable | Descripción |
|----------|-------------|
| `DB_*` | Conexión a MySQL |
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
| Error de conexión MySQL | Servicio apagado o credenciales incorrectas | Revisa `DB_*` y que MySQL esté activo |
| `ECONNREFUSED` en el frontend | API no levantada | Ejecuta `pnpm dev:api` antes de usar la web |
| CORS / fetch bloqueado | `CORS_ORIGIN` distinto al puerto del front | Debe ser `http://localhost:3000` |
| Catálogo vacío | Seed no corrió | Pon `SEED_DEMO=1` y reinicia la API |
| 404 en rutas `/api/api/...` | URL mal configurada | `NEXT_PUBLIC_API_URL` debe ser `http://localhost:4000` (sin `/api`) |

---

## Base de datos — referencia

### Tablas principales

**`usuarios`** — id, nombre, correo (unique), password_hash, edad, peso, altura, sexo, nivel_actividad, objetivo

**`administradores`** — id, user_id (unique) → `usuarios.id`

**`categorias`** — id, nombre, slug (unique)

**`suplementos`** — id, nombre, descripcion, beneficios, modo_uso, advertencias, imagen_url, categoria_id, precio, stock

**`recomendaciones`** — id, user_id, supplement_id, objetivo, created_at

### Relaciones

- 1 usuario → muchas recomendaciones  
- 1 categoría → muchos suplementos  
- 1 suplemento → muchas filas en historial de recomendaciones  

El esquema completo está en `apps/api/db/schema.sql`.

### Rutinas almacenadas (funciones y procedimientos)

La lógica crítica (pedidos, peso, recomendaciones, altas/bajas) se ejecuta en MySQL mediante **7 funciones**, **9 procedimientos** y un **trigger**. Tras el esquema, aplica:

```bash
mysql -u root -p suplefit < apps/api/db/migrations/003_stored_routines.sql
```

O usa el reset completo: `apps/api/scripts/db-reset.sh` (schema + rutinas + seed).

**Documentación académica detallada** (flujos, diagramas, ejemplos `CALL`/`SELECT`, verificación para defensa):

→ [`docs/BASE_DE_DATOS.md`](docs/BASE_DE_DATOS.md)

Endpoints nuevos ligados a rutinas: `GET /api/admin/stats`, `POST /api/admin/orders/:id/confirm` (confirma pedido y descuenta stock).

### Despliegue en Railway (API + MySQL)

Configuración automática: `apps/api/railway.toml`, migraciones en pre-deploy y guía paso a paso en **[`docs/RAILWAY.md`](docs/RAILWAY.md)**.

### Despliegue en Vercel (frontend Next.js)

El frontend está en `apps/web` dentro del monorepo (no es submódulo). En Vercel, **Root Directory** = `apps/web`. Guía: **[`docs/VERCEL.md`](docs/VERCEL.md)**.

---

## Lógica de negocio (resumen)

### Registro y login

- `POST /api/auth/register` — crea usuario con perfil físico y objetivo.  
- `POST /api/auth/login` — devuelve JWT; marca `isAdmin` si existe en `administradores`.  
- Header en rutas protegidas: `Authorization: Bearer <token>`.

### Recomendaciones (reglas, no IA real)

- `GET /api/recommendations` (protegido).  
- Lee el `objetivo` del usuario y mapea categorías en `apps/api/src/lib/recommendationRules.ts`.  
- Ejemplo: **ganar masa muscular** → creatina, whey protein, mass gainer.  
- Guarda historial en `recomendaciones` (evita duplicar el mismo día por usuario/objetivo).

### Catálogo

- `GET /api/supplements` — filtros: `categorySlug`, `search`, `minPrice`, `maxPrice`.  
- `GET /api/supplements/:id` — detalle.

### Panel administrador

- Requiere JWT de usuario en tabla `administradores`.  
- CRUD: `GET/POST/PUT/DELETE` bajo `/api/admin/supplements`.

---

## Scripts disponibles (raíz)

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instala dependencias de api + web |
| `pnpm dev:api` | Backend en desarrollo (puerto 4000) |
| `pnpm dev:web` | Frontend en desarrollo (puerto 3000) |
| `pnpm build:api` | Compila TypeScript del backend |
| `pnpm build:web` | Build de producción de Next.js |
| `pnpm start:api` | Backend compilado (`dist/`) |
| `pnpm start:web` | Next.js en modo producción |
| `pnpm seed` | Ejecuta seed manual (opcional) |

---

## Próximas mejoras

- Subida real de imágenes (multipart).  
- Endpoint público de categorías.  
- Docker Compose (MySQL + api + web) para un solo comando de arranque.
