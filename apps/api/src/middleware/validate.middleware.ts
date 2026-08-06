// shared/middlewares/validate.middleware.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { CommonErrors } from "../shared/errors/common.errors";

type ValidationTarget = "body" | "params" | "query" ;

export function validate<T extends ZodType>(schema: T, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
      return next(CommonErrors.validation(parsed.error.flatten()));
    }

    // Nunca reasignamos req[target] directamente:
    // - req.query es un getter puro en Express 5, falla en runtime
    // - req.body/req.params sí son asignables, pero mantenemos el mismo patrón
    //   para los tres por consistencia, y para conservar el dato original
    req.validated ??= {};
    req.validated[target] = parsed.data;
    next();
  };
}