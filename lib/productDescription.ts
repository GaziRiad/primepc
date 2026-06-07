import sanitizeHtml from "sanitize-html";

const MAX_DESCRIPTION_LENGTH = 100_000;
const ALLOWED_TAGS = ["p", "h3", "strong", "ul", "ol", "li", "br"];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const plainTextToHtml = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => {
      const content = escapeHtml(paragraph.trim()).replace(/\n/g, "<br />");
      return content ? `<p>${content}</p>` : "";
    })
    .filter(Boolean)
    .join("");

export const sanitizeProductDescription = (value: unknown) => {
  const raw = String(value ?? "")
    .trim()
    .slice(0, MAX_DESCRIPTION_LENGTH);

  if (!raw) return "";

  const input = /<\/?[a-z][\s\S]*>/i.test(raw) ? raw : plainTextToHtml(raw);

  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    disallowedTagsMode: "discard",
    transformTags: {
      b: "strong",
      h1: "h3",
      h2: "h3",
      h4: "h3",
      h5: "h3",
      h6: "h3",
    },
  }).trim();
};

export const productDescriptionToPlainText = (value: unknown) => {
  const html = sanitizeProductDescription(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|h3|li)>/gi, " ");

  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};
