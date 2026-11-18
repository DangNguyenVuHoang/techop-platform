import { Pool } from "pg";
import type { AppConfig } from "../config/env.js";
import type { Logger } from "./logger.js";

export interface DatabaseClient {
  checkReadiness(): Promise<boolean>;
  close(): Promise<void>;
}

/**
 * Create a centralized PostgreSQL connection pool with lifecycle & readiness helpers.
 */
export function createDatabase(
  config: Pick<AppConfig, "databaseUrl" | "dbPoolMax" | "dbConnectTimeoutMs" | "dbIdleTimeoutMs">,
  logger: Logger,
): DatabaseClient {
  const pool = new Pool({
    connectionString: config.databaseUrl,
    max: config.dbPoolMax,
    connectionTimeoutMillis: config.dbConnectTimeoutMs,
    idleTimeoutMillis: config.dbIdleTimeoutMs,
  });

  pool.on("error", (err) => {
    logger.error("db_pool_error", {
      message: err.message,
    });
  });

  return {
    async checkReadiness(): Promise<boolean> {
      try {
        await pool.query("SELECT 1");
        return true;
      } catch (err) {
        logger.warn("db_readiness_check_failed", {
          message: err instanceof Error ? err.message : "Unknown database error",
        });
        return false;
      }
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
