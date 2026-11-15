# Move session, terminal, story and observation checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#finish-dissolving-integrated-ui-test
**Source:** [Move session, terminal, story and observation checks out of Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#finish-dissolving-integrated-ui-test)
**Source review:** [source-review.md](./source-review.md)

## Goal, scope and decisions

Convert every interim case under `dashboard/tests/{sessions,terminals,review,stories,observation}`
while preserving each distinct regression assertion in E2E, Frontend or
Backend. Shared support and historical proof remain usable; the interim
runner stays for the Intent and navigation cases of
[SEED-334#retire-dashboard-integrated-ui-test](../633-retire-dashboard-integrated-ui-test/PLAN.md).
The source governs this plan.

Terry split the whole-dissolution story in half on 2026-11-15 to fit the
eight-slice cap and 15-active-minute slices. This plan keeps the original
identity and the first half's slices; the remaining conversions and the
retirement moved to plan 633. A converted batch is a safe delivery increment.

## Existing solution and architecture

PFE: reuse `dashboard/tests/support/frontendApp.ts` and service-family
substitutes for built-page UI, component mounts for isolated presentation,
`dashboardTest.ts`'s public Backend boundary, and existing representative E2E
journeys. A mixed test's assertions determine the split; a filename or old
inventory row never decides it. Keep real in-service collaborators and
substitute only the service boundaries each unit case needs. Add a missing
answer family beside the existing ones rather than another harness or tier.

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The existing [North Star](../../NORTH-STAR.md) governs published facts, local
sessions and observations; no new direction is needed for moving proof.

## Proof and local gates

Every conversion slice owns an assertion-by-assertion disposition of its
interim cases: retained unchanged at the same boundary, moved to a named case,
or split across named E2E/Frontend/Backend cases. Include negative effects
(native commands, upstream requests or store writes that must not happen).
Inspect reused proof's setup and assertions; preserve every distinct promise.

Before changing a proof boundary, retain its interim assertions and observe a
representative scratch break of the asserted rule. The new home must catch
the same break and pass after restoration. Revert scratch edits before any
commit. Remove migrated specs and their `integrated.longest-first*` entries
only with the replacement proof, and run the touched homes and affected
support consumers. Use the installed
[consumer-trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for moved modules, changed contracts and retired outputs.

Local gate: focused converted cases via `npm run test:e2e -- <paths>`,
`npm run test:dashboard:frontend -- <paths>` and/or
`npm run test:dashboard:backend -- <paths>`, with lint/typecheck for changed
TypeScript. Select MakeMe and, for browser sources, page-object conventions
before authoring under [AGENTS.md](../../../AGENTS.md#test-automation).
No `test.slow()` or suite/file/hook timeout overrides; retain default case budgets.

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, including hosted CI after publication. Choose broader local proof
for actual fixture/runtime consumers. Before expensive runs inspect host load,
memory and competing work. On macOS use
the maintained [sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake and on AC, `caffeinate -s -i`; on battery, plug in or keep the lid
open under `caffeinate -i` and inspect the sleep log afterwards. Full groups
share local admission across worktrees; focused selections remain independent.

| Final-state promise / source example | Owner and observable proof |
| --- | --- |
| Final report, passive native behavior and stored session state / example 1 | Slice 1: controlled Frontend report interaction plus retained E2E/Backend store and no-native-operation assertions. |
| Mixed session, terminal, review and story cases retain their distinct assertions / example 2 | Slices 1–10: named old-to-new assertion dispositions, focused passing cases, representative discrimination at changed proof boundaries. |
| Specs absent from the inventory still convert / example 3 | Slices 4 and 7 explicitly include the two named additions; each batch reconciles current cases against its old inventory rows. |
| Five folders empty; interim runner still runs the rest / example 4 | Slice 10 closes with no `*.spec.ts` left in the five folders and a focused `npm run test:dashboard:integrated` listing of the remaining Intent and navigation cases. |

## Carried learnings

- **Proof per conversion slice.** Every distinct check from the slice's
  interim specs runs under `npm run test:e2e`, `test:dashboard:frontend`
  and/or `test:dashboard:backend`; those interim files and their
  `dashboard/integrated.longest-first*` rows are gone; a representative
  converted case fails a scratch break of the asserted rule the same way the
  interim case did, then passes restored; focused runs of the touched homes
  pass.
- **Sizing.** One agent slice held about 2.5–3k interim lines, or about 11
  small specs, with agent context the binding limit. A new Frontend substitute
  family costs most of a slice — treat that as a hard per-slice budget even
  when interim lines fit; two new families in one batch overrun. Once a family
  exists each case takes a few minutes and E2E moves are mechanical. Split
  batches by folder or substitute family before delegating them.
- **Substitutes to reuse** under `dashboard/tests/support/`:
  `frontendSettingsSubstitutes.ts`, `frontendLaunchSubstitutes.ts`,
  `frontendLaunchAttempts.ts`, `frontendTranscriptionSubstitutes.ts`,
  `frontendSessionActions.ts`, `frontendCardSessions.ts`,
  `frontendFinalReportSubstitutes.ts` / `frontendFinalReportSession.ts`
  (`installFrontendFinalReport` with `holdNext`/`answerNext` per session),
  with held answers through `frontendSubstituteAnswers.ts`
  (`holdAnswer`/`answerHeld`, ended at teardown) and story arrangements
  through `frontendServiceState.ts` (`putFrontendStories`,
  `frontendStoryLaunch`) plus `frontendPublishedFixtures.ts`. Authenticated
  read and terminal install live in
  `frontendAuthenticatedReadSubstitute.ts` and
  `frontendTerminalSubstitute.ts`. The default substitutes answer a moved
  revision on `since` and the `at` stream. After slice 1,
  `frontendServiceState.ts` (~129) and `frontendServiceSubstitutes.ts` (~98)
  are under the 250-line limit; keep new session/terminal/review answer
  families in their own modules. The new Frontend and E2E spec files have no
  duration-list rows until CI timing is refreshed.
- **Slice 1 proof.** FE:
  `dashboard/frontend-tests/sessions/final-report-touch{,-divider}.spec.ts`,
  `session-workspace-retirement-held-report.spec.ts` (focused FE 6–8 passed;
  Escape/`mark` scratch break failed then restored). E2E:
  `e2e/sessions/final-report-done-native.spec.ts`,
  `session-workspace-retirement{,-claude-done,-lifetime}.spec.ts` (9 passed).
  Existing Backend final-report and retirement homes reused. Interim five
  specs and their `integrated.longest-first-agents` rows removed. Held
  `/result` cancellation needs `holdNext(session)` plus
  `answerNext(..., otherSession)` on the same substitute.
- **Discrimination sequencing.** Run the representative scratch break on the
  interim home before deleting it, then again on the new home; slice 1
  demonstrated the new-home break after interim removal with matching
  Escape→`mark` assertion text. Slice 2 paired
  Completed→Launched aria-label scratch on interim and FE touch homes.
- **Slice 2 proof.** FE:
  `recently-done-sessions-sidebar{,-touch,-projects,-room,-paging}` (7 passed);
  E2E: `…-reopen`, `…-paging-board`, `…-navigation` (6 passed). Support:
  `frontendRecentlyDoneSidebar.ts` + `pygardonSource`. Do not call
  `preferShortRecentlyDoneBody` in room setup (resets divider preference).
- **Slice 3 proof.** FE `recently-done-sessions-select*` (12) + E2E
  `…-select-open` (1) + Backend association reused. Support:
  `frontendCompletedStoryAssociation.ts` (hold/link/absent/refuse/fail) and
  `frontendRecentlyDoneSelection.ts`; association-check status on
  `recentlyDoneParts.choiceStatus` (page at 249 lines). Hardwired absent
  settle replaced by the controllable family.
- **Known traps.** A `MachineAnswer` failing `launchRecordsSchema` leaves the
  page on "Reading sessions…" silently; Cursor entries need the Cursor runner
  sessions read substituted; a history read needs its own `audience=history`
  route. Reinstalling the context clock for a second page fires the first
  page's silence deadline.
- **Open CI observation.** `dashboard/tests/observation/revision-stream.spec.ts`
  "two streaming pages…" once saw no revision B for 15 s in CI (run
  43666885667) and was not reproduced locally; failing integrated and E2E
  tests now attach server output with `revision-observation` trace lines and
  fake GitHub calls to name the stalled layer if it recurs.
- **Slice 2 overrun (2026-11-15).** First attempt on the former single
  recently-done batch (~12–13 active minutes) delivered no conversion: line
  count fit (~2.8k), but the batch needs two new Frontend answer families
  (`completed-story` association and `storyReviewState`) plus many mixed
  FE/E2E splits. Failed sizing assumption: interim lines alone understate cost
  when multiple new substitute families are required. Working tree stayed
  clean. Refined in place under the execution in-progress split allowance
  (plan may reach ten slices): three recently-done batches below, then the
  former slices 3–8 renumbered 5–10.

## Ordered slices

Sizes are current interim specs / lines, against the carried capacity of
about 2.5–3k lines per slice. Treat each new Frontend answer family as most
of one slice's active budget.

### 1. Convert final report and workspace retirement
Type: Behavior
Status: done
Proof: `final-report-touch{,-divider}` and
`session-workspace-retirement{,-claude-done,-lifetime}` (5 / 744) retain
report reading, focus, confirmation, stale-answer and passive native/store
assertions.
Behavior: retained/unfinished report on card, Recently done or sidebar → read,
close, change selection or confirm Done → the same UI, persistence and native
results remain protected in their proper homes; these five interim specs go.
Extend a report-result substitute at `/__agent-launch/result` for UI answers;
keep actual report storage, native passivity and Done integration in E2E or
Backend. Own the reorganization of `frontendServiceState.ts` and
`frontendServiceSubstitutes.ts` by responsibility that later slices need.

### 2. Convert recently-done sidebar presentation and reopen
Type: Behavior
Status: done
Proof: `recently-done-sessions-sidebar{,-touch,-projects,-room,-paging}`,
`…-sidebar-paging-board`, `…-sidebar-navigation`, `…-sidebar-reopen`
(~8–9 specs) retain listing, ages, empty/reading, project filter, room layout,
paging UI, Board non-eager read, progressive reveal and Cursor reopen.
Behavior: observe Done in the sessions sidebar → expand, page, filter or
reopen → presentation and real-boundary attach/Board outcomes remain protected;
these interim specs go. Multi-project machine fixtures only; no association
family yet. Mechanical E2E for reopen, paging-board and navigation.

### 3. Convert recently-done select and association
Type: Behavior
Status: done
Proof: `recently-done-sessions-select{,-touch,-development,-check,-supersede,-ad-hoc-check}`
(~6 specs) retain Intent select/Open, association check holds/fails/supersede
and related touch/development/ad-hoc outcomes.
Behavior: select a Done session → controlled association answers or real
ad-hoc journeys → the same UI and workflow outcomes remain protected; these
interim specs go. Own one new `frontendCompletedStoryAssociation` module (one
new Frontend family only); keep ad-hoc/store in existing E2E/Backend. Review-cue
moves to slice 4 so this slice stays within one-family budget.

### 4. Convert recently-done story card, returned sessions and review-cue
Type: Behavior
Status: planned
Proof: `recently-done-story-sessions`, `recently-done-active-story-sessions`,
inventory-absent `recently-done-returned-sessions`, and
`…-review-cue{,-races,-evidence}` (~6 specs) retain card nesting,
active/closed ownership, column paging, returned-to-backlog reopen, and
review-cue races/evidence.
Behavior: Done, returned or review-cued sessions → nest, page, reopen or show
cue → the same nesting, native restore and cue outcomes remain protected;
these interim specs go. Own one new `frontendStoryReviewState` module.
Completes the recently-done sessions conversion.

### 5. Convert the sessions sidebar
Type: Behavior
Status: planned
Proof: the 16 `cursor-sessions-sidebar-*` and `sessions-sidebar-*` specs
(16 / 2,573), with `cursorSessionsSidebarFormerHeightCases.ts`, preserve
layout, resizing/kept size, host status, navigation, keyboard, row and state
cases.
Behavior: observed sessions across hosts/projects → operate the sidebar → its
same presentation, focus, persistence and native-action outcomes remain
protected outside the interim group; no session product spec remains there.

### 6. Convert terminal checks
Type: Behavior
Status: planned
Proof: all 14 `dashboard/tests/terminals/` specs (14 / 2,584) retain terminal
attachment, input/recovery, keyboard/touch, size/theme and voice-lifecycle
assertions.
Behavior: attach or operate a terminal → real workflow or controlled
WebSocket/transcription answer → the same transport/backend outcomes and UI
rules remain protected at their owning boundaries; interim terminal specs go.
Reuse the terminal application and transcription substitutes.

### 7. Convert story review checks
Type: Behavior
Status: planned
Proof: all 16 `dashboard/tests/review/` specs (16 / 2,426), including
`story-review-diff-line-follow-up.spec.ts`, preserve range/refresh races,
diffs/context/moves, pane/tree/touch, uncommitted checks and follow-up behavior.
Behavior: open or operate story review → review answer or real repository
change → the same reviewed state and UI remain protected outside the interim
group; interim review specs go. Extend one story-review answer family at the
snapshot/range/diff/text/mark boundaries, retaining actual Git work in Backend
or representative E2E journeys.

### 8. Convert progressive done reading and review state on the board
Type: Behavior
Status: planned
Proof: the 14 `dashboard/tests/stories/recently-done-*` specs (14 / 2,158)
retain progressive loading/navigation/refresh/reset/state, added-project,
failed-read refresh, read latency and review cue/state/offer assertions.
Behavior: read the board's Recently done column progressively or review a done
story → controlled done/read answers or a real refresh → the same reading,
paging and review-state outcomes remain protected; these 14 specs go.

### 9. Convert story presentation, readiness and progress
Type: Behavior
Status: planned
Proof: the other 17 `dashboard/tests/stories/` specs (17 / 2,594) retain
agent roster, branch progress, direction disclosure, portrait, plan-complete
detail, preparation legend, published work, story card inspection,
dependency, readiness and Taken profile/clock/progress assertions.
Behavior: show published stories and Taken work → operate or refresh them →
the same presentation, readiness, dependency and progress outcomes remain
protected; no product spec remains under `stories/`.

### 10. Convert published-fact observation
Type: Behavior
Status: planned
Proof: all seven `dashboard/tests/observation/` specs (7 / 1,168) retain
per-project read isolation, published-fact reading, revision streaming and
steady-refresh bound/carry/inspection assertions; the five folders contain no
`*.spec.ts`, and the interim runner lists only Intent and navigation cases.
Behavior: a publication or local fact changes → real server/SSE or controlled
project/event answers → the same observed facts and isolation remain
protected; keep representative real server/SSE sharing journeys in E2E.

## Premises and remaining concerns

Observed at `788c5a64ca128ee64bc10ffe752f617633a28127`: this half covers 102
specs / 15,907 lines (sessions 41 / 6,145; terminals 14 / 2,584; review
16 / 2,426; stories 31 / 4,752; observation 7 / 1,168). After the slice-2
overrun refinement the plan has ten slices (execution in-progress split
allowance). Slice 1 delivered the report-result family and support split;
slice 3 owns only the association family; slice 4 owns only the review-state
family (preemptive one-family split before dispatch); slice 7 keeps actual
Git work outside Frontend. If a further slice overruns, apply the
[oversized-slice procedure](../../../.agents/skills/dough-execute-plan/references/oversized-slice.md)
and reassess the story boundary before another slice-only refinement (second
overrun rule).

The predecessor's completion record demonstrates Frontend refused-Done fault
discrimination and the restored Backend no-native-command assertion. Reuse
that boundary approach.
