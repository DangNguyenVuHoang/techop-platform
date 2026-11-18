import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import type { ApiSuccessResponse } from "@techop/shared";
import { Pool } from "pg";
import { createApp } from "../app.js";
import { parseEnv } from "../config/env.js";
import { createDatabase } from "../lib/db.js";
import { createLogger } from "../lib/logger.js";
import type { SystemReadyPayload } from "../modules/system/index.js";

const DEV_DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://techop_app:techop_dev_password_change_me@127.0.0.1:5434/techop_platform_dev";

const parsedDbUrl = new URL(DEV_DB_URL);
const isIsolatedDevPort = parsedDbUrl.hostname === "127.0.0.1" && parsedDbUrl.port === "5434";

describe("@techop/core-api database integration (port 5434)", () => {
  const testDbName = "techop_platform_core_api_test";
  let adminPool: Pool;
  let testDbUrl = "";

  before(async () => {
    assert.equal(
      isIsolatedDevPort,
      true,
      "Integration tests must only run against isolated 127.0.0.1:5434",
    );

    const adminUrl = new URL(DEV_DB_URL);
    adminUrl.pathname = "/postgres";
    adminPool = new Pool({ connectionString: adminUrl.toString(), max: 1 });

    await adminPool.query(`DROP DATABASE IF EXISTS ${testDbName}`);
    await adminPool.query(`CREATE DATABASE ${testDbName}`);

    const isolatedUrl = new URL(DEV_DB_URL);
    isolatedUrl.pathname = `/${testDbName}`;
    testDbUrl = isolatedUrl.toString();
  });

  after(async () => {
    if (adminPool) {
      await adminPool.query(`DROP DATABASE IF EXISTS ${testDbName}`);
      await adminPool.end();
    }
  });

  it("connects via createDatabase, serves /api/v1/system/ready 200, and closes cleanly", async () => {
    const config = parseEnv({
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: testDbUrl,
    });
    const logger = createLogger(config);
    const db = createDatabase(config, logger);
    const app = createApp({ config, logger, db });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const { port } = server.address() as AddressInfo;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/system/ready`);
      assert.equal(res.status, 200);

      const body = (await res.json()) as ApiSuccessResponse<SystemReadyPayload>;
      assert.equal(body.ok, true);
      assert.equal(body.data.status, "ready");
      assert.equal(body.data.checks.database, "up");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      await db.close();
    }
  });

  it("handles unreachable database gracefully in checkReadiness", async () => {
    const config = parseEnv({
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: "postgresql://techop_app:bad@127.0.0.1:5999/nonexistent",
      DB_CONNECT_TIMEOUT_MS: "500",
    });
    const logger = createLogger(config);
    const db = createDatabase(config, logger);

    const ready = await db.checkReadiness();
    assert.equal(ready, false);
    await db.close();
  });
});
