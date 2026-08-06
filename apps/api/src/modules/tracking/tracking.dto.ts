import { z } from "zod";

// Validación de entrada HTTP (runtime) → tipos inferidos para el controller/service

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)");

// ---- Register weight (body) ----
export const RegisterWeightSchema = z.object({
  peso: z.coerce.number().min(20).max(300),
  registradoEn: isoDateSchema.optional(),
});

export type RegisterWeightDto = z.infer<typeof RegisterWeightSchema>;

// ---- Save habit (body) ----
export const SaveHabitSchema = z.object({
  fecha: isoDateSchema.optional(),
  entrenamiento: z.coerce.boolean().optional(),
  descansoHoras: z.coerce.number().min(0).max(24).optional(),
  hidratacionLitros: z.coerce.number().min(0).max(20).optional(),
  notas: z.string().max(255).optional(),
});

export type SaveHabitDto = z.infer<typeof SaveHabitSchema>;
