# Move configuration, launch and session lifecycle checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#focus-detailed-dashboard-ui-checks
**Source:** [Move configuration, launch and session lifecycle checks out of Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#focus-detailed-dashboard-ui-checks)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Developers get Frontend/Backend unit feedback and E2E workflow confidence for
the dashboard's configuration, launch, and session lifecycle checks: the
interim **Dashboard Integrated UI Test** group no longer holds those batches,
and every distinct behavior they proved keeps a home that catches the same
regressions.

Included: convert the configuration batch, the launch dialog and start batch,
and the session lifecycle and done-terminal specs by the migration inventory
at `125c45649fa587c78ed7445deff35db87604489d` (starting classification;
decide each case by behavior); preserve assertions that catch regressions;
keep shared helpers under `dashboard/tests/`.

Excluded: the remaining interim batches and retiring the interim group
(SEED-334#finish-dissolving-integrated-ui-test, plan
[632](../632-finish-dissolving-integrated-ui-test/PLAN.md), which carries
this plan's former slices 7–14); a permanent third browser group; SEED-341
session simplification beyond placement; SEED-300 page-object expressiveness
work; speed or shard-count goals; product behavior changes; wholesale
re-inventory before conversion.

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
| Frontend substitute harness is the unit conversion route (slices 1–6) | `npx playwright test --config dashboard/frontend.playwright.config.ts --list --reporter=line` at `c327752a0f385417c74b1a7b3511ebe5d3b450e6` listed 161 Chromium cases under `frontend-tests/` (exit 0). |
| Configuration batch is still the inventory’s first conversion set (slice 1) | `dashboard/tests/configuration/` holds the 11 inventory-named specs; related workflow cases already live under `e2e/configuration/`. |
| Later batch effort fits one execution slice (slices 2–6) | Unsettled until slice 1 records elapsed conversion effort for frontend/small and split/small cases. Slice 1 is the early probe: if measured effort shows a later inventory batch cannot finish as one slice, replan that batch (split by folder or substitute family) before continuing it. |

## Outside-in proof ownership

Each conversion slice (1–6):

1. Every distinct check from that slice’s interim specs runs under
   `npm run test:e2e`, `test:dashboard:frontend`, and/or
   `test:dashboard:backend` as its boundary requires.
2. Those interim files and their `integrated.longest-first*` rows are gone.
3. At least one representative converted case fails a scratch break of the
   asserted rule the same way the prior integrated case did (or an equivalent
   discriminating probe when the case moved to Backend), then passes restored.
4. Focused run of the touched homes passes; no wall-clock sleep, `test.slow()`,
   or suite/file/group/hook timeout overrides.

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

Trunk merge after slice 2 (`5e139ef9e`): trunk's de-freezing of the removal
test and the options comment were carried into their new homes
(`e2e/configuration/project-remove-selection.spec.ts`,
`e2e/launches/agent-launch-options.spec.ts`). The merged run exposed a race
in `dashboard/tests/support/projectAddPage.ts`: its response predicate read a
body the page had navigated away from and rejected the wait; it now skips
such reads (8/8 repeated, its 5 consumer files passed). Merged proof: 48 E2E
cases from slices 1–2, unfiltered Frontend 209, duration-list node tests.
`runner-ownership` timed out 4 nested group runs at two workers while another
checkout's suite held load at about 39, and passed 10/10 with one worker at
31–37; hosted CI on the merge is the verdict. After the merge refactor
(`removeProject` page action, `ConfiguredProject` type), two `project-add`
cases timed out in server start at load about 32 and the seven touched files
passed 16/16 at load 16–18.

### 3. Convert launch story-card start, attachments, responsive start and layout
Type: Behavior
Status: done
Proof: same for 7 `dashboard/tests/launches/` specs: `agent-launch-story-card`
(with `storyCardTouchStartCases.ts`), `agent-launch-story-attachments`,
`agent-launch-start-story-card`, `agent-launch-story-card-problems`,
`responsive-session-start`, `responsive-session-recovery-reads`,
`agent-launch-start-session-layout`.

Behavior: interim story-card start, attachments, responsive start and
start-session layout checks → converted and removed with assertions preserved.

Sizing learning: the first attempt at all 13 remaining launch specs stopped
after these 7 (about 38 minutes, agent context the binding limit); the
assumption that the remaining launches batch fits one slice failed. The six
`large` specs left each need their own substitute family, so they move to
slices 4 and 5.

Accepted proof: 6 Frontend specs in `dashboard/frontend-tests/launches/` on
the new `frontendLaunchAttempts.ts` (owned running attempt, settle)
and the `/__agent-launch/changed` substitute, with held answers ended at page
teardown; 5 E2E specs in `e2e/launches/`. Unfiltered Frontend 229 passed,
focused E2E 9 passed, `typecheck:dashboard` and the duration-list node tests
passed. Scratch break of the `LaunchProblemAnswer` description id failed the
interim and converted folder-not-found cases with the same empty accessible
description; both passed restored.

CI repair on `f021ef850` (run 43666885667, integrated shard 2/5):
`tests/observation/revision-stream.spec.ts` "two streaming pages…" saw no
revision B for 15 s after the push. Not reproduced locally (10/10, 40/40 at
load 23, CI's 48 shard-2 files 99/99 twice) and not explained by server pace
or the forced CI ordering. Repaired a real defect in the same window:
reopening the context clock for a second tab fired the first tab's 45 s
silence deadline (now asserted absent; the old helper fails it 3/3). Added
`DOUGH_REVISION_OBSERVATION_TRACE` server trace lines and failure attachments
(server output, fake GitHub calls) so a recurrence names the stalled layer.
The original stall remains unexplained; a recurrence is a defect to diagnose
from those attachments.

### 4. Convert launch instruction voice
Type: Behavior
Status: done
Proof: same for `session-instruction-voice-capture-failures`,
`session-instruction-voice-lifecycle` and `session-instruction-voice-overflow`
on a Frontend transcription substitute (`/__instruction-transcription` and the
saved-key setting).

Behavior: interim launch voice checks → converted and removed with assertions
preserved.

Accepted proof: 3 Frontend specs in `dashboard/frontend-tests/launches/` on
`frontendTranscriptionSubstitutes.ts` (abandoned requests observed through
`requestfailed`); E2E joins in `session-instruction-voice.spec.ts` (exactly
4,000 characters reach argv) and `session-instruction-voice-provider-failures.spec.ts`
(Cancel ends the held provider request). `voiceRecovery.ts` lost a 200 ms
wall-clock sleep. Focused Frontend 10, voice E2E 9, unfiltered Frontend 239,
`typecheck:dashboard` and duration-list node tests passed. Scratch breaks of
the 4,000 limit and of Cancel's abort failed interim and converted cases
identically; both passed restored. About 16 minutes for three `large` specs.

### 5. Convert launch access, noted start and answer touch
Type: Behavior
Status: done
Proof: same for `responsive-session-access`, `agent-launch-story-card-noted-start`
and `agent-launch-start-session-answer-touch`, reusing slice 3's attempt
substitutes (`frontendLaunchAttempts.ts`); `dashboard/tests/launches/` holds
no product spec afterwards.

Behavior: interim access, noted-start and answer-touch checks → converted and
removed; the launches batch is complete.

Accepted proof: 4 Frontend specs in `dashboard/frontend-tests/launches/`
(access split into a story's start and an unattached session's start) on
`frontendLaunchAttempts.ts` `publish`/`launch`, with the default Frontend
substitutes now answering a moved revision on `since` and the `at` stream;
real-server workflow parts were already E2E-proved. Focused launches Frontend
70, unfiltered Frontend 246, typechecks, eslint and duration-list node tests
passed. Scratch breaks of the reduced-motion rule and the tooltip's
`aria-hidden` failed interim and converted cases identically.
`dashboard/tests/launches/` is gone.

### 6. Convert session lifecycle and done terminals
Type: Behavior
Status: done
Proof: same for 11 `dashboard/tests/sessions/` specs: `agent-launch-ad-hoc-sessions`,
`agent-launch-retained-history`, `agent-launch-sessions-unanswered`,
`agent-launch-story-card-delete{,-problems}`, `agent-launch-story-card-done`,
`agent-terminal-done{,-pending,-question}`, `compact-session-entry`,
`session-unread-report-message`; do not perform SEED-341 simplification
beyond placement.

Behavior: interim session lifecycle and done-terminal checks →
Frontend/Backend/E2E homes by boundary; those interim files gone.

Sizing learning: the first attempt at 16 session specs stopped after these
11 small ones (about 55 minutes, context the binding limit); the final-report
and workspace-retirement family needs its own `/__agent-launch/result`
substitute and moved to the sibling story (plan 632, slice 1).

Accepted proof: 12 Frontend specs in `dashboard/frontend-tests/sessions/` on
the new `frontendSessionActions.ts` (Mark as done, Delete record, Mark as
read: asked, refuse, fail, hold) and `frontendCardSessions.ts`; 6 E2E specs
in `e2e/sessions/`. Unfiltered Frontend 269, focused E2E 6, typecheck, eslint
and duration-list node tests passed. Scratch break of the delete failure
reason failed interim and converted cases with the same received text; both
passed restored.

## Story obligations

### G1. Late transcription guard has no discriminating case (reported in slice 4)
Reported: slice 4 — "The `!current()` guard after `response.json()` has no discriminating test, neither before nor after conversion."
Story clause: "Every distinct behavior those batches proved keeps a home that catches the same regressions"
Disposition: no user cost "Every distinct behavior those batches proved keeps a home that catches the same regressions": slice 4's scratch break removed the guard and both the interim and converted late-response cases still passed, so the interim group never proved it and no regression assertion was lost; the converted case keeps the interim observation that a response completed after Cancel never populates the next launch dialog, because the closed dialog's append target is gone.

### G2. One published Taken profile no longer counted in the access journey (reported in slice 5)
Reported: slice 5 — "The interim access test checked `origin.takenProfiles()` had length 1 after the held push was released."
Story clause: "Do not drop a distinct regression assertion when relocating a case."
Disposition: proved by slice 5: `dashboard/backend-tests/launches/agent-launch-acceptance.spec.ts` "an accepted launch › is kept before publication and settles after its caller is gone, one start across workflows" asserts `origin.takenProfiles()` has length 1 after the accepted execution launch publishes its Take, and `e2e/launches/responsive-session-start.spec.ts` keeps the held-push publication observed as `published`.

## Current decisions

- Inventory batches are the default conversion units, split by folder or
  substitute family when a batch exceeds one agent slice: launches became
  slices 2–5 after slice 3's overrun, and slice 6's overrun moved final report
  and workspace retirement to the sibling story.
- On 2026-11-15 Terry split the story after slice 6: this story keeps the
  delivered configuration, launch and session-lifecycle batches; the rest,
  including retirement, moved with former slices 7–14 to
  SEED-334#finish-dissolving-integrated-ui-test at the top of the backlog.
- SEED-341 does not own moving interim session specs; this plan places them.

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written. Before test edits run the installed `test-entry-rules.mjs` on the
exact paths. No wall-clock sleeps, `test.slow()`, or suite/file/group/hook
timeout overrides. Run post-change refactor before each commit. Hosted CI on
the published candidate is the all-group proof; locally run the slice’s focused
homes.

Local gate: from a fully awake macOS machine on AC power wrap long or browser
runs in `caffeinate -s -i`; on battery plug in, or keep the lid open under
`caffeinate -i` and read the sleep log afterwards, per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Inspect load and memory before browser runs. Observed at planning time: AC
power with an existing `caffeinate` assertion held.

## Plan concern assessment

Refined during execution: slice 1's probe and the overruns of slices 3 and 6
showed that an inventory batch above about 2.5–3k interim lines, or one
needing several new Frontend substitute families, exceeds one agent slice.
Launches became slices 2–5; the story was then split after slice 6, leaving
six delivered slices, each one conversion outcome with one proof loop.
