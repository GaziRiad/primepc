import { Resend } from "resend";

import { formatDZD } from "@/lib/utils";

type OrderEmailItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
};

type OrderEmailCustomer = {
  name: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  commune: string;
  country?: string;
};

type OrderEmailPayload = {
  orderId: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: OrderEmailCustomer;
  notes?: string;
  createdAt: Date;
};

type EmailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY || "");
const RESEND_FROM = process.env.RESEND_FROM || "";
const ADMIN_EMAILS = process.env.ADMIN_EMAILS || "";
const APP_NAME = process.env.APP_NAME || "PRIMEPC";
const APP_URL = process.env.APP_URL || "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "";
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatAddress = (customer: OrderEmailCustomer) => {
  const lines = [customer.street];
  if (customer.apartment) lines.push(customer.apartment);
  lines.push(`${customer.city}, ${customer.commune}`);
  if (customer.country) lines.push(customer.country);
  return lines.filter(Boolean).join(", ");
};

const formatDate = (value: Date) => new Date(value).toLocaleString("fr-DZ");

const formatItemLines = (items: OrderEmailItem[]) =>
  items
    .map((item) => {
      const lineTotal = item.finalPrice * item.quantity;
      return `- ${item.name} x${item.quantity} @ ${formatDZD(
        item.finalPrice,
      )} = ${formatDZD(lineTotal)}`;
    })
    .join("\n");

const formatItemRows = (items: OrderEmailItem[]) =>
  items
    .map((item) => {
      const lineTotal = item.finalPrice * item.quantity;
      return `
        <tr>
          <td style="padding:8px 0;">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0; text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0; text-align:right;">${escapeHtml(
            formatDZD(item.finalPrice),
          )}</td>
          <td style="padding:8px 0; text-align:right;">${escapeHtml(
            formatDZD(lineTotal),
          )}</td>
        </tr>
      `;
    })
    .join("");

const parseRecipients = (value: string | string[]) => {
  const list = Array.isArray(value) ? value : value.split(",");
  return list.map((entry) => entry.trim()).filter(Boolean);
};

const isResendConfigured = () =>
  Boolean(process.env.RESEND_API_KEY && RESEND_FROM);

const sendEmail = async ({ to, subject, text, html }: EmailPayload) => {
  if (!isResendConfigured())
    return { ok: false as const, skipped: true as const };

  const recipients = parseRecipients(to);
  if (!recipients.length) return { ok: false as const, skipped: true as const };

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: recipients,
      subject,
      text,
      html,
    });
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
};

const sendTelegram = async (text: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
};

const buildAdminText = (payload: OrderEmailPayload) => {
  const lines = [
    `New order: ${payload.orderId}`,
    `Customer: ${payload.customer.name}`,
    `Email: ${payload.customer.email}`,
    `Phone: ${payload.customer.phone}`,
    `Address: ${formatAddress(payload.customer)}`,
    `Placed: ${formatDate(payload.createdAt)}`,
    "",
    "Items:",
    formatItemLines(payload.items),
    "",
    `Subtotal: ${formatDZD(payload.subtotal)}`,
    `Shipping: ${payload.shippingFee === 0 ? "Free" : formatDZD(payload.shippingFee)}`,
    `Total: ${formatDZD(payload.total)}`,
  ];

  if (payload.notes) {
    lines.push("", `Notes: ${payload.notes}`);
  }

  return lines.join("\n");
};

const buildAdminHtml = (payload: OrderEmailPayload) => {
  const notes = payload.notes
    ? `<p style="margin:16px 0 0;">Notes: ${escapeHtml(payload.notes)}</p>`
    : "";

  return `
    <div style="font-family:Arial, sans-serif; color:#111;">
      <h2 style="margin:0 0 8px;">New order received</h2>
      <p style="margin:0 0 16px;">Order #${escapeHtml(payload.orderId)}</p>
      <div style="margin-bottom:16px;">
        <strong>Customer</strong><br />
        ${escapeHtml(payload.customer.name)}<br />
        ${escapeHtml(payload.customer.email)}<br />
        ${escapeHtml(payload.customer.phone)}<br />
        ${escapeHtml(formatAddress(payload.customer))}
      </div>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="text-align:left; border-bottom:1px solid #e5e7eb;">
            <th style="padding:8px 0;">Item</th>
            <th style="padding:8px 0; text-align:center;">Qty</th>
            <th style="padding:8px 0; text-align:right;">Unit</th>
            <th style="padding:8px 0; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${formatItemRows(payload.items)}
        </tbody>
      </table>
      <div style="margin-top:16px; text-align:right;">
        <div>Subtotal: ${escapeHtml(formatDZD(payload.subtotal))}</div>
        <div>Shipping: ${payload.shippingFee === 0 ? "Free" : escapeHtml(formatDZD(payload.shippingFee))}</div>
        <div style="font-size:16px; font-weight:700;">Total: ${escapeHtml(formatDZD(payload.total))}</div>
      </div>
      ${notes}
    </div>
  `;
};

