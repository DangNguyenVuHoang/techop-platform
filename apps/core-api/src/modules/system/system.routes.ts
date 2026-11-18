import { Router } from "express";
import type { AppConfig } from "../../config/env.js";
import type { DatabaseClient } from "../../lib/db.js";
import { createHealthHandler, createReadinessHandler } from "./system.controller.js";

/**
 * Create system module router (/api/v1/system/*).
 */
export function createSystemRouter(
  config: Pick<AppConfig, "serviceName">,
  db: DatabaseClient | null = null,
): Router {
  const router = Router();
  router.get("/health", createHealthHandler(config));
  router.get("/ready", createReadinessHandler(config, db));
  return router;
}
