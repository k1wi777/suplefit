import type {
  AdminCategory,
  AdminOrderListItem,
  AdminStats,
  AdminSupplement,
  AdminSupplementInput,
} from "./admin.interfaces";

export interface AdminRepository {
  getStats(): Promise<AdminStats>;
  listOrders(filters: { estado: string; search: string }): Promise<AdminOrderListItem[]>;
  confirmOrder(orderId: number): Promise<string | null>;
  listCategories(): Promise<AdminCategory[]>;
  listSupplements(search: string): Promise<AdminSupplement[]>;
  createSupplement(input: AdminSupplementInput): Promise<void | { error: string }>;
  updateSupplement(id: number, input: AdminSupplementInput): Promise<void | { error: string }>;
  deleteSupplement(id: number): Promise<void>;
}
