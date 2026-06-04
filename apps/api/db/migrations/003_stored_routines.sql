-- Migración 003: funciones, procedimientos almacenados, reglas de recomendación y trigger
-- SupleFit — lógica de negocio ejecutada en MySQL (requisito académico)
-- Aplicar tras schema.sql: mysql ... suplefit < db/migrations/003_stored_routines.sql

-- ---------------------------------------------------------------------------
-- Limpieza idempotente
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_seguimiento_peso_after_insert;

DROP PROCEDURE IF EXISTS sp_estadisticas_admin;
DROP PROCEDURE IF EXISTS sp_confirmar_pedido;
DROP PROCEDURE IF EXISTS sp_eliminar_cuenta_usuario;
DROP PROCEDURE IF EXISTS sp_generar_recomendaciones;
DROP PROCEDURE IF EXISTS sp_crear_pedido;
DROP PROCEDURE IF EXISTS sp_resumen_seguimiento_7d;
DROP PROCEDURE IF EXISTS sp_guardar_habito_diario;
DROP PROCEDURE IF EXISTS sp_registrar_peso;
DROP PROCEDURE IF EXISTS sp_registrar_usuario;

DROP FUNCTION IF EXISTS fn_resumen_peso;
DROP FUNCTION IF EXISTS fn_usuario_es_admin;
DROP FUNCTION IF EXISTS fn_stock_suficiente;
DROP FUNCTION IF EXISTS fn_peso_inicial_usuario;
DROP FUNCTION IF EXISTS fn_delta_peso_reciente;
DROP FUNCTION IF EXISTS fn_clasificar_imc;
DROP FUNCTION IF EXISTS fn_calcular_imc;

DROP TABLE IF EXISTS reglas_objetivo_categoria;

