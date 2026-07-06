import assert from "node:assert/strict";
import test from "node:test";

import { buildR2ObjectKey } from "../lib/r2Storage";

test("builds safe R2 object keys for uploaded images", () => {
  assert.equal(
    buildR2ObjectKey({
      contentType: "image/jpeg",
      filename: "../ÉliteBook 840 G5.JPG",
      folder: "primepc/products",
      id: "fixed-id",
    }),
    "primepc/products/fixed-id-elitebook-840-g5.jpg",
  );
});

test("falls back to mime extension when filename extension is unsafe", () => {
  assert.equal(
    buildR2ObjectKey({
      contentType: "image/webp",
      filename: "invoice.php",
      folder: "/primepc/marketing/",
      id: "fixed-id",
    }),
    "primepc/marketing/fixed-id-invoice.webp",
  );
});
