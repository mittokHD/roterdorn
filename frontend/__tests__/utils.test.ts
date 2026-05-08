import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort, readingTime } from "@/lib/utils";

describe("formatDate", () => {
  it("formats ISO date to German long form", () => {
    expect(formatDate("2026-05-08T00:00:00.000Z")).toMatch(/8\. Mai 2026/);
  });

  it("accepts custom Intl options", () => {
    const result = formatDate("2026-01-01T00:00:00.000Z", { year: "numeric" });
    expect(result).toBe("2026");
  });
});

describe("formatDateShort", () => {
  it("produces a short date string", () => {
    const result = formatDateShort("2026-05-08T00:00:00.000Z");
    expect(result).toMatch(/2026/);
    expect(result.length).toBeLessThan(16);
  });
});

describe("readingTime", () => {
  it("returns at least 1 minute for very short text", () => {
    expect(readingTime("Hello world")).toBe(1);
  });

  it("calculates 2 minutes for ~400 words", () => {
    const text = Array(400).fill("word").join(" ");
    expect(readingTime(text)).toBe(2);
  });

  it("strips HTML tags before counting words", () => {
    const html = `<p>${Array(200).fill("word").join(" ")}</p>`;
    expect(readingTime(html)).toBe(1);
  });

  it("handles empty string gracefully", () => {
    expect(readingTime("")).toBe(1);
  });
});
