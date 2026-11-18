import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

/**
 * Attach a validated or newly generated Request ID to each HTTP request and response.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id")?.trim();
  const requestId = incoming && SAFE_REQUEST_ID_REGEX.test(incoming) ? incoming : randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
