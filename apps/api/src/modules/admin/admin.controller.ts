import type { Request, Response } from "express";
import { PostgresAdminRepository } from "./postgres-admin.repository";
import { AdminService } from "./admin.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type {
  ListAdminSupplementsQueryDto,
  ListOrdersQueryDto,
  OrderIdParamsDto,
  SupplementIdParamsDto,
  SupplementUpsertDto,
} from "./admin.dto";

const adminService = new AdminService(new PostgresAdminRepository());

class AdminController {
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getStats();
    return res.json(stats);
  });

  listOrders = asyncHandler(async (req: Request, res: Response) => {
    const query = getValidated<ListOrdersQueryDto>(req, "query");
    const orders = await adminService.listOrders(query.estado, query.search);
    return res.json({ orders });
  });

  confirmOrder = asyncHandler(async (req: Request, res: Response) => {
    const params = getValidated<OrderIdParamsDto>(req, "params");
    const result = await adminService.confirmOrder(params.id);
    return res.json(result);
  });

  listCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await adminService.listCategories();
    return res.json({ categories });
  });

  listSupplements = asyncHandler(async (req: Request, res: Response) => {
    const query = getValidated<ListAdminSupplementsQueryDto>(req, "query");
    const items = await adminService.listSupplements(query.search);
    return res.json({ items });
  });

  createSupplement = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<SupplementUpsertDto>(req, "body");
    const result = await adminService.createSupplement(dto);
    return res.status(201).json(result);
  });

  updateSupplement = asyncHandler(async (req: Request, res: Response) => {
    const params = getValidated<SupplementIdParamsDto>(req, "params");
    const dto = getValidated<SupplementUpsertDto>(req, "body");
    const result = await adminService.updateSupplement(params.id, dto);
    return res.json(result);
  });

  deleteSupplement = asyncHandler(async (req: Request, res: Response) => {
    const params = getValidated<SupplementIdParamsDto>(req, "params");
    const result = await adminService.deleteSupplement(params.id);
    return res.json(result);
  });
}

export default new AdminController();
