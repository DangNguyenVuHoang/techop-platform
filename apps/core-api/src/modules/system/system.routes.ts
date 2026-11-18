import { Router } from "express";
import type { AppConfig } from "../../config/env.js";
import { createHealthHandler } from "./system.controller.js";

/**
 * Create system module router (/api/v1/system/*).
 */
export function createSystemRouter(config: Pick<AppConfig, "serviceName">): Router {
  const router = Router();
  router.get("/health", createHealthHandler(config));
  return router;
}
