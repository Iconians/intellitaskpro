import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility (a11y) tests using axe-core.
 * Failures list violations (WCAG, etc.) that need to be fixed.
 * Run with: npm run test:e2e (or test:e2e:list for CI).
 */
function expectNoA11yViolations(violations: Array<{ id: string; description: string; nodes: unknown }>) {
  const message =
    violations.length > 0
      ? violations
          .map(
            (v) =>
              `[${v.id}] ${v.description}\n  ${Array.isArray(v.nodes) ? v.nodes.length : 0} node(s). See report for details.`
          )
          .join("\n")
      : "";
  expect(violations, message).toEqual([]);
}

test.describe("Accessibility (axe)", () => {
  test("home page has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/home");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expectNoA11yViolations(results.violations);
  });

  test("login page has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expectNoA11yViolations(results.violations);
  });

  test("signup page has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/signup");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expectNoA11yViolations(results.violations);
  });
});
