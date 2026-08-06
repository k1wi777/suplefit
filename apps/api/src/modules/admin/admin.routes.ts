import express from "express";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate.middleware";
import adminController from "./admin.controller";
import {
  ListAdminSupplementsQuerySchema,
  ListOrdersQuerySchema,
  OrderIdParamsSchema,
  SupplementIdParamsSchema,
  SupplementUpsertSchema,
} from "./admin.dto";

const adminRouter = express.Router();

adminRouter.get("/stats", requireAuth, requireAdmin, adminController.getStats);

adminRouter.get(
  "/orders",
  requireAuth,
  requireAdmin,
  validate(ListOrdersQuerySchema, "query"),
  adminController.listOrders,
);
adminRouter.post(
  "/orders/:id/confirm",
  requireAuth,
  requireAdmin,
  validate(OrderIdParamsSchema, "params"),
  adminController.confirmOrder,
);

adminRouter.get(
  "/categories",
  requireAuth,
  requireAdmin,
  adminController.listCategories,
);

adminRouter.get(
  "/supplements",
  requireAuth,
  requireAdmin,
  validate(ListAdminSupplementsQuerySchema, "query"),
  adminController.listSupplements,
);
adminRouter.post(
  "/supplements",
  requireAuth,
  requireAdmin,
  validate(SupplementUpsertSchema, "body"),
  adminController.createSupplement,
);
adminRouter.put(
  "/supplements/:id",
  requireAuth,
  requireAdmin,
  validate(SupplementIdParamsSchema, "params"),
  validate(SupplementUpsertSchema, "body"),
  adminController.updateSupplement,
);
adminRouter.delete(
  "/supplements/:id",
  requireAuth,
  requireAdmin,
  validate(SupplementIdParamsSchema, "params"),
  adminController.deleteSupplement,
);

export default adminRouter;
