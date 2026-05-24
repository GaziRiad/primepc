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
const BRAND_PRIMARY = "#1D4ED8";
const BRAND_DARK = "#0F172A";
const BRAND_SOFT = "#EFF6FF";
const BORDER_COLOR = "#E2E8F0";
const BG_SOFT = "#F8FAFC";

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

const buildFooter = () => {
  const supportParts: string[] = [];
  if (SUPPORT_EMAIL) supportParts.push(`Email: ${escapeHtml(SUPPORT_EMAIL)}`);
  if (SUPPORT_PHONE) supportParts.push(`Phone: ${escapeHtml(SUPPORT_PHONE)}`);

  const supportLine = supportParts.length ? supportParts.join(" | ") : "";
  const siteLink = APP_URL
    ? `<a href="${escapeHtml(APP_URL)}" style="color:${BRAND_PRIMARY};text-decoration:none;">${escapeHtml(APP_URL)}</a>`
    : "";

  return [
    supportLine ? `<div>${supportLine}</div>` : "",
    siteLink ? `<div style="margin-top:6px;">${siteLink}</div>` : "",
    `<div style="margin-top:6px;">${escapeHtml(APP_NAME)} automated email.</div>`,
  ]
    .filter(Boolean)
    .join("");
};

const buildActionButton = (label: string, href: string) => {
  if (!href) return "";

  return `
    <a
      href="${escapeHtml(href)}"
      style="display:inline-block;background:${BRAND_PRIMARY};color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;font-size:14px;"
    >
      ${escapeHtml(label)}
    </a>
  `;
};

