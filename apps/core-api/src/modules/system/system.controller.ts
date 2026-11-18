import type { Request, Response } from "express";
import type { ApiSuccessResponse } from "@techop/shared";
import type { AppConfig } from "../../config/env.js";

export interface SystemHealthPayload {
  status: "ok";
  service: string;
  uptimeSeconds: number;
  timestamp: string;
}

/**
 * Handle GET /api/v1/system/health (process-level healthcheck only at Phase C.2).
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
