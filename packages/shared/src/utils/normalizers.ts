/**
 * Normalize a phone number to E.164 format (prioritizing Vietnam +84 when local 0-prefix is used).
 * Returns null if the cleaned input does not contain 8..15 digits.
 */
export function normalizePhoneE164(
  raw: string | null | undefined,
  defaultCountryCode = "84",
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return null;

  let normalizedDigits: string;
  if (hasPlus) {
    normalizedDigits = digitsOnly;
  } else if (digitsOnly.startsWith("0")) {
    normalizedDigits = `${defaultCountryCode}${digitsOnly.slice(1)}`;
  } else {
    normalizedDigits = digitsOnly;
  }

  if (normalizedDigits.length < 8 || normalizedDigits.length > 15) {
    return null;
  }

  return `+${normalizedDigits}`;
}

/**
 * Normalize an email address (trim + lowercase) with basic RFC-like structure validation.
 * Returns null if empty or invalid format.
 */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase();
  if (!cleaned) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

/**
 * Convert Vietnamese/Unicode text to a clean URL slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
