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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/782-keep-attention-completion-journey-within-timeout/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"34b563d30c4f1fff6a034381262bce312887f37dc630aa597c119b482a333d37","plan":"cffe317bfab61aa85f6b0b8b26047e97eb7d6a62c8aa6254e196390f2589e626"}}
```

**Goal:** Developers can run the attention-completion journey on a busy
development machine and in CI without exhausting the default 30-second case
budget. The shorter cases preserve proof that an installed report stays
available through workspace loss and restart, and that reading the report and
marking the session done have distinct effects.

**Scope:**

- Split `e2e/sessions/agent-completion-attention.spec.ts` at the retained
  unfinished report. One case carries the actual installed report through the
  open Board, the published move to Taken, workspace removal and server
  restart. The other starts with that kind of retained record and exercises
  the real Final report, Mark as read and Mark as done.
- Keep the proof in the existing spec, with less setup and every distinct
  observation accounted for. Reuse existing builders and page objects.
  Keep private setup and observations inside the normal test budget.
- This story edits only the attention spec. The existing backend proof owns
  refused deliveries. The 30-second default, dashboard behavior, shared test
  support and CI job configuration are outside the change.

**Key examples:**

- Under comparable contention to the reported timeout, around load 50 on 16
  logical CPUs, both cases pass inside 30 seconds. Record per-case times
  against the unsplit journey under matched conditions.
- An installed completed-with-attention report returns a receipt with the
  message and Codex session. The store keeps that completion, `doneAt` is
  absent, and the native session receives no interrupt, rename, or new turn. A later
  installed unfinished report returns unfinished and the store keeps that
  message, with `doneAt` still absent. After the workspace directory is
  removed, the installed command still returns a receipt. After the
  dashboard process restarts, the stored receipt is that retained receipt.
- On the next session read, the open Backlog card shows the installed message
  as text with zero script elements, Working, "Unread report: Completed with
  attention", and Mark as read. The later unfinished receipt changes the
  open card to "Unfinished work". A published Take moves the same message to
  the Taken card. A fresh page read after workspace removal and dashboard
  restart still shows it there.
- With an unread unfinished report on a Taken Codex session whose workspace
  is gone, the Final report panel shows only the native report text. The
  reminder and the Mark as read control belong to the card. Mark as read
  clears the button, records `reportRead`, leaves `doneAt` unset, and adds
  no panel control. Mark as done closes the panel, removes the message from
  the story card, sets `doneAt` with no done problem, renames the native
  session, and interrupts its in-progress turn. The Done entry shows Done
  and the new name. The message stays collapsed under "Unfinished work"
  until expanded, and the final report still shows the native report.

**Baseline and prior attempt**

On 22 November 2026 the original case timed out once at 30 seconds during
the quiet completion investigation, with shared completion specs at four
workers and 86 CPU burners (load 52 → 59). The developer chose to split the
case within its existing test budget.

A separate browser-free closure ran in 7.5–11.9 seconds versus 17.7–20.0
seconds for the combined case in a later 46-burner comparison. The
[reverted implementation](https://github.com/terryyin/open-dough/commit/d2c918ddb49aeb962358eb2a30e220e145691047)
grew 245 lines to about 478 across two specs and two new support modules. The
first page slice also reached its active-time limit before proof. Keep the
installed-report handoff to the page in one case and reuse the existing
record builder for the remaining actions.
