import type { AdminRepository } from "./admin.repository";
import type { SupplementUpsertDto } from "./admin.dto";
import { AdminErrors } from "./admin.errors";

export class AdminService {
  constructor(private adminRepo: AdminRepository) {}

  async getStats() {
    return this.adminRepo.getStats();
  }

  async listOrders(estado: string, search: string) {
    return this.adminRepo.listOrders({ estado, search });
  }

  async confirmOrder(orderId: number) {
    const error = await this.adminRepo.confirmOrder(orderId);
    if (error) {
      throw AdminErrors.confirmOrderFailed(error);
    }

    return { ok: true };
  }

  async listCategories() {
    return this.adminRepo.listCategories();
  }

  async listSupplements(search: string) {
    return this.adminRepo.listSupplements(search);
  }

  async createSupplement(input: SupplementUpsertDto) {
    const result = await this.adminRepo.createSupplement(input);
    if (result && "error" in result) {
      throw AdminErrors.invalidCategory();
    }

    return { ok: true };
  }

  async updateSupplement(id: number, input: SupplementUpsertDto) {
    const result = await this.adminRepo.updateSupplement(id, input);
    if (result && "error" in result) {
      throw AdminErrors.invalidCategory();
    }

    return { ok: true };
  }

  async deleteSupplement(id: number) {
    await this.adminRepo.deleteSupplement(id);
    return { ok: true };
  }
}
