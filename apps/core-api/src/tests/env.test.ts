import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEnv } from "../config/env.js";

const VALID_DB_URL = "postgresql://techop_app:secret@127.0.0.1:5434/techop_platform_dev";

describe("@techop/core-api env validation", () => {
  it("accepts valid configuration and parses defaults and CORS allowlist", () => {
    const config = parseEnv({
      NODE_ENV: "production",
      PORT: "4001",
      API_PREFIX: "/api/v1/",
      LOG_LEVEL: "warn",
      DATABASE_URL: VALID_DB_URL,
      DB_POOL_MAX: "20",
      CORS_ALLOWED_ORIGINS: "https://crm.gettechop.com, https://staging-crm.gettechop.com",
      JSON_BODY_LIMIT: "512kb",
    });

    assert.equal(config.nodeEnv, "production");
    assert.equal(config.isProduction, true);
    assert.equal(config.port, 4001);
    assert.equal(config.apiPrefix, "/api/v1");
    assert.equal(config.logLevel, "warn");
    assert.equal(config.databaseUrl, VALID_DB_URL);
    assert.equal(config.dbPoolMax, 20);
    assert.deepEqual(config.corsAllowedOrigins, [
      "https://crm.gettechop.com",
      "https://staging-crm.gettechop.com",
    ]);
    assert.equal(config.jsonBodyLimit, "512kb");
  });

  it("applies safe foundation defaults when optional variables are omitted", () => {
    const config = parseEnv({ DATABASE_URL: VALID_DB_URL });

    assert.equal(config.nodeEnv, "development");
    assert.equal(config.port, 4001);
    assert.equal(config.apiPrefix, "/api/v1");
    assert.equal(config.logLevel, "info");
    assert.equal(config.dbPoolMax, 10);
    assert.equal(config.dbConnectTimeoutMs, 5000);
    assert.deepEqual(config.corsAllowedOrigins, []);
  });

  it("rejects missing/invalid DATABASE_URL, PORT, NODE_ENV, API_PREFIX, and wildcard CORS", () => {
    assert.throws(() => parseEnv({}), /DATABASE_URL/);
    assert.throws(
      () => parseEnv({ DATABASE_URL: "mysql://user:pass@localhost:3306/db" }),
      /DATABASE_URL must be a valid postgres/,
    );
    assert.throws(
      () => parseEnv({ DATABASE_URL: VALID_DB_URL, PORT: "not-a-port" }),
      /Invalid Core API configuration/,
    );
    assert.throws(
      () => parseEnv({ DATABASE_URL: VALID_DB_URL, NODE_ENV: "staging-invalid" }),
      /Invalid Core API configuration/,
    );
    assert.throws(
      () => parseEnv({ DATABASE_URL: VALID_DB_URL, API_PREFIX: "api/v1" }),
      /API_PREFIX must start with '\/'/,
    );
    assert.throws(
      () => parseEnv({ DATABASE_URL: VALID_DB_URL, CORS_ALLOWED_ORIGINS: "*" }),
      /Wildcard '\*' is not allowed/,
    );
    assert.throws(
      () =>
        parseEnv({
          DATABASE_URL: VALID_DB_URL,
          CORS_ALLOWED_ORIGINS: "https://crm.gettechop.com/extra-path",
        }),
      /Invalid CORS origin format/,
    );
  });
});
