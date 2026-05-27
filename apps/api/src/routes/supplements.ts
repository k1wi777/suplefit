import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import { query } from "../lib/db";

const router: Router = expressRouter();

router.get("/", async (req: Request, res: Response) => {
  const { categorySlug, search, minPrice, maxPrice } = req.query;

  let sql = `
    SELECT s.*, c.nombre AS categoriaNombre, c.slug AS categoriaSlug
    FROM suplementos s
    JOIN categorias c ON c.id = s.categoria_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (typeof categorySlug === "string" && categorySlug.trim()) {
    sql += " AND c.slug = ?";
    params.push(categorySlug.trim());
  }

  if (typeof search === "string" && search.trim()) {
    sql += " AND (s.nombre LIKE ? OR s.descripcion LIKE ? OR s.beneficios LIKE ?)";
    const q = `%${search.trim()}%`;
    params.push(q, q, q);
  }

  if (typeof minPrice === "string" && minPrice.trim()) {
    sql += " AND s.precio >= ?";
    params.push(Number(minPrice));
  }

  if (typeof maxPrice === "string" && maxPrice.trim()) {
    sql += " AND s.precio <= ?";
    params.push(Number(maxPrice));
  }

  sql += " ORDER BY s.updated_at DESC";

  const items = await query<any>(sql, params);
  return res.json({ items });
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  const rows = await query<any>(
    `
      SELECT s.*, c.nombre AS categoriaNombre, c.slug AS categoriaSlug
      FROM suplementos s
      JOIN categorias c ON c.id = s.categoria_id
      WHERE s.id = ?
    `,
    [id]
  );

  const item = rows[0];
  if (!item) return res.status(404).json({ error: "Suplemento no encontrado" });
  return res.json({ item });
});

export default router;

