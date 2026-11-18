import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Pool } from "pg";

const MIGRATION_LOCK_KEY = 90421003; // Stable advisory lock key for techop-platform migrations
const MIGRATION_FILE_REGEX = /^\d{4}_[a-z0-9_]+\.sql$/;

export interface MigrationFile {
  version: string;
  filePath: string;
  sql: string;
  checksum: string;
}

export interface AppliedMigration {
  version: string;
  checksum: string;
  applied_at: Date;
}

export interface MigrationRunResult {
  applied: string[];
  skipped: string[];
}

export interface MigrationStatusResult {
  applied: AppliedMigration[];
  pending: string[];
}

function sha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

async function ensureSchemaMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

/**
 * Load and validate sorted *.sql migration files from disk.
 */
export async function loadMigrationFiles(migrationsDir: string): Promise<MigrationFile[]> {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  const sqlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const migrations: MigrationFile[] = [];
  for (const fileName of sqlFiles) {
    if (!MIGRATION_FILE_REGEX.test(fileName)) {
      throw new Error(
        `Invalid migration filename "${fileName}". Expected format: NNNN_description.sql`,
      );
    }
    const version = fileName.replace(/\.sql$/, "");
    const filePath = path.join(migrationsDir, fileName);
    const sql = await fs.readFile(filePath, "utf8");
    migrations.push({
      version,
      filePath,
      sql,
      checksum: sha256(sql),
    });
  }

  return migrations;
}

/**
 * Return applied and pending migrations without modifying schema state.
 */
export async function getMigrationStatus(
  pool: Pool,
  migrationsDir: string,
): Promise<MigrationStatusResult> {
  await ensureSchemaMigrationsTable(pool);
  const files = await loadMigrationFiles(migrationsDir);
  const { rows } = await pool.query<AppliedMigration>(
    "SELECT version, checksum, applied_at FROM schema_migrations ORDER BY version ASC",
  );

  const appliedMap = new Map(rows.map((row) => [row.version, row]));
  const pending: string[] = [];

  for (const file of files) {
    const existing = appliedMap.get(file.version);
    if (!existing) {
      pending.push(file.version);
    } else if (existing.checksum !== file.checksum) {
      throw new Error(`Checksum mismatch for already-applied migration "${file.version}".`);
    }
  }

  return { applied: rows, pending };
}

/**
 * Apply pending SQL migrations transactionally under a PostgreSQL advisory lock.
 */
export async function runMigrations(
  pool: Pool,
  migrationsDir: string,
  log: (message: string) => void = () => {},
): Promise<MigrationRunResult> {
  const client = await pool.connect();
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = await loadMigrationFiles(migrationsDir);
    const { rows } = await client.query<{ version: string; checksum: string }>(
      "SELECT version, checksum FROM schema_migrations ORDER BY version ASC",
    );
    const appliedMap = new Map(rows.map((row) => [row.version, row.checksum]));

    for (const file of files) {
      const existingChecksum = appliedMap.get(file.version);
      if (existingChecksum) {
        if (existingChecksum !== file.checksum) {
          throw new Error(
            `Checksum mismatch for already-applied migration "${file.version}". Refusing to continue.`,
          );
        }
        skipped.push(file.version);
        continue;
      }

      log(`Applying migration ${file.version}...`);
      await client.query("BEGIN");
      try {
        await client.query(file.sql);
        await client.query("INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)", [
          file.version,
          file.checksum,
        ]);
        await client.query("COMMIT");
        applied.push(file.version);
        log(`Applied migration ${file.version}.`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    return { applied, skipped };
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
    } catch {
      // Ignore unlock errors if connection already closed
    }
    client.release();
  }
}