const buildEmailShell = ({
  title,
  subtitle,
  preheader,
  content,
}: {
  title: string;
  subtitle: string;
  preheader: string;
  content: string;
}) => `
  <div style="background:${BG_SOFT};padding:24px 12px;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#fff;border:1px solid ${BORDER_COLOR};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_PRIMARY};padding:24px;color:#fff;">
                <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.9;">${escapeHtml(APP_NAME)}</div>
                <div style="font-size:24px;font-weight:700;line-height:1.2;margin-top:6px;">${escapeHtml(title)}</div>
                <div style="margin-top:8px;font-size:14px;opacity:0.92;">${escapeHtml(subtitle)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${BORDER_COLOR};padding:16px 24px;font-size:12px;color:#64748B;">
                ${buildFooter()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

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
  const summaryTable = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${BORDER_COLOR};border-radius:12px;">
      <tr>
        <td width="34%" style="padding:12px;border-right:1px solid ${BORDER_COLOR};">
          <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;">Order</div>
          <div style="font-size:16px;font-weight:700;color:${BRAND_DARK};">#${escapeHtml(payload.orderId)}</div>
        </td>
        <td width="33%" style="padding:12px;border-right:1px solid ${BORDER_COLOR};">
          <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;">Placed</div>
          <div style="font-size:14px;font-weight:600;color:${BRAND_DARK};">${escapeHtml(
            formatDate(payload.createdAt),
          )}</div>
        </td>
        <td width="33%" style="padding:12px;">
          <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;">Total</div>
          <div style="font-size:16px;font-weight:700;color:${BRAND_PRIMARY};">${escapeHtml(
            formatDZD(payload.total),
          )}</div>
        </td>
      </tr>
    </table>
  `;

  const customerBlock = `
    <div style="margin-top:16px;padding:16px;background:${BG_SOFT};border:1px solid ${BORDER_COLOR};border-radius:12px;">
      <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.12em;">Customer</div>
      <div style="margin-top:6px;font-size:15px;font-weight:700;color:${BRAND_DARK};">${escapeHtml(
        payload.customer.name,
      )}</div>
      <div style="margin-top:6px;font-size:13px;color:${BRAND_DARK};">${escapeHtml(
        payload.customer.email,
      )}</div>
      <div style="margin-top:4px;font-size:13px;color:${BRAND_DARK};">${escapeHtml(
        payload.customer.phone,
      )}</div>
      <div style="margin-top:4px;font-size:13px;color:${BRAND_DARK};">${escapeHtml(
        formatAddress(payload.customer),
      )}</div>
    </div>
  `;

  const notes = payload.notes
    ? `
      <div style="margin-top:16px;padding:14px;border-left:4px solid ${BRAND_PRIMARY};background:${BRAND_SOFT};border-radius:10px;">
        <strong>Notes</strong><br />
        ${escapeHtml(payload.notes)}
      </div>
    `
    : "";

  const content = `
    ${summaryTable}
    ${customerBlock}
    <div style="margin-top:20px;font-size:13px;color:#64748B;text-transform:uppercase;letter-spacing:0.12em;">Order items</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;border-collapse:collapse;">
      <thead>
        <tr style="text-align:left;border-bottom:1px solid ${BORDER_COLOR};">
          <th style="padding:8px 0;">Item</th>
          <th style="padding:8px 0;text-align:center;">Qty</th>
          <th style="padding:8px 0;text-align:right;">Unit</th>
          <th style="padding:8px 0;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${formatItemRows(payload.items)}
      </tbody>
    </table>
    <div style="margin-top:16px;text-align:right;">
      <div style="color:#64748B;">Subtotal: ${escapeHtml(
        formatDZD(payload.subtotal),
      )}</div>
      <div style="color:#64748B;">Shipping: ${payload.shippingFee === 0 ? "Free" : escapeHtml(formatDZD(payload.shippingFee))}</div>
      <div style="font-size:16px;font-weight:700;color:${BRAND_DARK};">Total: ${escapeHtml(
        formatDZD(payload.total),
      )}</div>
    </div>
    ${notes}
  `;

  return buildEmailShell({
    title: "New order received",
    subtitle: "A fresh order just landed. Review and fulfill it quickly.",
    preheader: `New order ${payload.orderId} from ${payload.customer.name}`,
    content,
  });
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
  const action = APP_URL
    ? `<div style="margin-top:18px;">${buildActionButton(
        "Continue shopping",
        APP_URL,
      )}</div>`
    : "";

  const notes = payload.notes
    ? `
      <div style="margin-top:16px;padding:14px;border-left:4px solid ${BRAND_PRIMARY};background:${BRAND_SOFT};border-radius:10px;">
        <strong>Notes</strong><br />
        ${escapeHtml(payload.notes)}
      </div>
    `
    : "";

  const content = `
    <div style="font-size:15px;color:${BRAND_DARK};">
      Hi ${escapeHtml(payload.customer.name)}, thanks for your order. We are preparing everything now.
    </div>
    <div style="margin-top:16px;padding:16px;background:${BG_SOFT};border:1px solid ${BORDER_COLOR};border-radius:12px;">
      <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.12em;">Order summary</div>
      <div style="margin-top:6px;font-size:15px;font-weight:700;color:${BRAND_DARK};">Order #${escapeHtml(
        payload.orderId,
      )}</div>
      <div style="margin-top:4px;font-size:13px;color:${BRAND_DARK};">Placed ${escapeHtml(
        formatDate(payload.createdAt),
      )}</div>
      <div style="margin-top:6px;font-size:13px;color:${BRAND_DARK};">Ship to ${escapeHtml(
        formatAddress(payload.customer),
      )}</div>
    </div>
    <div style="margin-top:20px;font-size:13px;color:#64748B;text-transform:uppercase;letter-spacing:0.12em;">Items</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;border-collapse:collapse;">
      <thead>
        <tr style="text-align:left;border-bottom:1px solid ${BORDER_COLOR};">
          <th style="padding:8px 0;">Item</th>
          <th style="padding:8px 0;text-align:center;">Qty</th>
          <th style="padding:8px 0;text-align:right;">Unit</th>
          <th style="padding:8px 0;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${formatItemRows(payload.items)}
      </tbody>
    </table>
    <div style="margin-top:16px;text-align:right;">
      <div style="color:#64748B;">Subtotal: ${escapeHtml(
        formatDZD(payload.subtotal),
      )}</div>
      <div style="color:#64748B;">Shipping: ${payload.shippingFee === 0 ? "Free" : escapeHtml(formatDZD(payload.shippingFee))}</div>
      <div style="font-size:16px;font-weight:700;color:${BRAND_DARK};">Total: ${escapeHtml(
        formatDZD(payload.total),
      )}</div>
    </div>
    ${notes}
    ${action}
  `;

  return buildEmailShell({
    title: "Thanks for your order!",
    subtitle: "We are confirming your order and will update you soon.",
    preheader: `Order ${payload.orderId} confirmed`,
    content,
  });
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

  const content = `
    <div style="font-size:15px;color:${BRAND_DARK};">
      Hi ${escapeHtml(firstName)}, welcome to ${escapeHtml(APP_NAME)}.
    </div>
    <div style="margin-top:16px;padding:16px;background:${BG_SOFT};border:1px solid ${BORDER_COLOR};border-radius:12px;">
      <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.12em;">What to expect</div>
      <ul style="margin:10px 0 0;padding-left:18px;color:${BRAND_DARK};font-size:14px;">
        <li>Fresh product drops and exclusive PC deals.</li>
        <li>Fast responses from our support team.</li>
        <li>Order updates as soon as your gear is ready.</li>
      </ul>
    </div>
    ${APP_URL ? `<div style="margin-top:18px;">${buildActionButton("Start shopping", APP_URL)}</div>` : ""}
  `;

  const html = buildEmailShell({
    title: `Welcome to ${APP_NAME}!`,
    subtitle: "Your next setup starts here.",
    preheader: `Welcome to ${APP_NAME}`,
    content,
  });

  await sendEmail({ to: email, subject, text, html });
};
