# Finish dissolving Dashboard Integrated UI Test

**Identity:** SEED-334#finish-dissolving-integrated-ui-test
**Source:** [Finish dissolving Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#finish-dissolving-integrated-ui-test)

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution.

Resume with `dough-story-refinement` on this identity to clarify its Goal,
Scope and Key examples, then realign this plan before slice-plan refinement
and readiness assessment. The slices below are provisional planning input
mapped from slices 7–14 of SEED-334#focus-detailed-dashboard-ui-checks
(plan 627, recoverable at `64e07ab2c1ce5abc67fffe4b779aaba2f0258ed4`), which
was split after delivering its configuration, launch and session-lifecycle
batches; their earlier readiness does not carry over.

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
Proof: same for `final-report-touch{,-divider}` and
`session-workspace-retirement{,-claude-done,-lifetime}` on a Frontend final
report (`/__agent-launch/result`) substitute.

Behavior: interim final-report and workspace-retirement checks → homes by
boundary; those interim files gone.

### 2. Convert recently done sessions
Type: Behavior
Status: planned
Proof: same for the 20 `dashboard/tests/sessions/recently-done-*` specs,
including `recently-done-returned-sessions.spec.ts` (not in the inventory).

Behavior: interim recently-done session checks → homes by boundary; those
interim files gone.

### 3. Convert the sessions sidebar
Type: Behavior
Status: planned
Proof: same for the 16 `cursor-sessions-sidebar-*` (with
`cursorSessionsSidebarFormerHeightCases.ts`) and `sessions-sidebar-*` specs;
`dashboard/tests/sessions/` holds no product spec afterwards.

Behavior: interim sessions sidebar checks → homes by boundary; interim
session product specs gone.

### 4. Convert terminals interim detailed checks
Type: Behavior
Status: planned
Proof: same for `dashboard/tests/terminals/`.

Behavior: interim terminal detailed checks → unit or E2E homes; interim
terminal product specs gone.

### 5. Convert story review interim checks
Type: Behavior
Status: planned
Proof: same for `dashboard/tests/review/` including
`story-review-diff-line-follow-up.spec.ts`.

Behavior: interim review detailed/mixed checks → homes by boundary; interim
review product specs gone.

### 6. Convert Intent CI, proof, history and Purpose checks
Type: Behavior
Status: planned
Proof: same for inventory Intent batch specs still under
`dashboard/tests/intent/` (including the pending backend
`intent-ci-status-read-boundary` case); extend Intent page substitutes as the
inventory names (ci-status, ci-proof, ci-history, ci-comparison, done/review,
revision polling).

Behavior: interim Intent detailed/mixed checks → Frontend/Backend/E2E homes;
those interim Intent files gone. Split by substitute family before executing it.

### 7. Convert board, navigation, stories and observation reading
Type: Behavior
Status: planned
Proof: same for remaining `dashboard/tests/navigation/`, `stories/` and
`observation/` interim specs.

Behavior: interim board/navigation/stories/observation detailed/mixed checks →
homes by boundary; those interim product specs gone. Split by folder or substitute family before executing.

### 8. Retire Dashboard Integrated UI Test
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
