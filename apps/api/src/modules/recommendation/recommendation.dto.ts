import { z } from "zod";

// Validación de entrada HTTP (runtime) → tipos inferidos para el controller/service

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

// ---- History (query) — limit opcional con default 10 ----
export const GetHistoryQuerySchema = z.object({
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(50).default(10),
  ),
});

export type GetHistoryQueryDto = z.infer<typeof GetHistoryQuerySchema>;
