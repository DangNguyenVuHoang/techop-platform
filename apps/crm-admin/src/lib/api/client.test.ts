import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCrmAdminEnv } from "../../config/env.js";
import { apiFetch } from "./client.js";
import { buildApiUrl } from "./config.js";
import { ApiClientError } from "./errors.js";

describe("@techop/crm-admin env and API client foundation", () => {
  it("normalizes NEXT_PUBLIC_API_BASE_URL and applies dev defaults", () => {
    const devDefaults = getCrmAdminEnv({ NODE_ENV: "development" });
    assert.equal(devDefaults.apiBaseUrl, "http://localhost:4001/api/v1");
    assert.equal(devDefaults.appName, "TECHOP CRM Admin");

    const custom = getCrmAdminEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_BASE_URL: "https://api.gettechop.com/api/v1/",
      NEXT_PUBLIC_APP_NAME: "TECHOP Admin",
    });
    assert.equal(custom.apiBaseUrl, "https://api.gettechop.com/api/v1");
    assert.equal(custom.appName, "TECHOP Admin");
  });

  it("rejects missing NEXT_PUBLIC_API_BASE_URL in production and invalid URLs", () => {
    assert.throws(
      () => getCrmAdminEnv({ NODE_ENV: "production", NEXT_PUBLIC_API_BASE_URL: undefined }),
      /NEXT_PUBLIC_API_BASE_URL must be configured in production/,
    );
    assert.throws(
      () => getCrmAdminEnv({ NEXT_PUBLIC_API_BASE_URL: "not-a-url" }),
      /Invalid NEXT_PUBLIC_API_BASE_URL/,
    );
    assert.throws(
      () => getCrmAdminEnv({ NEXT_PUBLIC_API_BASE_URL: "ftp://api.gettechop.com" }),
      /must use http:\/\/ or https:\/\//,
    );
  });

  it("builds API URLs cleanly and prevents duplicate /api/v1 prefixes", () => {
    assert.equal(
      buildApiUrl("system/health", "http://localhost:4001/api/v1/"),
      "http://localhost:4001/api/v1/system/health",
    );
    assert.equal(
      buildApiUrl("/leads", "http://localhost:4001/api/v1"),
      "http://localhost:4001/api/v1/leads",
    );
    assert.equal(
      buildApiUrl("/api/v1/leads", "http://localhost:4001/api/v1"),
      "http://localhost:4001/api/v1/leads",
    );
    assert.throws(() => buildApiUrl("", "http://localhost:4001/api/v1"), /must not be empty/);
    assert.throws(
      () => buildApiUrl("https://evil.example.com/leads", "http://localhost:4001/api/v1"),
      /must be relative/,
    );
  });

  it("parses ApiSuccessResponse, handles HTTP 204, and throws ApiClientError on HTTP/network errors", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () =>
        new Response(JSON.stringify({ ok: true, data: { status: "ok" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })) as typeof fetch;

      const okRes = await apiFetch<{ status: string }>("/system/health", {
        baseUrl: "http://localhost:4001/api/v1",
      });
      assert.equal(okRes.ok, true);
      assert.equal(okRes.data.status, "ok");

      globalThis.fetch = (async () => new Response(null, { status: 204 })) as typeof fetch;
      const noContentRes = await apiFetch<void>("/leads/123", {
        method: "DELETE",
        baseUrl: "http://localhost:4001/api/v1",
      });
      assert.equal(noContentRes.ok, true);
      assert.equal(noContentRes.data, undefined);

      globalThis.fetch = (async () =>
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: "NOT_FOUND", message: "Route not found" },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        )) as typeof fetch;

      await assert.rejects(
        () => apiFetch("/unknown", { baseUrl: "http://localhost:4001/api/v1" }),
        (err: unknown) =>
          err instanceof ApiClientError && err.status === 404 && err.code === "NOT_FOUND",
      );

      globalThis.fetch = (async () => {
        throw new TypeError("fetch failed");
      }) as typeof fetch;

      await assert.rejects(
        () => apiFetch("/system/health", { baseUrl: "http://localhost:4001/api/v1" }),
        (err: unknown) =>
          err instanceof ApiClientError && err.status === 0 && err.code === "NETWORK_ERROR",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
