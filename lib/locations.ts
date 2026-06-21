import wilayas from "./algeria-wilayas.json";

export type AlgeriaWilaya = {
  code: string;
  name: string;
};

export const ALGERIA_WILAYAS = wilayas as AlgeriaWilaya[];

const normalizeKey = (value: string) => value.trim().toLowerCase();

const WILAYA_ALIASES = new Map<string, string>([["algiers", "Alger"]]);

export const normalizeWilayaName = (value: unknown) => {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return "";

  const key = normalizeKey(rawValue);
  const alias = WILAYA_ALIASES.get(key);
  if (alias) return alias;

  return (
    ALGERIA_WILAYAS.find((wilaya) => normalizeKey(wilaya.name) === key)
      ?.name ?? ""
  );
};

export const isValidWilaya = (value: unknown) =>
  Boolean(normalizeWilayaName(value));

export const ALGERIA_LOCATIONS = ALGERIA_WILAYAS.map((wilaya) => ({
  city: wilaya.name,
  communes: [] as string[],
}));
