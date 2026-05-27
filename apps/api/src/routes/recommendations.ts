import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import { query } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { generateAndFetchRecommendationsForUser } from "../lib/recommendations";

const router: Router = expressRouter();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const rows = await query<any>("SELECT objetivo FROM usuarios WHERE id = ? LIMIT 1", [userId]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const { items } = await generateAndFetchRecommendationsForUser(userId, user.objetivo);
  return res.json({ items });
});

router.get("/history", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const limit = Math.min(Number(req.query.limit ?? 10), 50);

  const history = await query<any>(
    `
      SELECT r.created_at, r.objetivo, s.*
      FROM recomendaciones r
      JOIN suplementos s ON s.id = r.supplement_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ?
    `,
    [userId, limit]
  );

  return res.json({ history });
});

export default router;

