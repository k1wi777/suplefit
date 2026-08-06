import { eq } from "drizzle-orm";
import { db } from "../../lib/postgres";
import { administradores, seguimientoPeso, usuarios } from "../../lib/db/schema";
import { calcularImc, clasificarImc } from "../../shared/domain/imc";
import { getResumenPeso } from "../../shared/domain/weight";
import type { AuthProfile, AuthUserRecord, AuthUserSummary, RegisterInput } from "./auth.interfaces";
import type { AuthRepository } from "./auth.repository";

export class PostgresAuthRepository implements AuthRepository {
  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const [row] = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        correo: usuarios.correo,
        password_hash: usuarios.passwordHash,
        objetivo: usuarios.objetivo,
      })
      .from(usuarios)
      .where(eq(usuarios.correo, email))
      .limit(1);

    return row ?? null;
  }

  async findByIdSummary(userId: number): Promise<AuthUserSummary | null> {
    const [row] = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        correo: usuarios.correo,
        objetivo: usuarios.objetivo,
      })
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    return row ?? null;
  }

  async createUser(
    input: RegisterInput & { passwordHash: string; version: string },
  ): Promise<number | null> {
    try {
      const userId = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(usuarios)
          .values({
            nombre: input.nombre,
            correo: input.correo,
            passwordHash: input.passwordHash,
            edad: input.edad,
            peso: input.peso.toFixed(2),
            altura: input.altura.toFixed(2),
            sexo: input.sexo,
            nivelActividad: input.nivelActividad,
            objetivo: input.objetivo,
            consentimientoDatos: true,
            consentimientoFecha: new Date(),
            politicaVersion: input.version,
          })
          .returning({ id: usuarios.id });

        if (!created) return null;

        const today = new Date().toISOString().slice(0, 10);
        await tx.insert(seguimientoPeso).values({
          userId: created.id,
          peso: input.peso.toFixed(2),
          registradoEn: today,
        });

        return created.id;
      });

      return userId;
    } catch {
      return null;
    }
  }

  async findProfile(userId: number): Promise<AuthProfile | null> {
    const [row] = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        correo: usuarios.correo,
        edad: usuarios.edad,
        peso: usuarios.peso,
        altura: usuarios.altura,
        sexo: usuarios.sexo,
        nivel_actividad: usuarios.nivelActividad,
        objetivo: usuarios.objetivo,
        created_at: usuarios.createdAt,
      })
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    if (!row) return null;

    return {
      ...row,
      peso: Number(row.peso),
      altura: Number(row.altura),
      created_at: row.created_at.toISOString(),
    };
  }

  async getImcData(userId: number): Promise<{ imc: number | null; clasificacionImc: string | null }> {
    const profile = await this.findProfile(userId);
    if (!profile) {
      return { imc: null, clasificacionImc: null };
    }

    const imc = calcularImc(profile.peso, profile.altura);
    const clasificacionImc = clasificarImc(imc);
    return { imc, clasificacionImc };
  }

  async getWeightSummary(userId: number): Promise<unknown> {
    return getResumenPeso(db, userId);
  }

  async isAdmin(userId: number): Promise<boolean> {
    const [row] = await db
      .select({ id: administradores.id })
      .from(administradores)
      .where(eq(administradores.userId, userId))
      .limit(1);

    return Boolean(row);
  }
}
