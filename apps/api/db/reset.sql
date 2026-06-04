-- Reset completo de SupleFit (borra rutinas, datos y tablas)
SET FOREIGN_KEY_CHECKS = 0;

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
DROP TABLE IF EXISTS pedido_items;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS seguimiento_peso;
DROP TABLE IF EXISTS habitos_diarios;
DROP TABLE IF EXISTS recomendaciones;
DROP TABLE IF EXISTS administradores;
DROP TABLE IF EXISTS suplementos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;
