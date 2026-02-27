import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login page loads and shows form", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /Sign in to your account/i })
    ).toBeVisible();
    await expect(page.getByLabel(/Email address/i)).toBeVisible();
    await expect(page.getByLabel(/^Password$/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sign in/i })
    ).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveURL(/\/signup/);
    await expect(
      page.getByRole("heading", { name: /Create.*account|Sign up|Register/i })
    ).toBeVisible();
  });

  test("unauthenticated /boards redirects to login", async ({ page }) => {
    await page.goto("/boards");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /profile redirects to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /billing redirects to login", async ({ page }) => {
    await page.goto("/billing");
    await expect(page).toHaveURL(/\/login/);
  });
});
