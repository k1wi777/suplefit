import { callProcedure, query, queryScalar } from "../../lib/db";
import type { AuthMeResult, AuthProfile, AuthUserRecord, AuthUserSummary, RegisterInput } from "./auth.interfaces";
import type { AuthRepository } from "./auth.repository";

export class MySqlAuthRepository implements AuthRepository {
  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const rows = await query<AuthUserRecord>(
      "SELECT id, nombre, correo, password_hash, objetivo FROM usuarios WHERE correo = ? LIMIT 1",
      [email],
    );

    return rows[0] ?? null;
  }

  async findByIdSummary(userId: number): Promise<AuthUserSummary | null> {
    const rows = await query<AuthUserSummary>(
      "SELECT id, nombre, correo, objetivo FROM usuarios WHERE id = ? LIMIT 1",
      [userId],
    );

    return rows[0] ?? null;
  }

  async createUser(
    input: RegisterInput & { passwordHash: string; version: string },
  ): Promise<number | null> {
    const { p_user_id: rawUserId } = await callProcedure(
      "sp_registrar_usuario",
      [
        input.nombre,
        input.correo,
        input.passwordHash,
        input.edad,
        input.peso,
        input.altura,
        input.sexo,
        input.nivelActividad,
        input.objetivo,
        input.version,
      ],
      ["p_user_id"],
    );

    const userId = Number(rawUserId);
    if (!Number.isFinite(userId)) {
      return null;
    }

    return userId;
  }

  async findProfile(userId: number): Promise<AuthProfile | null> {
    const rows = await query<AuthProfile>(
      "SELECT id, nombre, correo, edad, peso, altura, sexo, nivel_actividad, objetivo, created_at FROM usuarios WHERE id = ?",
      [userId],
    );

    return rows[0] ?? null;
  }

  async getImcData(userId: number): Promise<{ imc: number | null; clasificacionImc: string | null }> {
    const profile = await this.findProfile(userId);
    if (!profile) {
      return { imc: null, clasificacionImc: null };
    }

    const imc = await queryScalar<number | null>("SELECT fn_calcular_imc(?, ?) AS v", [profile.peso, profile.altura]);
    const clasificacionImc =
      imc != null ? await queryScalar<string | null>("SELECT fn_clasificar_imc(?) AS v", [imc]) : null;

    return { imc, clasificacionImc };
  }

  async getWeightSummary(userId: number): Promise<unknown> {
    const resumenPesoRaw = await queryScalar<unknown>("SELECT fn_resumen_peso(?) AS v", [userId]);
    if (typeof resumenPesoRaw === "string") {
      return JSON.parse(resumenPesoRaw);
    }
    return resumenPesoRaw ?? null;
  }

  async isAdmin(userId: number): Promise<boolean> {
    return Boolean(await queryScalar<number>("SELECT fn_usuario_es_admin(?) AS v", [userId]));
  }
}
