# Get fast proof of Intent timing history

**Identity:** SEED-413#speed-intent-timing-history-proof
**Source:** [Get fast proof of Intent timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof)
**Source review:** [source-review.md](source-review.md)
**Split from:** SEED-413#speed-intent-proof-and-timing (recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`, former Slices 4–6) on 2026-11-21 at its delivered Slice 3 boundary

## Goal and scope

**Correction first.** Before any history move, Slices 1–4 correct the test
entry delivered by SEED-413#speed-intent-proof-and-timing (see
[Correction of the CI status test entry](#correction-of-the-ci-status-test-entry)),
so the history slices build on the corrected entry instead of extending it.

Dashboard maintainers get fast Vitest feedback on what collected Project and
Done timing history say across Intent's homepage, location, folder, and file,
and on how those history reads recover independently and stay isolated to
their project, endpoint, and scope key. Move the 31 legacy cases across 19
timing-history files in `dashboard/frontend-tests/intent/`
(`intent-ci-compact-readout`, `intent-ci-done-glance`,
`intent-ci-done-reference-lifecycle`, `intent-ci-history-chart-marks`,
`intent-project-ci-history-chart-marks`, `intent-project-scope-glance`,
`intent-project-scope-history-{key-isolation,project-isolation,recovery,refresh,remount,source-identity}`,
`intent-scope-glance`, and
`intent-scope-timing-history-{absent,gaps,provenance,reading,segments,units}`),
and refresh the 3 existing Project CI wall-time Vitest specs
(`intent-ci-wall-time-history{,-gaps,-evidence}`) to retire `createRoot`,
React `act`, and `IS_REACT_ACT_ENVIRONMENT` while covering any changed owner.

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use `mountComponent`, `pageMakeMe.mjs` (`aProjectHistory`,
  `aScopeHistoryGlance`, `aComparedStory`, `aCiProof`, and Node-free
  `aDoneWallTimeHistory` added on `publishedReadingMakeMe.mjs`), and colocated
  page objects under `dashboard/frontend-tests/intent/` without modifying
  sibling-owned page objects (`intent-ci-evidence-page.tsx`,
  `intent-ci-scope-page.tsx`, `intent-done-story-page.tsx`,
  `intent-browser-page.ts`, `intent-candidates-page.ts`,
  `intent-file-reading-page.ts`).
- Read CI history through the typed page reads that Slice 1 establishes.
  Add `readDoneWallTimeHistory` (`useIntentCiDoneWallTimeHistory.ts`) and
  `readScopeHistory` (`useIntentCiScopeHistory.ts`) as **required** members
  of the CI reads, supplied with their authenticated readers by the
  production composition root and with typed replies by each case. No
  optional member, `?? default` fallback, or defaulted parameter.
- Render the production composition that owns the history, at its typed
  entry, the way production renders it. Where a history view needs the
  reading place, mount the production owner that provides it; when no owner
  can stand alone, make it stand alone in production. Do not rebuild provider
  stacks, page frames, or ancestor class wrappers in test code. Do not call
  private pipeline functions to build a view's props. Narrow `JudgedBranch`'s
  presentation input to `Omit<JudgedReading, "round">` while
  `IntentCiHistoryPanel` keeps its refresh `round`, and verify owner refresh
  on `intent-ci-wall-time-history.spec.ts`. Use pure helpers in
  `dashboard/src/ciPriorBuildReference.ts` or `ciScopeTiming*.ts` directly
  only for pure calculation rules that need no DOM.
- Build every domain input with page-loadable MakeMe builders and add
  domain-named steps for recurring setup. Do not hand-write domain records,
  and do not run production transforms such as `measuredHistoryOf` to make
  inputs. Keep each spec's and colocated helper's production imports to the
  entry, its typed inputs, and stylesheets. A longer list means the entry
  exposes too much or the case mounts below its owner: fix the entry instead.
- Size each slice to one mount boundary and 3–6 test files (avoiding the
  20-file / 3-surface bundle that overran former Slice 4 in `plan 752`).
  Capture the 19-file / 31-case legacy Playwright baseline with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` at `--workers=2` in Slice 5
  before replacing the first legacy spec, and compare the completed history
  suite in Slice 9. Remove any history `dashboard/test-support/` module whose
  last consumer moves in Slice 9.

## Correction of the CI status test entry

Retrospective of SEED-413#speed-intent-proof-and-timing (`plan 752`,
recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`;
implementation `b1a3f27ea`, `8f260107c`, `b41efa7cb`, merge reconciliation
`6b1afcd88`, landed at `75ab8266d`), at `f5237fab7` on 21 November 2026.
Terry raised the first finding on reviewing the helpers' import lists. It
repeats the backend
[Done capture import-list analysis](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#done-capture-import-list-analysis)
on the frontend. The findings break the
[test boundary](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary)
and [testability](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
rules: a case renders the entry production uses, and production gains no
behavior solely for tests. They also break the
[frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses):
a component that cannot stand alone is made to.

- **Symptom: long production import lists.** In `dashboard/frontend-tests/intent/`,
  `intent-ci-side-panel-mount.ts` imports from 22 production modules,
  `intent-ci-status-fixtures.ts` from 12, `intent-ci-perspective-mount.ts`
  from 10 and the 39-line-body `intent-ci-cues-dark-contrast.spec.ts` from 9.
  The CI comparison family's `intent-done-story-page.tsx` (16) and
  `intent-ci-evidence-page.tsx` (10) show the same shape over the same seam.
- **Test code re-implements production composition.**
  `intent-ci-side-panel-mount.ts` hand-builds a copy of `PageFrame`: the
  Sessions sidebar, `usePageSidePanel` wiring, banner, story cards and
  panels. Production `PageFrame` already takes typed `sessions` and
  `stories`. `intent-ci-perspective-mount.ts` rebuilds
  `StorySelectionProvider` → `IntentPageProviders` → `IntentReadRecovery` →
  `IntentPerspective`, which production composes in `PageFrame` and
  `ConfiguredDashboardContent`. `mountIntentCiEvidence` restates the reading
  place that `IntentCiEvidenceProvider` needs outside its owner
  (`IntentReadingProvider` + `IntentReadingPlaceOfItsOwn`, recorded as a
  `plan 752` learning). The side-panel, homepage and kept cases therefore
  prove a test copy of the page. A change to the production composition can
  break the product while these cases still pass.
- **Cases drive private pipelines and hook state.** The dark-contrast case
  builds Summary props by calling `ciTargetOf`, `scopeEvidenceOf`,
  `comparisonProofOf`, `intentStoryOverlay`, `overlayFilesByPath`,
  `owningLocation` and `filesOfSelection`. It wraps the view in hand-written
  `intent-perspective` / `intent-browser` / `intent-reading` divs so the
  composed backgrounds resemble the page. `mountJudgedRunProof` passes
  `JudgedBranch` a hand-built `judged` hook state and `shownRunOf(shown)`.
- **The typed source is not enforced, and production gained test-only
  behavior.** `IntentCiReadSourceOnPage` (with `IntentReadSourceOnPage` and
  `ReviewSourceOnPage`) is a context whose default is the authenticated
  readers, and production never provides it. A case that omits one compiles
  and silently reaches the real reader. `readHistory` is optional with a
  fallback in `useIntentCiHistory.ts`, kept so that the merge in
  `6b1afcd88` would not touch callers. `ciProofReading.select`,
  `ciComparisonProofs` and `ciComparisonReading.select` gained defaulted
  reader parameters. `ciComparisonReading` also gained a reselection rule
  (`selected.readComparison !== readComparison`) that only a test can
  trigger. Plan 759's own former decisions would have added two more optional
  defaulted readers (`readDoneWallTimeHistory?`, `readScopeHistory?`).
- **Data built outside MakeMe.** `takenStoryEntry` hand-writes a `WorkEntry`
  because `aPublishedWork` has no Taken-story step. `inertCiReads` runs
  production `measuredHistoryOf` to make its empty history. The kept case
  asserts builder output through production `watchedBranchHeads`.

**Correction outcome.** Dashboard maintainers get CI status proof that renders
the production composition through one required, typed page-reads entry, and
that production supplies the same entry explicitly. Each helper's production
imports shrink to that entry, its typed inputs and stylesheets.

**Preserved promises.** Every observation in the 15 `plan 752` cases keeps an
owner: the case titles and distinguishing assertions of the 7 CI status and
cue-contrast files, and the comparison family's consumers of the seam. Product
behavior is unchanged. The 7-file selection stays near its recorded
`8,315 ms` (two workers, including preparation); a regression beyond paired
noise needs a recorded reason.

**Out of scope.** Page-object CSS-class locators (`.intent-ci-state`,
`.intent-locations`) are a separate concern. The comparison family's own
mount design changes only as far as the new entry requires.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under
the [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, focused path selections, and
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types and check
representative E2E history consumers when shared contracts change.

## Decisive premises and proof

- At `58b829487ba83a8a0752eabfeb37391e4169a596` on 21 November 2026 (macOS on AC under `caffeinate -s -i`, `--workers=2`), `intent-project-scope-history-recovery.spec.ts`, `intent-ci-comparison-check-again.spec.ts`, and `intent-ci-comparison-selection.spec.ts` passed 7 cases observing failed and empty history preserving live Scope Proof, measured zero, and partial-unit gaps; the existing 3-file / 5-case Vitest Project CI wall-time history suite (`intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`) passed in `3,437 ms` (`3.44 s`) elapsed including preparation (`baseline-vitest-wall-time-history.proof.json`); and the pre-split 44-file / 95-case legacy cohort ran in `36,187 ms`.
- During `plan 752`'s Slice 4 probe on `cursor/get-fast-proof-of-intent-evidence-and-timing-his` (21 November 2026), adding optional `readDoneWallTimeHistory` and `readScopeHistory` on `IntentCiReadSource`, `aDoneWallTimeHistory` on `publishedReadingMakeMe.mjs`, and narrowing `JudgedBranch` to `Omit<JudgedReading, "round">` passed `npm run typecheck:dashboard` with `0` errors and mounted `IntentCiComparisonView`, `IntentCiHistory`, and `IntentScopeTimingHistory` cleanly in Vitest Browser Mode. The optional members are superseded by required ones under Slice 1's entry; the typecheck premise still holds for adding them.

- At `f5237fab7` on 21 November 2026: production `ConfiguredDashboard`
  provides none of `IntentCiReadSourceOnPage`, `IntentReadSourceOnPage` or
  `ReviewSourceOnPage`, and their defaults serve production. 8 production
  modules read them. 9 test files under `dashboard/frontend-tests/` provide
  them. `PageFrame` takes typed `sessions` (a `MachineSessions` pick) and
  `stories`. `aPublishedWork` has no step that adds a Taken story.
  `SessionsSidebar.tsx` already throws when a consumer sits outside its
  provider ("The Sessions button is outside the page's PageFrame."), the
  precedent for a required page entry.
- Scratch mount at `ebd6cc201` on 21 November 2026 (Vitest Browser Mode,
  `frontend.vitest.config.mts`): real `PageFrame` inside `ProjectsOnPage` and
  `LaunchesOnPage`, with the Side panel case's MakeMe sessions and global
  `fetch`/`WebSocket` recorded. Mounting made no call. Showing the Taken
  story's final report fetched `/__agent-launch/result?source=open-dough&host=claude&session=f-session`.
  Showing the ad hoc session's terminal fetched `/__host-status`, opened
  `ws://…/__agent-terminal?source=open-dough&session=…&host=claude`, and
  called `launches.rereadSessions`. Without `LaunchesOnPage`, `Terminal`
  throws "A launch control is shown outside the page's launches." The
  scratch spec was deleted.

| Promise | Owning proof |
| --- | --- |
| Production and every case supply Intent, CI and review reads through one required typed entry. Readers are fixed at creation, with no optional members, defaulted parameters or test-only reselection. | Slice 1 (`npm run typecheck:dashboard`, the CI status and comparison families, one representative Intent E2E journey). |
| The final-report, host-status and terminal-attach calls go through the required typed page entry that production supplies. | Slice 2 (typecheck, full frontend group, representative session E2E journeys). |
| Homepage, kept-status and Side-panel cases render production `PageFrame` and the production Board/Intent composition, not test copies. | Slice 3 (`intent-ci-status-{homepage,kept,side-panel}`). |
| Status freshness, execution timing, sort and dark-contrast cases render their owning production composition with MakeMe inputs, with no private pipeline calls or hand-built hook state. | Slice 4 (`intent-ci-status-{freshness,execution-time,sort}`, `intent-ci-cues-dark-contrast`, 7-file timing). |
| Done wall-time history keeps its separate read boundary from live Proof, states missing/pending/outside-retention/zero-base facts accurately, and follows reference lifecycle changes | Slice 5 (`intent-ci-compact-readout`, `intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`). |
| Existing Project CI wall-time mounts refresh cleanly without `act` wrapping when `JudgedBranch` narrows, and Done/Project scope chart marks preserve keyboard order, labels, and narrow layout | Slice 6 (`intent-ci-wall-time-history{,-gaps,-evidence}`, `intent-ci-history-chart-marks`, `intent-project-ci-history-chart-marks`). |
| Project and Done scope glances and source/project history keys stay isolated to their own source and project | Slice 7 (`intent-project-scope-glance`, `intent-scope-glance`, `intent-project-scope-history-{source-identity,project-isolation}`). |
| Project scope history distinguishes scope keys, preserves kept history and live Proof on failure, and recovers via Retry or refresh across remounts | Slice 8 (`intent-project-scope-history-{key-isolation,recovery,refresh,remount}`). |
| Collected scope timing keeps case/file units, provenance, segments, and gap explanations distinct, removes spent history support, and runs faster on Vitest | Slice 9 (`intent-scope-timing-history-{absent,gaps,provenance,reading,segments,units}` + two-worker before/after comparison). |

## Slices

### 1. Intent, CI and review reads enter through one required typed page entry

Type: Structure
Status: done

Replace the three default-valued contexts (`IntentCiReadSourceOnPage`,
`IntentReadSourceOnPage`, `ReviewSourceOnPage`) with one production provider.
It takes the page's reads as a required typed prop and throws when a consumer
reads outside it, following the `SessionsSidebar` precedent. `ConfiguredDashboard`
supplies the authenticated readers explicitly. Make every CI read member
required (`readHistory` included) and drop its fallback. Each reading owner
(`ciProofReading`, `ciComparisonProofs`, `ciComparisonReading`) takes its
reader when created, not per call: remove the defaulted parameters and the
reader-identity reselection rule. Move every test provider of the three
contexts to the new entry, comparison family included, with no change to its
assertions.

**Proof.** `npm run typecheck:dashboard` passes. The 7 CI status and
cue-contrast files and the CI comparison family's Vitest files pass unchanged
in their assertions. One representative Intent CI E2E journey passes,
proving that production supplies the authenticated readers. `grep` finds no
default-valued read context, optional read member or defaulted reader
parameter in `dashboard/src`.

**Accepted (21 November 2026).** `dashboard/src/pageReads.tsx` is the entry
(`PageReads`, `PageReadsOnPage`, `useIntentReads`/`useIntentCiReads`/
`useReviewReads`, `authenticatedPageReads`). Cases supply reads through
`pageReadsSupplying` in `dashboard/test-support/component-mount/unreadPageReads.ts`;
unsupplied reads reject. `readCachedFile` also lost its defaulted reader.
Proof: typecheck, full `npm run --silent test:dashboard:frontend` (Vitest 100
files / 306 tests plus legacy Playwright), backend `ci-comparison-client*` and
`intent-shared-reads`, E2E `intent-ci-status` and `story-review-commits`.
Learning for Slices 5–9: the legacy timing-history specs mount through
`dashboard/test-support/comparison-mount/entry.tsx`, which now supplies
`authenticatedPageReads` against its real test servers; it stays until its
last consumer moves. The full frontend group also exposed a flake: a
settings touch helper switched off the context's touch emulation for later
spec files (`board-indicators` lost its coarse pointer). It was fixed in
`system-settings-browser.ts`.

### 2. Side-panel service calls enter through the typed page entry

Type: Structure
Status: done

Decided (Terry, 21 November 2026, option (a)): put the panels' three untyped
service calls behind the Slice 1 typed page entry. `ConfiguredDashboard`
supplies their authenticated implementations and each case supplies typed
replies, keeping the real frame:
- the final-report read (`FinalReport.tsx`, `fetch` of
  `/__agent-launch/result`);
- the host-status read (`hostStatusReads.ts`, `/__host-status`, reached when
  the terminal shows);
- the terminal attach (`attachTerminal` in `attachedTerminal.ts`, used by
  `useAttachedTerminal.ts`, a WebSocket to `/__agent-terminal`).

`PageReads` gains a required `sessions` member (`dashboard/src/sessionServices.ts`:
`readFinalReport`, `readHostStatus`, `openTerminal`) that
`authenticatedPageReads` supplies; `pageReadsSupplying` rejects unsupplied
session calls. The two legacy mounts that Slice 3 replaces supply it until
then.

**Proof.** `npm run typecheck:dashboard` passes; the full frontend group
passes; representative E2E journeys for the final report, the attached
terminal and its host status pass, proving production supplies the
authenticated services.

**Accepted (22 November 2026).** `attachTerminal` takes the opened
`TerminalSocket`; the client `terminalUrl` is gone. Proof: typecheck, full
frontend group (Vitest 102 files / 314 tests plus legacy Playwright), E2E
`agent-terminal-done-report`, `sessions-sidebar-host-status`,
`agent-launch-ad-hoc-terminal`, `agent-terminal-keyboard` and
`intent-ci-status`. Learning for Slice 3: Slice 3 should record each case's
`fetch` and `WebSocket` calls and show none outside its typed replies. Under
load 15–20 the full frontend group took about 24 minutes wall time.

### 3. Homepage, kept and Side panel CI status cases render the production page frame

Type: Structure
Status: planned

Replace `intent-ci-side-panel-mount.ts` and `intent-ci-perspective-mount.ts`.
The cases mount production `PageFrame` with MakeMe sessions and stories,
through the Slice 1 entry, around one production component extracted from
`ConfiguredDashboardContent`: the part that shows either the Board
(`<main hidden><Board/></main>`, owning the Taken story cards, the "Read
final report" button and card selection) or the Intent body
(`IntentReadRecovery` → `IntentPerspective`/`RetainedFollowUpPerspective`).
`ConfiguredDashboardContent` and the cases render that same component; a
case switches view through its typed `showsIntent` input, as the route does.
Supply the page's launches (`LaunchesOnPage`, typed `MachineSessions` built
by MakeMe with every member) as `ConfiguredDashboard` does, because
`Terminal` and `Board` require them.

Add a Taken-story step to `aPublishedWork` in place of `takenStoryEntry`.
Drop the `watchedBranchHeads` assertions on builder output. Keep role-based
colocated page objects.

**Proof.** `intent-ci-status-homepage`, `intent-ci-status-kept` and
`intent-ci-status-side-panel` keep their titles and distinguishing
observations and pass at `--workers=2`. No test file renders `usePageSidePanel`,
`SessionsSidebarOpenList`, `StorySelectionProvider` or `IntentPageProviders`
itself. The side-panel case records no `fetch` or `WebSocket` call outside
its typed replies. Record each replaced helper's production import count
before (side-panel mount 21, perspective mount 11 at `40408c07c`) and after.

### 4. Status evidence and cue-contrast cases render their owning composition with MakeMe inputs

Type: Structure
Status: planned

Render `intent-ci-status-freshness`, `-execution-time` and `-sort` through
the owner of CI status and its proof. That owner stands alone in production,
or the cases render it within the production Intent composition. Either way
the cases restate no reading-place stack, and the judged state comes from
typed status and proof replies, not from a hand-built `judged` or
`shownRunOf`. Render `intent-ci-cues-dark-contrast` through the production
Intent Summary for a selected scope fed by typed CI reads, so that real
ancestors compose the background and no private pipeline function is called.
Add MakeMe steps for any recurring input, such as an empty measured history,
in place of `measuredHistoryOf`.

**Proof.** The 4 files keep their titles and distinguishing observations and
pass. Measure the complete 7-file selection at `--workers=2`, including
preparation, against `8,315 ms`, and record any regression beyond paired
noise with its reason. Record each spec's and helper's production import
count before and after. `intent-ci-status-fixtures.ts` keeps no production
transform.

### 5. Done wall-time history keeps its separate boundary, compact readout, and reference lifecycle

Type: Behavior
Status: planned

Capture the 19-file / 31-case legacy timing-history baseline at `--workers=2`
with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`. Add required
`readDoneWallTimeHistory` to the CI reads (`useIntentCiDoneWallTimeHistory.ts`),
supplied by production and by each case, and add `aDoneWallTimeHistory` to
`publishedReadingMakeMe.mjs` (`pageMakeMe.mjs`).
Move `intent-ci-compact-readout`, `intent-ci-done-glance`, and
`intent-ci-done-reference-lifecycle` (3 files, 6 legacy cases) over
`IntentCiComparisonView` and the Slice 1 page-reads entry (and direct pure
reference checks only where no DOM behavior is part of the proof). First
observe one held Done wall-time history read resolving beside live comparison
proof without rereading comparison proof.

**Proof.** Missing, pending, outside-retention, insufficient, unusable-selected,
zero-average, and stand-in landing baselines render their exact compact words
and cues; Done glance marks and hover/focus details match the landing;
changing or retrying the Done reference updates or preserves history without
perturbing live Proof (`0` legacy Playwright cases remain on the 3 files).

### 6. Project CI wall-time mounts drop `act` wrapping and chart marks keep keyboard and narrow layout

Type: Behavior
Status: planned

Add required `readScopeHistory` to the CI reads
(`useIntentCiScopeHistory.ts`) and narrow `JudgedBranch` to
`Omit<JudgedReading, "round">` while `IntentCiHistoryPanel` retains its
refresh `round`. Refresh `intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`
onto `mountComponent` (retiring `createRoot`, React `act`, and
`IS_REACT_ACT_ENVIRONMENT` and verifying refresh round behavior), and move
`intent-ci-history-chart-marks` and `intent-project-ci-history-chart-marks`
(2 legacy files / 4 legacy cases + 3 refreshed Vitest files).

**Proof.** Project CI wall-time history refreshes through `Check again` ->
`Builds and evidence` keyboard order without `act` helpers, and Project/Done
history chart marks preserve build/date labels, accessible descriptions,
run links, and narrow-viewport fit.

### 7. Scope glances and project/source history keys stay isolated to their source

Type: Behavior
Status: planned

Move `intent-project-scope-glance`, `intent-scope-glance`,
`intent-project-scope-history-source-identity`, and
`intent-project-scope-history-project-isolation` (4 files, 5 legacy cases)
over `IntentScopeTimingHistory` / `useIntentCiScopeHistory` within its
production owner (no restated reading-place stack) and typed `readScopeHistory` replies recording requested source, endpoint, scope,
and `AbortSignal`.

**Proof.** Project and Done scope glances display accurate summary cues, and
switching source identity or project issues the right request and aborts/ignores
other projects' or sources' answers without leaking history across projects.

### 8. Project scope history isolates scope keys, retains live proof on failure, and recovers on Retry

Type: Behavior
Status: planned

Move `intent-project-scope-history-key-isolation`,
`intent-project-scope-history-recovery`,
`intent-project-scope-history-refresh`, and
`intent-project-scope-history-remount` (4 files, 6 legacy cases) within the
production owner of `IntentScopeTimingHistory` beside live Scope Proof.

**Proof.** Entry, folder, file, and revision keys keep distinct kept histories
across remounts; a failed or empty history read preserves both the last kept
history and live Scope Proof, offers `Retry`, and recovers or refreshes
without borrowing history from another endpoint or scope.

### 9. Collected scope timing preserves units, provenance, segments, and gaps and runs faster on Vitest

Type: Behavior
Status: planned

Move `intent-scope-timing-history-absent`, `intent-scope-timing-history-gaps`,
`intent-scope-timing-history-provenance`, `intent-scope-timing-history-reading`,
`intent-scope-timing-history-segments`, and `intent-scope-timing-history-units`
(6 files, 10 legacy cases) over `IntentScopeTimingHistory` (plus direct pure
timing checks only where DOM rendering is not the proof). Remove any
`dashboard/test-support/` history module whose last consumer across `e2e/` and
`dashboard/frontend-tests/` has moved, and record the two-worker before/after
timing and case-disposition comparison against Slice 5's 19-file legacy
baseline and the `3,437 ms` Vitest wall-time baseline.

**Proof.** Absent, partial, and unavailable timing reasons, separate case vs
file units, interrupted segments, build dates, and provenance stay readable
and accessible; zero legacy Playwright cases remain across all 19 owned files;
no `act`/`IS_REACT_ACT_ENVIRONMENT` remains in the owned history specs; spent
history support is removed; and two-worker Vitest elapsed time including
preparation improves over the legacy baseline.

## Plan review

Amended on 21 November 2026 by the execution retrospective of
SEED-413#speed-intent-proof-and-timing. Slices 1–3 correct its test entry
ahead of the history moves, the former Slices 1–5 are now 4–8, and their
decisions no longer extend the corrected seam with optional defaulted
readers or restated provider stacks. Eight slices is the plan limit.
Refinement was not needed: each correction slice keeps one boundary (the
production read entry, the page-frame mount, the evidence mount).
Slice 2's entry is settled: Terry chose option (a) on 21 November 2026, and
the scratch mount (see the premises) named the three untyped calls it moves.
Slice 3 may need a production extraction to make the CI status owner stand
alone; that extraction is bounded to the slice's own owner. No remaining
concern blocks readiness.

Refined in execution on 22 November 2026: Slice 2 stopped at 9 of 15 active
minutes because its premise failed. The side-panel case also observes the
Taken story cards (`Board`) and the Development/Intent switch, which sit
outside `PageFrame` plus the Intent body, so the mount boundary needs one
extracted Board/Intent production component. The plan's own rule ("extract
it in production") covers that extraction. Former Slice 2 split into Slice 2
(service calls behind the entry, nearly complete) and Slice 3 (frame mount),
renumbering former Slices 3–8 to 4–9. Nine slices stays within the
in-execution limit for splitting the slice in progress.
