import { Resend } from "resend";

import { formatDZD, SOCIAL_LINKS } from "@/lib/utils";

type OrderEmailItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  coverImage?: string;
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

const BRAND_PRIMARY = "#1847B7";
const BRAND_DARK = "#1F2937";
const BRAND_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";
const BG_SOFT = "#F6F7F9";

const SITE_URL = APP_URL ? APP_URL.replace(/\/$/, "") : "";
const LOGO_URL = SITE_URL ? `${SITE_URL}/logo.png` : "";
const PRODUCTS_URL = SITE_URL ? `${SITE_URL}/products` : "";

const SOCIALS = SOCIAL_LINKS.filter((link) => link.href);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (!SITE_URL) return "";
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const formatAddress = (customer: OrderEmailCustomer) => {
  const lines = [customer.street];
  if (customer.apartment) lines.push(customer.apartment);
  lines.push(`${customer.city}, ${customer.commune}`);
  if (customer.country) lines.push(customer.country);
  return lines.filter(Boolean).join(", ");
};

const formatDateLong = (value: Date) =>
  new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatDateTime = (value: Date) =>
  new Date(value).toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatItemLines = (items: OrderEmailItem[]) =>
  items
    .map((item) => {
      const lineTotal = item.finalPrice * item.quantity;
      return `- ${item.name} x${item.quantity} @ ${formatDZD(
        item.finalPrice,
      )} = ${formatDZD(lineTotal)}`;
    })
    .join("\n");

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

const buildLogoHtml = () => {
  if (!LOGO_URL) {
    return `<div style="font-size:18px;font-weight:700;color:${BRAND_PRIMARY};">${escapeHtml(APP_NAME)}</div>`;
  }

  return `
    <img src="${LOGO_URL}" alt="${escapeHtml(APP_NAME)}" height="36" style="display:block;border:0;outline:none;" />
  `;
};

const buildSocialLinks = () => {
  if (!SOCIALS.length) return "";

  const links = SOCIALS.map(
    (link) =>
      `<a href="${escapeHtml(link.href)}" style="color:${BRAND_PRIMARY};text-decoration:none;">${escapeHtml(link.label)}</a>`,
  ).join(" · ");

  return `<div style="margin-top:8px;">Suivez-nous : ${links}</div>`;
};

const buildFooter = () => {
  const contactParts: string[] = [];
  if (SUPPORT_EMAIL) contactParts.push(escapeHtml(SUPPORT_EMAIL));
  if (SUPPORT_PHONE) contactParts.push(escapeHtml(SUPPORT_PHONE));

  const contactLine = contactParts.length
    ? `Contact : ${contactParts.join(" | ")}`
    : "";
  const siteLine = SITE_URL
    ? `<a href="${escapeHtml(SITE_URL)}" style="color:${BRAND_PRIMARY};text-decoration:none;">${escapeHtml(SITE_URL)}</a>`
    : "";

  return [
    contactLine ? `<div>${contactLine}</div>` : "",
    siteLine ? `<div style="margin-top:6px;">${siteLine}</div>` : "",
    buildSocialLinks(),
    `<div style="margin-top:8px;">${escapeHtml(APP_NAME)} · Email automatique</div>`,
  ]
    .filter(Boolean)
    .join("");
};

const buildEmailShell = (content: string, preheader: string) => `
  <div style="background:${BG_SOFT};padding:28px 12px;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#fff;border:1px solid ${BORDER_COLOR};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px 8px 28px;">
                ${buildLogoHtml()}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px 28px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${BORDER_COLOR};padding:18px 28px;font-size:12px;color:${BRAND_MUTED};">
                ${buildFooter()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

const buildOrderRows = (items: OrderEmailItem[]) =>
  items
    .map((item) => {
      const lineTotal = item.finalPrice * item.quantity;
      const imageUrl = normalizeUrl(item.coverImage);
      const image = imageUrl
        ? `<img src="${imageUrl}" width="44" height="44" style="display:block;border-radius:10px;object-fit:cover;" />`
        : `<div style="width:44px;height:44px;background:#E5E7EB;border-radius:10px;"></div>`;

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER_COLOR};">
            <table role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <td style="vertical-align:top;">${image}</td>
                <td style="padding-left:12px;">
                  <div style="font-size:14px;font-weight:600;color:${BRAND_DARK};">${escapeHtml(
                    item.name,
                  )}</div>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER_COLOR};text-align:center;color:${BRAND_MUTED};">x${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER_COLOR};text-align:right;font-weight:600;color:${BRAND_DARK};">${escapeHtml(
            formatDZD(lineTotal),
          )}</td>
        </tr>
      `;
    })
    .join("");

