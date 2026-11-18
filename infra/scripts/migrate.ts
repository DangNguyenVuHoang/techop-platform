import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { z } from "zod";
import { getMigrationStatus, runMigrations } from "./migration-runner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_MIGRATIONS_DIR = path.resolve(ROOT_DIR, "infra/migrations");

const cliEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, "DATABASE_URL is required")
    .refine(
      (val) => val.startsWith("postgres://") || val.startsWith("postgresql://"),
      "DATABASE_URL must start with postgres:// or postgresql://",
    ),
});

function loadLocalEnvIfNeeded(): void {
  if (process.env.DATABASE_URL) return;
  const candidateFiles = [
    path.resolve(ROOT_DIR, "apps/core-api/.env"),
    path.resolve(ROOT_DIR, ".env"),
  ];
  for (const envPath of candidateFiles) {
    if (fs.existsSync(envPath)) {
      process.loadEnvFile(envPath);
      if (process.env.DATABASE_URL) return;
    }
  }
}

async function main(): Promise<void> {
  loadLocalEnvIfNeeded();

  const parsed = cliEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => i.message).join("; ");
    console.error(`[db:migrate] Configuration error: ${details}`);
    process.exit(1);
  }

  const command = process.argv[2] ?? "up";
  if (command !== "up" && command !== "status") {
    console.error(`[db:migrate] Unknown command "${command}". Supported: up | status`);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: parsed.data.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: 5000,
  });

  try {
    if (command === "status") {
      const status = await getMigrationStatus(pool, DEFAULT_MIGRATIONS_DIR);
      console.log(
        JSON.stringify(
          {
            applied: status.applied.map((a) => ({
              version: a.version,
              appliedAt: a.applied_at,
            })),
            pending: status.pending,
          },
          null,
          2,
        ),
      );
      return;
    }

    const result = await runMigrations(pool, DEFAULT_MIGRATIONS_DIR, (msg) => {
      console.log(`[db:migrate] ${msg}`);
    });
    console.log(
      `[db:migrate] Done. Applied: ${result.applied.length}, Skipped: ${result.skipped.length}.`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown migration error";
    console.error(`[db:migrate] Failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();

