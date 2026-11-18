import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import type { ApiErrorResponse, ApiSuccessResponse } from "@techop/shared";
import { createApp } from "../app.js";
import { parseEnv, type AppConfig } from "../config/env.js";
import { createLogger } from "../lib/logger.js";
import type { SystemHealthPayload } from "../modules/system/index.js";

async function startTestServer(configOverrides: NodeJS.ProcessEnv = {}) {
  const config: AppConfig = parseEnv({
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    CORS_ALLOWED_ORIGINS: "http://localhost:3001",
    ...configOverrides,
  });
  const logger = createLogger(config);
  const app = createApp({
    config,
    logger,
    registerTestRoutes(expressApp) {
      expressApp.get("/api/v1/__test/boom", () => {
        throw new Error("Sensitive internal database failure detail");
      });
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

describe("@techop/core-api HTTP foundation", () => {
  let baseUrl = "";
  let closeServer: () => Promise<void>;

  before(async () => {
    const started = await startTestServer();
    baseUrl = started.baseUrl;
    closeServer = started.close;
  });

  after(async () => {
    await closeServer();
  });

  it("GET /api/v1/system/health returns standard envelope without sensitive info", async () => {
    const res = await fetch(`${baseUrl}/api/v1/system/health`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get("x-request-id"));
    assert.ok(res.headers.get("x-content-type-options"));

    const body = (await res.json()) as ApiSuccessResponse<SystemHealthPayload>;
    assert.equal(body.ok, true);
    assert.equal(body.data.status, "ok");
    assert.equal(body.data.service, "techop-core-api");
    assert.equal(typeof body.data.uptimeSeconds, "number");
    assert.ok(!Number.isNaN(Date.parse(body.data.timestamp)));
    assert.equal("database" in body.data, false);
    assert.equal("env" in body.data, false);
  });

  it("propagates safe X-Request-Id and replaces unsafe client values", async () => {
    const safeRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { "X-Request-Id": "req_client_123456" },
    });
    assert.equal(safeRes.headers.get("x-request-id"), "req_client_123456");

    const unsafeRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { "X-Request-Id": "bad<script>id" },
    });
    const generated = unsafeRes.headers.get("x-request-id");
    assert.ok(generated);
    assert.notEqual(generated, "bad<script>id");
  });

  it("returns standard JSON 404 envelope for unknown routes", async () => {
    const res = await fetch(`${baseUrl}/api/v1/non-existent-route`);
    assert.equal(res.status, 404);
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);

    const body = (await res.json()) as ApiErrorResponse;
    assert.equal(body.ok, false);
    assert.equal(body.error.code, "NOT_FOUND");
    assert.ok(body.error.message.includes("/api/v1/non-existent-route"));
  });

  it("handles malformed JSON with 400 INVALID_JSON envelope", async () => {
    const res = await fetch(`${baseUrl}/api/v1/system/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad-json",
    });
    assert.equal(res.status, 400);

    const body = (await res.json()) as ApiErrorResponse;
    assert.equal(body.ok, false);
    assert.equal(body.error.code, "INVALID_JSON");
  });

  it("hides stack traces and internal messages on unexpected 500 errors in production", async () => {
    const prod = await startTestServer({ NODE_ENV: "production" });
    try {
      const res = await fetch(`${prod.baseUrl}/api/v1/__test/boom`);
      assert.equal(res.status, 500);

      const rawText = await res.text();
      const body = JSON.parse(rawText) as ApiErrorResponse;
      assert.equal(body.ok, false);
      assert.equal(body.error.code, "INTERNAL_SERVER_ERROR");
      assert.equal("stack" in body.error, false);
      assert.equal(rawText.includes("Sensitive internal database failure detail"), false);
    } finally {
      await prod.close();
    }
  });

  it("enforces explicit CORS allowlist and rejects disallowed origins", async () => {
    const allowedRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { Origin: "http://localhost:3001" },
    });
    assert.equal(allowedRes.status, 200);
    assert.equal(allowedRes.headers.get("access-control-allow-origin"), "http://localhost:3001");

    const blockedRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { Origin: "https://evil.example.com" },
    });
    assert.equal(blockedRes.status, 403);
    assert.equal(blockedRes.headers.get("access-control-allow-origin"), null);
  });
});
