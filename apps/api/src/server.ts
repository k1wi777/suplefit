import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import supplementsRouter from "./routes/supplements";
import recommendationsRouter from "./routes/recommendations";
import adminRouter from "./routes/admin";
import ordersRouter from "./routes/orders";
import trackingRouter from "./routes/tracking";
import { seedDemoIfNeeded } from "./seed";

async function main() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: false,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
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

  // Fallback 404
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  if (env.SEED_DEMO) {
    await seedDemoIfNeeded();
  }

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SupleFit API running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("API start error:", err);
  process.exit(1);
});

