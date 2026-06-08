import { createHash } from "node:crypto";

const IDEMPOTENCY_KEY_REGEX = /^[a-zA-Z0-9:_-]{16,128}$/;

export const normalizeIdempotencyKey = (value: unknown) => {
  const key = String(value ?? "").trim();
  return IDEMPOTENCY_KEY_REGEX.test(key) ? key : "";
};

export const createOrderFingerprint = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
