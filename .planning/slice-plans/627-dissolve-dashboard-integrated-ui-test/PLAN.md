# Dissolve Dashboard Integrated UI Test into E2E and unit tests

**Identity:** SEED-334#focus-detailed-dashboard-ui-checks
**Source:** [Dissolve Dashboard Integrated UI Test into E2E and unit tests](../../seeds/SEED-334-product-wide-end-to-end-tests.md#focus-detailed-dashboard-ui-checks)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Developers keep two dashboard proof layers — end-to-end workflows and
service-level unit checks (Dashboard Frontend Test and Dashboard Backend Test)
— after every distinct behavior still proved by the interim **Dashboard
Integrated UI Test** group has a home there and that interim Intent entry,
runner, CI producer and current tooling references are retired.

Included: convert the remaining interim specs under `dashboard/tests/` by the
migration inventory batches at `125c45649fa587c78ed7445deff35db87604489d`
(starting classification; decide each case by behavior), including the two
specs that inventory never named; preserve assertions that catch regressions;
retire the interim group when the product-case tree is empty; retain shared
helpers under `dashboard/tests/` that remaining groups import.

Excluded: a permanent third browser group; Intent E2E naming / tagged-install
proof (SEED-334#observe-tagged-install-and-read-e2e-proof); SEED-341 session
simplification beyond placement; SEED-300 page-object expressiveness work;
speed or shard-count goals beyond what retirement naturally changes; product
behavior changes; wholesale re-inventory before conversion.

## Existing solutions and direction

Reuse, do not invent a conversion framework:

- **Frontend unit home:** `dashboard/frontend-tests/` with
  `dashboard/tests/support/frontendApp.ts` and
  `frontendServiceSubstitutes.ts` (already 57 specs / 161 listed Chromium
  cases at `c327752a0f385417c74b1a7b3511ebe5d3b450e6`).
- **E2E home:** `e2e/` journeys that already hold the inventory’s former
  e2e-class specs (307 files); extend or join an existing journey when it
  already proves the workflow outcome.
- **Backend home:** `dashboard/backend-tests/` boundary and in-process checks.
- **Placement starting point:** inventory
  `migration-purpose.json` / `migration-conversion-batches.json` /
  `migration-trunk-merge.json` at `125c45649fa587c78ed7445deff35db87604489d`.
- **Roster / CI consumers:** whatever
  [SEED-334#keep-one-browser-test-group-roster](../../seeds/SEED-334-product-wide-end-to-end-tests.md#keep-one-browser-test-group-roster)
  (plan 617) leaves, or today’s hard-coded callers; retirement updates them to
  three groups.

Follow Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(unit + e2e feedback; one representation per solution),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(Proof vs particular results; no fabricated continuity), and
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(existing tests as baseline). No new North Star topic: the two-layer model and
helper ownership under `dashboard/tests/` are already established.

Resolve conventions through
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
[dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md);
`.planning/open-dough.json` selects MakeMe for E2E, interim, Frontend and
Backend roots and page objects for the browser roots that keep them.

## Decisive premises and observations

| Premise and consuming operation | Observation |
| --- | --- |
| Interim tree still holds the conversion work (all conversion slices) | At `c327752a0f385417c74b1a7b3511ebe5d3b450e6`: 271 `dashboard/tests/**/*.spec.ts` (configuration 11, launches 27, sessions 52, terminals 14, review 16, intent 72, navigation 41, stories 31, observation 7). |
| Inventory still covers almost all interim specs (placement) | Same revision: 269 of 271 match `migration-purpose.json` at `125c45649fa587c78ed7445deff35db87604489d` (209 frontend, 59 split, 1 backend pending); e2e-class inventory rows are already absent from the interim tree; uninventoried: `tests/sessions/recently-done-returned-sessions.spec.ts`, `tests/review/story-review-diff-line-follow-up.spec.ts`. |
| Frontend substitute harness is the unit conversion route (slices 1–8) | `npx playwright test --config dashboard/frontend.playwright.config.ts --list --reporter=line` at `c327752a0f385417c74b1a7b3511ebe5d3b450e6` listed 161 Chromium cases under `frontend-tests/` (exit 0). |
| Configuration batch is still the inventory’s first conversion set (slice 1) | `dashboard/tests/configuration/` holds the 11 inventory-named specs; related workflow cases already live under `e2e/configuration/`. |
| Retirement touchpoints exist and are enumerable (slice 9) | Grep at `c327752a0f385417c74b1a7b3511ebe5d3b450e6` for `test:dashboard:integrated` / `dashboard-integrated` / `Dashboard Integrated UI Test` / `integrated.playwright` hits Intent location in `.planning/open-dough.json`, `package.json`, `ci.yml` job `dashboard-integrated`, `dashboard/integrated.playwright.config.ts`, duration lists, runner support, Distribution CI helpers/tests, and placement READMEs. Do not confuse with `integratedStateCompletion` in open-dough.json. |
| Later batch effort fits one execution slice (slices 2–8) | Unsettled until slice 1 records elapsed conversion effort for frontend/small and split/small cases. Slice 1 is the early probe: if measured effort shows a later inventory batch cannot finish as one slice, replan that batch (split by folder or substitute family) before continuing it. |

## Outside-in proof ownership

Each conversion slice (1–8):

1. Every distinct check from that slice’s interim specs runs under
   `npm run test:e2e`, `test:dashboard:frontend`, and/or
   `test:dashboard:backend` as its boundary requires.
2. Those interim files and their `integrated.longest-first*` rows are gone.
3. At least one representative converted case fails a scratch break of the
   asserted rule the same way the prior integrated case did (or an equivalent
   discriminating probe when the case moved to Backend), then passes restored.
4. Focused run of the touched homes passes; no wall-clock sleep, `test.slow()`,
   or suite/file/group/hook timeout overrides.

Retirement slice (9): Intent locations and CI no longer name **Dashboard
Integrated UI Test**; `test:dashboard:integrated` and its Playwright config,
producer, shards and settings prefix are gone; placement guidance and the
browser-group roster (or hard-coded callers) describe three groups; shared
helpers under `dashboard/tests/support/` remain importable; an old integrated
proof artifact from a prior revision stays readable without looking current.
Focused roster/CI declaration tests and `runner-ownership` (three groups) pass.

## Ordered slices

### 1. Convert configuration settings answers
Type: Behavior
Status: done
Proof: configuration interim specs gone; checks live in Frontend and/or E2E per
case; representative Frontend case fails a scratch UI-rule break and passes
restored; record elapsed effort per converted frontend/small and split/small
case as the sizing probe for later batches; focused Frontend/E2E paths for the
touched files pass under `caffeinate -s -i` on AC.

Behavior: pre-condition → the 11 `dashboard/tests/configuration/` interim
specs remain → trigger → convert them using inventory placement, extending
shared settings substitutes as needed → result → each distinct check has a
Frontend or E2E home, interim files and duration rows are removed, and the
story’s configuration example holds.

Accepted proof: 7 Frontend specs under `dashboard/frontend-tests/configuration/`
on the new `dashboard/tests/support/frontendSettingsSubstitutes.ts` (stateful
settings answers with `changes`, `refuseNext`, `holdNext`); E2E homes in
`e2e/configuration/` (`project-add`, `project-hide`, `project-remove`,
`project-remove-selection`, `system-settings-openai`,
`system-settings-terminal-theme`, `system-settings-running-session`). Focused
Frontend configuration 15 passed, unfiltered Frontend 176 passed, focused E2E
configuration passed, `runner-ownership`, `browser-group-shards`,
`dashboard-test-files` and `typecheck:dashboard` passed. Scratch break of
`AddProjectDialog` `aria-describedby` failed the interim and converted
refusal cases with the same `aria-invalid` message; both passed restored.

Sizing learning: 11 small specs took about 14 minutes of conversion and 12 of
verification, about 280k agent tokens. Cost concentrates in a new Frontend
substitute family; once it exists each case takes 1–2 minutes, and E2E moves
are mechanical. Batches needing several new families, or many inventory
`large` cases (launches 11, sessions 21, intent 40, navigation 24, stories
17), exceed one agent slice and are split by folder or substitute family
before delegation.

### 2. Convert launch dialog, model and options
Type: Behavior
Status: done
Proof: same ownership pattern for the 14 launch-dialog specs in
`dashboard/tests/launches/`: `agent-launch-ad-hoc*` (4),
`agent-launch-{codex,cursor}-model`, `agent-launch-model{,-entries}`,
`agent-launch-dialog-{layout,touch}`, `agent-launch-options{,-entries,-exclusive,-kept}`;
split mixed cases; focused runs of touched E2E/Frontend homes.

Behavior: interim launch dialog, model and option detailed and mixed checks →
converted and removed from the interim tree with assertions preserved.

Accepted proof: 12 Frontend specs in `dashboard/frontend-tests/launches/` on
`frontendLaunchSubstitutes.ts` (with shared `frontendSubstituteAnswers.ts`
hold/answer mechanics), 10 new E2E specs in `e2e/launches/` plus the joined
attachments journey; split example `agent-launch-ad-hoc` (E2E argv/cwd and
record; Frontend placement, held read and dialog focus). Focused E2E 35
passed, unfiltered Frontend 209 passed, Backend launch boundaries and builder
consumers passed, `typecheck:dashboard` passed. Scratch break of the
`LaunchOptions` summary failed interim and converted dialog-layout cases
identically. Sizing: 14 specs including one `large` took about 26 minutes
with verification; large split cases with a plain JSON boundary cost no more
than small ones.

### 3. Convert launch start, story-card start, responsive access and voice
Type: Behavior
Status: planned
Proof: same for the remaining 13 `dashboard/tests/launches/` specs:
`agent-launch-start-*`, `agent-launch-story-*` (4), `responsive-session-*`
(3), `session-instruction-voice-*` (3).

Behavior: interim start, story-card start, responsive session and voice
checks → converted and removed; `dashboard/tests/launches/` holds no product
specs.

### 4. Convert sessions interim detailed checks
Type: Behavior
Status: planned
Proof: same for `dashboard/tests/sessions/` including
`recently-done-returned-sessions.spec.ts`; do not perform SEED-341
simplification beyond placement.

Behavior: interim session detailed/mixed checks → Frontend/Backend/E2E homes
by boundary; interim session product specs gone.

### 5. Convert terminals interim detailed checks
Type: Behavior
Status: planned
Proof: same for `dashboard/tests/terminals/`.

Behavior: interim terminal detailed checks → unit or E2E homes; interim
terminal product specs gone.

### 6. Convert story review interim checks
Type: Behavior
Status: planned
Proof: same for `dashboard/tests/review/` including
`story-review-diff-line-follow-up.spec.ts`.

Behavior: interim review detailed/mixed checks → homes by boundary; interim
review product specs gone.

### 7. Convert Intent CI, proof, history and Purpose checks
Type: Behavior
Status: planned
Proof: same for inventory Intent batch specs still under
`dashboard/tests/intent/` (including the pending backend
`intent-ci-status-read-boundary` case); extend Intent page substitutes as the
inventory names (ci-status, ci-proof, ci-history, ci-comparison, done/review,
revision polling).

Behavior: interim Intent detailed/mixed checks → Frontend/Backend/E2E homes;
those interim Intent files gone. If slice 1’s sizing probe requires a split,
replan this slice into substitute-family Behaviors before executing it.

### 8. Convert board, navigation, stories and observation reading
Type: Behavior
Status: planned
Proof: same for remaining `dashboard/tests/navigation/`, `stories/` and
`observation/` interim specs.

Behavior: interim board/navigation/stories/observation detailed/mixed checks →
homes by boundary; those interim product specs gone. If the sizing probe
requires it, replan into per-folder Behaviors before executing.

### 9. Retire Dashboard Integrated UI Test
Type: Behavior
Status: planned
Proof: `dashboard/tests/**/*.spec.ts` has no remaining product cases; remove
Intent location for **Dashboard Integrated UI Test**, `npm run
test:dashboard:integrated`, `dashboard/integrated.playwright.config.ts`, CI
job `dashboard-integrated` and its shards/settings, duration lists, and
current tooling/placement references; update the three-group roster or
hard-coded callers; keep `dashboard/tests/support/` helpers; historical
integrated proof at an older revision remains readable; focused
`ci-browser-groups`, related CI declaration tests and `runner-ownership` pass
for the three remaining groups.

Behavior: empty interim product-case tree → retirement → only E2E, Frontend
and Backend remain as current browser proof groups.

## Current decisions

- Inventory batches are the default conversion units; slice 1’s measured effort
  may force a replan that splits later batches by folder or substitute family
  without changing story goal or scope. Slice 1 split the launches batch into
  slices 2 and 3.
- SEED-341 does not own moving interim session specs; this plan places them.
- Retirement may land before or after plan 617; either way the final roster
  surface is three groups.
- Leave `integratedStateCompletion` in `.planning/open-dough.json` alone unless
  a focused test proves it is the interim group’s Intent entry (it is not).

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written. Before test edits run the installed `test-entry-rules.mjs` on the
exact paths. No wall-clock sleeps, `test.slow()`, or suite/file/group/hook
timeout overrides. Run post-change refactor before each commit. Hosted CI on
the published candidate is the all-group proof; locally run the slice’s focused
homes and the retirement declaration/ownership tests named above.

Local gate: from a fully awake macOS machine on AC power wrap long or browser
runs in `caffeinate -s -i`; on battery plug in, or keep the lid open under
`caffeinate -i` and read the sleep log afterwards, per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Inspect load and memory before browser runs. Observed at planning time: AC
power with an existing `caffeinate` assertion held.

## Plan concern assessment

Refinement was not needed: eight slices, each one conversion or retirement
outcome with one proof loop, inventory batches as the story’s own units, and
slice 1 bounding the only unsettled sizing premise as an early probe. No
remaining slice-specific concern blocks readiness. This plan is preparation
only; it grants no Take or execution.
