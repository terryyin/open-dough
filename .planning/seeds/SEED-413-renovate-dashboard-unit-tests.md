---
id: SEED-413
status: active
planted: 2026-11-19
planted_during: Terry aligned unit-test entry guidance around strongly typed backend handlers and narrow UI components, set the Architectural North Star to minimize test support, and started the dashboard unit-test renovation campaign
trigger_when: selected from the product backlog after the updated test-boundary release is installed
scope: three stories (one vertical pilot and two renovation epics decomposed by feature folder)
---

# SEED-413 — Renovate dashboard unit tests around directly testable production seams

## Why this matters

`dashboard/backend-tests/` (555 `.spec.ts` files), `dashboard/frontend-tests/`
(302 `.spec.ts` files), and `dashboard/test-support/` (~790 files alongside
~1,145 production files in `dashboard/src/` and `dashboard/server/`) grew
around two expensive entry habits:

- Backend unit specs start or mount HTTP servers (`startDashboardServer`,
  `adHocReview.ts`, `launchStore.ts`) because `dashboard/server/` mixes
  `node:http` (`URL`, `IncomingMessage`, `ServerResponse`) into domain
  admission and selection.
- Frontend unit specs mount `<App />` (`frontendApp.ts`, `mountedDashboard.ts`),
  triggering 8+ background endpoints and requiring whole-app route mini-servers
  (`frontendServiceSubstitutes.ts`, `frontend*Rule.ts`) and Node arrangement
  commands (`SEED-404`'s baseline at
  `986aad0f1:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`
  measured ~29 minutes locally at two workers, against Doughnut's 2,573
  narrow-component cases in 65 seconds).

The released and installed
[test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary),
[architectural thinking guidance](../../.agents/skills/dough-slice-planning/references/architectural-thinking.md),
and [Architectural North Star](../NORTH-STAR.md) establish the target
direction:

- **Test support holds only data builders (MakeMe) and page objects** (plus rare
  minimal seam code strictly forced by a framework limitation); no new wrappers
  may be added to test support, and every change outside data builders and page
  objects only removes from it.
- **Plain Vitest runs unit tests; `@playwright/test` stays in `e2e/` only:**
  `dashboard/frontend-tests/` runs on plain Vitest + embedded headless Chromium
  (retiring `frontend.playwright.config.ts`, `.mounted.spec.ts` split naming,
  and dual-runner glue in `scripts/test-frontend.mjs`), and
  `dashboard/backend-tests/` runs on plain Vitest in Node (retiring
  `backend.playwright.config.ts`).

## Alternatives and decision

Migrating 247 built-app frontend files to whole-`<App />` `mountAnsweredDashboard`
first (`SEED-404`) or piling layered settle helpers onto full-board mounts
(`DD-587`, `a3a734696`) adds test-support machinery and touches the suite
twice. Renovating all 857 unit-test files in one uninterrupted block would
stall product work.

Instead:

1. Run **one small vertical pilot family first** (`Story Notes`, folding in
   `SEED-407`'s ~100 ms/case target at `47cf696e5` without `DD-587`'s settle
   complexity) to prove the shared typed contract pattern between
   `dashboard/src/` and `dashboard/server/`, delete that family's `test-support`
   wrappers, and align `dashboard/backend-tests/README.md`,
   `dashboard/frontend-tests/README.md`, and `.planning/open-dough.json` so all
   subsequent stories follow the new architecture immediately.
2. Decompose **Backend Renovation** and **Frontend Renovation** by feature
   folder when reached, leading each family with its shared typed contract and
   backend handler seam so neither side invents throwaway adapters.

Assume the Open Dough release containing the updated test-boundary and
direct-mapping guidance is already published and installed in this repository;
do not spend story scope re-editing `Distribution/src/`. Judge speed, clarity,
and deleted `test-support` surface together under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="pilot-direct-dashboard-unit-tests"></a>

### Pilot direct backend handler and narrow UI component tests on one dashboard family

**Identity:** SEED-413#pilot-direct-dashboard-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Contributors and agents get one working end-to-end reference
  family (`stories/` Story Notes and `backend-tests/review/story-notes-*`) and
  aligned repository test docs so new dashboard stories stop copying HTTP
  wrappers and `<App />` route substitutes, while Story Notes reaches ~100 ms
  per case (~1.1 s summed across its 11 behaviors, baseline `47cf696e5`) by
  mounting the owning UI surface rather than `<App />`.
