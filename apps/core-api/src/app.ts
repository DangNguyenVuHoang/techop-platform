import cors from "cors";
import express, { type Express } from "express";
import * as helmetModule from "helmet";
import type { AppConfig } from "./config/env.js";
import type { DatabaseClient } from "./lib/db.js";
import type { Logger } from "./lib/logger.js";
import { createErrorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { createRequestLoggerMiddleware } from "./middleware/request-logger.js";
import { createApiRouter } from "./routes/index.js";
import { AppError } from "./utils/errors.js";

export interface CreateAppOptions {
  config: AppConfig;
  logger: Logger;
  db?: DatabaseClient | null;
  /**
   * Optional hook for registering test-only routes before 404/error middleware.
   */
  registerTestRoutes?: (app: Express) => void;
}

/**
 * Build the Express 5 Core API application without binding a network port.
 */
export function createApp({
  config,
  logger,
  db = null,
  registerTestRoutes,
}: CreateAppOptions): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(helmetModule.default());

  const allowedOrigins = new Set(config.corsAllowedOrigins);
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser / same-origin requests with no Origin header
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new AppError(403, "CORS_ORIGIN_FORBIDDEN", "Origin không được phép truy cập."));
      },
      credentials: false,
    }),
  );

  app.use(express.json({ limit: config.jsonBodyLimit }));
  app.use(createRequestLoggerMiddleware(logger));

  app.use(createApiRouter(config, db));

  if (registerTestRoutes) {
    registerTestRoutes(app);
  }

  app.use(notFoundHandler);
  app.use(createErrorHandler(config, logger));

  return app;
}
