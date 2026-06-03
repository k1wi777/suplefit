-- Migración incremental para bases existentes

-- Ejecutar solo si las columnas no existen (ignorar error duplicate column si ya aplicado)
ALTER TABLE usuarios ADD COLUMN consentimiento_datos TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN consentimiento_fecha TIMESTAMP NULL;
ALTER TABLE usuarios ADD COLUMN politica_version VARCHAR(20) DEFAULT '1.0';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS seguimiento_peso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  peso DECIMAL(6,2) NOT NULL,
  registrado_en DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_peso_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_peso_user_fecha (user_id, registrado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

UPDATE categorias SET nombre = 'Soporte nutricional', slug = 'soporte-nutricional' WHERE slug = 'quemadores';
UPDATE suplementos SET nombre = 'Complemento de soporte nutricional' WHERE nombre = 'Quemador de Grasa';
