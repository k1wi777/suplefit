import { z } from "zod";

// Validación de entrada HTTP (runtime) → tipos inferidos para el controller/service

export const RegisterSchema = z.object({
  nombre: z.string().min(2).max(120),
  correo: z.string().email().max(190),
  password: z.string().min(6).max(72),
  edad: z.coerce.number().int().min(10).max(120),
  peso: z.coerce.number().min(20).max(300),
  altura: z.coerce.number().min(0.8).max(2.5),
  sexo: z.enum(["M", "F", "Otro"]),
  nivelActividad: z.string().min(2).max(50),
  objetivo: z.enum([
    "ganar_masa_muscular",
    "perder_grasa",
    "recomposicion_corporal",
    "resistencia",
    "definicion",
    "rendimiento",
  ]),
  consentimientoDatos: z.literal(true),
  politicaVersion: z.string().max(20).optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  correo: z.string().email().max(190),
  password: z.string().min(1).max(72),
});

export type LoginDto = z.infer<typeof LoginSchema>;
