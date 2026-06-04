-- SupleFit (MySQL) - schema base para prototipo

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  edad INT NOT NULL,
  peso DECIMAL(6,2) NOT NULL,
  altura DECIMAL(6,2) NOT NULL,
  sexo ENUM('M','F','Otro') NOT NULL,
  nivel_actividad VARCHAR(50) NOT NULL,
  objetivo VARCHAR(50) NOT NULL,
  consentimiento_datos TINYINT(1) NOT NULL DEFAULT 0,
  consentimiento_fecha TIMESTAMP NULL,
  politica_version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS administradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suplementos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  descripcion TEXT NOT NULL,
  beneficios TEXT,
  modo_uso TEXT,
  advertencias TEXT,
  imagen_url TEXT,
  categoria_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_supplement_category
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recomendaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  supplement_id INT NOT NULL,
  objetivo VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rec_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rec_supp
    FOREIGN KEY (supplement_id) REFERENCES suplementos(id)
    ON DELETE CASCADE,
  INDEX idx_recs_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  estado ENUM('pendiente','confirmado','cancelado') NOT NULL DEFAULT 'pendiente',
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_pedidos_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  supplement_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_pedido_item_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pedido_item_supp
    FOREIGN KEY (supplement_id) REFERENCES suplementos(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seguimiento_peso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  peso DECIMAL(6,2) NOT NULL,
  registrado_en DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_peso_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_peso_user_fecha (user_id, registrado_en, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS habitos_diarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  fecha DATE NOT NULL,
  entrenamiento TINYINT(1) DEFAULT 0,
  descanso_horas DECIMAL(3,1) NULL,
  hidratacion_litros DECIMAL(4,2) NULL,
  notas VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_habito_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_habito_user_fecha (user_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

