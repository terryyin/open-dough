---
id: SEED-341
status: active
planted: 2026-11-13
planted_during: Terry reviewed the session tests SEED-300 changed and asked for shorter cases and cheaper proof
trigger_when: Session test cases read long, loop over case tables, or prove pure reading rules end to end
scope: story
---

# SEED-341 — Short session tests with proof at the cheapest tier

## Parent goal and scope

Terry reviewed the session-related dashboard tests that
[Express session discovery and report test intent through page objects](https://github.com/terryyin/open-dough/blob/891a05400ffabebbe64505d67561c0a6e20afd42/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects) changed and found
them verbose: long cases, loops over case tables outside and inside tests, and
long comments explaining what the code already says. A developer reading a
session test should see only the facts that matter to its case. MakeMe
builders supply defaults for everything else.

Most session tests began as full-app or end-to-end browser journeys. Under the installed
[shared test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary)
and the [Architectural North Star](../NORTH-STAR.md), behavior one service can
prove belongs in plain Vitest unit tests that exercise production code
directly: backend session cases run in plain Node Vitest calling strongly typed
handlers in `dashboard/server/` (testing the raw wire only when wire behavior
itself is under test), and frontend session UI cases use Vitest browser mode
to mount the smallest rendered component or view that owns the interaction.
Supply narrow typed inputs or shared contracts and keep controls beside the
specs. Test support holds only MakeMe data builders and `e2e/` page
objects — add zero wrappers and only remove session `test-support` wrappers as
production seams become directly testable. A few end-to-end journeys remain in
`e2e/` (`@playwright/test`) for what only the integrated page shows: pace,
placement, persistence across restarts and reloads, and no unintended reads.

Preserve every distinct behavior check at some tier. Remove an end-to-end
variant only when a cheaper test proves the same rule and a remaining journey
still proves the integration. No dashboard behavior changes.

<a id="simplify-remaining-session-tests"></a>

### Simplify the remaining session tests

**Identity:** SEED-341#simplify-remaining-session-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Simplify the session families across `e2e/sessions/`,
`dashboard/frontend-tests/sessions/`, and `dashboard/backend-tests/sessions/`:
sidebar reading and navigation, Recently done selection and paging, final
reports and touch, workspace retirement, completion reporting, and Running
Cursor. Remove case-table loops, shorten cases through clean production seams
and MakeMe defaults while retiring session `test-support` wrappers and
whole-app substitutes, and move single-service session behavior to strongly
typed backend handler tests or narrow owning UI component mounts while keeping
a few representative end-to-end journeys. Apply the
[production testability rule](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
to each family. For example, the Recently done paging view should render
from its typed page data and paging actions without setting up host discovery.

Use the [Project Intent revision family](SEED-413-renovate-dashboard-unit-tests.md#project-intent-revision-family-example)
as the frontend example. Mount the session view with the real state owner when
reopening or switching scopes is the behavior. Keep integrated navigation in
a representative E2E journey, and check that an existing test proves the same
recovery before cutting it from a longer case.

#### Starting evidence

On 2026-11-13 the 112 session specs averaged 60 lines per case. The longest
cases (150–206 lines) are in `agent-launch-codex-observation`,
`agent-completion-quiet`, `agent-completion-attention`,
`agent-launch-recent-delete`, `recently-done-sessions-select-ad-hoc`,
`session-attribution`, `sessions-sidebar`, `session-management-touch`,
`recently-done-sessions-sidebar` and `recently-done-sessions-sidebar-paging`.
Existing browser-free rule tests beside `session-reading-rule.spec.ts` in
`dashboard/backend-tests/sessions/` show the receiving tier for pure rules.
Refinement should split this into stories small enough to finish quickly.

Since SEED-334 (`64f15182b`) and its finish-dissolving half, session families
no longer sit under interim Integrated UI Test: `dashboard/tests/sessions/`
holds no product specs. Representative workflows live in E2E Test
(`e2e/sessions/`, `npm run test:e2e`); detailed UI lives in Dashboard Frontend
Test (`dashboard/frontend-tests/sessions/`, `npm run test:dashboard:frontend`);
backend contracts remain under `dashboard/backend-tests/sessions/`. The sibling
retirement story still owns Intent and navigation under the interim runner.
Refinement should target the FE/E2E/Backend homes above rather than the emptied
interim folder, and settle overlap with any remaining cheapening of those
homes before work starts.

<a id="keep-attention-completion-journey-within-timeout"></a>

### Keep the attention completion journey within its timeout under load

**Identity:** SEED-341#keep-attention-completion-journey-within-timeout
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Developers get the same `agent-completion-attention` result locally
and in CI whatever the machine load, so a red run names a real regression.
Its case finishes inside the default 30 s test timeout.

**Scope:** The single journey in `e2e/sessions/agent-completion-attention.spec.ts`
("installed attention report stays open, durable and readable through column
change, retirement, restart, Mark as read and Mark as done"). It has the same
shape of serial work as the quiet completion journey: a real launch, an
installed closure and reporting, then page phases. Keep every observation at
some owner, keep the default timeout and add no override. No dashboard
behavior changes. Refinement decides the split. The completed quiet
completion split is a model to reuse.
`agent-completion-quiet-done.spec.ts` reads a record composed through
`retainedReport.ts` `retained()` plus a recent MakeMe completion receipt.
`agent-completion-quiet.spec.ts` keeps the installed closure and reporting
without the `page` fixture. Under 40 burners (load 40–71) its cases took
27% less time than before. `DEBUG=pw:browser` shows whether a worker
launched a browser.

**Starting evidence:** On 22 November 2026, during the preparation
observations for the quiet completion split, the case timed out at 30 s once
under 86 CPU burners plus the four sibling completion specs on
`--workers 4` (load 52 → 59).
