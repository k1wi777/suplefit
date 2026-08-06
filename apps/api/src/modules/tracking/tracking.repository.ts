import type {
  HabitItem,
  RegisterWeightInput,
  SaveHabitInput,
  TrackingSummary,
  WeightHistoryItem,
} from "./tracking.interfaces";

export interface TrackingRepository {
  listWeightHistory(userId: number): Promise<WeightHistoryItem[]>;
  registerWeight(userId: number, input: RegisterWeightInput): Promise<WeightHistoryItem | null>;
  listHabits(userId: number): Promise<HabitItem[]>;
  saveHabit(userId: number, input: SaveHabitInput): Promise<void>;
  getSummary(userId: number): Promise<TrackingSummary>;
}
