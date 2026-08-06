import type { Supplement, SupplementFilters } from "./supplement.interfaces";

export interface SupplementRepository {
  findMany(filters: SupplementFilters): Promise<Supplement[]>;
  findById(id: number): Promise<Supplement | null>;
}
