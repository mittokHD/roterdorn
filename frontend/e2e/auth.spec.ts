import { test, expect } from "@playwright/test";

// ─── Test credentials (set via environment or use fixed test user) ────────────
const TEST_USER = {
  identifier: process.env.E2E_USER_EMAIL ?? "test@roterdorn.de",
  password: process.env.E2E_USER_PASSWORD ?? "testpassword123",
};

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state: logged out
    await page.context().clearCookies();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Anmelden" })).toBeVisible();
    await expect(page.getByLabel(/E-Mail oder Benutzername/i)).toBeVisible();
    await expect(page.getByLabel(/Passwort/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Anmelden/i })).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/E-Mail oder Benutzername/i).fill("wrong@email.de");
    await page.getByLabel(/Passwort/i).fill("wrongpassword");
    await page.getByRole("button", { name: /Anmelden/i }).click();

    await expect(page.locator(".text-red-400")).toBeVisible({ timeout: 5000 });
  });

  test("shows loading state during submission", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/E-Mail oder Benutzername/i).fill(TEST_USER.identifier);
    await page.getByLabel(/Passwort/i).fill(TEST_USER.password);

    // Intercept to delay response and check loading state
    await page.route("/api/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });

    await page.getByRole("button", { name: /Anmelden/i }).click();
    await expect(page.getByRole("button", { name: /Wird angemeldet/i })).toBeVisible();
  });

  test("successful login redirects to homepage", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/E-Mail oder Benutzername/i).fill(TEST_USER.identifier);
    await page.getByLabel(/Passwort/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /Anmelden/i }).click();

    await page.waitForURL("/", { timeout: 10_000 });
    await expect(page).toHaveURL("/");
  });

  test("rate limit blocks after 10 rapid attempts", async ({ page }) => {
    for (let i = 0; i < 11; i++) {
      await page.goto("/login");
      await page.getByLabel(/E-Mail oder Benutzername/i).fill(`attempt${i}@test.de`);
      await page.getByLabel(/Passwort/i).fill("wrongpass");
      await page.getByRole("button", { name: /Anmelden/i }).click();
      await page.waitForTimeout(100);
    }

    await expect(page.locator(".text-red-400")).toContainText(/Zu viele/i);
  });

  test("registration page renders correctly", async ({ page }) => {
    await page.goto("/registrieren");
    await expect(page.getByRole("heading", { name: "Registrieren" })).toBeVisible();
    await expect(page.getByLabel(/Benutzername/i)).toBeVisible();
    await expect(page.getByLabel(/E-Mail/i)).toBeVisible();
  });
});