-- ---------------------------------------------------------------------------
-- Tabla de reglas objetivo → categoría (recomendaciones 100 % en SQL)
-- ---------------------------------------------------------------------------
CREATE TABLE reglas_objetivo_categoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  objetivo VARCHAR(50) NOT NULL,
  categoria_slug VARCHAR(120) NOT NULL,
  prioridad INT NOT NULL DEFAULT 1,
  omitir_si_sedentario TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = no recomendar si nivel sedentario/baja/media',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_regla_objetivo_slug (objetivo, categoria_slug),
  INDEX idx_regla_objetivo (objetivo, prioridad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO reglas_objetivo_categoria (objetivo, categoria_slug, prioridad, omitir_si_sedentario) VALUES
  ('ganar_masa_muscular', 'creatina', 1, 0),
  ('ganar_masa_muscular', 'whey-protein', 2, 0),
  ('ganar_masa_muscular', 'mass-gainer', 3, 0),
  ('perder_grasa', 'l-carnitina', 1, 0),
  ('perder_grasa', 'proteina-aislada', 2, 0),
  ('perder_grasa', 'electrolitos', 3, 0),
  ('perder_grasa', 'soporte-nutricional', 4, 1),
  ('recomposicion_corporal', 'creatina', 1, 0),
  ('recomposicion_corporal', 'whey-protein', 2, 0),
  ('recomposicion_corporal', 'bcaa', 3, 0),
  ('resistencia', 'electrolitos', 1, 0),
  ('resistencia', 'bcaa', 2, 0),
  ('resistencia', 'pre-entrenos', 3, 1),
  ('definicion', 'l-carnitina', 1, 0),
  ('definicion', 'proteina-aislada', 2, 0),
  ('definicion', 'electrolitos', 3, 0),
  ('rendimiento', 'electrolitos', 1, 0),
  ('rendimiento', 'pre-entrenos', 2, 1),
  ('rendimiento', 'bcaa', 3, 0);

DELIMITER $$

-- ===========================================================================
-- FUNCIONES (solo lectura / cálculo)
-- ===========================================================================

-- IMC = peso / altura²; NULL si altura inválida
CREATE FUNCTION fn_calcular_imc(p_peso DECIMAL(6,2), p_altura DECIMAL(6,2))
RETURNS DECIMAL(6,1)
DETERMINISTIC
NO SQL
BEGIN
  IF p_altura IS NULL OR p_altura <= 0 OR p_peso IS NULL OR p_peso <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(p_peso / (p_altura * p_altura), 1);
END$$

-- Clasificación OMS simplificada
CREATE FUNCTION fn_clasificar_imc(p_imc DECIMAL(6,1))
RETURNS VARCHAR(40)
DETERMINISTIC
NO SQL
BEGIN
  IF p_imc IS NULL THEN RETURN NULL; END IF;
  IF p_imc < 18.5 THEN RETURN 'bajo_peso'; END IF;
  IF p_imc < 25 THEN RETURN 'normal'; END IF;
  IF p_imc < 30 THEN RETURN 'sobrepeso'; END IF;
  RETURN 'obesidad';
END$$

-- Diferencia entre los dos últimos registros de seguimiento_peso
CREATE FUNCTION fn_delta_peso_reciente(p_user_id INT)
RETURNS DECIMAL(6,1)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_actual DECIMAL(6,2);
  DECLARE v_anterior DECIMAL(6,2);
  SELECT peso INTO v_actual FROM seguimiento_peso
    WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1;
  SELECT peso INTO v_anterior FROM seguimiento_peso
    WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1 OFFSET 1;
  IF v_actual IS NULL OR v_anterior IS NULL THEN RETURN NULL; END IF;
  RETURN ROUND(v_actual - v_anterior, 1);
END$$

-- Primer peso registrado cronológicamente
CREATE FUNCTION fn_peso_inicial_usuario(p_user_id INT)
RETURNS DECIMAL(6,2)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_peso DECIMAL(6,2);
  SELECT peso INTO v_peso FROM seguimiento_peso
    WHERE user_id = p_user_id ORDER BY created_at ASC LIMIT 1;
  RETURN v_peso;
END$$

-- Valida existencia de producto y stock disponible
CREATE FUNCTION fn_stock_suficiente(p_supplement_id INT, p_cantidad INT)
RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_stock INT;
  SELECT stock INTO v_stock FROM suplementos WHERE id = p_supplement_id LIMIT 1;
  IF v_stock IS NULL THEN RETURN 0; END IF;
  IF v_stock >= p_cantidad AND p_cantidad > 0 THEN RETURN 1; END IF;
  RETURN 0;
END$$

CREATE FUNCTION fn_usuario_es_admin(p_user_id INT)
RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
  RETURN EXISTS (SELECT 1 FROM administradores WHERE user_id = p_user_id LIMIT 1);
END$$

-- JSON: peso actual (usuarios), inicial (historial) y delta reciente
CREATE FUNCTION fn_resumen_peso(p_user_id INT)
RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_actual DECIMAL(6,2);
  DECLARE v_inicial DECIMAL(6,2);
  DECLARE v_delta DECIMAL(6,1);
  SELECT peso INTO v_actual FROM usuarios WHERE id = p_user_id LIMIT 1;
  SET v_inicial = fn_peso_inicial_usuario(p_user_id);
  SET v_delta = fn_delta_peso_reciente(p_user_id);
  RETURN JSON_OBJECT(
    'pesoActual', v_actual,
    'pesoInicial', v_inicial,
    'deltaReciente', v_delta
  );
END$$

-- ===========================================================================
-- PROCEDIMIENTOS (escritura / transacciones)
-- ===========================================================================

-- Alta de usuario + primer registro de peso (hash de contraseña viene del API)
CREATE PROCEDURE sp_registrar_usuario(
  IN p_nombre VARCHAR(120),
  IN p_correo VARCHAR(190),
  IN p_password_hash VARCHAR(255),
  IN p_edad INT,
  IN p_peso DECIMAL(6,2),
  IN p_altura DECIMAL(6,2),
  IN p_sexo ENUM('M','F','Otro'),
  IN p_nivel_actividad VARCHAR(50),
  IN p_objetivo VARCHAR(50),
  IN p_politica_version VARCHAR(20),
  OUT p_user_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  INSERT INTO usuarios
    (nombre, correo, password_hash, edad, peso, altura, sexo, nivel_actividad, objetivo,
     consentimiento_datos, consentimiento_fecha, politica_version)
  VALUES
    (p_nombre, p_correo, p_password_hash, p_edad, p_peso, p_altura, p_sexo, p_nivel_actividad, p_objetivo,
     1, NOW(), p_politica_version);
  SET p_user_id = LAST_INSERT_ID();
  INSERT INTO seguimiento_peso (user_id, peso, registrado_en) VALUES (p_user_id, p_peso, CURDATE());
  COMMIT;
END$$

-- Historial de peso; usuarios.peso lo sincroniza el trigger trg_seguimiento_peso_after_insert
CREATE PROCEDURE sp_registrar_peso(
  IN p_user_id INT,
  IN p_peso DECIMAL(6,2),
  IN p_fecha DATE,
  OUT p_insert_id INT
)
BEGIN
  INSERT INTO seguimiento_peso (user_id, peso, registrado_en)
  VALUES (p_user_id, p_peso, p_fecha);
  SET p_insert_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_guardar_habito_diario(
  IN p_user_id INT,
  IN p_fecha DATE,
  IN p_entrenamiento TINYINT(1),
  IN p_descanso_horas DECIMAL(3,1),
  IN p_hidratacion_litros DECIMAL(4,2),
  IN p_notas VARCHAR(255)
)
BEGIN
  INSERT INTO habitos_diarios (user_id, fecha, entrenamiento, descanso_horas, hidratacion_litros, notas)
  VALUES (p_user_id, p_fecha, p_entrenamiento, p_descanso_horas, p_hidratacion_litros, p_notas)
  ON DUPLICATE KEY UPDATE
    entrenamiento = COALESCE(VALUES(entrenamiento), entrenamiento),
    descanso_horas = COALESCE(VALUES(descanso_horas), descanso_horas),
    hidratacion_litros = COALESCE(VALUES(hidratacion_litros), hidratacion_litros),
    notas = COALESCE(VALUES(notas), notas);
END$$

-- Agregados de los últimos 7 días para el dashboard
CREATE PROCEDURE sp_resumen_seguimiento_7d(
  IN p_user_id INT,
  OUT p_entrenos_semana INT,
  OUT p_hidratacion_promedio DECIMAL(6,2),
  OUT p_delta_peso DECIMAL(6,1)
)
BEGIN
  SELECT COUNT(*) INTO p_entrenos_semana
  FROM habitos_diarios
  WHERE user_id = p_user_id AND entrenamiento = 1 AND fecha >= (CURDATE() - INTERVAL 7 DAY);

  SELECT AVG(hidratacion_litros) INTO p_hidratacion_promedio
  FROM habitos_diarios
  WHERE user_id = p_user_id AND hidratacion_litros IS NOT NULL AND fecha >= (CURDATE() - INTERVAL 7 DAY);

  SET p_delta_peso = fn_delta_peso_reciente(p_user_id);
END$$

-- Crea pedido en estado pendiente; valida stock sin descontarlo (descuento en sp_confirmar_pedido)
-- p_items_json: [{"supplementId":1,"cantidad":2},...]
CREATE PROCEDURE sp_crear_pedido(
  IN p_user_id INT,
  IN p_items_json JSON,
  OUT p_pedido_id INT,
  OUT p_error VARCHAR(255)
)
proc: BEGIN
  DECLARE v_i INT DEFAULT 0;
  DECLARE v_n INT;
  DECLARE v_supp_id INT;
  DECLARE v_cant INT;
  DECLARE v_total DECIMAL(10,2) DEFAULT 0;
  DECLARE v_precio DECIMAL(10,2);
  DECLARE v_nombre VARCHAR(160);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_error = 'Error interno al crear el pedido';
    SET p_pedido_id = NULL;
  END;

  SET p_pedido_id = NULL;
  SET p_error = NULL;
  SET v_n = JSON_LENGTH(p_items_json);

  IF v_n IS NULL OR v_n < 1 THEN
    SET p_error = 'El pedido debe incluir al menos un producto';
    LEAVE proc;
  END IF;

  START TRANSACTION;

  WHILE v_i < v_n DO
    SET v_supp_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_i, '].supplementId'))) AS UNSIGNED);
    SET v_cant = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_i, '].cantidad'))) AS UNSIGNED);

    IF v_supp_id IS NULL OR v_cant IS NULL OR v_cant < 1 THEN
      ROLLBACK;
      SET p_error = 'Línea de pedido inválida';
      LEAVE proc;
    END IF;

    IF NOT fn_stock_suficiente(v_supp_id, v_cant) THEN
      SELECT nombre INTO v_nombre FROM suplementos WHERE id = v_supp_id LIMIT 1;
      ROLLBACK;
      SET p_error = CONCAT('Stock insuficiente para "', COALESCE(v_nombre, 'producto'), '"');
      LEAVE proc;
    END IF;

    SELECT precio INTO v_precio FROM suplementos WHERE id = v_supp_id LIMIT 1;
    SET v_total = v_total + (v_precio * v_cant);
    SET v_i = v_i + 1;
  END WHILE;

  INSERT INTO pedidos (user_id, estado, total) VALUES (p_user_id, 'pendiente', v_total);
  SET p_pedido_id = LAST_INSERT_ID();

  SET v_i = 0;
  WHILE v_i < v_n DO
    SET v_supp_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_i, '].supplementId'))) AS UNSIGNED);
    SET v_cant = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_i, '].cantidad'))) AS UNSIGNED);
    SELECT precio INTO v_precio FROM suplementos WHERE id = v_supp_id LIMIT 1;
    INSERT INTO pedido_items (pedido_id, supplement_id, cantidad, precio_unitario)
    VALUES (p_pedido_id, v_supp_id, v_cant, v_precio);
    SET v_i = v_i + 1;
  END WHILE;

  COMMIT;