- **Evaluation.**
  - `dashboard/src/` and `dashboard/server/` share one typed Story Notes
    contract; the server HTTP route is a thin wire adapter (retaining only a
    focused wire check where wire admission itself is under test), and backend
    Story Notes behavior cases call the typed server handler directly.
  - Frontend Story Notes cases run as plain Vitest + embedded headless Chromium
    specs (no `@playwright/test` imports or `test.step` wrappers), mounting the
    smallest rendered component or view owning the Story Notes interaction with
    narrow typed inputs/contracts and MakeMe data directly (no `<App />` mount,
    no `mountedStoryNotesBoard.ts`, no `frontendStoryNotesRule.ts`, and none of
    `DD-587`'s custom settle-mode flags); any cross-region live-terminal
    coexistence check lives at the minimal container or one E2E check that
    genuinely owns it. The 11 Story Notes behaviors pass in ~1.1 s summed case
    time at two workers.
  - Spent Story Notes `test-support` wrappers are deleted (adding no new
    wrappers), `dashboard/backend-tests/README.md` and
    `dashboard/frontend-tests/README.md` state the plain-Vitest entry rules and
    the test-support freeze, and `.planning/open-dough.json` disables
    `pageObjects` on `dashboard/frontend-tests`.
- **Effort hypothesis.** S–M, high confidence — bounded to one 11-case UI
  family, its backend notes handler, and repository guidance alignment.
- **Safe stopping point.** Even before the remaining folders migrate, every new
  story follows the updated READMEs and copies a clean reference family.

<a id="renovate-dashboard-backend-unit-tests"></a>

### Renovate dashboard backend unit tests around strongly typed server handlers

**Identity:** SEED-413#renovate-dashboard-backend-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing `dashboard/server/` get fast,
  compile-time-checked TypeScript unit tests that call strongly typed domain/API
  handlers directly with MakeMe domain state and real Git/file collaborators,
  without booting HTTP servers or importing multi-helper request plumbing.
- **Evaluation.** Decompose by feature folder (`review/`, `intent/`,
  `sessions/`, `launches/`, `observation/`, `configuration/`, `terminals/`,
  `runtime/` — 555 `.spec.ts` files), starting with `review/` (retiring
  `adHocReview.ts` request plumbing) and `intent/landed-ci` (resolving
  `SEED-324`/`SEED-319` load sensitivity and isolating module-level server
  memos in `followUpStory.ts`, `ciProofArtifact.ts`, `ciAdapterProof.ts`,
  `baseCiGithubRevisionLookup.ts`, and `LandedCiCollection.close()`, recoverable
  at `6c628be4a:.planning/slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md`).
  For each folder:
  - Keep wire transport thin over exported strongly typed handlers sharing one
    typed contract with `dashboard/src/`.
  - Move single-service behavioral specs to plain Node Vitest calling those
    typed handlers directly; retain focused HTTP/SSE/WebSocket specs only where
    wire admission, origin/auth refusal, status, or framing is the behavior
    under test, and retire `dashboard/backend.playwright.config.ts` once the
    last folder leaves `@playwright/test`.
  - Delete retired `dashboard/test-support/` HTTP request/server wrappers
    (adding no new wrappers) and leave no behavioral regression gap.
- **Effort hypothesis.** L across the suite — split into independent per-folder
  stories during refinement so each finishes cleanly within the slice limit.
- **Safe stopping point.** Every completed folder stands on its own with faster
  checks, compile-time contract safety, and fewer `test-support` files.

<a id="renovate-dashboard-frontend-unit-tests"></a>

### Renovate dashboard frontend unit tests around narrow owning components

**Identity:** SEED-413#renovate-dashboard-frontend-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing `dashboard/src/` get Doughnut-speed
  (~1 minute full two-worker run, absorbing `SEED-404`'s goal recoverable at
  `986aad0f1:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`)
  and readable UI unit tests that mount the smallest rendered component or view
  owning the interaction instead of `<App />` and fake backend mini-servers.
- **Evaluation.** Decompose by feature folder (`intent/`, `navigation/`,
  `sessions/`, `launches/`, `review/`, `configuration/`, `terminals/`, top-level,
  and auditing/retiring `test-harness/` — 302 `.spec.ts` files), starting with
  the highest case-second families (`intent/` — absorbing
  `SEED-301#publish-intent-projects-through-makeme` onto narrow typed Intent
  component inputs rather than `putFrontend*` — and `sessions/` alongside
  `SEED-341`). For each folder:
  - Give components narrow typed props or shared typed boundary contracts so
    plain Vitest + headless Chromium specs mount the owning component/view
    directly without `@playwright/test`, `page.route(...)`, or `test.step(...)`
    (mounting an enclosing container only when focus return or cross-child
    coordination is the contract, and moving any true multi-service or
    full-reload straggler to `e2e/` or dropping duplicates).
  - Retire `dashboard/frontend.playwright.config.ts`, `.mounted.spec.ts` split
    naming, dual-runner glue (`scripts/test-frontend.mjs`,
    `frontendMounted.mjs`, `frontendOutputs.mjs`, `frontendSelection.mjs`),
    `frontendApp.ts`, `mountedDashboard.ts`, `frontendServiceSubstitutes.ts`,
    `frontend*Rule.ts`, and `frontend-tests` page-object scaffolding.
- **Effort hypothesis.** L across the suite — split by folder during refinement,
  following each folder's shared typed contract from Backend Renovation where
  coupled.
- **Safe stopping point.** Each migrated folder drops its multi-second `<App />`
  tax and deletes its route-substitute rules independently.
