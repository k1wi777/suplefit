// shared/utils/get-validated.ts
import type { Request } from "express";
import { CommonErrors } from "../errors/common.errors";

export function getValidated<T>(
  req: Request,
  target: "body" | "params" | "query" = "body",
): T {
  const value = req.validated?.[target];
  if (value === undefined) {
    throw CommonErrors.validation(
      `getValidated(): no hay datos validados en req.validated.${target}. ¿Olvidaste el middleware validate()?`,
    );
  }
  
  return value as T;
}
