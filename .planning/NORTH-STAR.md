# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain
authoritative.

## Read published comparisons from the Review repository

After [Review published changes](https://github.com/terryyin/open-dough/blob/d0489607774ee6a3dd2c69b3fd5e0409288e68ab/.planning/seeds/SEED-427-review-published-changes.md#review-published-changes),
move every published code review read to one dashboard-managed bare Review
repository per project. Origin supplies the published history. Share bounded
fetches per project and serve file lists, diffs, and source from local Git. Resolve
each comparison from published evidence and reuse its exact endpoints and file
list across Review changes and Intent. Refresh can advance the comparison. If
origin is unavailable, keep the last readable comparison with its sync status.

Review works independently of the execution checkout. Retire the superseded
review routes and helpers once their callers use the Review repository. Remove
this topic at wrap-up of
[Read published reviews from the Review repository](seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)
once the new path and its proof are in place. The durable repository roles are
defined in [ADR 0008](../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships).

## Make production code directly testable instead of growing test support

Test support (`dashboard/test-support/` at ~790 files beside ~1,145 production
files, and `Distribution/tests/support/` at ~361 files) may hold **only data
builders (MakeMe) and page objects**, with the rare exception of minimal seam
code strictly forced by a framework limitation. **Adding any new wrapper to test
support is forbidden; every further change outside data builders and page
objects may only remove code from test support** until tests exercise production
code directly. Count setup and support when judging the cost of a test. Keep
the case's inputs and expected outcomes visible.

When a case would need a wrapper or wide helper imports, reshape the production
seam while preserving behavior. Keep wire and command adapters thin over
strongly typed handlers. Give UI components narrow typed inputs and shared
boundary contracts so specs mount the owning component.

## Act as soon as the page allows

UI tests act as the reader does: render and deliver input as soon as the page
allows it, and wait only for what the action changes through retrying
assertions, as
[Which entry a case uses](../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
describes. New cases act directly. Remove the remaining React `act` wrapping
as its test families move.

## Plain Vitest for unit tests; Playwright only for E2E

Remove `@playwright/test` completely from `dashboard/frontend-tests/` (and
`dashboard/backend-tests/`), reserving Playwright (`@playwright/test` and its
`Given / When / Then` step style) exclusively for `e2e/`. Run
`dashboard/frontend-tests/` on **plain Vitest with embedded headless Chromium**
(Vitest Browser Mode, as in Doughnut — real Chromium DOM and CSS without
`@playwright/test` imports, `page.route(...)`, `test.step(...)`, or page
objects), deleting `dashboard/frontend.playwright.config.ts` and the
dual-runner glue in `scripts/test-frontend.mjs`,
`scripts/dashboard-group-run.mjs`, `scripts/retained-playwright.mjs`, `groupVitest.mjs`, `groupOutputs.mjs`, and `groupSelection.mjs`; move
any true multi-service or full-reload straggler to `e2e/` (or drop duplicates)
rather than retaining Playwright in `frontend-tests/`. Run
`dashboard/backend-tests/` on plain Vitest in Node, deleting
`dashboard/backend.playwright.config.ts`.

Applies to all upcoming dashboard (`dashboard/server/`, `dashboard/src/`,
`dashboard/*-tests/`, `dashboard/test-support/`), distribution (`Distribution/`),
test-optimization, and refactoring work, under
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and the installed
[test boundary rule](../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary).
