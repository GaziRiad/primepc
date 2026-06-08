import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeProductQuery } from "../lib/productQuery";

test("drops arbitrary Mongo-like query fields", () => {
  assert.deepEqual(
    sanitizeProductQuery({
      q: " laptop ",
      sort: "-finalPrice",
      $where: "sleep(1000)",
      "stock[$gt]": "0",
    }),
    { q: "laptop", sort: "-finalPrice" },
  );
});

test("bounds paging and category inputs", () => {
  const sanitized = sanitizeProductQuery({
    limit: "1000",
    page: "-2",
    minPrice: "-1",
    categories: Array.from({ length: 20 }, (_, index) => `cat-${index}`),
  });

  assert.equal(sanitized.limit, "48");
  assert.equal(sanitized.page, undefined);
  assert.equal(sanitized.minPrice, undefined);
  assert.equal(sanitized.categories?.length, 12);
});
