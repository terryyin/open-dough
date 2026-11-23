# Get fast proof of story changes, Done references, notes and recorded progress

**Identity:** SEED-413#speed-story-changes-notes-and-progress-reading
**Source:** [Get fast proof of story changes, Done references, notes and recorded progress](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-story-changes-notes-and-progress-reading)
**Source review:** [Source-only review](source-review.md)
**Split from:** Plan 755 at its delivered Slice 2 boundary

## Execution context

Story Branch Mode uses the owned worktree
`/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-story-changes-done-references`
and branch `codex/get-fast-proof-of-story-changes-done-references`.
Originating integration checkout: `/Users/terryyin/git/open-dough` on `main`.
Remote target: `origin/main`. Publisher:
`dashboard-territory.local-open-dough` (Hitomi-chan).
Starting revision: `419aeed53f24da7958951adf6fde5caebf963d6e`.
Established claim and first published branch base:
`57cd409a3d685bc2cceb50c4338ad8c5c8d9ea48`.
Checkout setup passed with Node 24.21.0, locked `npm ci`, and
`npm run typecheck:dashboard`. Existing planning authority applies.

The Codex `hitomi-plan-763-deacc745` observer watches the execution branch
in `terryyin/open-dough` with GitHub Actions `ci.yml` (CI). Its directory is
`/tmp/dough-ci-501/watch-nz5hVd`, PID 30941, command session 17212 and cell
`g266:19`.

## Goal and scope

Give Dashboard maintainers faster proof of selected-story changes, Done
historical Intent, Done dependency navigation, Story Notes, and recorded
progress, execution completion and coverage. Migrate the 40 current
Playwright cases across 17 specs and narrow the six mounted Notes control
cases to the project's subscribed state. Preserve real-page provenance,
publication and reload checks in E2E. Retire support once its last consumer
moves and compare time and maintained case count.

