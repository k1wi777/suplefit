import express from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate.middleware";
import recommendationController from "./recommendation.controller";
import { GetHistoryQuerySchema } from "./recommendation.dto";

const recommendationRouter = express.Router();

recommendationRouter.get("/", requireAuth, recommendationController.getCurrent);
recommendationRouter.get(
  "/history",
  requireAuth,
  validate(GetHistoryQuerySchema, "query"),
  recommendationController.getHistory,
);

export default recommendationRouter;