END proc$$

-- Regenera recomendaciones del día según reglas_objetivo_categoria
CREATE PROCEDURE sp_generar_recomendaciones(IN p_user_id INT)
BEGIN
  DECLARE v_objetivo VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_nivel VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_sedentario TINYINT(1) DEFAULT 0;

  SELECT objetivo, nivel_actividad INTO v_objetivo, v_nivel
  FROM usuarios WHERE id = p_user_id LIMIT 1;

  IF v_objetivo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no encontrado';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM reglas_objetivo_categoria
    WHERE objetivo COLLATE utf8mb4_unicode_ci = v_objetivo LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Objetivo sin reglas configuradas';
  END IF;

  IF LOWER(v_nivel) IN ('sedentario', 'baja', 'media') THEN
    SET v_sedentario = 1;
  END IF;

  DELETE FROM recomendaciones
  WHERE user_id = p_user_id AND DATE(created_at) = CURDATE();

  INSERT INTO recomendaciones (user_id, supplement_id, objetivo)
  SELECT p_user_id, s.id, v_objetivo
  FROM suplementos s
  INNER JOIN categorias c ON c.id = s.categoria_id
  INNER JOIN reglas_objetivo_categoria r
    ON r.categoria_slug COLLATE utf8mb4_unicode_ci = c.slug
   AND r.objetivo COLLATE utf8mb4_unicode_ci = v_objetivo
  WHERE (r.omitir_si_sedentario = 0 OR v_sedentario = 0)
  ORDER BY r.prioridad ASC, s.stock DESC, s.precio ASC
  LIMIT 6;
