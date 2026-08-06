import express from "express";
import { requireAuth } from "../../middleware/auth";
import authController from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { LoginSchema, RegisterSchema } from "./auth.dto";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validate(RegisterSchema, "body"),
  authController.register,
);
authRouter.post("/login", validate(LoginSchema, "body"), authController.login);
authRouter.get("/me", requireAuth, authController.me);

export default authRouter;
