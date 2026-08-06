-- SupleFit (PostgreSQL) — schema base

CREATE TYPE sexo AS ENUM ('M', 'F', 'Otro');
CREATE TYPE pedido_estado AS ENUM ('pendiente', 'confirmado', 'cancelado');

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  edad INTEGER NOT NULL,
  peso NUMERIC(6,2) NOT NULL,
  altura NUMERIC(6,2) NOT NULL,
  sexo sexo NOT NULL,
  nivel_actividad TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  consentimiento_datos BOOLEAN NOT NULL DEFAULT FALSE,
  consentimiento_fecha TIMESTAMPTZ,
  politica_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suplementos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  beneficios TEXT,
  modo_uso TEXT,
  advertencias TEXT,
  imagen_url TEXT,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recomendaciones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  supplement_id INTEGER NOT NULL REFERENCES suplementos(id) ON DELETE CASCADE,
  objetivo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recs_user_created ON recomendaciones (user_id, created_at);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estado pedido_estado NOT NULL DEFAULT 'pendiente',
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos (user_id, created_at);

CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  supplement_id INTEGER NOT NULL REFERENCES suplementos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS seguimiento_peso (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  peso NUMERIC(6,2) NOT NULL,
  registrado_en DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peso_user_fecha ON seguimiento_peso (user_id, registrado_en, created_at);

CREATE TABLE IF NOT EXISTS habitos_diarios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  entrenamiento BOOLEAN DEFAULT FALSE,
  descanso_horas NUMERIC(3,1),
  hidratacion_litros NUMERIC(4,2),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, fecha)
);

CREATE TABLE IF NOT EXISTS reglas_objetivo_categoria (
  id SERIAL PRIMARY KEY,
  objetivo TEXT NOT NULL,
  categoria_slug TEXT NOT NULL,
  prioridad INTEGER NOT NULL DEFAULT 1,
  omitir_si_sedentario BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (objetivo, categoria_slug)
);

CREATE INDEX IF NOT EXISTS idx_regla_objetivo ON reglas_objetivo_categoria (objetivo, prioridad);

-- Reglas de recomendación (equivalente a migración MySQL 003)
INSERT INTO reglas_objetivo_categoria (objetivo, categoria_slug, prioridad, omitir_si_sedentario) VALUES
  ('ganar_masa_muscular', 'creatina', 1, FALSE),
  ('ganar_masa_muscular', 'whey-protein', 2, FALSE),
  ('ganar_masa_muscular', 'mass-gainer', 3, FALSE),
  ('perder_grasa', 'l-carnitina', 1, FALSE),
  ('perder_grasa', 'proteina-aislada', 2, FALSE),
  ('perder_grasa', 'electrolitos', 3, FALSE),
  ('perder_grasa', 'soporte-nutricional', 4, TRUE),
  ('recomposicion_corporal', 'creatina', 1, FALSE),
  ('recomposicion_corporal', 'whey-protein', 2, FALSE),
  ('recomposicion_corporal', 'bcaa', 3, FALSE),
  ('resistencia', 'electrolitos', 1, FALSE),
  ('resistencia', 'bcaa', 2, FALSE),
  ('resistencia', 'pre-entrenos', 3, TRUE),
  ('definicion', 'l-carnitina', 1, FALSE),
  ('definicion', 'proteina-aislada', 2, FALSE),
  ('definicion', 'electrolitos', 3, FALSE),
  ('rendimiento', 'electrolitos', 1, FALSE),
  ('rendimiento', 'pre-entrenos', 2, TRUE),
  ('rendimiento', 'bcaa', 3, FALSE)
ON CONFLICT (objetivo, categoria_slug) DO NOTHING;
