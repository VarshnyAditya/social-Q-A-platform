import DOMPurify from "dompurify";

// The question/answer/article renderers turn a few markdown-style patterns
// (##, ```, `, **, *) into hardcoded HTML strings via regex, then inject
// them with dangerouslySetInnerHTML. That's fine for the parts *we* generate
// — but everything in the original text that ISN'T one of those patterns
// (raw <script>, <img onerror=...>, <svg onload=...>, etc.) was passing
// through completely untouched before landing in the DOM. This strips
// anything outside a small allowlist of the exact tags those renderers are
// meant to produce, so arbitrary HTML/JS in a question, answer, or article
// body can no longer execute.
const ALLOWED_TAGS = ["p", "h2", "h3", "pre", "code", "strong", "em", "br"];
const ALLOWED_ATTR = ["class"];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}