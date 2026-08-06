import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../../lib/postgres";
import { habitosDiarios, seguimientoPeso } from "../../lib/db/schema";
import { getDeltaPesoReciente, syncUserWeight } from "../../shared/domain/weight";
import type { TrackingRepository } from "./tracking.repository";
import type {
  HabitItem,
  RegisterWeightInput,
  SaveHabitInput,
  TrackingSummary,
  WeightHistoryItem,
} from "./tracking.interfaces";

function formatDate(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function formatDateTime(d: Date): string {
  return d.toISOString().slice(0, 19);
}

export class PostgresTrackingRepository implements TrackingRepository {
  async listWeightHistory(userId: number): Promise<WeightHistoryItem[]> {
    const rows = await db
      .select({
        id: seguimientoPeso.id,
        peso: seguimientoPeso.peso,
        registradoEn: seguimientoPeso.registradoEn,
        createdAt: seguimientoPeso.createdAt,
      })
      .from(seguimientoPeso)
      .where(eq(seguimientoPeso.userId, userId))
      .orderBy(asc(seguimientoPeso.createdAt))
      .limit(60);

    return rows.map((row) => ({
      id: row.id,
      peso: Number(row.peso),
      registradoEn: formatDate(row.registradoEn),
      createdAt: formatDateTime(row.createdAt),
    }));
  }

  async registerWeight(userId: number, input: RegisterWeightInput): Promise<WeightHistoryItem | null> {
    const [inserted] = await db
      .insert(seguimientoPeso)
      .values({
        userId,
        peso: input.peso.toFixed(2),
        registradoEn: input.registradoEn,
      })
      .returning({
        id: seguimientoPeso.id,
        peso: seguimientoPeso.peso,
        registradoEn: seguimientoPeso.registradoEn,
        createdAt: seguimientoPeso.createdAt,
      });

    if (!inserted) return null;

    await syncUserWeight(db, userId, input.peso);

    return {
      id: inserted.id,
      peso: Number(inserted.peso),
      registradoEn: formatDate(inserted.registradoEn),
      createdAt: formatDateTime(inserted.createdAt),
    };
  }

  async listHabits(userId: number): Promise<HabitItem[]> {
    const rows = await db
      .select({
        fecha: habitosDiarios.fecha,
        entrenamiento: habitosDiarios.entrenamiento,
        descansoHoras: habitosDiarios.descansoHoras,
        hidratacionLitros: habitosDiarios.hidratacionLitros,
        notas: habitosDiarios.notas,
      })
      .from(habitosDiarios)
      .where(
        and(
          eq(habitosDiarios.userId, userId),
          gte(habitosDiarios.fecha, sql`current_date - interval '14 days'`),
        ),
      )
      .orderBy(desc(habitosDiarios.fecha));

    return rows.map((row) => ({
      fecha: formatDate(row.fecha),
      entrenamiento: Boolean(row.entrenamiento),
      descansoHoras: row.descansoHoras != null ? Number(row.descansoHoras) : null,
      hidratacionLitros: row.hidratacionLitros != null ? Number(row.hidratacionLitros) : null,
      notas: row.notas,
    }));
  }

  async saveHabit(userId: number, input: SaveHabitInput): Promise<void> {
    await db
      .insert(habitosDiarios)
      .values({
        userId,
        fecha: input.fecha,
        entrenamiento: input.entrenamiento ?? false,
        descansoHoras: input.descansoHoras?.toFixed(1) ?? null,
        hidratacionLitros: input.hidratacionLitros?.toFixed(2) ?? null,
        notas: input.notas ?? null,
      })
      .onConflictDoUpdate({
        target: [habitosDiarios.userId, habitosDiarios.fecha],
        set: {
          entrenamiento: sql`coalesce(excluded.entrenamiento, ${habitosDiarios.entrenamiento})`,
          descansoHoras: sql`coalesce(excluded.descanso_horas, ${habitosDiarios.descansoHoras})`,
          hidratacionLitros: sql`coalesce(excluded.hidratacion_litros, ${habitosDiarios.hidratacionLitros})`,
          notas: sql`coalesce(excluded.notas, ${habitosDiarios.notas})`,
          updatedAt: new Date(),
        },
      });
  }

  async getSummary(userId: number): Promise<TrackingSummary> {
    const [entrenos] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(habitosDiarios)
      .where(
        and(
          eq(habitosDiarios.userId, userId),
          eq(habitosDiarios.entrenamiento, true),
          gte(habitosDiarios.fecha, sql`current_date - interval '7 days'`),
        ),
      );

    const [hidratacion] = await db
      .select({ avg: sql<number | null>`avg(${habitosDiarios.hidratacionLitros})` })
      .from(habitosDiarios)
      .where(
        and(
          eq(habitosDiarios.userId, userId),
          sql`${habitosDiarios.hidratacionLitros} IS NOT NULL`,
          gte(habitosDiarios.fecha, sql`current_date - interval '7 days'`),
        ),
      );

    const deltaPeso = await getDeltaPesoReciente(db, userId);

    return {
      entrenosSemana: entrenos?.count ?? 0,
      hidratacionPromedio: hidratacion?.avg != null ? Number(hidratacion.avg) : null,
      deltaPesoSemanal: deltaPeso,
    };
  }
}
