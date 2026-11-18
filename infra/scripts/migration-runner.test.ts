import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { getMigrationStatus, runMigrations } from "./migration-runner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");

const DEV_DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://techop_app:techop_dev_password_change_me@127.0.0.1:5434/techop_platform_dev";

const parsedDbUrl = new URL(DEV_DB_URL);
const isIsolatedDevPort = parsedDbUrl.hostname === "127.0.0.1" && parsedDbUrl.port === "5434";

describe("infra/scripts migration runner (port 5434)", () => {
  const testDbName = "techop_platform_migration_test";
  let adminPool: Pool;
  let testPool: Pool;

  before(async () => {
    assert.equal(
      isIsolatedDevPort,
      true,
      "Migration tests must only run against isolated 127.0.0.1:5434",
    );

    const adminUrl = new URL(DEV_DB_URL);
    adminUrl.pathname = "/postgres";
    adminPool = new Pool({ connectionString: adminUrl.toString(), max: 1 });

    await adminPool.query(`DROP DATABASE IF EXISTS ${testDbName}`);
    await adminPool.query(`CREATE DATABASE ${testDbName}`);

    const isolatedUrl = new URL(DEV_DB_URL);
    isolatedUrl.pathname = `/${testDbName}`;
    testPool = new Pool({ connectionString: isolatedUrl.toString(), max: 3 });
  });

  after(async () => {
    if (testPool) await testPool.end();
    if (adminPool) {
      await adminPool.query(`DROP DATABASE IF EXISTS ${testDbName}`);
      await adminPool.end();
    }
  });

  it("applies foundation migration from empty DB, records schema_migrations, and is idempotent", async () => {
    const firstRun = await runMigrations(testPool, MIGRATIONS_DIR);
    assert.deepEqual(firstRun.applied, ["0001_init_foundation"]);
    assert.deepEqual(firstRun.skipped, []);

    const status = await getMigrationStatus(testPool, MIGRATIONS_DIR);
    assert.equal(status.applied.length, 1);
    assert.equal(status.applied[0]?.version, "0001_init_foundation");
    assert.deepEqual(status.pending, []);

    const { rows: fnRows } = await testPool.query<{ proname: string }>(
      "SELECT proname FROM pg_proc WHERE proname = 'set_updated_at'",
    );
    assert.equal(fnRows.length, 1);

    const secondRun = await runMigrations(testPool, MIGRATIONS_DIR);
    assert.deepEqual(secondRun.applied, []);
    assert.deepEqual(secondRun.skipped, ["0001_init_foundation"]);
  });

  it("rolls back failed migration and does not record failed version in schema_migrations", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "techop-mig-fail-"));
    try {
      await fs.writeFile(
        path.join(tempDir, "0002_failing_migration.sql"),
        `
          CREATE TABLE temp_should_rollback (id INT PRIMARY KEY);
          SELECT * FROM nonexistent_table_to_force_failure;
        `,
        "utf8",
      );

      await assert.rejects(() => runMigrations(testPool, tempDir));

      const { rows } = await testPool.query<{ version: string }>(
        "SELECT version FROM schema_migrations WHERE version = $1",
        ["0002_failing_migration"],
      );
      assert.equal(rows.length, 0);

      const { rows: tableCheck } = await testPool.query<{ exists: string | null }>(
        "SELECT to_regclass('public.temp_should_rollback') AS exists",
      );
      assert.equal(tableCheck[0]?.exists, null);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
