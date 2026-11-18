import type { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@techop/shared";
import type { AppConfig } from "../config/env.js";
import type { Logger } from "../lib/logger.js";
import { AppError } from "../utils/errors.js";

interface HttpErrorLike {
  status?: number;
  statusCode?: number;
  type?: string;
}

/**
 * Centralized Express 5 error handler returning the standard API error envelope.
 */
export function createErrorHandler(config: Pick<AppConfig, "isProduction">, logger: Logger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = req.requestId;

    if (res.headersSent) {
      return;
    }

    if (err instanceof AppError) {
      logger.warn("operational_error", {
        requestId,
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      });

      const body: ApiErrorResponse = {
        ok: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      };
      res.status(err.statusCode).json(body);
      return;
    }

    const httpErr = err as HttpErrorLike;
    if (err instanceof SyntaxError && (httpErr.status === 400 || httpErr.statusCode === 400)) {
      const body: ApiErrorResponse = {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Payload JSON không hợp lệ.",
        },
      };
      res.status(400).json(body);
      return;
    }

    if (httpErr.type === "entity.too.large" || httpErr.status === 413) {
      const body: ApiErrorResponse = {
        ok: false,
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Kích thước dữ liệu vượt quá giới hạn cho phép.",
        },
      };
      res.status(413).json(body);
      return;
    }

    logger.error("unexpected_error", {
      requestId,
      path: req.path,
      method: req.method,
      error: err instanceof Error ? err.message : "Unknown error",
      ...(config.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
    });

    const body: ApiErrorResponse = {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Đã xảy ra lỗi hệ thống.",
      },
    };
    res.status(500).json(body);
  };
}