The original 19-file/41-case selection is the starting inventory. Record the
two cases retired by `ffb4ef63d` (`intent-done-landed-review-mode` and
`intent-done-review-modes`) against the removed Intent shortcut to the Side
panel. Record the outside-locations line note added by `88d7b0553` in Slice 6.
Ordinary Review controls and the new Review entry from the Intent story card
are owned by [that story](../../seeds/SEED-420-unified-intent-review.md#open-review-changes-from-a-story-card).
The published-observation recovery migration, Locations recovery, source
browsing and reading-place detours retain their separate owners.

## Current decisions

- Apply [the campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the North Star topics
  [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Select MakeMe and page-object conventions for the actual source paths.
  Record production imports before and after for each touched spec or helper.
  Remove spent Playwright support only after tracing frontend and E2E callers.
- Reuse `mountIntentCiPage` for `BoardOrIntent` with a committed work snapshot
  and production card selection. Supply actual `PageReads` collaborators
  via `pageReadsSupplying` and page-loadable MakeMe replies, including
  `anIntentLocationsAnswer`. Use typed review comparisons, file answers and
  historical revisions. Keep existing shared readers and selection rules.
- Use the existing Done owner, `StoryReferenceNavigation`, with the range
  owned by `PageFrame`, its production Board destination and typed
  `done.readBodies`. Reuse the production composition from a narrow entry
  where the case needs the three together. The current Board fixture's
  stubbed `StoryNavigationOnPage` and `board-frame-mount`'s module mocks
  cannot prove this journey. Supply published work already projected by its
  owner for mounted behavior. A built-page case owns actual catalog
  re-observation after Retry if the mounted proof uses a supplied snapshot
  transition. Leave the broader typed observation and launch entry work with
  [its owner](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#drive-published-observation-through-page-entry).
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps selected work, published comparison and progress facts tied to their
  own source and revision. Notes share the page's machine-local per-project
  state across controls. Preserve that ownership when the view takes a
  subscribed project state. [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  calls for reducing feedback cost while preserving distinct proof.
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports preserving observable automated proof through the migration.

## Local gate

On macOS use `caffeinate -s -i`
on AC power, as required by the [maintained sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, default timeouts, and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Use `npm run --silent test:dashboard:frontend -- <owned spec paths> --workers=2`
for focused browser proof, `npm run typecheck:dashboard` when changing TS
contracts or mounts, and `npm run --silent test:e2e -- <named spec paths> --workers=2`
for reached real-page behaviors. Keep the proof record with
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` or `OPEN_DOUGH_E2E_PROOF_RECORD`
pointed to a fresh path. Use the installed consumer trace on the actual
candidate and apply the [executable proof rules](../../../.agents/skills/dough-story-refinement/references/executable-proof.md).
Prove each migrated check can discriminate its promised outcome before retiring
its legacy owner. Run independent engine selections for inventory and include
any E2E promotion in the paired timing.

## Current baseline and premises

Observed on 23 November 2026 in the established preparation worktree at
`e538dcccb`, on AC with Node 24.21.0 and Chromium 158. The 16-logical-core
host reported load 24.28 and 51% free memory before the focused runs. Use a
comparable pair when workload or host load has shifted.

- **Current cohort and runner.** The two-worker frontend command above used
  the 17 legacy paths named in Slices 1–6 and 8, plus Slice 7's existing
  mounted notes spec. Its proof record was strictly green with 40 legacy
  and six Vitest cases in 85.05 s shell elapsed, including setup.
  Summed case time was 119.94 s legacy and 0.16 s mounted. The longest cases
  were Selected story only (8.76 s), Done refresh (8.09 s), and Done dark
  appearance (6.49 s). This is the current cohort baseline. The historical
  37-file/71-case pre-split measurement has a different selection.
- **Built-page proof.** With the E2E command above and two workers, select
  `intent/intent-(story-changes|done-project-refresh|story-completed-source|done-retained-workspace)\.spec\.ts|stories/(branch-slice-progress|taken-execution-complete)\.spec\.ts`
  as the path expression. All eight cases passed in 50.24 s, including
  preparation. This reached the published diff, retained live checkout versus
  immutable historical source, Done refresh and reading place, branch/trunk
  progress and awaiting wrap-up. It is the retained E2E selection for Slices
  1, 3 and 8.
- **Execution baseline repeat.** The original 17 frontend paths and mounted
  Notes control were strictly green at claim revision `57cd409a3` with
  two workers on the same AC-powered Node 24.21.0, 16-logical-core Mac.
  At 11.10 load and 45% free memory, 40 Playwright and six Vitest cases
  took 49.34 s shell elapsed. The retained built-page selection then
  passed eight cases in 37.78 s, at 11.70 load and 44% free memory.
  This lower-load pair gives a second comparison basis. The Git evidence
  directory holds the revision, exact path list, independent engine
  inventories, host readings and both strict proof records.
- **Done reference mount.** The scratch
  `navigation/story-reference-preparation-probe.spec.ts` ran under the
  two-worker frontend command above. It used the Board mount's real
  `PageFrame` and `Board`, the production `StoryReferenceNavigation`
  in place of the stub, and `makeMe.aDoneCatalog` with a current and an
  expired record. Following the reference showed the catalog failure with
  zero body reads. Retry supplied the recovered snapshot, focused the
  correct card, cleared the notice, and requested only the current record
  (the Board and disclosure can ask for its same body independently).
  Removing `revealStory` left the card visible without focus and failed the
  focus assertion. The restored probe passed again. Scratch sources were
  removed. Snapshot replacement proves the journey from the projected
  catalog. The actual Retry refetch belongs to Slice 5's built-page proof.
- **Typed Intent route.** The preparation observation at `bb42f3886`, recorded
  in `e538dcccb:.planning/slice-plans/778-speed-intent-revision-and-detour-reading/PLAN.md`, mounted the production Intent body with typed story review and
  diff answers, selected a story through its card, and restored a nested
  diff at its exact scroll offset after Development, with zero extra reads.
  Its broken-scroll-recording run returned at 0 px instead of 1,054 px.
  The current cohort additionally observed selected-story reuse and gaps
  and the held historical comparison/locations transition at the built-page
  boundary. Use the existing typed entry at those same transitions as the
  replacement cases move.

## Slices

Paths below are relative to `dashboard/frontend-tests/` and name the
corresponding `.spec.ts` unless stated otherwise.

### 1. Read the selected story's Changed tests from its comparison

Type: Behavior
Status: done

Move `intent/intent-read-reuse-story`, `intent/intent-story-changes-gaps`
and `intent/intent-story-changes-only` (7 legacy cases). Use the production
Intent page entry with typed comparison, locations, and file replies.
Retain `e2e/intent/intent-story-changes.spec.ts` for the real published
selection and the Review changes diff.

**Proof.** Inspect the changed-only inventory, expansion and refresh at a new
revision. Open a changed file and observe one diff ask and no published-text
ask for it. Keep the empty/product-only and missing-location explanations,
and fail then retry a comparison while the tree remains usable.

**Accepted proof and case disposition.** All seven legacy cases moved to
Vitest Chromium at the same three spec paths. The names stayed the same
except for the product-only case, which now also exercises Refresh to an
empty comparison and reads published source after clearing the filter.
The other cases retain the location and folder read counts, no-workspace
and failed comparison details, retry, missing locations across story
and Project Intent, changed-only inventory and selection, and Show latest
at a newer published revision. The source review records C01–C07 at their
assertions. Fixture data enters `mountIntentCiPage` as committed work and
typed comparison, CI, locations and file reads. Production still owns
selection, read reuse, tree behavior and retry.

- The three-spec two-worker Vitest selection passed seven cases in 11.415 s
  including preparation. The retained built-page story-changes E2E case
  passed in 15.784 s and the Dashboard typecheck passed.
- The deliberate regression run failed all seven cases at their intended
  assertions. A second probe suppressed published-tree file reads after
  unavailable or failed comparisons and failed both source assertions.
  Restored production files match the base.
- Spec production imports went from `authenticatedReadRules.ts` and
  `storyReviewContract.ts` to zero in read reuse, from
  `storyReviewContract.ts` to zero in comparison gaps, and stayed zero in
  selected-only. The added Changes fixture imports only the production
  `ReviewSource` type. No existing shared test support was removed because
  it still has frontend or E2E callers.
- The independent refactor shares the story's controls through the existing
  `intent-story-compare-page.ts` (zero production imports before and after),
  uses completed MakeMe work entries, and restores the collapsed Other folder's
  file-absence assertion. All seven focused cases passed on the refactored
  sources in 17.37 s. The E2E and scratch proof boundaries still apply.
- The current worktree's Git evidence directory holds `slice-1-refactor.md`,
  `s1-refactor-final.json`, `slice-1-return.md`,
  `s1-consumer-trace-final.md` and the `s1-restored`, `s1-e2e`,
  `s1-typecheck`, `s1-regression` and `s1-gap-tree-regression` run records.

### 2. Keep Intent controls and CI cues usable as the reading space changes

Type: Behavior
Status: done

Move `intent/intent-sidebar-toggle`, `intent/intent-story-views-narrow`,
`intent/intent-story-summary-title` and `intent/intent-story-ci-cues` (8 legacy
cases). Use the same mounted Intent frame and browser viewport as the proof
surface. Reuse the location header look already exercised by
`intent/intent-gherkin-groups`. Consolidate the header look read with that
case. The other current consumer is
`e2e/intent/intent-story-changes.spec.ts`. Move its equivalent location
header appearance assertions only after the mounted proof distinguishes the
changed, selected and unmarked states and the visible controls. Keep its
publication, folder/file markings and diff assertions intact. Remove
`dashboard/test-support/intentLocationHeaderLook.ts` after both consumers
have moved.

**Proof.** Hide and show files through the story and Project views. Observe
the reading pane's width or height, preserved file and proof, project-local
choice, keyboard order and activation. Check the full title and selected,
focused and group CI cues in Chromium, including their distinct geometry
or appearance assertions.

**Accepted proof and case disposition.** All eight legacy cases moved at
their existing spec paths and titles. The four sidebar cases retain reading
pane width and height, restored file, Proof, scope, expansion and scroll,
project-local choice, and keyboard input. The two narrow cases exercise
phone and short layouts, including zoom-equivalent sizes. The title case
observes the complete wrapping heading. The CI cue case observes accessible
names and computed appearances for file, folder, location, focus and
selection across light and dark layouts. The two existing Gherkin cases
retain their checks and share the location header measurement. A separate mounted
case in the sidebar spec now observes marked, selected and unmarked headers.
The retained E2E still proves real publication, tree markings, selection,
changed diff and published source. The two consumer-free Playwright helpers
`intentLocationHeaderLook.ts` and `captureTreeCiCueScreenshots.ts`, and four
unused file-layout exports in `intentModePage.ts`, were removed.

The two-worker five-spec frontend selection passed ten cases in 10.041 s
including preparation. The retained E2E passed in 7.924 s and Dashboard
typecheck passed. The probes first failed all eight migrated cases at their
layout, title or cue checks, then failed the mounted Taken and Gherkin
header checks when header width shrank. Restored production files match
the base. The independent refactor gave the relocated Taken-header proof
its own mounted case and restored the title's exact text observation.
Seven cases in the three affected specs then passed in 8.82 s, including
the added case. The width probe failed that case at its width assertion.
The unchanged narrow and Gherkin cases, E2E and typecheck proof still
apply. Source review C08–C10 records the observing cases.

Direct production imports stay zero in the five specs, the scope-tree
object, the E2E spec and the two new layout helpers. The existing Done
fixture retains its three type-only production imports.
`intentPerspectivePage.ts` retains its location ID import and
`intentModePage.ts` retains zero. The removed helpers had zero.
`slice-2-return.md` in the worktree's Git evidence directory records each
migration, the consumer trace and the terminal `s2-final`, `s2-e2e`,
`s2-typecheck` and two regression runs. The refactor evidence is in
`slice-2-refactor.md` and `s2-refactor-frontend.json`.

### 3. Read a Done story's own historical Intent

Type: Behavior
Status: done

Move `intent/intent-done-project-refresh`, `intent/intent-done-source-selection`
and `intent/intent-story-dark-appearance` (3 legacy cases). Use typed
historical comparison and location replies. Preserve the actual sidebar
selection while Intent is open. Reuse the mounted frame and feed the work
update through the committed-work entry for the refresh assertions.
Retain `e2e/intent/intent-done-project-refresh.spec.ts`,
`e2e/intent/intent-story-completed-source.spec.ts` and
`e2e/intent/intent-done-retained-workspace.spec.ts` for publication,
historical source and live workspace provenance.

**Proof.** Refresh leaves the same historical file and reading place usable
through Done tabs; Project Intent can later return updated evidence.
When a Done selection supersedes another, hold both comparison and
locations and see no prior story's tree or source during either wait. The
new story's own source arrives and the Done evidence stays readable in dark
appearance.

**Accepted proof and case disposition.** All three legacy cases moved at
their original paths and titles. Historical refresh commits newer work
while Done Purpose is open, cycles Done tabs, requests the latest Project
Intent locations, and returns to the same file, diff and exact nonzero scroll
position while that reply is held. The comparison ledger stays at one
historical read. The second case changes the selected Done story through the
actual Sessions sidebar with Intent open. Neither held response permits the
prior tree or source to show, and the new completion supplies its own file.
The dark case retains numeric contrast, keyboard focus and file-layout
observations across desktop and phone widths as well as light/dark switching.
The first probe caught borrowed historical locations and lost dark-token
contrast. The second showed 0 px in place of the saved 1,000 px when reading
place was broken. The real title assertion now waits for the Done body
before measuring or clicking the card.

The restored two-worker gate passed nine cases across these three specs
and the reached Taken selection, phone paging/layout and Done cue specs
in 27.605 s. Typecheck passed. The five retained built-page Done cases
reuse the strict claim baseline because their production, setup and
assertions remain applicable. That proof retains actual publication,
historic-versus-live reads, unavailable history and Project refresh.
The consumer trace found the removed `frontendDoneSelection.ts` helper
had exactly one migrated consumer.

Direct production imports stayed zero in the refresh, appearance and
Development card sources. The selection spec dropped
`storyReviewContract.ts`, the new fixture imports the `PageReads` type,
and the compared story fixture keeps the same three type imports. Retired
Done selection support used `authenticatedReadRules.ts`. The worktree's
Git evidence directory holds `slice-3-return.md`, the consumer trace and
run records. Source review C11–C13 records the observing assertions.
The independent pass checks the dark root text and measured chart mark,
shares the existing contrast reader with the related mounted CI cue case,
and checks the whole Purpose region for absence of Story A's source.
All three affected cases passed in 12.24 s outer wall. The runner's
strict receipt was written before the evidence wrapper rejected its
shell status variable assignment. The extra cue spec still has zero
production imports. See `slice-3-refactor.md`.

### 4. Reveal a Done destination and honor superseding input

Type: Behavior
Status: planned

Move the successful near/far and held keyboard reveal cases from
`navigation/story-reference-done` and all three cancellation cases in
`navigation/story-reference-done-cancellation` (5 legacy cases). Exercise the
production range, notice and destination against a typed catalog and held
record body. Use the actual pointer or keyboard event where cancellation
depends on it.

**Proof.** The near destination focuses in place; a far destination grows the
range just through its entry and keeps a longer range. A held body stays
pending until it can focus. A later move or range reset, pointer down with a
subsequent click, and Tab away each supersede the held reveal. Observe focus,
cue or its end, shown range, and requested bodies after releasing the hold.

### 5. Explain and recover Done references from recorded read states

Type: Behavior
Status: planned

Move the failed-detail and changed-disclosure cases from
`navigation/story-reference-done` and the four cases in
`navigation/story-reference-done-recovery` (6 legacy cases). Reuse Slice 4's
production entry and count typed read requests. Preserve actual catalog
Retry at the built-page boundary, with a representative E2E path if the
focused mount owns only the request and re-projected result. Any additional
E2E costs count in the comparison.

**Proof.** Distinguish expired, unlisted, pending and failed answers. Retry
the actual catalog or Done body failure and observe the recovered
destination with no older body reads. Later inspection supersedes stale
misses and failures. A replaced disclosure starts closed and reads the
new supplier only when opened.

### 6. Save notes from Intent and return to the same reading

Type: Behavior
Status: planned

Move `intent/intent-story-notes` (5 legacy cases) with typed Notes and Review
replies. Use the mounted Intent entry and actual Notes and diff controls,
including the Changed tests file outside Intent locations.

**Proof.** Observe the unreadable cue next to the long title, and capture the
stored line-note subject from each distinct entry. Close Notes and observe
the selected file and opener focus. Keep the case added for the
outside-locations file in the disposition map.

### 7. Subscribe the Story Notes control to the project's notes state

Type: Behavior
Status: planned

Narrow `stories/story-notes-control` (6 existing Vitest cases). Wire the
production control at the existing per-project state and observe the
mounted control with the same subscribed state, using `localSettingState`
and `mountComponent`. Drop its `act` wrapping and global settle flag.
Trace reached callers including `StoryNotesDialog`, Board and Done cards,
Intent header and Story Review. Run
`e2e/terminals/agent-terminal-lifetime.spec.ts` for shared page wiring.

**Proof.** Verify count, waiting and unreadable notices, open-list refresh,
keyboard activation and focus return. A save is visible before the held
read resolves, and a post-resolution render observes that the stale reply
cannot replace it. Keep one project subscription for the control and its
open dialog.

### 8. Show recorded progress, execution completion and coverage with their gaps

Type: Behavior
Status: planned

Move `stories/taken-slice-progress`, `stories/plan-execution-complete-detail`
and `intent/intent-story-coverage` (6 legacy cases) over the existing
`SliceProgress`, `StoryDetail` and `IntentStoryCoverage` owners. Reuse typed
plan facts and Done record replies. Treat plan interpretation, provenance and
reload as the existing
`e2e/stories/branch-slice-progress.spec.ts` and
`e2e/stories/taken-execution-complete.spec.ts` boundaries. Check the final
disposition ledger across slices, retire spent support, and record the
paired two-worker case counts, wall time and remaining costs.

**Proof.** An updated plan changes the recorded slice bar/count. The plan
and completion gaps remain distinct from an empty result. Show execution
advice from the recorded completion. Coverage preserves reported,
insufficient, unavailable, absent and failed/retry meanings. Opening a
disclosure adds no read if the facts were already projected, and future
plan proof provides no completed coverage.

## Slice review

The provisional wide changes and Done-navigation slices were separated by
their proof boundary during construction. The eight resulting slices each
own one proof loop and are sized for 15 active minutes, with typed fixture
reuse and command time outside that budget. Further slice-plan refinement
was unnecessary after that split. The changed-tree and layout slices reuse
one Intent production entry, the two reference slices reuse one navigation
and range owner, and the Notes slices preserve the same project state.
No slice-specific blocking concern remains.
