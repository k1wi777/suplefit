import type {
  RecommendationHistoryItem,
  RecommendedSupplement,
  RecommendationUserContext,
} from "./recommendation.interfaces";

export interface RecommendationRepository {
  findUserContext(userId: number): Promise<RecommendationUserContext | null>;
  generateForUser(userId: number): Promise<void>;
  findCurrentByObjective(
    userId: number,
    objetivo: string,
  ): Promise<RecommendedSupplement[]>;
  findHistory(userId: number, limit: number): Promise<RecommendationHistoryItem[]>;
}
