# Finish dissolving Dashboard Integrated UI Test

**Identity:** SEED-334#finish-dissolving-integrated-ui-test
**Source:** [Finish dissolving Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#finish-dissolving-integrated-ui-test)

## Goal, scope and decisions

Dissolve the entire remaining interim group while preserving every distinct
regression assertion in E2E, Frontend or Backend, then retire its current
Intent entry, runner, CI producer and live tooling references. Shared support
and historical proof remain usable. The source governs this plan.

Terry's clarification in this preparation keeps the full outcome in one
story. All eight batches below remain in scope; none is deferred to a
successor. A converted batch is a safe delivery increment, and completion
requires every batch plus retirement. The eight boundaries remain a draft
because their sizing concerns below are unresolved. Refinement grants no
execution authority or exception to the slice budget.

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
| All remaining mixed cases retain their distinct assertions / example 2 | Slices 1–7: named old-to-new assertion dispositions, focused passing cases, representative discrimination at changed proof boundaries. |
| CI read refuses malformed input without extra upstream work / example 3 | Slice 6: direct Backend HTTP answers and recorded GitHub calls for every current query. |
| Specs absent from the inventory still convert / example 4 | Slices 2 and 5 explicitly include the two named additions; each batch reconciles current cases against its old inventory rows. |
| Empty interim case tree; three current groups; retained helpers/history / example 5 | Slice 8: no product spec left, three-group runner/CI proof, current Intent absence and historical revision/source reading. |

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
  family costs most of a slice; once it exists each case takes a few minutes
  and E2E moves are mechanical. Split batches by folder or substitute family
  before delegating them.
- **Substitutes to reuse** under `dashboard/tests/support/`:
  `frontendSettingsSubstitutes.ts`, `frontendLaunchSubstitutes.ts`,
  `frontendLaunchAttempts.ts`, `frontendTranscriptionSubstitutes.ts`,
  `frontendSessionActions.ts`, `frontendCardSessions.ts`, with held answers
  through `frontendSubstituteAnswers.ts` (`holdAnswer`/`answerHeld`, ended at
  teardown) and story arrangements through `frontendServiceState.ts`
  (`putFrontendStories`, `frontendStoryLaunch`). The default substitutes
  answer a moved revision on `since` and the `at` stream.
  `frontendServiceState.ts` (240 lines) and `frontendServiceSubstitutes.ts`
  (244) are near the 250-line limit: reorganize them by responsibility before
  adding the session, terminal and Intent answers later slices need. The new
  Frontend and E2E spec files have no duration-list rows until CI timing is
  refreshed.
- **Known traps.** A `MachineAnswer` failing `launchRecordsSchema` leaves the
  page on "Reading sessions…" silently; Cursor entries need the Cursor runner
  sessions read substituted; a history read needs its own `audience=history`
  route. Reinstalling the context clock for a second page fires the first
  page's silence deadline.
- **Retirement inputs.** At `c327752a0f385417c74b1a7b3511ebe5d3b450e6` the
  interim group was named by its Intent location in `.planning/open-dough.json`,
  `package.json`, `ci.yml` job `dashboard-integrated`,
  `dashboard/integrated.playwright.config.ts`, the `integrated.longest-first*`
  lists, runner support (`dashboard/tests/support/groupRunnerExamples.ts`),
  Distribution CI helpers and tests, and placement READMEs. Leave
  `integratedStateCompletion` in `.planning/open-dough.json` alone; it is not
  the interim group's Intent entry. Retirement may land before or after
  SEED-334#keep-one-browser-test-group-roster; either way three groups remain.
- **Open CI observation.** `dashboard/tests/observation/revision-stream.spec.ts`
  "two streaming pages…" once saw no revision B for 15 s in CI (run
  43666885667) and was not reproduced locally; failing integrated and E2E
  tests now attach server output with `revision-observation` trace lines and
  fake GitHub calls to name the stalled layer if it recurs.

## Ordered slices

### 1. Convert final report and workspace retirement
Type: Behavior
Status: planned
Proof: `final-report-touch{,-divider}` and
`session-workspace-retirement{,-claude-done,-lifetime}` retain report reading,
focus, confirmation, stale-answer and passive native/store assertions.
Behavior: retained/unfinished report on card, Recently done or sidebar → read,
close, change selection or confirm Done → the same UI, persistence and native
results remain protected in their proper homes; these five interim specs go.
Extend a report-result substitute at `/__agent-launch/result` for UI answers;
keep actual report storage, native passivity and Done integration in E2E or
Backend. Own any currently necessary shared-answer reorganization here.

### 2. Convert recently done sessions
Type: Behavior
Status: planned
Proof: all 20 `dashboard/tests/sessions/recently-done-*` specs, including
`recently-done-returned-sessions.spec.ts`, map every selection, review-cue,
paging, reopening, project, touch and active/returned-session assertion.
Behavior: observed recent session → select, reopen, page or receive an updated
observation → the same association, navigation and session action outcomes
remain protected outside the interim group; its 20 specs go.

### 3. Convert the sessions sidebar
Type: Behavior
Status: planned
Proof: the 16 remaining `cursor-sessions-sidebar-*` and `sessions-sidebar-*`
specs, with `cursorSessionsSidebarFormerHeightCases.ts`, preserve layout,
resizing/kept size, host status, navigation, keyboard, row and state cases.
Behavior: observed sessions across hosts/projects → operate the sidebar → its
same presentation, focus, persistence and native-action outcomes remain
protected outside the interim group; no session product spec remains there.

### 4. Convert terminal checks
Type: Behavior
Status: planned
Proof: all 14 `dashboard/tests/terminals/` specs retain terminal attachment,
input/recovery, keyboard/touch, size/theme and voice-lifecycle assertions.
Behavior: attach or operate a terminal → real workflow or controlled
WebSocket/transcription answer → the same transport/backend outcomes and UI
rules remain protected at their owning boundaries; interim terminal specs go.
Reuse the terminal application and transcription substitutes where appropriate.

### 5. Convert story review checks
Type: Behavior
Status: planned
Proof: all 16 `dashboard/tests/review/` specs, including
`story-review-diff-line-follow-up.spec.ts`, preserve range/refresh races,
diffs/context/moves, pane/tree/touch, uncommitted checks and follow-up behavior.
Behavior: open or operate story review → review answer or real repository
change → the same reviewed state and UI remain protected outside the interim
group; interim review specs go. Extend one story-review answer family at the
snapshot/range/diff/text/mark boundaries, retaining actual Git work in Backend
or representative E2E journeys.

### 6. Convert Intent CI, proof, history and Purpose checks
Type: Behavior
Status: planned
Proof: all 72 `dashboard/tests/intent/` specs retain CI status/freshness/sort,
comparison/proof/history/gaps, done/review, source/Purpose/Gherkin, selection,
revision/recovery and optimization-candidate assertions, including the direct
Backend conversion of `intent-ci-status-read-boundary.spec.ts`.
Behavior: read or navigate Intent and receive a changed/refused/held answer →
the same truthful proof, source selection, recovery and UI outcomes remain
protected at their boundaries; all interim Intent specs go. Reuse component
mounts; add only the full-page answer families each converted case needs.

### 7. Convert board, navigation, stories and observation
Type: Behavior
Status: planned
Proof: all 41 navigation, 31 stories and seven observation specs retain board,
frame/header, selection/reference, readiness/dependency/roster/progress,
progressive done reading, per-project isolation and revision-stream assertions.
Behavior: navigate, operate, refresh or observe a publication → the same board,
selection, focus and published/local-fact outcomes remain protected at their
boundaries; these 79 interim specs go. Keep representative real server/SSE
sharing journeys in E2E; frontend polling/late-answer variants use controlled
project/done/read/event answers.

### 8. Retire Dashboard Integrated UI Test
Type: Behavior
Status: planned
Proof: no `dashboard/tests/**/*.spec.ts` product case remains. Remove the
current Intent location, npm command, Playwright config, `dashboard-integrated`
CI producer/shards, duration lists and live tooling/placement references.
Keep `integratedStateCompletion`, shared helpers and historical evidence.
Behavior: every interim assertion has a maintained home → retire the empty
group → only E2E, Frontend and Backend are current, all shared imports work,
and old integrated artifacts/source remain readable at their old revisions
without current-proof claims, fabricated comparisons or dead links.
Update roster or hard-coded callers regardless of the roster story's order.
Focused `ci-browser-groups`, related CI declarations and `runner-ownership`
prove the remaining groups; retained Intent/history cases prove old evidence.

## Premises and remaining concerns

Observed in this owned checkout at
`aa71a3a2a86fe17020814bf0339fd1ace4e16fd2`: current `*.spec.ts` contents and
historical migration batches were inspected, yielding 222 specs / 34,600
lines: sessions 41 / 6,145; terminals 14 / 2,584; review 16 / 2,426;
Intent 72 / 11,009; navigation 41 / 6,516; stories 31 / 4,752;
observation seven / 1,168. The old inventory covers 214 current specs; actual cases remain authoritative.
These observations establish scope/sizing, not replacement proof.

The predecessor's completion record demonstrates Frontend refused-Done fault
discrimination and the restored Backend no-native-command assertion. Reuse that
boundary approach; new report/Intent/review substitutes and proof remain owed.

Slice-plan refinement ran against the eight retained boundaries. Slice 1
stays a bounded candidate. Slices 2–5 require smaller cohesive proof loops
within their session, transport/voice and review responsibilities; each new
substitute family consumes substantial work. Slice 6 combines CI acquisition,
proof comparison/history and source/Purpose reading across 11,009 lines.
Slice 7 combines independent navigation, story presentation/progressive reads
and server-observation proof across 12,436 lines. These two alone exceed the
predecessor's observed 2.5–3k-line agent-slice capacity several times over.
Keeping eight headings cannot establish 15-active-minute slices.

The selected whole-dissolution boundary is preserved. No split, dropped scope,
probe-based exemption or budget exception has been authorized. Under the
[slice limit and sizing rules](../../../.agents/skills/dough-story-decomposition/references/problem-decomposition.md#limit-slices-per-plan),
this draft is not ready: executable boundaries cannot currently fit both the
eight-slice cap and the per-slice budget. Resolving that execution-sizing
constraint must preserve the whole promised outcome. Do not infer execution
readiness from all work being listed or from the absence of successor stories.
