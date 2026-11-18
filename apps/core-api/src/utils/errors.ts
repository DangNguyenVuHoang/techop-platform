import type { ApiErrorDetail } from "@techop/shared";

/**
 * Base operational error class mapped to the standard API error envelope.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[],
    isOperational = true,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Yêu cầu không hợp lệ.", details?: ApiErrorDetail[]) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy tài nguyên yêu cầu.") {
    super(404, "NOT_FOUND", message);
  }
}
