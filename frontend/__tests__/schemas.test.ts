import { describe, it, expect } from "vitest";
import { parseComment, parseLogin, parseRegister } from "@/lib/schemas";

describe("parseComment", () => {
  it("accepts valid input", () => {
    const result = parseComment({ text: "Super Rezension!", rezensionId: "abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("Super Rezension!");
      expect(result.data.rezensionId).toBe("abc123");
    }
  });

  it("rejects text shorter than 3 characters", () => {
    const result = parseComment({ text: "Hi", rezensionId: "abc123" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors[0].field).toBe("text");
  });

  it("rejects text longer than 1000 characters", () => {
    const result = parseComment({ text: "x".repeat(1001), rezensionId: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects missing rezensionId", () => {
    const result = parseComment({ text: "Guter Artikel" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors[0].field).toBe("rezensionId");
  });

  it("trims whitespace from text", () => {
    const result = parseComment({ text: "  Guter Text  ", rezensionId: "xyz" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.text).toBe("Guter Text");
  });

  it("returns false for non-object body", () => {
    expect(parseComment(null).success).toBe(false);
    expect(parseComment("string").success).toBe(false);
  });
});

describe("parseLogin", () => {
  it("accepts valid credentials", () => {
    const result = parseLogin({ identifier: "user@test.de", password: "secret1" });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = parseLogin({ identifier: "user@test.de", password: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("parseRegister", () => {
  it("accepts valid registration data", () => {
    const result = parseRegister({ username: "testuser", email: "x@y.de", password: "secret1" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = parseRegister({ username: "testuser", email: "not-an-email", password: "secret1" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors[0].field).toBe("email");
  });

  it("lowercases email on success", () => {
    const result = parseRegister({ username: "user", email: "TEST@EXAMPLE.DE", password: "secret1" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("test@example.de");
  });
});
