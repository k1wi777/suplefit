import express from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate.middleware";
import trackingController from "./tracking.controller";
import { RegisterWeightSchema, SaveHabitSchema } from "./tracking.dto";

const trackingRouter = express.Router();

trackingRouter.get("/peso", requireAuth, trackingController.getWeightHistory);
trackingRouter.post(
  "/peso",
  requireAuth,
  validate(RegisterWeightSchema, "body"),
  trackingController.registerWeight,
);
trackingRouter.get("/habitos", requireAuth, trackingController.getHabits);
trackingRouter.post(
  "/habitos",
  requireAuth,
  validate(SaveHabitSchema, "body"),
  trackingController.saveHabit,
);
trackingRouter.get("/resumen", requireAuth, trackingController.getSummary);

export default trackingRouter;
