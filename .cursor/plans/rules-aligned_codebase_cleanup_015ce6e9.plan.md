---
name: Rules-aligned codebase cleanup
overview: Bring the repo in line with the current [.cursor/rules.mdc](.cursor/rules.mdc) (Next.js 13+/16+ layout, 100-line components, 200-line file cap, lib-as-services) through incremental refactors—no wholesale folder rewrites.
todos:
  - id: rules-audit
    content: "Optional hygiene: confirm rules.mdc frontmatter parses (YAML comments under alwaysApply are valid); no full rewrite needed"
    status: pending
  - id: split-board-header
    content: Refactor BoardHeader.tsx into subcomponents + useBoardHeader hook (100-line rule, 3-responsibility split)
    status: pending
  - id: split-kanban-board
    content: Refactor KanbanBoard.tsx into useKanbanBoard + smaller presentational pieces; extract 30–40+ line functions
    status: pending
  - id: split-integration-settings
    content: Refactor IntegrationSettings.tsx by provider sections + shared shell
    status: pending
  - id: split-large-modals
    content: Refactor CreateTaskModal, TagManagerModal, TaskDetailModal; keep under 100 lines per component where feasible
    status: pending
  - id: split-lib-email-github-ai
    content: Split lib/email.ts, github-sync*, ai/client.ts by domain (200-line file rule; avoid massive util files)
    status: pending
  - id: split-app-clients
    content: Thin app routes—move reusable blocks from home/page, billing-client, profile-client into src/components/* + hooks
    status: pending
  - id: route-vs-shared-boundary
    content: "Apply rule: page.tsx / *-client.tsx stay thin; new reusable UI goes under src/components/{domain}/, not route folders"
    status: pending
isProject: false
---

# Codebase cleanup per rules.mdc (revised)

## Alignment with current rules

`[.cursor/rules.mdc](.cursor/rules.mdc)` now explicitly matches this stack:

- **Routes & pages:** `src/app/`** — layouts, `page.tsx`, thin `*-client.tsx`, `app/api/`** handlers.
- **Shared UI:** `src/components/`** — domain folders (`boards/`, `tasks/`, `kanban/`); single-purpose, **under 100 lines**.
- **Services / backend logic:** `src/lib/`** (optional later `src/server/services/`); **not** fat logic inside route files except thin handlers.
- **Hooks:** `src/hooks/`** — **100–150 lines** max, reusable client logic.

**Important boundary (new in rules):** *Avoid placing reusable components directly in the route folder* — they belong in `src/components/`. Route folders should stay thin orchestrators.

**No longer applicable:** The old plan’s “Phase A: rewrite rules.mdc Project Structure” and “reconcile conflicting `/backend` + components-only-in-app rules” — **rules already describe this repo**. Optional: verify Cursor parses frontmatter (`#` lines after `alwaysApply` are YAML comments, which is valid).

---

## Enforcement targets (from rules)


| Rule                                       | Action                                                |
| ------------------------------------------ | ----------------------------------------------------- |
| Components **< 100 lines**, single-purpose | Split oversized TSX by section + subcomponents        |
| Files **> 200 lines**                      | Refactor (components, lib, or clients)                |
| **30–40 line** functions                   | Break up when touching large handlers                 |
| **3+ responsibilities** in one component   | Split immediately                                     |
| UI vs logic                                | Queries/mutations → hooks; business rules → `src/lib` |
| **300+ line** components (anti-pattern)    | Priority list below                                   |


---

## Largest offenders (priority order)

Approximate line counts — refactor first:

- `[IntegrationSettings.tsx](src/components/integrations/IntegrationSettings.tsx)`
- `[BoardHeader.tsx](src/components/boards/BoardHeader.tsx)`
- `[home/page.tsx](src/app/home/page.tsx)` — extract sections into `src/components/home/` (or similar) per route vs shared rule
- `[KanbanBoard.tsx](src/components/kanban/KanbanBoard.tsx)`
- `[TagManagerModal.tsx](src/components/tags/TagManagerModal.tsx)`
- `[billing-client.tsx](src/app/(dashboard)`/billing/billing-client.tsx)
- `[CreateTaskModal.tsx](src/components/tasks/CreateTaskModal.tsx)`
- `[TaskDetailModal.tsx](src/components/tasks/TaskDetailModal.tsx)`, `[ManageColumnsModal.tsx](src/components/boards/ManageColumnsModal.tsx)`, etc.
- Lib: `[email.ts](src/lib/email.ts)`, `[github-project-sync.ts](src/lib/github-project-sync.ts)`, `[github-sync.ts](src/lib/github-sync.ts)`, `[ai/client.ts](src/lib/ai/client.ts)`

---

## Phased execution (incremental PRs)

### Phase A — Rules / hygiene (optional, small)

- Confirm `rules.mdc` is the source of truth (already Next-aligned). No mandatory rewrite.
- If any tool still complains about `.mdc`, adjust frontmatter only as needed.

### Phase B — Hot-spot UI (several PRs)

Repeatable pattern per file:

1. **Subcomponents** in the same domain folder under `src/components/...` (not under `app/` if reusable).
2. `**useX` hooks** for React Query, local UI state, and handlers — **no** long business logic in JSX files.
3. **Thin container** composes hook + children.
4. When splitting functions inside hooks/lib, apply **30–40 line** guidance.

Apply to **BoardHeader**, **KanbanBoard**, **IntegrationSettings**, **CreateTaskModal**, **TagManagerModal**, **TaskDetailModal** tail sections as needed.

### Phase C — App router shells

- `**home/page.tsx`**, `**billing-client.tsx`**, `**profile-client.tsx**`: keep pages as composition only; move marketing/dashboard/billing sections into `src/components/...` + hooks.
- Matches: *thin client components in app; reusable pieces in components/*.

### Phase D — Large `src/lib` modules (one PR per domain)

- **email:** split by template / product area.
- **GitHub:** split sync vs webhook vs mapping.
- **AI client:** split provider adapters vs shared `generateWithAI` core.

### Phase E — API route handlers

- Audit longest `route.ts` files; delegate to `src/lib` helpers so handlers stay thin (consistent with *avoid server logic in route folder*).

### Phase F — Verification

- After each PR: `bun run build` / CI; smoke-test board, task modals, billing, integrations.
- Optional later: ESLint `max-lines` / complexity — not a blocker for first passes.

---

## What not to do

- Do **not** bulk-move `src/components` into `app/` — rules say reusable UI stays in `src/components/`.
- Do **not** add a separate `/backend` tree; `src/lib` (and optional `src/server/services/`) is the service layer.
- Do **not** add new `.md` docs unless explicitly approved (file creation rule).

---

## Success criteria

- New or refactored **components** trend toward **< 100 lines**; no **300+** line components without a tracked follow-up.
- **Route and `*-client.tsx` files** are mostly composition and wiring.
- Heavy logic in `**src/lib`** (or `src/server/services/` if introduced); **API routes** stay thin.
- **Hooks** stay within **100–150 lines** and single-purpose.

