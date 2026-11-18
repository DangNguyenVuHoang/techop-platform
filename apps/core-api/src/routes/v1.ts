import { Router } from "express";
import type { AppConfig } from "../config/env.js";
import { createSystemRouter } from "../modules/system/index.js";

/**
 * Mount all v1 module routers under /api/v1.
 */
export function createV1Router(config: AppConfig): Router {
  const router = Router();
  router.use("/system", createSystemRouter(config));
  return router;
}
