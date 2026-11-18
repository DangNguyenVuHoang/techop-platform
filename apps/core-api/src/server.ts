import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { createLogger } from "./lib/logger.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

function startServer(): void {
  const config = loadEnv();
  const logger = createLogger(config);
  const app = createApp({ config, logger });

  const server = app.listen(config.port, () => {
    logger.info("core_api_started", {
      port: config.port,
      apiPrefix: config.apiPrefix,
      nodeEnv: config.nodeEnv,
    });
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    logger.error("core_api_startup_error", {
      code: err.code ?? "UNKNOWN",
      message: err.message,
      port: config.port,
    });
    process.exit(1);
  });

  let isShuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info("core_api_shutting_down", { signal });

    const forceTimer = setTimeout(() => {
      logger.error("core_api_shutdown_timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceTimer.unref();

    server.close((err) => {
      clearTimeout(forceTimer);
      if (err) {
        logger.error("core_api_shutdown_error", { message: err.message });
        process.exit(1);
      }
      logger.info("core_api_stopped");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
