# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain
authoritative.

## Share one refresh for published Dashboard Git reads

Extend the Review repository and shared fetch from SEED-428 so every
published Dashboard Git read uses one repository and refresh coordinator per
project. Origin remains authoritative. Open, Refresh, and live observation
share checks of trunk and relevant story branches. Advance the displayed refs
only when their commits are locally readable, and keep detail reads pinned.
When refresh fails, retain the last readable view with its confirmation time
and sync status. Actions that need current state require a successful fresh
check. The
[Board trunk story](seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk)
establishes the shared observation, and the
[published-progress story](seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git)
extends it to branches, records, and Review. The
[Intent](seeds/SEED-434-browse-published-intent-from-local-git.md#browse-published-intent-from-local-git),
[CI](seeds/SEED-435-read-published-ci-inputs-from-local-git.md#read-published-ci-inputs-from-local-git),
and [feedback maintenance](seeds/SEED-436-check-feedback-maintenance-from-local-git.md#check-feedback-maintenance-from-local-git)
stories carry the remaining inventory. Retire this topic once all of those
readers use the shared Git boundary where their scope requires it.

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
