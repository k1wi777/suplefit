-- Reset completo de SupleFit (borra todos los datos y tablas)
SET FOREIGN_KEY_CHECKS = 0;

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
