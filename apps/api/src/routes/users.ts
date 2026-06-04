import type { Request, Response, Router } from "express";
import { Router as expressRouter } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { callProcedure, query, queryScalar } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router: Router = expressRouter();

const ProfileUpdateSchema = z.object({
  nombre: z.string().min(2).max(120).optional(),
  edad: z.coerce.number().int().min(10).max(120).optional(),
  peso: z.coerce.number().min(20).max(300).optional(),
  altura: z.coerce.number().min(0.8).max(2.5).optional(),
  sexo: z.enum(["M", "F", "Otro"]).optional(),
  nivelActividad: z.string().min(2).max(50).optional(),
  objetivo: z
    .enum(["ganar_masa_muscular", "perder_grasa", "recomposicion_corporal", "resistencia", "definicion", "rendimiento"])
    .optional(),
  password: z.string().min(6).max(72).optional(),
});

router.get("/profile", requireAuth, async (req: Request, res: Response) => {
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

  return res.json({ user: { ...user, imc, clasificacionImc }, isAdmin: req.user!.isAdmin });
});

router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  const parsed = ProfileUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.userId;

  const updates: Record<string, any> = {};
  const data = parsed.data;

  if (data.nombre !== undefined) updates["nombre"] = data.nombre;
  if (data.edad !== undefined) updates["edad"] = data.edad;
  if (data.peso !== undefined) updates["peso"] = data.peso;
  if (data.altura !== undefined) updates["altura"] = data.altura;
  if (data.sexo !== undefined) updates["sexo"] = data.sexo;
  if (data.nivelActividad !== undefined) updates["nivel_actividad"] = data.nivelActividad;
  if (data.objetivo !== undefined) updates["objetivo"] = data.objetivo;

  let password_hash: string | null = null;
  if (data.password !== undefined) password_hash = await bcrypt.hash(data.password, 10);

  if (password_hash) updates["password_hash"] = password_hash;

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "Nada para actualizar" });

  const entries = Object.entries(updates);
  const setSql = entries.map(([k]) => `${k} = ?`).join(", ");
  const params = entries.map(([, v]) => v);

  await query(`UPDATE usuarios SET ${setSql} WHERE id = ?`, [...params, userId]);

  const updated = await query<any>(
    "SELECT id, nombre, correo, edad, peso, altura, sexo, nivel_actividad, objetivo, created_at FROM usuarios WHERE id = ?",
    [userId]
  );

  return res.json({ user: updated[0] });
});

router.delete("/profile", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await callProcedure("sp_eliminar_cuenta_usuario", [userId]);
  return res.json({ ok: true });
});

export default router;

