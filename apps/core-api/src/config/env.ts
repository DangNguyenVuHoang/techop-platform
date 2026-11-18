import { z } from "zod";

export const NODE_ENVS = ["development", "test", "production"] as const;
export const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(NODE_ENVS).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4001),
    API_PREFIX: z
      .string()
      .trim()
      .min(1)
      .refine((val) => val.startsWith("/"), {
        message: "API_PREFIX must start with '/'",
      })
      .transform((val) => (val.length > 1 && val.endsWith("/") ? val.slice(0, -1) : val))
      .default("/api/v1"),
    LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
    SERVICE_NAME: z.string().trim().min(1).max(100).default("techop-core-api"),
    CORS_ALLOWED_ORIGINS: z.string().optional().default(""),
    JSON_BODY_LIMIT: z
      .string()
      .trim()
      .regex(/^\d+(b|kb|mb)$/i, "JSON_BODY_LIMIT must be like 512kb or 1mb")
      .default("1mb"),
  })
  .transform((raw, ctx) => {
    const origins = raw.CORS_ALLOWED_ORIGINS.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const origin of origins) {
      if (origin === "*") {
        ctx.addIssue({
          code: "custom",
          path: ["CORS_ALLOWED_ORIGINS"],
          message: "Wildcard '*' is not allowed in CORS_ALLOWED_ORIGINS",
        });
        return z.NEVER;
      }

      try {
        const parsed = new URL(origin);
        if (parsed.origin !== origin) {
          ctx.addIssue({
            code: "custom",
            path: ["CORS_ALLOWED_ORIGINS"],
            message: `Invalid CORS origin format (no trailing path/slash allowed): ${origin}`,
          });
          return z.NEVER;
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["CORS_ALLOWED_ORIGINS"],
          message: `Invalid URL in CORS_ALLOWED_ORIGINS: ${origin}`,
        });
        return z.NEVER;
      }
    }

    return {
      nodeEnv: raw.NODE_ENV,
      port: raw.PORT,
      apiPrefix: raw.API_PREFIX,
      logLevel: raw.LOG_LEVEL,
      serviceName: raw.SERVICE_NAME,
      corsAllowedOrigins: origins,
      jsonBodyLimit: raw.JSON_BODY_LIMIT,
      isProduction: raw.NODE_ENV === "production",
    };
  });

export type AppConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables without mutating global state.
 */
export function parseEnv(rawEnv: NodeJS.ProcessEnv): AppConfig {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid Core API configuration: ${details}`);
  }
  return result.data;
}

/**
 * Load and validate configuration from process.env (fail-fast).
 */
export function loadEnv(): AppConfig {
  return parseEnv(process.env);
}
