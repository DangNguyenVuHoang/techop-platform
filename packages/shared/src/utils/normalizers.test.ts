import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeEmail, normalizePhoneE164, slugify } from "./normalizers.js";
import { ingestLeadSchema } from "../schemas/index.js";

describe("@techop/shared normalizers", () => {
  it("normalizes Vietnamese local phone numbers to E.164", () => {
    assert.equal(normalizePhoneE164("0389 431 139"), "+84389431139");
    assert.equal(normalizePhoneE164("090-123-4567"), "+84901234567");
    assert.equal(normalizePhoneE164("+84 389.431.139"), "+84389431139");
  });

  it("rejects invalid phone numbers", () => {
    assert.equal(normalizePhoneE164("1234"), null);
    assert.equal(normalizePhoneE164(""), null);
    assert.equal(normalizePhoneE164(null), null);
  });

  it("normalizes email addresses to lowercase trimmed strings", () => {
    assert.equal(normalizeEmail("  Sales@TECHOP.vn "), "sales@techop.vn");
    assert.equal(normalizeEmail("invalid-email"), null);
    assert.equal(normalizeEmail(undefined), null);
  });

  it("slugifies Vietnamese text accurately", () => {
    assert.equal(
      slugify("Thiết kế Website Doanh Nghiệp Đẹp!"),
      "thiet-ke-website-doanh-nghiep-dep",
    );
  });
});

describe("@techop/shared schemas", () => {
  it("accepts valid ingest lead payload and rejects missing contact", () => {
    const valid = ingestLeadSchema.safeParse({
      fullName: "Nguyen Van A",
      phone: "0389431139",
    });
    assert.equal(valid.success, true);

    const invalid = ingestLeadSchema.safeParse({
      fullName: "Nguyen Van B",
      phone: "",
      email: "",
    });
    assert.equal(invalid.success, false);
  });
});
