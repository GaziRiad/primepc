import assert from "node:assert/strict";
import test from "node:test";

import {
  getDiscountedPrice,
  getDiscountPercentFromFinalPrice,
  getDisplayDiscountPercent,
} from "../lib/utils";

test("calculates a precise discount from a desired final price", () => {
  const discount = getDiscountPercentFromFinalPrice(75000, 68000);

  assert.equal(discount, 9.3333);
  assert.equal(getDiscountedPrice(75000, discount), 68000);
});

test("bounds reverse discount calculation", () => {
  assert.equal(getDiscountPercentFromFinalPrice(0, 100), 0);
  assert.equal(getDiscountPercentFromFinalPrice(100000, 120000), 0);
  assert.equal(getDiscountPercentFromFinalPrice(100000, -1), 100);
});

test("rounds discount down for public display", () => {
  assert.equal(getDisplayDiscountPercent(9.3333), 9);
  assert.equal(getDisplayDiscountPercent(11.3636), 10);
  assert.equal(getDisplayDiscountPercent(18.9), 15);
  assert.equal(getDisplayDiscountPercent(0.4), 0);
  assert.equal(getDisplayDiscountPercent(100.5), 100);
});
