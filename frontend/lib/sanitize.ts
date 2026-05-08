// Server-side HTML sanitizer that removes the most common XSS vectors.
//
// Limitations: Regex-based sanitization is inherently incomplete. This covers
// the main attack vectors for trusted CMS content (admin-authored HTML from Strapi).
// TODO: Replace with `isomorphic-dompurify` + `jsdom` once npm registry is available.

const DANGEROUS_PATTERNS: RegExp[] = [
  // <script> tags and their content
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi,
  // <style> tags (can contain CSS expressions)
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi,
  // Inline event handlers: onclick, onerror, onload, onmouseover, …
  /\s+on[a-z]{2,}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
  // javascript: protocol in href/src/action
  /\b(?:href|src|action|formaction|xlink:href)\s*=\s*["']?\s*javascript:[^"'\s>]*/gi,
  // vbscript: protocol
  /\b(?:href|src)\s*=\s*["']?\s*vbscript:[^"'\s>]*/gi,
  // data: URIs outside of images (data:text/html etc.)
  /\bsrc\s*=\s*["']?\s*data:(?!image\/)[^"'\s>]*/gi,
  // CSS expression() used in old IE
  /expression\s*\(/gi,
  // <iframe>, <object>, <embed>, <applet> — not produced by Strapi WYSIWYG
  /<\s*\/?\s*(?:iframe|object|embed|applet)\b[^>]*>/gi,
];

export function sanitizeHtml(html: string): string {
  return DANGEROUS_PATTERNS.reduce(
    (safe, pattern) => safe.replace(pattern, ""),
    html
  );
}
