import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import { z } from "zod";
import { pool, query } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router: Router = expressRouter();

const PesoSchema = z.object({
  peso: z.coerce.number().min(20).max(300),
  registradoEn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const HabitoSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  entrenamiento: z.coerce.boolean().optional(),
  descansoHoras: z.coerce.number().min(0).max(24).optional(),
  hidratacionLitros: z.coerce.number().min(0).max(20).optional(),
  notas: z.string().max(255).optional(),
});

router.get("/peso", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const rows = await query<any>(
    `SELECT id, peso,
            DATE_FORMAT(registrado_en, '%Y-%m-%d') AS registradoEn,
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
     FROM seguimiento_peso
     WHERE user_id = ? ORDER BY created_at ASC LIMIT 60`,
    [userId]
  );
  return res.json({ historial: rows });
});

router.post("/peso", requireAuth, async (req: Request, res: Response) => {
  const parsed = PesoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.userId;
  const fecha = parsed.data.registradoEn ?? new Date().toISOString().slice(0, 10);

  const [insertResult] = await pool.query(
    `INSERT INTO seguimiento_peso (user_id, peso, registrado_en) VALUES (?, ?, ?)`,
    [userId, parsed.data.peso, fecha]
  );
  const insertId = (insertResult as { insertId: number }).insertId;

  await query(`UPDATE usuarios SET peso = ? WHERE id = ?`, [parsed.data.peso, userId]);

  const inserted = await query<any>(
    `SELECT id, peso,
            DATE_FORMAT(registrado_en, '%Y-%m-%d') AS registradoEn,
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
     FROM seguimiento_peso WHERE id = ?`,
    [insertId]
  );

  const row = inserted[0];
  return res.status(201).json({
    ok: true,
    id: row?.id,
    registradoEn: row?.registradoEn ?? fecha,
    createdAt: row?.createdAt,
    peso: parsed.data.peso,
  });
});

router.get("/habitos", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const rows = await query<any>(
    `SELECT fecha, entrenamiento, descanso_horas AS descansoHoras,
            hidratacion_litros AS hidratacionLitros, notas
     FROM habitos_diarios WHERE user_id = ?
     AND fecha >= (CURDATE() - INTERVAL 14 DAY)
     ORDER BY fecha DESC`,
    [userId]
  );
  return res.json({ habitos: rows });
});

router.post("/habitos", requireAuth, async (req: Request, res: Response) => {
  const parsed = HabitoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.userId;
  const fecha = parsed.data.fecha ?? new Date().toISOString().slice(0, 10);
  const d = parsed.data;

  await query(
    `INSERT INTO habitos_diarios (user_id, fecha, entrenamiento, descanso_horas, hidratacion_litros, notas)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       entrenamiento = COALESCE(VALUES(entrenamiento), entrenamiento),
       descanso_horas = COALESCE(VALUES(descanso_horas), descanso_horas),
       hidratacion_litros = COALESCE(VALUES(hidratacion_litros), hidratacion_litros),
       notas = COALESCE(VALUES(notas), notas)`,
    [
      userId,
      fecha,
      d.entrenamiento ? 1 : 0,
      d.descansoHoras ?? null,
      d.hidratacionLitros ?? null,
      d.notas ?? null,
    ]
  );

  return res.json({ ok: true, fecha });
});

router.get("/resumen", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const entrenos = await query<any>(
    `SELECT COUNT(*) AS total FROM habitos_diarios
     WHERE user_id = ? AND entrenamiento = 1 AND fecha >= (CURDATE() - INTERVAL 7 DAY)`,
    [userId]
  );

  const hidratacion = await query<any>(
    `SELECT AVG(hidratacion_litros) AS promedio FROM habitos_diarios
     WHERE user_id = ? AND hidratacion_litros IS NOT NULL AND fecha >= (CURDATE() - INTERVAL 7 DAY)`,
    [userId]
  );

  const pesoRows = await query<any>(
    `SELECT peso FROM seguimiento_peso
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 2`,
    [userId]
  );

  let deltaPeso: number | null = null;
  if (pesoRows.length >= 2) {
    deltaPeso =
      Math.round((Number(pesoRows[0].peso) - Number(pesoRows[1].peso)) * 10) / 10;
  }

  return res.json({
    entrenosSemana: Number(entrenos[0]?.total ?? 0),
    hidratacionPromedio: hidratacion[0]?.promedio != null ? Number(hidratacion[0].promedio) : null,
    deltaPesoSemanal: deltaPeso,
  });
});

export default router;
