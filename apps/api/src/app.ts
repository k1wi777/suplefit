import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/user/user.routes";
import supplementsRouter from "./modules/supplement/supplement.routes";
import recommendationsRouter from "./modules/recommendation/recommendation.routes";
import adminRouter from "./modules/admin/admin.routes";
import ordersRouter from "./modules/order/order.routes";
import trackingRouter from "./modules/tracking/tracking.routes";
import { notFoundHandler } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// API
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/supplements", supplementsRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/tracking", trackingRouter);

// SIEMPRE al final, en este orden exacto:
app.use(notFoundHandler); // 1. rutas que no existen
app.use(errorHandler); // 2. errores lanzados en cualquier ruta (4 parámetros = Express lo detecta como error handler)
