import { test, expect } from "@playwright/test";

test.describe("Smoke – app and landing", () => {
  test("root redirects to /home or /boards", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(home|boards)/);
  });

  test("home page loads and shows marketing content", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveTitle(/AI-Powered|Task|Management/i);
    await expect(
      page.getByRole("heading", { name: /AI-Powered Task/i })
    ).toBeVisible();
    await expect(page.getByText(/Management Made Simple/i)).toBeVisible();
  });

  test("home has Get Started and Sign In links", async ({ page }) => {
    await page.goto("/home");
    await expect(
      page.getByRole("link", { name: /Get Started Free/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Sign In/i })
    ).toBeVisible();
  });

  test("Get Started links to signup", async ({ page }) => {
    await page.goto("/home");
    const link = page.getByRole("link", { name: /Get Started Free/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/signup/);
    await page.goto(href!);
    await expect(page).toHaveURL(/\/signup/);
  });

  test("Sign In links to login", async ({ page }) => {
    await page.goto("/home");
    const link = page.getByRole("link", { name: /Sign In/i }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/login/);
    await page.goto(href!);
    await expect(page).toHaveURL(/\/login/);
  });
});
