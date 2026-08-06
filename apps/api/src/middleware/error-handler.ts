// shared/middlewares/error-handler.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { CustomError } from "../shared/errors/custom-error";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof CustomError) {
    if (!err.isOperational) {
      console.error(`[UNEXPECTED CustomError] code=${err.code}`, err);
    }
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res
      .status(422)
      .json({ error: "Datos inválidos", details: err.flatten() });
  }

  console.error("[UNHANDLED ERROR]", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
