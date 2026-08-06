import { callProcedure, query } from "../../lib/db";
import type { TrackingRepository } from "./tracking.repository";
import type {
  HabitItem,
  RegisterWeightInput,
  SaveHabitInput,
  TrackingSummary,
  WeightHistoryItem,
} from "./tracking.interfaces";

export class MySqlTrackingRepository implements TrackingRepository {
  async listWeightHistory(userId: number): Promise<WeightHistoryItem[]> {
    return query<WeightHistoryItem>(
      `SELECT id, peso,
              DATE_FORMAT(registrado_en, '%Y-%m-%d') AS registradoEn,
              DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM seguimiento_peso
       WHERE user_id = ? ORDER BY created_at ASC LIMIT 60`,
      [userId],
    );
  }

  async registerWeight(userId: number, input: RegisterWeightInput): Promise<WeightHistoryItem | null> {
    const { p_insert_id: rawInsertId } = await callProcedure(
      "sp_registrar_peso",
      [userId, input.peso, input.registradoEn],
      ["p_insert_id"],
    );

    const insertId = Number(rawInsertId);
    const rows = await query<WeightHistoryItem>(
      `SELECT id, peso,
              DATE_FORMAT(registrado_en, '%Y-%m-%d') AS registradoEn,
              DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM seguimiento_peso WHERE id = ?`,
      [insertId],
    );

    return rows[0] ?? null;
  }

  async listHabits(userId: number): Promise<HabitItem[]> {
    return query<HabitItem>(
      `SELECT fecha, entrenamiento, descanso_horas AS descansoHoras,
              hidratacion_litros AS hidratacionLitros, notas
       FROM habitos_diarios WHERE user_id = ?
       AND fecha >= (CURDATE() - INTERVAL 14 DAY)
       ORDER BY fecha DESC`,
      [userId],
    );
  }

  async saveHabit(userId: number, input: SaveHabitInput): Promise<void> {
    await callProcedure("sp_guardar_habito_diario", [
      userId,
      input.fecha,
      input.entrenamiento ? 1 : 0,
      input.descansoHoras ?? null,
      input.hidratacionLitros ?? null,
      input.notas ?? null,
    ]);
  }

  async getSummary(userId: number): Promise<TrackingSummary> {
    const out = await callProcedure(
      "sp_resumen_seguimiento_7d",
      [userId],
      ["p_entrenos_semana", "p_hidratacion_promedio", "p_delta_peso"],
    );

    return {
      entrenosSemana: Number(out.p_entrenos_semana ?? 0),
      hidratacionPromedio:
        out.p_hidratacion_promedio != null ? Number(out.p_hidratacion_promedio) : null,
      deltaPesoSemanal: out.p_delta_peso != null ? Number(out.p_delta_peso) : null,
    };
  }
}
