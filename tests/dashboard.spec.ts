import { test, expect } from "@playwright/test";

test.describe("Dashboard – protected routes redirect", () => {
  const protectedPaths = [
    "/boards",
    "/boards/new",
    "/organizations",
    "/organizations/new",
    "/analytics",
    "/tasks/watching",
    "/audit-logs",
  ];

  for (const path of protectedPaths) {
    test(`${path} redirects to login when not authenticated`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});
