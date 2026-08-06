import type { SupplementFilters } from "./supplement.interfaces";
import type { SupplementRepository } from "./supplement.repository";
import { SupplementErrors } from "./supplement.errors";

export class SupplementService {
  constructor(private supplementRepo: SupplementRepository) {}

  async listSupplements(filters: SupplementFilters) {
    const items = await this.supplementRepo.findMany(filters);
    return { items };
  }

  async getSupplementById(id: number) {
    const item = await this.supplementRepo.findById(id);
    if (!item) {
      throw SupplementErrors.notFound();
    }

    return { item };
  }
}
