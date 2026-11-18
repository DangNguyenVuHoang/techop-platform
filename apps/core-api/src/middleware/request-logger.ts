import type { NextFunction, Request, Response } from "express";
import type { Logger } from "../lib/logger.js";

/**
 * Log HTTP request completion with Request ID correlation and zero body/PII exposure.
 */
export function createRequestLoggerMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
      logger.info("http_request", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      });
    });

    next();
  };
}
