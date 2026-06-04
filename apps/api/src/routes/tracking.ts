import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import { z } from "zod";
import { callProcedure, query } from "../lib/db";
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

  const { p_insert_id: rawInsertId } = await callProcedure(
    "sp_registrar_peso",
    [userId, parsed.data.peso, fecha],
    ["p_insert_id"]
  );
  const insertId = Number(rawInsertId);

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

  await callProcedure("sp_guardar_habito_diario", [
    userId,
    fecha,
    d.entrenamiento ? 1 : 0,
    d.descansoHoras ?? null,
    d.hidratacionLitros ?? null,
    d.notas ?? null,
  ]);

  return res.json({ ok: true, fecha });
});

router.get("/resumen", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const out = await callProcedure(
    "sp_resumen_seguimiento_7d",
    [userId],
    ["p_entrenos_semana", "p_hidratacion_promedio", "p_delta_peso"]
  );

  return res.json({
    entrenosSemana: Number(out.p_entrenos_semana ?? 0),
    hidratacionPromedio:
      out.p_hidratacion_promedio != null ? Number(out.p_hidratacion_promedio) : null,
    deltaPesoSemanal: out.p_delta_peso != null ? Number(out.p_delta_peso) : null,
  });
});

export default router;
