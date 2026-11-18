const DEFAULT_DEV_API_BASE_URL = "http://localhost:4001/api/v1";
const DEFAULT_APP_NAME = "TECHOP CRM Admin";

// Direct literal reads are required so Next.js statically inlines NEXT_PUBLIC_* into client bundles.
const INLINE_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const INLINE_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
const INLINE_NODE_ENV = process.env.NODE_ENV;

export interface EnvOverrides {
  NEXT_PUBLIC_API_BASE_URL?: string;
  NEXT_PUBLIC_APP_NAME?: string;
  NODE_ENV?: string;
}

function normalizeApiBaseUrl(rawUrl: string | undefined, nodeEnv: string | undefined): string {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    if (nodeEnv === "production") {
      throw new Error("NEXT_PUBLIC_API_BASE_URL must be configured in production.");
    }
    return DEFAULT_DEV_API_BASE_URL;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_API_BASE_URL: "${trimmed}"`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL must use http:// or https:// protocol (received "${parsed.protocol}")`,
    );
  }

  return trimmed.replace(/\/+$/, "");
}

export interface CrmAdminEnv {
  apiBaseUrl: string;
  appName: string;
}

/**
 * Resolve public application display name (safe during static build without API URL).
 */
export function getAppName(overrides?: EnvOverrides): string {
  const rawName =
    overrides && "NEXT_PUBLIC_APP_NAME" in overrides
      ? overrides.NEXT_PUBLIC_APP_NAME
      : INLINE_APP_NAME;
  return rawName?.trim() || DEFAULT_APP_NAME;
}

/**
 * Resolve public CRM Admin configuration. Accepts optional test overrides without
 * compromising literal NEXT_PUBLIC_* inlining in production client bundles.
 */
export function getCrmAdminEnv(overrides?: EnvOverrides): CrmAdminEnv {
  const rawApiUrl =
    overrides && "NEXT_PUBLIC_API_BASE_URL" in overrides
      ? overrides.NEXT_PUBLIC_API_BASE_URL
      : INLINE_API_BASE_URL;
  const nodeEnv = overrides && "NODE_ENV" in overrides ? overrides.NODE_ENV : INLINE_NODE_ENV;

  return {
    apiBaseUrl: normalizeApiBaseUrl(rawApiUrl, nodeEnv),
    appName: getAppName(overrides),
  };
}
