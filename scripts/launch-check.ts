import { config } from "dotenv";

config({ path: ".env.local" });
config();

const errors: string[] = [];
const warnings: string[] = [];

for (const name of ["MONGODB_URI", "AUTH_SECRET"]) {
  if (!process.env[name]?.trim()) errors.push(`${name} is required.`);
}

if ((process.env.AUTH_SECRET?.length ?? 0) < 32) {
  errors.push("AUTH_SECRET must contain at least 32 characters.");
}

for (const name of ["APP_URL", "AUTH_URL", "NEXTAUTH_URL"]) {
  const value = process.env[name]?.trim();
  if (!value) {
    errors.push(`${name} is required for production.`);
    continue;
  }
  if (!value.startsWith("https://")) errors.push(`${name} must use HTTPS.`);
  if (/localhost|127\.0\.0\.1/i.test(value)) {
    errors.push(`${name} still points to a local address.`);
  }
}

if (process.env.RESEND_API_KEY) {
  if (!process.env.RESEND_FROM) errors.push("RESEND_FROM is required.");
  if (!process.env.RESEND_WEBHOOK_SECRET) {
    errors.push("RESEND_WEBHOOK_SECRET is missing; delivery events are hidden.");
  }
}

if (!process.env.RATE_LIMIT_SALT) {
  warnings.push("RATE_LIMIT_SALT is missing; AUTH_SECRET will be used.");
}
if (!process.env.EMAIL_UNSUBSCRIBE_SECRET) {
  warnings.push("EMAIL_UNSUBSCRIBE_SECRET is missing; AUTH_SECRET will be used.");
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("Launch environment check passed.");