const buildOrderTable = (items: OrderEmailItem[]) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;border-collapse:collapse;">
    <thead>
      <tr style="text-align:left;border-bottom:1px solid ${BORDER_COLOR};">
        <th style="padding:8px 0;font-size:13px;color:${BRAND_MUTED};font-weight:600;">Produit</th>
        <th style="padding:8px 0;font-size:13px;color:${BRAND_MUTED};font-weight:600;text-align:center;">Quantité</th>
        <th style="padding:8px 0;font-size:13px;color:${BRAND_MUTED};font-weight:600;text-align:right;">Prix</th>
      </tr>
    </thead>
    <tbody>
      ${buildOrderRows(items)}
    </tbody>
  </table>
`;

const buildTotalsTable = (payload: OrderEmailPayload) => {
  const shippingLabel =
    payload.shippingFee === 0
      ? "Livraison offerte"
      : formatDZD(payload.shippingFee);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;border-collapse:collapse;">
      <tr>
        <td style="padding:6px 0;color:${BRAND_MUTED};">Sous-total :</td>
        <td style="padding:6px 0;text-align:right;">${escapeHtml(
          formatDZD(payload.subtotal),
        )}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${BRAND_MUTED};">Expédition · Livraison à domicile :</td>
        <td style="padding:6px 0;text-align:right;">${escapeHtml(shippingLabel)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-weight:700;">Total :</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;">${escapeHtml(
          formatDZD(payload.total),
        )}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${BRAND_MUTED};">Moyen de paiement :</td>
        <td style="padding:6px 0;text-align:right;">Paiement à la livraison</td>
      </tr>
    </table>
  `;
};

const buildAddressBlock = (payload: OrderEmailPayload) => `
  <div style="margin-top:16px;">
    <div style="font-size:15px;font-weight:700;color:${BRAND_DARK};">Adresse de facturation</div>
    <div style="margin-top:6px;color:${BRAND_DARK};">${escapeHtml(
      payload.customer.name,
    )}</div>
    <div style="margin-top:2px;color:${BRAND_DARK};">${escapeHtml(
      formatAddress(payload.customer),
    )}</div>
    <div style="margin-top:2px;color:${BRAND_DARK};">${escapeHtml(
      payload.customer.phone,
    )}</div>
    <div style="margin-top:2px;color:${BRAND_PRIMARY};">${escapeHtml(
      payload.customer.email,
    )}</div>
  </div>
`;

const buildNotesBlock = (notes?: string) =>
  notes
    ? `
      <div style="margin-top:16px;padding:12px;border-left:4px solid ${BRAND_PRIMARY};background:#F0F4FF;border-radius:10px;">
        <strong>Note :</strong> ${escapeHtml(notes)}
      </div>
    `
    : "";

const buildButton = (label: string, href: string) => {
  if (!href) return "";

  return `
    <a
      href="${escapeHtml(href)}"
      style="display:inline-block;margin-top:16px;background:${BRAND_PRIMARY};color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;"
    >
      ${escapeHtml(label)}
    </a>
  `;
};

const buildAdminText = (payload: OrderEmailPayload) => {
  const lines = [
    `Nouvelle commande : ${payload.orderId}`,
    `Client : ${payload.customer.name}`,
    `Email : ${payload.customer.email}`,
    `Téléphone : ${payload.customer.phone}`,
    `Adresse : ${formatAddress(payload.customer)}`,
    `Passée le : ${formatDateTime(payload.createdAt)}`,
    "",
    "Produits :",
    formatItemLines(payload.items),
    "",
    `Sous-total : ${formatDZD(payload.subtotal)}`,
    `Expédition : ${payload.shippingFee === 0 ? "Livraison offerte" : formatDZD(payload.shippingFee)}`,
    `Total : ${formatDZD(payload.total)}`,
    "Moyen de paiement : Paiement à la livraison",
  ];

  if (payload.notes) {
    lines.push("", `Note : ${payload.notes}`);
  }

  return lines.join("\n");
};

