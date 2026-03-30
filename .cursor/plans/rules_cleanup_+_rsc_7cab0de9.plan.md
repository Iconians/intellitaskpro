---
name: Rules cleanup + RSC
overview: "Revise the rules-aligned codebase cleanup plan to explicitly enforce [.cursor/rules.mdc](.cursor/rules.mdc) **Server vs Client Components** (lines 67–90): default Server Components for `page.tsx`, small client islands, server-side data fetching with props, and minimal client JS—alongside existing size and folder-boundary rules."
todos:
  - id: rules-audit
    content: "Optional hygiene: confirm rules.mdc frontmatter parses; no full rewrite needed"
    status: pending
  - id: split-board-header
    content: "BoardHeader refactor (completed): subcomponents + hooks per 100-line rule"
    status: pending
  - id: split-kanban-board
    content: "Refactor KanbanBoard: useKanbanBoard + presentational pieces; apply SC/CC — interactive leaves client-only"
    status: pending
  - id: split-integration-settings
    content: Refactor IntegrationSettings by provider sections + shared shell; keep static sections server where possible
    status: pending
  - id: split-large-modals
    content: Refactor CreateTaskModal, TagManagerModal, TaskDetailModal; under 100 lines; minimal client surface
    status: pending
  - id: split-lib-email-github-ai
    content: Split lib/email, github-sync*, ai/client by domain (200-line file rule)
    status: pending
  - id: split-app-clients
    content: "Thin app routes: server page.tsx fetches + props to client; move sections to src/components; *-client.tsx = interactivity only per rules 67–90"
    status: pending
  - id: route-vs-shared-boundary
    content: page.tsx / *-client.tsx stay thin; reusable UI in src/components; pages remain Server Components by default
    status: pending
  - id: server-client-verification
    content: "Per touched route: verify no use client on page.tsx; prefer server fetch + props; document rare client-fetch exceptions in code if needed"
    status: pending
isProject: false
---

# Codebase cleanup per rules.mdc (revised with Server vs Client rules)

## New alignment: Server vs Client (rules.mdc 67–90)

These rules sit alongside existing component size limits (100-line components, 200-line files, hooks 100–150 lines) and the **route vs shared UI** boundary.


| Principle                            | What it means for this repo                                                                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**page.tsx` is a Server Component** | No `"use client"` on `page.tsx`. Pages orchestrate: fetch/compose on the server, render client children only where needed.                                                                                        |
| **Prefer Server Components**         | Default new UI to Server Components; add `"use client"` only for interactivity (state, effects, handlers).                                                                                                        |
| **Small client islands**             | Do not grow monolithic `*-client.tsx` files. Split into small client components + hooks under `[src/components/](src/components/)` / `[src/hooks/](src/hooks/)`; keep route files as thin composition.            |
| **Data & rendering**                 | Fetch in Server Components (`page.tsx` or server layouts) when possible; pass data into client components via **props**. Avoid client-side fetching unless necessary (e.g. live updates, user-triggered refetch). |
| **Goal**                             | Less client JS, more server-rendered content for performance and SEO.                                                                                                                                             |


**Relationship to existing plan items:** Phases B–C (UI splits and app shells) should apply the **size/structure** rules *and* this **server/client data flow**. Phase E (API routes) is unchanged: server-only, no UI.

```mermaid
flowchart LR
  pageServer["page.tsx Server Component"]
  fetch["fetch / prisma in server layer"]
  clientIsland["Small Client Components"]
  hooks["Hooks useX"]

  pageServer --> fetch
  fetch -->|"props"| clientIsland
  clientIsland --> hooks
```



---

## Updates to phased execution

### Phase B — Hot-spot UI (unchanged goal, stricter boundary)

When splitting **BoardHeader**, **KanbanBoard**, **IntegrationSettings**, modals:

- Prefer **presentational Server Components** where there is no state/events; wrap only interactive leaves in `"use client"`.
- Keep **React Query / handlers** in hooks; do not use client components as dump-all containers for data fetching if the same data can be loaded in the parent Server Component and passed down.

### Phase C — App router shells (revised)

Applies to `[home/page.tsx](src/app/home/page.tsx)`, `[billing-client.tsx](src/app/(dashboard)`/billing/billing-client.tsx), `[profile-client.tsx](src/app/(dashboard)`/profile/profile-client.tsx), and similar:

- `**page.tsx`**: Server Component — load data here (or via server helpers), pass serializable props to client children.
- `***-client.tsx`**: Only interactivity and wiring; **not** the primary place for initial data load unless unavoidable.
- Move reusable sections to `[src/components/{domain}/](src/components/)` as today, but split so **large static/marketing blocks** can stay server-rendered when extracted (avoid marking entire sections client by default).

### New emphasis — incremental audit (can merge with Phase C PRs)

- For each touched route: confirm **no accidental `"use client"`** on `page.tsx`; confirm **fetch location** (server first).
- Document exceptions briefly in code only if needed (e.g. real-time-only data), not new markdown docs.

### Phases D–F

- **D (lib splits)**, **E (thin API routes)**, **F (verify build/smoke)** — unchanged; they are server-side by nature.

---

## Enforcement table (additions)


| Rule                          | Action                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| Server default for pages      | `page.tsx` without `"use client"`; data fetch on server where feasible                        |
| Client only for interactivity | State/effects/events in small components or hooks                                             |
| Props down                    | Server parents pass data to client children; avoid redundant client fetch                     |
| Existing                      | < 100 lines per component, < 200 lines per file, thin routes, components in `src/components/` |


---

## Success criteria (additions)

- Touched `**page.tsx` files** remain Server Components unless there is a documented exception.
- Initial **data for a route** is loaded on the server when practical, with client components receiving **props**.
- `***-client.tsx`** files trend toward **composition + interactivity**, not bulk data loading and not whole-page client trees.
- Existing criteria retained: components < 100 lines, hooks 100–150 lines, thin API routes, reusable UI under `src/components/`.

---

## What not to do (additions)

- Do **not** add `"use client"` to `page.tsx` for convenience.
- Do **not** duplicate server-fetchable data with client-side `useEffect` fetch without a clear reason.

---

## Todo mapping (merge with existing cleanup)


| Existing todo              | Revision                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `split-app-clients`        | Expand: thin `*-client.tsx` **and** server `page.tsx` fetch + props per rules 67–90                                        |
| `route-vs-shared-boundary` | Keep; add explicit check that **server pages** compose **shared components** without forcing unnecessary client boundaries |
| New (optional standalone)  | **Server/client boundary pass** on dashboard routes touched by Phase C — can be the same PRs as `split-app-clients`        |


Completed items (`rules-audit`, `split-board-header`) stay complete; remaining work (**KanbanBoard**, **IntegrationSettings**, modals, **lib** splits, **app clients**) should apply this revised Phase B/C guidance.