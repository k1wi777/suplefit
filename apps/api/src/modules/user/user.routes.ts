// El router solo declara las rutas y delega a handlers (controllers)
import express from "express";
import UserController from "./user.controller";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate.middleware";
import { UpdateUserSchema } from "./user.dto";

const usersRouter = express.Router();

usersRouter.get("/profile", requireAuth, UserController.getProfile);
usersRouter.put(
  "/profile",
  requireAuth,
  validate(UpdateUserSchema, "body"),
  UserController.updateProfile,
);
usersRouter.delete("/profile", requireAuth, UserController.deleteProfile);

export default usersRouter;