const buildAdminHtml = (payload: OrderEmailPayload) => {
  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;color:${BRAND_DARK};">Nouvelle commande reçue</h1>
    <p style="margin:0 0 12px;color:${BRAND_DARK};">Commande n°${escapeHtml(
      payload.orderId,
    )} · ${escapeHtml(formatDateTime(payload.createdAt))}</p>
    <div style="margin-top:12px;padding:14px;border:1px solid ${BORDER_COLOR};border-radius:12px;background:#fff;">
      <strong>Client</strong><br />
      ${escapeHtml(payload.customer.name)}<br />
      ${escapeHtml(payload.customer.email)}<br />
      ${escapeHtml(payload.customer.phone)}<br />
      ${escapeHtml(formatAddress(payload.customer))}
    </div>
    <div style="margin-top:18px;font-size:16px;font-weight:700;color:${BRAND_DARK};">Résumé de la commande</div>
    ${buildOrderTable(payload.items)}
    ${buildTotalsTable(payload)}
    ${buildNotesBlock(payload.notes)}
  `;

  return buildEmailShell(content, `Nouvelle commande ${payload.orderId}`);
};

const buildCustomerText = (payload: OrderEmailPayload) => {
  const lines = [
    `Merci pour votre commande chez ${APP_NAME} !`,
    `Commande n°${payload.orderId} (${formatDateLong(payload.createdAt)})`,
    "",
    "Produits :",
    formatItemLines(payload.items),
    "",
    `Sous-total : ${formatDZD(payload.subtotal)}`,
    `Expédition : ${payload.shippingFee === 0 ? "Livraison offerte" : formatDZD(payload.shippingFee)}`,
    `Total : ${formatDZD(payload.total)}`,
    "Moyen de paiement : Paiement à la livraison",
    "",
    `Adresse de facturation : ${formatAddress(payload.customer)}`,
  ];

  if (payload.notes) {
    lines.push("", `Note : ${payload.notes}`);
  }

  if (SUPPORT_EMAIL || SUPPORT_PHONE) {
    lines.push("", "Besoin d'aide ?");
    if (SUPPORT_EMAIL) lines.push(`Email : ${SUPPORT_EMAIL}`);
    if (SUPPORT_PHONE) lines.push(`Téléphone : ${SUPPORT_PHONE}`);
  }

  if (SITE_URL) {
    lines.push("", `Site : ${SITE_URL}`);
  }

  return lines.join("\n");
};

const buildCustomerHtml = (payload: OrderEmailPayload) => {
  const firstName = payload.customer.name
    ? payload.customer.name.split(" ")[0]
    : "";
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";

  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;color:${BRAND_DARK};">Merci pour votre commande</h1>
    <p style="margin:0 0 10px;color:${BRAND_DARK};">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 14px;color:${BRAND_DARK};">Nous avons bien reçu votre commande, elle est maintenant en cours de traitement.</p>
    <p style="margin:0 0 16px;color:${BRAND_DARK};">Voici un rappel de ce que vous avez commandé :</p>
    <p style="margin:0 0 16px;color:${BRAND_MUTED};">Paiement à la livraison.</p>
    <div style="margin-top:6px;font-size:16px;font-weight:700;color:${BRAND_DARK};">Résumé de la commande</div>
    <div style="margin-top:4px;color:${BRAND_MUTED};">Commande n°${escapeHtml(
      payload.orderId,
    )} (${escapeHtml(formatDateLong(payload.createdAt))})</div>
    ${buildOrderTable(payload.items)}
    ${buildTotalsTable(payload)}
    ${buildAddressBlock(payload)}
    ${buildNotesBlock(payload.notes)}
  `;

  return buildEmailShell(
    content,
    `Merci pour votre commande ${payload.orderId}`,
  );
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
          subject: `Nouvelle commande n°${payload.orderId}`,
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

  const subject = `Merci pour votre commande n°${payload.orderId}`;
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

  const firstName = payload.name ? payload.name.trim().split(" ")[0] : "";
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  const subject = `Bienvenue chez ${APP_NAME} !`;

  const text = [
    greeting,
    "",
    `Bienvenue chez ${APP_NAME}. Nous sommes ravis de vous compter parmi nous.`,
    PRODUCTS_URL ? `Découvrir nos produits : ${PRODUCTS_URL}` : "",
    SUPPORT_EMAIL ? `Support : ${SUPPORT_EMAIL}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;color:${BRAND_DARK};">Bienvenue chez ${escapeHtml(
      APP_NAME,
    )}</h1>
    <p style="margin:0 0 10px;color:${BRAND_DARK};">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 14px;color:${BRAND_DARK};">Merci de nous rejoindre. Chez ${escapeHtml(
      APP_NAME,
    )}, on met tout en place pour vous aider à trouver le setup idéal.</p>
    <div style="margin-top:12px;padding:16px;border:1px solid ${BORDER_COLOR};border-radius:12px;background:#fff;">
      <strong>Ce que vous pouvez attendre :</strong>
      <ul style="margin:10px 0 0;padding-left:18px;color:${BRAND_DARK};font-size:14px;">
        <li>Des arrivages réguliers et des offres exclusives.</li>
        <li>Un support réactif pour toutes vos questions.</li>
        <li>Des mises à jour claires sur vos commandes.</li>
      </ul>
    </div>
    ${buildButton("Découvrir nos produits", PRODUCTS_URL)}
  `;

  const html = buildEmailShell(content, `Bienvenue chez ${APP_NAME}`);

  await sendEmail({ to: email, subject, text, html });
};
