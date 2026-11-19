# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain
authoritative.

## Make production code directly testable instead of growing test support

Test support (`dashboard/test-support/` at ~790 files beside ~1,145 production
files, and `Distribution/tests/support/` at ~361 files) may hold **only data
builders (MakeMe) and page objects**, with the rare exception of minimal seam
code strictly forced by a framework limitation. **Adding any new wrapper to test
support is forbidden; every further change outside data builders and page
objects may only remove code from test support** until tests exercise production
code directly instead of testing test code. When a case would otherwise want a
wrapper or wide helper imports, reshape the production seam instead — keep wire
and command adapters thin over strongly typed handlers, and give UI components
narrow typed inputs and shared boundary contracts so specs mount the owning
component rather than `<App />`.

## Plain Vitest for unit tests; Playwright only for E2E

Remove `@playwright/test` completely from `dashboard/frontend-tests/` (and
`dashboard/backend-tests/`), reserving Playwright (`@playwright/test` and its
`Given / When / Then` step style) exclusively for `e2e/`. Run
`dashboard/frontend-tests/` on **plain Vitest with embedded headless Chromium**
(Vitest Browser Mode, as in Doughnut — real Chromium DOM and CSS without
`@playwright/test` imports, `page.route(...)`, `test.step(...)`, or page
objects), deleting `dashboard/frontend.playwright.config.ts`, `.mounted.spec.ts`
split naming, and the dual-runner glue in `scripts/test-frontend.mjs`,
`frontendMounted.mjs`, `frontendOutputs.mjs`, and `frontendSelection.mjs`; move
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
