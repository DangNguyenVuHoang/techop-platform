import type { Request, Response } from "express";
import type { ApiErrorResponse, ApiSuccessResponse } from "@techop/shared";
import type { AppConfig } from "../../config/env.js";
import type { DatabaseClient } from "../../lib/db.js";

export interface SystemHealthPayload {
  status: "ok";
  service: string;
  uptimeSeconds: number;
  timestamp: string;
}

export interface SystemReadyPayload {
  status: "ready";
  service: string;
  checks: {
    database: "up";
  };
  timestamp: string;
}

/**
 * Liveness probe: GET /api/v1/system/health (checks Core API process only, never blocks on DB).
 */
export function createHealthHandler(config: Pick<AppConfig, "serviceName">) {
  return (_req: Request, res: Response): void => {
    const payload: ApiSuccessResponse<SystemHealthPayload> = {
      ok: true,
      data: {
        status: "ok",
        service: config.serviceName,
        uptimeSeconds: Number(process.uptime().toFixed(2)),
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(payload);
  };
}

/**
 * Readiness probe: GET /api/v1/system/ready (verifies PostgreSQL connectivity).
 */
export function createReadinessHandler(
  config: Pick<AppConfig, "serviceName">,
  db: DatabaseClient | null,
) {
  return async (_req: Request, res: Response): Promise<void> => {
    const isDatabaseReady = db ? await db.checkReadiness() : false;

    if (!isDatabaseReady) {
      const errorBody: ApiErrorResponse = {
        ok: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Hệ thống chưa sẵn sàng phục vụ.",
        },
      };
      res.status(503).json(errorBody);
      return;
    }

    const payload: ApiSuccessResponse<SystemReadyPayload> = {
      ok: true,
      data: {
        status: "ready",
        service: config.serviceName,
        checks: {
          database: "up",
        },
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(payload);
  };
}
