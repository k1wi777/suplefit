import express from "express";
import supplementController from "./supplement.controller";
import { validate } from "../../middleware/validate.middleware";
import {
  GetSupplementParamsSchema,
  ListSupplementsQuerySchema,
} from "./supplement.dto";

const supplementRouter = express.Router();

supplementRouter.get(
  "/",
  validate(ListSupplementsQuerySchema, "query"),
  supplementController.list,
);
supplementRouter.get(
  "/:id",
  validate(GetSupplementParamsSchema, "params"),
  supplementController.getById,
);

export default supplementRouter;
