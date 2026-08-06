import { z } from "zod";

// Validación de entrada HTTP (runtime) → tipos inferidos para el controller/service

// ---- Create Order ----
export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        supplementId: z.coerce.number().int().positive(),
        cantidad: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

// ---- Get Order (params) ----
export const GetOrderParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type GetOrderParamsDto = z.infer<typeof GetOrderParamsSchema>;
