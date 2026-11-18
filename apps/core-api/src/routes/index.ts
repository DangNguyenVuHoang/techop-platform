import { Router } from "express";
import type { AppConfig } from "../config/env.js";
import { createV1Router } from "./v1.js";

/**
 * Mount versioned API routers using the configured API prefix (default: /api/v1).
 */
export function createApiRouter(config: AppConfig): Router {
  const router = Router();
  router.use(config.apiPrefix, createV1Router(config));
  return router;
}
