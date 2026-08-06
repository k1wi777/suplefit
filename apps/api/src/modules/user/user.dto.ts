import { z } from "zod";

export const UpdateUserSchema = z.object({
  nombre: z.string().min(2).max(120).optional(),
  edad: z.coerce.number().int().min(10).max(120).optional(),
  peso: z.coerce.number().min(20).max(300).optional(),
  altura: z.coerce.number().min(0.8).max(2.5).optional(),
  sexo: z.enum(["M", "F", "Otro"]).optional(),
  nivelActividad: z.string().min(2).max(50).optional(),
  objetivo: z
    .enum([
      "ganar_masa_muscular",
      "perder_grasa",
      "recomposicion_corporal",
      "resistencia",
      "definicion",
      "rendimiento",
    ])
    .optional(),
  password: z.string().min(6).max(72).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
