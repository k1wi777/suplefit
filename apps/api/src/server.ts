import { env } from "./lib/env";
import { seedDemoIfNeeded } from "./seed";
import { app } from "./app";

async function main() {
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
