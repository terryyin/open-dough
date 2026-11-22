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

<a id="split-quiet-completion-journey"></a>

### Keep the quiet completion journey within its timeout under load

**Identity:** SEED-341#split-quiet-completion-journey
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/775-split-quiet-completion-journey/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"879cd64643594ebd1b1469b055fd850dc78232d604e5476f8d2cba5e141dfcf6","plan":"3015701ee7900428c399d1a561efe6e6cb4ebc44383f4380df5e0f9e76a60ada"}}
```

**Goal:** Developers get the same `agent-completion-quiet` result locally
and in CI whatever the machine load, so a red run names a real regression.
Each case finishes inside the default 30 s test timeout.

**Scope:**

- Split the journey in `e2e/sessions/agent-completion-quiet.spec.ts` (Land,
  Story Branch Wrap Up and Trunk Wrap Up) into two owners:
  - **Closure and reporting** proves, without a browser page, that the real
    installed closure retires accepted work before quiet reporting, and that
    reporting records the completion: the receipt, `doneAt`, no native
    interruption, the rename after the receipt, the Story Branch failed-write
    retry and duplicate, the Trunk rename refusal and its retry, and the
    kept landing that leaves the story Taken.
  - **Page** proves, from a composed record that is already retired and
    reported, what Recently done shows for a quiet completion.
- Keep every current observation, each at the owner named above. Remove no
  observation unless another test already proves the same rule.
- Keep the default timeout. Add no timeout override.
- Decide whether the parked observer-stop repair beside the diagnosis record
  is kept. Keep it only after one green run that reaches its path.
- Scope limit: no other completion spec (`-attention`, `-cursor`,
  `-execution`, `-quiet-claude`) changes; no dashboard behavior changes.

**Key examples:**

- At load about 50 on 16 cores, each case in both owners passes inside 30 s.
- Story Branch Wrap Up: the first installed report fails to write and its
  retry records the completion; a duplicate report returns the same receipt
  with no native call and no Git.
- Trunk Wrap Up: a refused native rename is recorded as a done problem, the
  entry offers Mark as done, and a retried submission clears the problem
  with exactly one rename.
- A quiet completion's Recently done entry shows Done and "Native session is
  still working", shows no Startup recovery and no attention message, reads
  the native final report "Done.", and still shows Done after a reload.

**Baseline:** On 22 November 2026 at `840788d00` each case did 13–21 s of
serial work (prepared origin, dashboard server, browser, a real launch,
a real installed closure, three reporting runs, a page phase). Every
phase ran 2–3.5 times slower under load; the spec failed 0/3 alone at
load 34 → 49 and passed 9/9 at load 22–38. The developer chose the
journey split over moving fixture cost or overriding the timeout.
Diagnosis record and parked patch:
`3a1ba5ca6:.planning/slice-plans/768-make-launch-proof-orthogonal/diagnosis-agent-completion-quiet-load-timeout.md`
and `diagnosis-agent-completion-quiet-observer-stop.patch` beside it.

<a id="keep-attention-completion-journey-within-timeout"></a>

### Keep the attention completion journey within its timeout under load

**Identity:** SEED-341#keep-attention-completion-journey-within-timeout
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/776-keep-attention-completion-journey-within-timeout/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ffcba45c6828b3d024db7c285a0b2009a27e364eec0aa5ad04bf009f3965720a","plan":"700f5ee20d1364bf669cb03755b4b19823c0b01350fec15087e518605d0588b7"}}
```

**Goal:** Developers get the same `agent-completion-attention` result locally
and in CI whatever the machine load, so a red run names a real regression.
Each case finishes inside the default 30 s test timeout.

**Scope:**

- Split the journey in `e2e/sessions/agent-completion-attention.spec.ts`
  ("installed attention report stays open, durable and readable through
  column change, retirement, restart, Mark as read and Mark as done") into
  two owners, the split the
  [quiet completion journey](#split-quiet-completion-journey) establishes:
  - **Closure and reporting** proves, without a browser page, that the real
    launch's installed attention report records a completion and leaves the
    session open: the receipt and stored completion, no `doneAt`, no native
    steering, a later unfinished report that still leaves `doneAt` unset,
    the installed command still returning a receipt after the workspace is
    removed, and the stored receipt surviving a dashboard restart.
  - **Page** proves, from a composed Codex record that already carries the
    attention completion, what the story card shows. It runs no launch, no
    installed closure, and no installed reporting.
- Keep every current observation, each at the owner named above. Remove no
  observation unless another test already proves the same rule for a Codex
  attention completion.
- Keep the default timeout. Add no timeout override.
- Scope limit: no other completion spec (`-quiet`, `-cursor`, `-execution`,
  `-quiet-claude`) changes; no dashboard behavior changes. Fixture cost stays
  inside the test budget, the lever the quiet journey's developer rejected.
  Refused deliveries stay in
  `dashboard/backend-tests/sessions/agent-completion-identity.spec.ts`.

**Key examples:**

- At load about 50 on 16 cores, each case in both owners passes inside 30 s.
- Installed completed-with-attention: the receipt records the message and
  the Codex session, the store keeps that completion, `doneAt` is absent, and
  the native session receives no interrupt, rename, or new turn. A later
  installed unfinished report returns unfinished and the store keeps that
  message, with `doneAt` still absent. After the workspace directory is
  removed, the installed command still returns a receipt. After the
  dashboard process restarts, the stored receipt is that retained receipt.
- A composed attention completion's story card shows the message as text
  (the script tag is not an element), Working, "Unread report: Completed
  with attention", and Mark as read. After the stored completion is
  unfinished, the open card shows "Unfinished work". When the published
  backlog moves that story from Backlog to Taken, the message is on the
  Taken card, and removing the workspace path does not clear it.
- The final report panel shows the native report and not the reminder, and
  offers no Mark as read. Mark as read clears the button, records
  `reportRead`, leaves `doneAt` unset, and adds no panel control. Mark as
  done closes the panel, removes the message from the story card, sets
  `doneAt` with no done problem, renames the native session, and interrupts
  its in-progress turn. The Done entry shows Done and the new name, and the
  message stays collapsed under "Unfinished work" until expanded; the final
  report is still the native report.

**Baseline:** On 22 November 2026, during the preparation observations for
the quiet completion split, the case timed out at 30 s once under 86 CPU
burners plus the four sibling completion specs on `--workers 4`
(load 52 → 59). The developer had already chosen the journey split over
moving fixture cost or overriding the timeout.
