const CSV_FORMULA_PREFIX = /^[=+\-@]/;

export const neutralizeCsvFormula = (value: string) =>
  CSV_FORMULA_PREFIX.test(value.trimStart()) ? `'${value}` : value;

export const toCsvValue = (value: string | number | null | undefined) => {
  const raw = value === null || value === undefined ? "" : String(value);
  return `"${neutralizeCsvFormula(raw).replace(/"/g, '""')}"`;
};
