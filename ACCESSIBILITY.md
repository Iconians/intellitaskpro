# Accessibility (a11y)

This project uses the following to improve and check accessibility.

## Linting (a11y rules)

- **ESLint + eslint-plugin-jsx-a11y**  
  Next.js already includes `eslint-plugin-jsx-a11y`. Additional rules are enabled in `eslint.config.mjs` (e.g. `jsx-a11y/anchor-is-valid`, `jsx-a11y/click-events-have-key-events`, `jsx-a11y/heading-has-content`, `jsx-a11y/html-has-lang`, `jsx-a11y/label-has-associated-control`, `jsx-a11y/mouse-events-have-key-events`, `jsx-a11y/no-static-element-interactions`).

- **Run lint**
  - `npm run lint` — Next.js lint (uses the same ESLint config).
  - `npm run lint:eslint` — Run ESLint on `src` with zero warnings allowed.

Fix reported issues (e.g. add `role`, `aria-*`, keyboard handlers, or use semantic HTML) so that `npm run lint` / `npm run lint:eslint` passes.

## Runtime checks (axe)

- **@axe-core/react** (dev, opt-in)  
  In development, axe runs only when **opt-in**: set `NEXT_PUBLIC_A11Y_AXE=1` (or `true`) in `.env.local`. The component is `src/components/a11y/AxeReporter.tsx`, mounted in the root layout. It does not run in production. Opt-in keeps the browser console quiet by default.

- **@axe-core/playwright** (E2E)  
  Playwright tests run axe on key pages (home, login, signup). Run `npm run test:e2e`; any axe violations fail the test and appear in the terminal and HTML report as the list of a11y issues to fix.

- **How to use (browser axe)**
  1. Add `NEXT_PUBLIC_A11Y_AXE=1` to `.env.local`.
  2. Run `npm run dev`, open the app and DevTools (Console).
  3. Navigate around; axe will report violations (and possible fixes) in the console.

Address any violations reported by axe (e.g. contrast, focus order, ARIA, labels) in addition to fixing ESLint a11y warnings.

## Summary

| Tool              | Purpose                    | When / how                          |
|-------------------|----------------------------|-------------------------------------|
| eslint-plugin-jsx-a11y | Static a11y rules in JSX   | `npm run lint` or `npm run lint:eslint` |
| @axe-core/react  | Runtime a11y (axe) in browser | Dev only when `NEXT_PUBLIC_A11Y_AXE=1`; check browser console |
| @axe-core/playwright | E2E a11y (axe) on key pages | `npm run test:e2e`; failures = list of issues to fix |

**Optional env (reduce console noise):**  
- `DEBUG_PRISMA=1` — in development, enables Prisma query logging (off by default).
