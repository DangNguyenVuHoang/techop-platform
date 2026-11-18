import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEnv } from "../config/env.js";

describe("@techop/core-api env validation", () => {
  it("accepts valid configuration and parses defaults and CORS allowlist", () => {
    const config = parseEnv({
      NODE_ENV: "production",
      PORT: "4001",
      API_PREFIX: "/api/v1/",
      LOG_LEVEL: "warn",
      CORS_ALLOWED_ORIGINS: "https://crm.gettechop.com, https://staging-crm.gettechop.com",
      JSON_BODY_LIMIT: "512kb",
    });

    assert.equal(config.nodeEnv, "production");
    assert.equal(config.isProduction, true);
    assert.equal(config.port, 4001);
    assert.equal(config.apiPrefix, "/api/v1");
    assert.equal(config.logLevel, "warn");
    assert.deepEqual(config.corsAllowedOrigins, [
      "https://crm.gettechop.com",
      "https://staging-crm.gettechop.com",
    ]);
    assert.equal(config.jsonBodyLimit, "512kb");
  });

  it("applies safe foundation defaults when optional variables are omitted", () => {
    const config = parseEnv({});

    assert.equal(config.nodeEnv, "development");
    assert.equal(config.port, 4001);
    assert.equal(config.apiPrefix, "/api/v1");
    assert.equal(config.logLevel, "info");
    assert.deepEqual(config.corsAllowedOrigins, []);
  });

  it("rejects invalid PORT, NODE_ENV, API_PREFIX, and wildcard CORS", () => {
    assert.throws(() => parseEnv({ PORT: "not-a-port" }), /Invalid Core API configuration/);
    assert.throws(
      () => parseEnv({ NODE_ENV: "staging-invalid" }),
      /Invalid Core API configuration/,
    );
    assert.throws(() => parseEnv({ API_PREFIX: "api/v1" }), /API_PREFIX must start with '\/'/);
    assert.throws(() => parseEnv({ CORS_ALLOWED_ORIGINS: "*" }), /Wildcard '\*' is not allowed/);
    assert.throws(
      () => parseEnv({ CORS_ALLOWED_ORIGINS: "https://crm.gettechop.com/extra-path" }),
      /Invalid CORS origin format/,
    );
  });
});
