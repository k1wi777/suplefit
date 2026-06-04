import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { callProcedure, query, queryScalar } from "../lib/db";
import { signAccessToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

const router: Router = expressRouter();

const RegisterSchema = z.object({
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

router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { nombre, correo, password, edad, peso, altura, sexo, nivelActividad, objetivo, politicaVersion } =
    parsed.data;
  const version = politicaVersion ?? "1.0";

  const existing = await query<{ id: number }>("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [correo]);
  if (existing.length) return res.status(409).json({ error: "Correo ya registrado" });

  const password_hash = await bcrypt.hash(password, 10);

  const { p_user_id: rawUserId } = await callProcedure(
    "sp_registrar_usuario",
    [
      nombre,
      correo,
      password_hash,
      edad,
      peso,
      altura,
      sexo,
      nivelActividad,
      objetivo,
      version,
    ],
    ["p_user_id"]
  );
  const userId = Number(rawUserId);
  const user = await query<any>(
    "SELECT id, nombre, correo, objetivo FROM usuarios WHERE id = ? LIMIT 1",
    [userId]
  );

  return res.status(201).json({ user: user[0] });
});

const LoginSchema = z.object({
  correo: z.string().email().max(190),
  password: z.string().min(1).max(72),
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { correo, password } = parsed.data;

  const users = await query<{ id: number; nombre: string; correo: string; password_hash: string; objetivo: string }>(
    "SELECT id, nombre, correo, password_hash, objetivo FROM usuarios WHERE correo = ? LIMIT 1",
    [correo]
  );
  const user = users[0];
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const isAdmin = Boolean(await queryScalar<number>("SELECT fn_usuario_es_admin(?) AS v", [user.id]));

  const token = signAccessToken({ userId: user.id, isAdmin });

  return res.status(200).json({
    token,
    user: { id: user.id, nombre: user.nombre, correo: user.correo, objetivo: user.objetivo, isAdmin },
  });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const users = await query<any>(
    "SELECT id, nombre, correo, edad, peso, altura, sexo, nivel_actividad, objetivo, created_at FROM usuarios WHERE id = ?",
    [userId]
  );
  const user = users[0];
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const imc = await queryScalar<number | null>(
    "SELECT fn_calcular_imc(?, ?) AS v",
    [user.peso, user.altura]
  );
  const clasificacionImc =
    imc != null ? await queryScalar<string | null>("SELECT fn_clasificar_imc(?) AS v", [imc]) : null;
  const resumenPesoRaw = await queryScalar<unknown>("SELECT fn_resumen_peso(?) AS v", [userId]);
  const resumenPeso =
    typeof resumenPesoRaw === "string"
      ? JSON.parse(resumenPesoRaw)
      : resumenPesoRaw ?? null;

  return res.json({
    user: { ...user, imc, clasificacionImc },
    resumenPeso,
    isAdmin: req.user!.isAdmin,
  });
});

export default router;

