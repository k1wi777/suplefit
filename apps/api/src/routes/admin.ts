import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import { z } from "zod";
import { callProcedure, query } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router: Router = expressRouter();

router.get("/stats", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const out = await callProcedure("sp_estadisticas_admin", [], [
    "p_total_usuarios",
    "p_total_pedidos",
    "p_total_suplementos",
    "p_pedidos_pendientes",
    "p_pedidos_confirmados",
    "p_stock_total",
  ]);
  return res.json({
    totalUsuarios: Number(out.p_total_usuarios ?? 0),
    totalPedidos: Number(out.p_total_pedidos ?? 0),
    totalSuplementos: Number(out.p_total_suplementos ?? 0),
    pedidosPendientes: Number(out.p_pedidos_pendientes ?? 0),
    pedidosConfirmados: Number(out.p_pedidos_confirmados ?? 0),
    stockTotal: Number(out.p_stock_total ?? 0),
  });
});

router.get("/orders", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const estado = typeof req.query.estado === "string" ? req.query.estado.trim() : "pendiente";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  let sql = `
    SELECT
      p.id,
      p.user_id AS userId,
      p.estado,
      p.total,
      p.created_at AS createdAt,
      u.nombre AS customerNombre,
      u.correo AS customerCorreo
    FROM pedidos p
    INNER JOIN usuarios u ON u.id = p.user_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (estado && estado !== "todos") {
    sql += " AND p.estado = ?";
    params.push(estado);
  }

  if (search) {
    sql += " AND (u.nombre LIKE ? OR u.correo LIKE ? OR CAST(p.id AS CHAR) LIKE ?)";
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  sql += " ORDER BY p.created_at DESC LIMIT 200";

  const orders = await query<any>(sql, params);
  return res.json({ orders });
});

router.post("/orders/:id/confirm", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  const out = await callProcedure("sp_confirmar_pedido", [id], ["p_error"]);
  if (out.p_error) {
    return res.status(400).json({ error: String(out.p_error) });
  }

  const order = await query<any>(
    `SELECT id, user_id, estado, total, created_at FROM pedidos WHERE id = ?`,
    [id]
  );
  return res.json({ ok: true, order: order[0] });
});

router.get("/categories", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const categories = await query<any>("SELECT id, nombre, slug FROM categorias ORDER BY nombre ASC");
  return res.json({ categories });
});

const SupplementUpsertSchema = z.object({
  nombre: z.string().min(2).max(160),
  descripcion: z.string().min(2),
  beneficios: z.string().min(2).optional().nullable(),
  modoUso: z.string().min(2).optional().nullable(),
  advertencias: z.string().min(2).optional().nullable(),
  imagenUrl: z.string().url().optional().nullable(),
  categoriaSlug: z.string().min(1).max(120),
  precio: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
});

router.get("/supplements", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { search } = req.query;
  let sql = `
    SELECT s.*, c.slug AS categoriaSlug, c.nombre AS categoriaNombre
    FROM suplementos s
    JOIN categorias c ON c.id = s.categoria_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (typeof search === "string" && search.trim()) {
    sql += " AND (s.nombre LIKE ? OR s.descripcion LIKE ?)";
    const q = `%${search.trim()}%`;
    params.push(q, q);
  }

  sql += " ORDER BY s.updated_at DESC";

  const items = await query<any>(sql, params);
  return res.json({ items });
});

router.post("/supplements", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const parsed = SupplementUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  const categories = await query<any>("SELECT id FROM categorias WHERE slug = ? LIMIT 1", [data.categoriaSlug]);
  const cat = categories[0];
  if (!cat) return res.status(400).json({ error: "Categoría inválida" });

  await query<any>(
    `
      INSERT INTO suplementos
        (nombre, descripcion, beneficios, modo_uso, advertencias, imagen_url, categoria_id, precio, stock)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.nombre,
      data.descripcion,
      data.beneficios ?? null,
      data.modoUso ?? null,
      data.advertencias ?? null,
      data.imagenUrl ?? null,
      cat.id,
      data.precio,
      data.stock,
    ]
  );

  return res.status(201).json({ ok: true });
});

router.put("/supplements/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  const parsed = SupplementUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  const categories = await query<any>("SELECT id FROM categorias WHERE slug = ? LIMIT 1", [data.categoriaSlug]);
  const cat = categories[0];
  if (!cat) return res.status(400).json({ error: "Categoría inválida" });

  await query<any>(
    `
      UPDATE suplementos
      SET
        nombre = ?,
        descripcion = ?,
        beneficios = ?,
        modo_uso = ?,
        advertencias = ?,
        imagen_url = ?,
        categoria_id = ?,
        precio = ?,
        stock = ?
      WHERE id = ?
    `,
    [
      data.nombre,
      data.descripcion,
      data.beneficios ?? null,
      data.modoUso ?? null,
      data.advertencias ?? null,
      data.imagenUrl ?? null,
      cat.id,
      data.precio,
      data.stock,
      id,
    ]
  );

  return res.json({ ok: true });
});

router.delete("/supplements/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  await query<any>("DELETE FROM suplementos WHERE id = ?", [id]);
  return res.json({ ok: true });
});

export default router;

