// Central SEO config. SITE_URL must be a real production URL — never
// localhost — because it's used to build canonical links, Open Graph URLs,
// robots.txt, and sitemap.xml, all of which are read by crawlers that can't
// resolve a dev-only address. Set the SITE_URL env var in production; this
// fallback exists only so local builds don't crash, and is intentionally
// a placeholder rather than localhost so a misconfigured deploy fails
// loudly (broken-looking URLs) instead of silently pointing at a machine
// Google can never reach.
const rawSiteUrl = process.env.SITE_URL || "https://codequest-mu-one.vercel.app";
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const SITE_NAME = "CodeQuest";
export const DEFAULT_TITLE = "CodeQuest — Social Q&A & Knowledge Sharing Platform";
export const DEFAULT_DESCRIPTION =
  "Ask questions, share knowledge, and connect with developers on CodeQuest — a community-driven Q&A and social platform for programmers.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

/** Builds an absolute, canonical URL for a given site-relative path. */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE_URL}${path}`;
}

/**
 * Strips HTML tags and collapses whitespace so rich-text question/answer/
 * article bodies can be safely used as plain-text meta descriptions.
 * Pure string/regex based (no DOM), so it's safe to call from
 * getServerSideProps as well as the browser.
 */
export function stripHtmlToText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncates text to `maxLength` on a word boundary, adding an ellipsis. */
export function truncate(text: string, maxLength = 160): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}