const buildCustomerText = (payload: OrderEmailPayload) => {
  const lines = [
    `Thanks for your order with ${APP_NAME}!`,
    `Order #${payload.orderId}`,
    `Placed: ${formatDate(payload.createdAt)}`,
    "",
    "Items:",
    formatItemLines(payload.items),
    "",
    `Subtotal: ${formatDZD(payload.subtotal)}`,
    `Shipping: ${payload.shippingFee === 0 ? "Free" : formatDZD(payload.shippingFee)}`,
    `Total: ${formatDZD(payload.total)}`,
    "",
    `Shipping to: ${formatAddress(payload.customer)}`,
  ];

  if (payload.notes) {
    lines.push("", `Notes: ${payload.notes}`);
  }

  if (SUPPORT_EMAIL || SUPPORT_PHONE) {
    lines.push("", "Need help?");
    if (SUPPORT_EMAIL) lines.push(`Email: ${SUPPORT_EMAIL}`);
    if (SUPPORT_PHONE) lines.push(`Phone: ${SUPPORT_PHONE}`);
  }

  if (APP_URL) {
    lines.push("", `Visit: ${APP_URL}`);
  }

  return lines.join("\n");
};

const buildCustomerHtml = (payload: OrderEmailPayload) => {
  const supportLine =
    SUPPORT_EMAIL || SUPPORT_PHONE
      ? `<p style="margin:16px 0 0;">Need help? ${
          SUPPORT_EMAIL ? `Email: ${escapeHtml(SUPPORT_EMAIL)} ` : ""
        }${SUPPORT_PHONE ? `Phone: ${escapeHtml(SUPPORT_PHONE)}` : ""}</p>`
      : "";

  const notes = payload.notes
    ? `<p style="margin:16px 0 0;">Notes: ${escapeHtml(payload.notes)}</p>`
    : "";

  const siteLink = APP_URL
    ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(
        APP_URL,
      )}">Visit ${escapeHtml(APP_NAME)}</a></p>`
    : "";

  return `
    <div style="font-family:Arial, sans-serif; color:#111;">
      <h2 style="margin:0 0 8px;">Thanks for your order!</h2>
      <p style="margin:0 0 16px;">Order #${escapeHtml(payload.orderId)}</p>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="text-align:left; border-bottom:1px solid #e5e7eb;">
            <th style="padding:8px 0;">Item</th>
            <th style="padding:8px 0; text-align:center;">Qty</th>
            <th style="padding:8px 0; text-align:right;">Unit</th>
            <th style="padding:8px 0; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${formatItemRows(payload.items)}
        </tbody>
      </table>
      <div style="margin-top:16px; text-align:right;">
        <div>Subtotal: ${escapeHtml(formatDZD(payload.subtotal))}</div>
        <div>Shipping: ${payload.shippingFee === 0 ? "Free" : escapeHtml(formatDZD(payload.shippingFee))}</div>
        <div style="font-size:16px; font-weight:700;">Total: ${escapeHtml(formatDZD(payload.total))}</div>
      </div>
      <p style="margin:16px 0 0;">Shipping to: ${escapeHtml(
        formatAddress(payload.customer),
      )}</p>
      ${notes}
      ${supportLine}
      ${siteLink}
    </div>
  `;
};

export const sendAdminOrderNotification = async (
  payload: OrderEmailPayload,
) => {
  const text = buildAdminText(payload);
  const html = buildAdminHtml(payload);
  const adminRecipients = parseRecipients(ADMIN_EMAILS);

  await Promise.allSettled([
    sendTelegram(text),
    adminRecipients.length
      ? sendEmail({
          to: adminRecipients,
          subject: `New order #${payload.orderId}`,
          text,
          html,
        })
      : Promise.resolve({ ok: false as const, skipped: true as const }),
  ]);
};

export const sendCustomerOrderConfirmation = async (
  payload: OrderEmailPayload,
) => {
  if (!payload.customer.email) return;

  const subject = `Thanks for your order #${payload.orderId}`;
  const text = buildCustomerText(payload);
  const html = buildCustomerHtml(payload);

  await sendEmail({ to: payload.customer.email, subject, text, html });
};

export const sendWelcomeEmail = async (payload: {
  email: string;
  name?: string | null;
}) => {
  const email = payload.email?.trim();
  if (!email) return;

  const firstName = payload.name ? payload.name.trim().split(" ")[0] : "there";
  const subject = `Welcome to ${APP_NAME}!`;

  const text = [
    `Hi ${firstName},`,
    "",
    `Welcome to ${APP_NAME}. We're excited to have you here.`,
    APP_URL ? `Visit us: ${APP_URL}` : "",
    SUPPORT_EMAIL ? `Support: ${SUPPORT_EMAIL}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial, sans-serif; color:#111;">
      <h2 style="margin:0 0 8px;">Welcome to ${escapeHtml(APP_NAME)}!</h2>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
      <p>We are excited to have you here.</p>
      ${
        APP_URL
          ? `<p><a href="${escapeHtml(APP_URL)}">Visit ${escapeHtml(
              APP_NAME,
            )}</a></p>`
          : ""
      }
      ${SUPPORT_EMAIL ? `<p>Support: ${escapeHtml(SUPPORT_EMAIL)}</p>` : ""}
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};
