-- Permitir varios registros de peso por día (historial real)

ALTER TABLE seguimiento_peso ADD INDEX idx_peso_user_id (user_id);
ALTER TABLE seguimiento_peso DROP INDEX uq_peso_user_fecha;
ALTER TABLE seguimiento_peso ADD INDEX idx_peso_user_fecha (user_id, registrado_en, created_at);

-- Backfill: usuarios sin historial reciben su peso actual como primer registro
INSERT INTO seguimiento_peso (user_id, peso, registrado_en, created_at)
SELECT u.id, u.peso, DATE(u.created_at), u.created_at
FROM usuarios u
WHERE NOT EXISTS (SELECT 1 FROM seguimiento_peso sp WHERE sp.user_id = u.id);
