import { Router } from "express";
import type { AppConfig } from "../config/env.js";
import type { DatabaseClient } from "../lib/db.js";
import { createV1Router } from "./v1.js";

/**
 * Mount versioned API routers using the configured API prefix (default: /api/v1).
 */
export function createApiRouter(config: AppConfig, db: DatabaseClient | null = null): Router {
  const router = Router();
  router.use(config.apiPrefix, createV1Router(config, db));
  return router;
}
