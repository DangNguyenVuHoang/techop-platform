const DEFAULT_SITE_URL = "http://localhost:3002";
const DEFAULT_SITE_NAME = "TECHOP";

// Direct literal reads ensure Next.js statically inlines NEXT_PUBLIC_* when bundled.
const INLINE_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const INLINE_SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME;

export interface MarketingEnvOverrides {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_SITE_NAME?: string;
}

function normalizeSiteUrl(rawUrl: string | undefined): string {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_SITE_URL: "${trimmed}"`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must use http:// or https:// protocol (received "${parsed.protocol}")`,
    );
  }

  return trimmed.replace(/\/+$/, "");
}

export interface MarketingEnv {
  siteUrl: string;
  siteName: string;
}

/**
 * Resolve public Marketing Web configuration for metadata, canonicals, and sitemaps.
 */
export function getMarketingEnv(overrides?: MarketingEnvOverrides): MarketingEnv {
  const rawUrl =
    overrides && "NEXT_PUBLIC_SITE_URL" in overrides
      ? overrides.NEXT_PUBLIC_SITE_URL
      : INLINE_SITE_URL;
  const rawName =
    overrides && "NEXT_PUBLIC_SITE_NAME" in overrides
      ? overrides.NEXT_PUBLIC_SITE_NAME
      : INLINE_SITE_NAME;

  return {
    siteUrl: normalizeSiteUrl(rawUrl),
    siteName: rawName?.trim() || DEFAULT_SITE_NAME,
  };
}
