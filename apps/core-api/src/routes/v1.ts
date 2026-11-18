import { Router } from "express";
import type { AppConfig } from "../config/env.js";
import type { DatabaseClient } from "../lib/db.js";
import { createSystemRouter } from "../modules/system/index.js";

/**
 * Mount all v1 module routers under /api/v1.
 */
export function createV1Router(config: AppConfig, db: DatabaseClient | null = null): Router {
  const router = Router();
  router.use("/system", createSystemRouter(config, db));
  return router;
}
