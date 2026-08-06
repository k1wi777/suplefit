import { z } from "zod";

// Validación de entrada HTTP (runtime) → tipos inferidos para el controller/service

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

// ---- List orders (query) ----
export const ListOrdersQuerySchema = z.object({
  estado: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).default("pendiente"),
  ),
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().default(""),
  ),
});

export type ListOrdersQueryDto = z.infer<typeof ListOrdersQuerySchema>;

// ---- List supplements (query) ----
export const ListAdminSupplementsQuerySchema = z.object({
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().default(""),
  ),
});

export type ListAdminSupplementsQueryDto = z.infer<
  typeof ListAdminSupplementsQuerySchema
>;

// ---- Resource ids (params) ----
export const OrderIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type OrderIdParamsDto = z.infer<typeof OrderIdParamsSchema>;

export const SupplementIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type SupplementIdParamsDto = z.infer<typeof SupplementIdParamsSchema>;

// ---- Create / update supplement (body) ----
export const SupplementUpsertSchema = z.object({
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

export type SupplementUpsertDto = z.infer<typeof SupplementUpsertSchema>;
