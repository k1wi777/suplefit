import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import { z } from "zod";
import { callProcedure, query } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router: Router = expressRouter();

const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        supplementId: z.coerce.number().int().positive(),
        cantidad: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1)
    .max(50),
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos de pedido inválidos", details: parsed.error.flatten() });
  }

  const userId = req.user!.userId;
  const itemsJson = JSON.stringify(parsed.data.items);

  const out = await callProcedure("sp_crear_pedido", [userId, itemsJson], ["p_pedido_id", "p_error"]);

  if (out.p_error) {
    return res.status(400).json({ error: String(out.p_error) });
  }

  const pedidoId = Number(out.p_pedido_id);
  if (!Number.isFinite(pedidoId)) {
    return res.status(500).json({ error: "No se pudo crear el pedido" });
  }

  const order = await query<any>(
    `SELECT id, user_id, estado, total, created_at FROM pedidos WHERE id = ?`,
    [pedidoId]
  );
  const orderItems = await query<any>(
    `
      SELECT pi.*, s.nombre AS supplementNombre
      FROM pedido_items pi
      JOIN suplementos s ON s.id = pi.supplement_id
      WHERE pi.pedido_id = ?
    `,
    [pedidoId]
  );

  return res.status(201).json({ order: order[0], items: orderItems });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orders = await query<any>(
    `SELECT id, estado, total, created_at FROM pedidos WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return res.json({ orders });
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  const orders = await query<any>(
    `SELECT id, user_id, estado, total, created_at FROM pedidos WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  const order = orders[0];
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

  const items = await query<any>(
    `
      SELECT pi.*, s.nombre AS supplementNombre, s.imagen_url AS supplementImagen
      FROM pedido_items pi
      JOIN suplementos s ON s.id = pi.supplement_id
      WHERE pi.pedido_id = ?
    `,
    [id]
  );

  return res.json({ order, items });
});

export default router;
