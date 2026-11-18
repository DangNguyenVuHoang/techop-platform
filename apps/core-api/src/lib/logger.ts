import type { AppConfig } from "../config/env.js";

export type LogLevel = AppConfig["logLevel"];

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const SENSITIVE_KEY_PATTERN =
  /^(password|token|access_?token|refresh_?token|secret|authorization|cookie|set-cookie|api_?key|x-source-key|email|phone|database_?url|connectionString)$/i;

const CONNECTION_STRING_PATTERN = /postgres(?:ql)?:\/\/[^\s"']+/gi;

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[Truncated]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.replace(CONNECTION_STRING_PATTERN, "[REDACTED_CONNECTION_URL]");
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message.replace(CONNECTION_STRING_PATTERN, "[REDACTED_CONNECTION_URL]"),
    };
  }
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = sanitizeValue(val, depth + 1);
      }
    }
    return output;
  }
  return value;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Create a structured JSON logger with automatic sensitive-field redaction.
 */
export function createLogger(
  config: Pick<AppConfig, "logLevel" | "serviceName" | "nodeEnv">,
): Logger {
  const minPriority = LEVEL_PRIORITY[config.logLevel];

  function write(
    level: Exclude<LogLevel, "silent">,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    if (LEVEL_PRIORITY[level] < minPriority) {
      return;
    }

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      service: config.serviceName,
      env: config.nodeEnv,
      message,
    };

    if (meta) {
      Object.assign(entry, sanitizeValue(meta) as Record<string, unknown>);
    }

    const line = JSON.stringify(entry);
    if (level === "error" || level === "warn") {
      process.stderr.write(`${line}\n`);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }

  return {
    debug: (message, meta) => write("debug", message, meta),
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
  };
}
