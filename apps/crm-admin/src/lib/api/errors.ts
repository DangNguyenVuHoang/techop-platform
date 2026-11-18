import type { ApiErrorDetail, ApiErrorResponse } from "@techop/shared";

/**
 * Standardized client-side error wrapping the shared Core API error envelope.
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromErrorResponse(status: number, body: ApiErrorResponse): ApiClientError {
    return new ApiClientError(status, body.error.code, body.error.message, body.error.details);
  }
}
