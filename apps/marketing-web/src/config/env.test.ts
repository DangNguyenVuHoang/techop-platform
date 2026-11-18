import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMarketingEnv } from "./env.js";

describe("@techop/marketing-web env configuration", () => {
  it("applies safe localhost defaults when env variables are omitted", () => {
    const env = getMarketingEnv({});
    assert.equal(env.siteUrl, "http://localhost:3002");
    assert.equal(env.siteName, "TECHOP");
  });

  it("normalizes trailing slashes on NEXT_PUBLIC_SITE_URL", () => {
    const env = getMarketingEnv({
      NEXT_PUBLIC_SITE_URL: "https://example.techop.test///",
      NEXT_PUBLIC_SITE_NAME: "TECHOP Platform",
    });
    assert.equal(env.siteUrl, "https://example.techop.test");
    assert.equal(env.siteName, "TECHOP Platform");
  });

  it("rejects invalid NEXT_PUBLIC_SITE_URL values", () => {
    assert.throws(
      () => getMarketingEnv({ NEXT_PUBLIC_SITE_URL: "not-a-valid-url" }),
      /Invalid NEXT_PUBLIC_SITE_URL/,
    );
    assert.throws(
      () => getMarketingEnv({ NEXT_PUBLIC_SITE_URL: "ftp://techop.local" }),
      /must use http:\/\/ or https:\/\//,
    );
  });
});
