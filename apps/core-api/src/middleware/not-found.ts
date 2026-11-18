import type { Request, Response } from "express";
import type { ApiErrorResponse } from "@techop/shared";

/**
 * Return a standardized JSON 404 response for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorResponse = {
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: `Không tìm thấy đường dẫn ${req.method} ${req.path}`,
    },
  };
  res.status(404).json(body);
}
