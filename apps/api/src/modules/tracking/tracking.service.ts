import type { RegisterWeightInput, SaveHabitInput } from "./tracking.interfaces";
import type { TrackingRepository } from "./tracking.repository";
import { TrackingErrors } from "./tracking.errors";

export class TrackingService {
  constructor(private trackingRepo: TrackingRepository) {}

  listWeightHistory(userId: number) {
    return this.trackingRepo.listWeightHistory(userId);
  }

  async registerWeight(userId: number, input: RegisterWeightInput) {
    const item = await this.trackingRepo.registerWeight(userId, input);
    if (!item) {
      throw TrackingErrors.weightRegisterFailed();
    }

    return {
      ok: true,
      id: item.id,
      registradoEn: item.registradoEn,
      createdAt: item.createdAt,
      peso: input.peso,
    };
  }

  listHabits(userId: number) {
    return this.trackingRepo.listHabits(userId);
  }

  async saveHabit(userId: number, input: SaveHabitInput) {
    await this.trackingRepo.saveHabit(userId, input);
    return { ok: true, fecha: input.fecha };
  }

  getSummary(userId: number) {
    return this.trackingRepo.getSummary(userId);
  }
}
