# E2E tests (Playwright)

Tests run in Chromium, Firefox, and WebKit and include **accessibility (axe)** checks on home, login, and signup. They produce:

- **Terminal**: list of passed/failed tests (what needs fixing).
- **HTML report**: `playwright-report/` — open with `npm run test:e2e:report`.

## Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all tests (starts dev server if needed). |
| `npm run test:e2e:ui` | Run tests in Playwright UI. |
| `npm run test:e2e:report` | Open last HTML report. |
| `npm run test:e2e:list` | Run with list reporter only (CI-friendly). |

## First-time setup

```bash
npm install
npx playwright install
```

Then run `npm run test:e2e`. Failures in the terminal and in the HTML report are the list of what needs to be fixed.

If you see "localhost:3000 is already used", either stop the process on port 3000 and run `npm run test:e2e` again (Playwright will start the app), or keep your dev server running and run the tests — Playwright will reuse it.
