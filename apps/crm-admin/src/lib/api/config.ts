import { getCrmAdminEnv } from "@/config/env";

/**
 * Resolve the configured Core API base URL (e.g. http://localhost:4001/api/v1).
 */
export function getApiBaseUrl(): string {
  return getCrmAdminEnv().apiBaseUrl;
}

/**
 * Build an absolute Core API URL from a relative endpoint path, preventing
 * duplicate version prefixes (e.g. /api/v1/api/v1/leads).
 */
export function buildApiUrl(path: string, baseUrl: string = getApiBaseUrl()): string {
  const trimmedPath = path.trim();
  if (!trimmedPath) {
    throw new Error("API path must not be empty.");
  }
  if (/^https?:\/\//i.test(trimmedPath)) {
    throw new Error("API path must be relative, not an absolute URL.");
  }

  const normalizedBase = baseUrl.trim().replace(/\/+$/, "");
  let normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;

  const basePathname = new URL(normalizedBase).pathname.replace(/\/+$/, "");
  if (
    basePathname &&
    basePathname !== "/" &&
    (normalizedPath === basePathname || normalizedPath.startsWith(`${basePathname}/`))
  ) {
    normalizedPath = normalizedPath.slice(basePathname.length) || "/";
  }

  return normalizedPath === "/" ? normalizedBase : `${normalizedBase}${normalizedPath}`;
}
