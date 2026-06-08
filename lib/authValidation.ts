export const AUTH_EMAIL_MAX_LENGTH = 254;
export const AUTH_NAME_MAX_LENGTH = 80;
export const AUTH_NAME_MIN_LENGTH = 2;
export const AUTH_PASSWORD_MAX_LENGTH = 72;
export const AUTH_PASSWORD_MIN_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const normalizeAuthEmail = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const normalizeAuthName = (value: unknown) => String(value ?? "").trim();

export const isValidAuthEmail = (email: string) =>
  email.length > 0 &&
  email.length <= AUTH_EMAIL_MAX_LENGTH &&
  EMAIL_REGEX.test(email);

export const isValidAuthName = (name: string) =>
  name.length >= AUTH_NAME_MIN_LENGTH && name.length <= AUTH_NAME_MAX_LENGTH;

export const isValidAuthPassword = (password: string) =>
  password.length >= AUTH_PASSWORD_MIN_LENGTH &&
  password.length <= AUTH_PASSWORD_MAX_LENGTH &&
  new TextEncoder().encode(password).length <= AUTH_PASSWORD_MAX_LENGTH;

export const escapeAuthRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
