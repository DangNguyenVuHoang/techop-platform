import type { ApiErrorResponse, ApiSuccessResponse } from "@techop/shared";
import { buildApiUrl } from "./config";
import { ApiClientError } from "./errors";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  baseUrl?: string;
}

const CSRF_HEADER_NAME = "X-Requested-With";
const CSRF_HEADER_VALUE = "techop-crm";

/**
 * Core typed HTTP client for communicating with Core API (/api/v1).
 * - Uses cookie credentials ("include") and standard @techop/shared response envelopes.
 * - Normalizes network failures into ApiClientError with status 0 and code "NETWORK_ERROR".
 * - Returns `{ ok: true, data: undefined as T }` for HTTP 204 No Content responses.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiSuccessResponse<T>> {
  const { body, headers: customHeaders, baseUrl, ...rest } = options;
  const headers = new Headers(customHeaders);

  headers.set("Accept", "application/json");
  headers.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    serializedBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path, baseUrl), {
      ...rest,
      headers,
      body: serializedBody,
      credentials: "include",
    });
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", "Không thể kết nối tới máy chủ API.");
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const payload = (await response.json().catch(() => null)) as
    ApiSuccessResponse<T> | ApiErrorResponse | null;

  if (!response.ok) {
    if (payload && !payload.ok) {
      throw ApiClientError.fromErrorResponse(response.status, payload);
    }
    throw new ApiClientError(
      response.status,
      "API_REQUEST_FAILED",
      `Request failed with status ${response.status}`,
    );
  }

  if (!payload || !payload.ok) {
    if (payload && !payload.ok) {
      throw ApiClientError.fromErrorResponse(response.status, payload);
    }
    throw new ApiClientError(
      response.status,
      "INVALID_RESPONSE",
      "Phản hồi từ máy chủ không đúng định dạng JSON.",
    );
  }

  return payload;
}
