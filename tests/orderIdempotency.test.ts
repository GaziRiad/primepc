import assert from "node:assert/strict";
import test from "node:test";

import {
  createOrderFingerprint,
  normalizeIdempotencyKey,
} from "../lib/orderIdempotency";

test("accepts safe idempotency keys and rejects malformed keys", () => {
  assert.equal(
    normalizeIdempotencyKey("checkout:1234567890"),
    "checkout:1234567890",
  );
  assert.equal(normalizeIdempotencyKey("short"), "");
  assert.equal(normalizeIdempotencyKey("bad key with spaces"), "");
});

test("creates stable fingerprints for the same payload", () => {
  const payload = { items: [{ productId: "1", quantity: 2 }], userId: "" };
  assert.equal(
    createOrderFingerprint(payload),
    createOrderFingerprint(payload),
  );
  assert.notEqual(
    createOrderFingerprint(payload),
    createOrderFingerprint({ ...payload, userId: "different" }),
  );
});
