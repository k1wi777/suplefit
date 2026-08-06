// shared/middlewares/not-found.ts
import type { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res
    .status(404)
    .json({ error: `Ruta ${req.method} ${req.originalUrl} no existe` });
}
