import { z } from "zod";

// Validación de entrada HTTP (runtime) → tipos inferidos para el controller/service

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

// ---- List supplements (query) ----
export const ListSupplementsQuerySchema = z.object({
  categorySlug: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).optional(),
  ),
  maxPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).optional(),
  ),
});

export type ListSupplementsQueryDto = z.infer<typeof ListSupplementsQuerySchema>;

// ---- Get supplement (params) ----
export const GetSupplementParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type GetSupplementParamsDto = z.infer<typeof GetSupplementParamsSchema>;