END$$

-- Borrado ordenado de cuenta (equivalente a DELETE /api/users/profile)
CREATE PROCEDURE sp_eliminar_cuenta_usuario(IN p_user_id INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  DELETE pi FROM pedido_items pi
  INNER JOIN pedidos p ON p.id = pi.pedido_id
  WHERE p.user_id = p_user_id;
  DELETE FROM pedidos WHERE user_id = p_user_id;
  DELETE FROM recomendaciones WHERE user_id = p_user_id;
  DELETE FROM seguimiento_peso WHERE user_id = p_user_id;
  DELETE FROM habitos_diarios WHERE user_id = p_user_id;
  DELETE FROM administradores WHERE user_id = p_user_id;
  DELETE FROM usuarios WHERE id = p_user_id;
  COMMIT;
END$$

-- Confirma pedido pendiente y descuenta stock por línea
CREATE PROCEDURE sp_confirmar_pedido(
  IN p_pedido_id INT,
  OUT p_error VARCHAR(255)
)
proc: BEGIN
  DECLARE v_estado VARCHAR(20);
  DECLARE v_sin_stock INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_error = 'Error al confirmar el pedido';
  END;

  SET p_error = NULL;
  START TRANSACTION;

  SELECT estado INTO v_estado FROM pedidos WHERE id = p_pedido_id FOR UPDATE;

  IF v_estado IS NULL THEN
    ROLLBACK;
    SET p_error = 'Pedido no encontrado';
    LEAVE proc;
  END IF;

  IF v_estado <> 'pendiente' THEN
    ROLLBACK;
    SET p_error = CONCAT('El pedido no está pendiente (estado: ', v_estado, ')');
    LEAVE proc;
  END IF;

  SELECT COUNT(*) INTO v_sin_stock
  FROM pedido_items pi
  INNER JOIN suplementos s ON s.id = pi.supplement_id
  WHERE pi.pedido_id = p_pedido_id AND s.stock < pi.cantidad;

  IF v_sin_stock > 0 THEN
    ROLLBACK;
    SET p_error = 'Stock insuficiente para confirmar el pedido';
    LEAVE proc;
  END IF;

  UPDATE suplementos s
  INNER JOIN pedido_items pi ON pi.supplement_id = s.id
  SET s.stock = s.stock - pi.cantidad
  WHERE pi.pedido_id = p_pedido_id;

  UPDATE pedidos SET estado = 'confirmado' WHERE id = p_pedido_id;

  COMMIT;
END proc$$

-- Panel administrativo: contadores globales
CREATE PROCEDURE sp_estadisticas_admin(
  OUT p_total_usuarios INT,
  OUT p_total_pedidos INT,
  OUT p_total_suplementos INT,
  OUT p_pedidos_pendientes INT,
  OUT p_pedidos_confirmados INT,
  OUT p_stock_total INT
)
BEGIN
  SELECT COUNT(*) INTO p_total_usuarios FROM usuarios;
  SELECT COUNT(*) INTO p_total_pedidos FROM pedidos;
  SELECT COUNT(*) INTO p_total_suplementos FROM suplementos;
  SELECT COUNT(*) INTO p_pedidos_pendientes FROM pedidos WHERE estado = 'pendiente';
  SELECT COUNT(*) INTO p_pedidos_confirmados FROM pedidos WHERE estado = 'confirmado';
  SELECT COALESCE(SUM(stock), 0) INTO p_stock_total FROM suplementos;
END$$

-- ===========================================================================
-- TRIGGER: coherencia usuarios.peso tras cada INSERT en historial
-- ===========================================================================
CREATE TRIGGER trg_seguimiento_peso_after_insert
AFTER INSERT ON seguimiento_peso
FOR EACH ROW
BEGIN
  UPDATE usuarios SET peso = NEW.peso WHERE id = NEW.user_id;
END$$

DELIMITER ;
