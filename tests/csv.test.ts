import assert from "node:assert/strict";
import test from "node:test";

import { neutralizeCsvFormula, toCsvValue } from "../lib/csv";

test("neutralizes spreadsheet formulas", () => {
  assert.equal(neutralizeCsvFormula("=SUM(A1:A2)"), "'=SUM(A1:A2)");
  assert.equal(neutralizeCsvFormula("  @cmd"), "'  @cmd");
  assert.equal(neutralizeCsvFormula("ordinary"), "ordinary");
});

test("quotes and escapes CSV fields", () => {
  assert.equal(toCsvValue('A "quoted" value'), '"A ""quoted"" value"');
});
