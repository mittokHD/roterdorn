import { test, expect, Page } from "@playwright/test";

const TEST_USER = {
  identifier: process.env.E2E_USER_EMAIL ?? "test@roterdorn.de",
  password: process.env.E2E_USER_PASSWORD ?? "testpassword123",
};

async function loginAs(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/E-Mail oder Benutzername/i).fill(TEST_USER.identifier);
  await page.getByLabel(/Passwort/i).fill(TEST_USER.password);
  await page.getByRole("button", { name: /Anmelden/i }).click();
  await page.waitForURL("/", { timeout: 10_000 });
}

test.describe("Comment System", () => {
  test("shows login prompt when not authenticated", async ({ page }) => {
    // Navigate to the first available review
    await page.goto("/buch");
    const firstCard = page.locator("a[href*='/buch/']").first();
    await firstCard.click();

    await page.waitForLoadState("networkidle");

    // CommentGate should show login prompt, not the form
    await expect(page.getByText(/anmelden/i).first()).toBeVisible();
  });

  test("shows comment form when authenticated", async ({ page }) => {
    await loginAs(page);

    await page.goto("/buch");
    const firstCard = page.locator("a[href*='/buch/']").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("textarea")).toBeVisible({ timeout: 5000 });
  });

  test("rejects comment shorter than 3 characters", async ({ page }) => {
    await loginAs(page);

    await page.goto("/buch");
    await page.locator("a[href*='/buch/']").first().click();
    await page.waitForLoadState("networkidle");

    await page.locator("textarea").fill("Hi");
    await page.getByRole("button", { name: /Kommentar senden/i }).click();

    await expect(page.getByText(/mindestens 3 Zeichen/i)).toBeVisible({ timeout: 5000 });
  });

  test("successful comment submission shows confirmation", async ({ page }) => {
    await loginAs(page);

    await page.goto("/buch");
    await page.locator("a[href*='/buch/']").first().click();
    await page.waitForLoadState("networkidle");

    await page.locator("textarea").fill("Das ist ein Testkommentar für den E2E-Test.");
    await page.getByRole("button", { name: /Kommentar senden/i }).click();

    // After submission, success message should appear
    await expect(
      page.getByText(/Danke|erfolgreich|gesendet/i)
    ).toBeVisible({ timeout: 8000 });
  });
});

test.describe("Navigation & SEO", () => {
  test("home page loads with reviews", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    // At least one review card should be visible
    await expect(page.locator("article, [data-testid='review-card']").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("category pages render correctly", async ({ page }) => {
    for (const slug of ["buch", "film", "spiel", "musik", "event"]) {
      await page.goto(`/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("review detail page has correct JSON-LD", async ({ page }) => {
    await page.goto("/buch");
    const firstCard = page.locator("a[href*='/buch/']").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    const jsonLd = await page.$eval(
      'script[type="application/ld+json"]',
      (el) => JSON.parse(el.textContent || "{}")
    );

    expect(jsonLd["@type"]).toBe("Review");
    expect(jsonLd["@context"]).toBe("https://schema.org");
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    const response = await page.goto("/buch/this-slug-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
  });
});
