// ─── Pure Utility Functions ──────────────────
// Stateless helper functions used across the app.
// Import from "@/lib/utils" for formatting and text processing.

/**
 * Format an ISO date string for German locale display.
 * @param isoDate - ISO 8601 date string (e.g. "2026-05-08T12:00:00Z")
 * @param options - Intl.DateTimeFormat options (defaults to "8. Mai 2026")
 */
export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string {
  return new Date(isoDate).toLocaleDateString("de-DE", options);
}

/**
 * Format a short date (e.g. "3. Apr. 2026").
 */
export function formatDateShort(isoDate: string): string {
  return formatDate(isoDate, { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Strips HTML tags and calculates estimated reading time in minutes (200 wpm).
 */
export function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
