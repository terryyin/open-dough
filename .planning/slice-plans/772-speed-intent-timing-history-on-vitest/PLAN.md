# Get fast proof of Intent CI wall-time history

**Identity:** SEED-413#speed-intent-timing-history-on-vitest
**Source:** [Get fast proof of Intent CI wall-time history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-on-vitest)
**Source review:** [source-only review](source-review.md)
**Split from:** SEED-413#speed-intent-ci-status-frame-and-timing-history (plan 764, recoverable at `7b9e64961:.planning/slice-plans/764-speed-intent-ci-status-frame-and-timing-history/PLAN.md`; former Slice 4's history port and Slices 5–8) on 2026-11-22 at its delivered Slice 4 boundary. Resplit before readiness on 2026-11-22: former Slices 4–6 (collected scope timing history) moved to [plan 774](../774-speed-intent-scope-timing-history/PLAN.md) for SEED-413#speed-intent-scope-timing-history.

## Goal and scope

A dashboard maintainer can quickly check what Project and Done CI wall-time
history say beside live CI proof, with every history case running against the
production Intent page layout. The seed story holds the full goal, scope and
key examples.

- **Included.** The delivered CI status entry correction below; the 5 legacy
  wall-time history specs (10 cases): `intent-ci-compact-readout` (3),
  `intent-ci-done-glance` (1), `intent-ci-done-reference-lifecycle` (2),
  `intent-ci-history-chart-marks` (2), `intent-project-ci-history-chart-marks`
  (2); refreshing the 3 Project CI wall-time Vitest specs
  (`intent-ci-wall-time-history{,-gaps,-evidence}`, 5 cases).
- **Excluded.** Collected scope timing history (14 legacy files, plan 774);
  attempt proof and Summary (plan 760); sibling-owned page objects
  (`intent-ci-evidence-page.tsx`, `intent-ci-scope-page.tsx`,
  `intent-done-story-page.tsx`, `intent-browser-page.ts`,
  `intent-candidates-page.ts`, `intent-file-reading-page.ts`) are not modified.
- **Assumption.** One or two legacy files fit a 15-minute slice (plan 764's
  three-file port stopped at 8.1 active minutes with work outstanding).

## Carried decisions and learnings

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Render the production owner of each history view at its typed entry; no
  test copies of compositions, restated provider stacks, ancestor class
  wrappers, private pipeline calls, hand-written domain records or production
  transforms to make inputs.
- Delivered by plan 764 and available: required `readDoneWallTimeHistory`
  and `readScopeHistory` on `IntentCiReadSource`
  (`dashboard/src/intentCiReadSource.ts`, supplied by
  `authenticatedIntentCiReads`, rejected by `unreadCiReads`);
  `intent/intent-ci-page-mount.ts` (`mountIntentCiPage`: production
  `PageFrame`, `StoryReferenceNavigation`, `BoardOrIntent`);
  `recordOutsideCalls`; `intent-ci-sessions-sidebar.ts`;
  `makeMe.aCiHistoryAnswer.pleaseMeasured()`. A Done story's Summary opens
  from its CI comparison entry button. The page-wide Sessions shortcut is
  Command+B only.
- Done wall-time history inputs come from a Node-free `aDoneWallTimeHistory`
  builder on `publishedReadingMakeMe.mjs` with domain-named steps
  (availability, priors, selected, stand-in), not raw facts.
- Narrow `JudgedBranch`'s presentation input
  (`dashboard/src/IntentCiJudgedBranch.tsx`) to `Omit<JudgedReading, "round">`
  while `IntentCiHistoryPanel` keeps its refresh `round`.

## Correction of the delivered CI status entry

Execution retrospective of SEED-413#speed-intent-ci-status-frame-and-timing-history
(plan 764; commits `ed26bbd04`, `d7cd56e6a`, `136d221a8`, `d14d182ad`,
`d55997e20` on its story branch), 22 November 2026, a read-only outcome
review of `git diff 5a434844e d55997e20`. No product bug was found. Every
history slice mounts through the same entry, so these come first:

- **The page mount omits production layout ancestors.**
  `configuredDashboardContent.tsx` places `BoardOrIntent` inside
  `<div class="board-scroll|intent-scroll"><div class="scroll-content">`;
  `board.css` makes `.board-scroll > .scroll-content` the `board` container
  that drives Column fit, and `intent-perspective.css` gives
  `.intent-scroll > .scroll-content` the flex-column height that lets the
  panes scroll on their own. `intent/intent-ci-page-mount.ts` renders
  `BoardOrIntent` without them. Move the perspective scroll container into
  one production component that `ConfiguredDashboardContent` and the mount
  both render; no class names in test code.
- **Circular imports at the page entry.** `pageReads.tsx` imports
  `StoryNotesOnPage`/`StoryReviewStatesOnPage` and their map types from
  `storyNotes.ts`/`storyReviewStates.ts`, which import their read hooks back
  from `pageReads.tsx`. Keep the per-project maps and their hooks in modules
  that depend on the entry, not the reverse.
- **A parallel `MachineSessions` copy remains.**
  `navigation/board-mount.ts` `noSessions` hand-builds what
  `test-support/component-mount/machineSessionsAnswering.ts` adapts from a
  MakeMe answer (its actions throw where the adapter's stay pending); give
  the adapter a step for the throwing variant or justify both.
- **Duplicated test data and helpers.** `aPublishedWork…taking()`
  (`comparisonViewTestData.mjs`) restates the Taken `WorkEntry` that
  `takenListing` (`comparedStoryWorkTestData.mjs`) builds; never-settling
  promise helpers are written separately in `intent-ci-status-fixtures.ts`,
  `intent-story-compare-stories.ts`, `review/story-review-panel-page.ts`,
  `machineSessionsAnswering.ts` and `fakeGitHub.ts`.
- **Relocated `act` scaffolding.** `stories/story-notes-dialog-page.ts`
  moved the dialog spec's `createRoot`/`act` mount and a module-scope
  `IS_REACT_ACT_ENVIRONMENT` stub out of the spec instead of retiring them.
- **Assertion gap in the freshness race.** With the abort in
  `useIntentCiJudgment.ts`'s effect cleanup removed,
  `intent-ci-status-freshness.spec.ts` case 3 still passes (premise P1).
  After `lateFailing.resolve(...)` the case waits one microtask and asserts
  only absences. Add a positive wait for the current story's answer after
  each late resolve; the late-trunk half is protected by the separate
  project-scope provider, not the abort guard.
- **Latent test-only trap.** `PageReadsOnPage` binds each project's notes and
  review-state store to the reads current at creation; a case that rerenders
  with different replies keeps the old ones. Production mounts it once with
  constant reads. Record it at the mount's contract; no change is needed
  unless a moved case rerenders with new replies.

## Decisive premises

| # | Premise | Consuming operation | Observation | Result |
|---|---|---|---|---|
| P1 | The freshness case does not discriminate the abort guard | Slice 2 proof | Scratch edit `// controller.abort();` at `dashboard/src/useIntentCiJudgment.ts:187`, then `npm run --silent test:dashboard:frontend -- --workers 2 dashboard/frontend-tests/intent/intent-ci-status-freshness.spec.ts` in this worktree at `1ec99e51a`, 2026-11-22; reverted | 3 passed with the guard removed: premise true, Slice 2 adds the discriminating wait |
| P2 | The page mount renders `BoardOrIntent` without the production scroll ancestors | Slice 1 | Read `intent/intent-ci-page-mount.ts` (no scroll container) and `configuredDashboardContent.tsx:70–76` at `1ec99e51a` | True; the move is structural |
| P3 | The 5 owned legacy files pass on the legacy engine and give the before measure | Slices 3–6 timing comparison | `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=… caffeinate -s -i npm run --silent test:dashboard:frontend -- --workers 2 <5 files>` at `1ec99e51a`, 2026-11-22 17:19 | 10 passed; 31.91 s including preparation; runner 28,744 ms; load 40–57 |
| P4 | The 3 Project CI wall-time Vitest specs pass before refresh | Slice 5 | Same command with the 3 `intent-ci-wall-time-history*` files at `1ec99e51a` | 5 passed; 12.09 s including preparation; Vitest 8.67 s; load ~61 |

No premise remains open. The legacy proof record from plan 764 is not
retained (its checkout was retired); P3 replaces it for this story's
selection.

## Proof map

| Promise | Owner | Observable proof |
|---|---|---|
| Mount renders the production layout ancestors | Slice 1 | One production scroll container rendered by `ConfiguredDashboardContent` and the mount; CI status cases unchanged and green |
| Page entry has no import cycle | Slice 1 | No import of `pageReads.tsx` from modules it imports; typecheck |
| Test support has one owner per concern; story-notes dialog without `act` | Slice 2 | Duplicates removed; dialog spec green without `act`/`IS_REACT_ACT_ENVIRONMENT` |
| Freshness race discriminates the abort guard | Slice 2 | Case fails with the abort removed (scratch) and passes with it |
| Done compact readout baselines | Slice 3 | Exact words and cues per baseline state, stand-in named |
| Done glance and reference lifecycle | Slice 4 | Glance marks and hover/focus details; reference change/retry keeps live proof |
| Project CI wall-time mounts without `act` | Slice 5 | 5 refreshed cases green with no `createRoot`/`act`/`IS_REACT_ACT_ENVIRONMENT` |
| Chart marks keep labels, links, keyboard and narrow fit | Slice 6 | Light/dark narrow viewport, run links, keyboard order |
| Faster, fewer maintained cases; spent support removed | Slice 6 | Two-worker before/after against P3 and P4; case disposition table |

Local gate per slice: typecheck and the focused frontend selection through
`npm run --silent test:dashboard:frontend -- --workers 2 <paths>`; Slice 1
and Slice 6 also run the full dashboard frontend group and the representative
`e2e/intent/intent-ci-status.spec.ts` and `e2e/intent/intent-ci-done-prior-build.spec.ts` E2E journeys, because the
mount and shared layout change. Run long local suites under the maintained
macOS sleep guard (`caffeinate -s -i`, on AC power) per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Failures follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Slices

### 1. The CI status page mount renders the production Intent layout and the page entry has no import cycle

Type: Structure
Status: done

Move the perspective scroll container out of `configuredDashboardContent.tsx`
into one production component that `ConfiguredDashboardContent` and
`mountIntentCiPage` both render. Move the per-project notes and review-state
maps and hooks so `pageReads.tsx` imports nothing that imports it back.
Enables Slices 3–6, whose narrow-viewport and layout cases need production
layout.

Proof: typecheck; the 7 CI status files, `intent-story-compare-*`,
board-mount consumers and the story-notes dialog spec pass with unchanged
titles and assertions; full frontend group; representative
`e2e/intent/intent-ci-status.spec.ts` E2E.

Accepted: `PerspectiveScroll` (`dashboard/src/perspectiveScroll.tsx`) is
rendered by `ConfiguredDashboardContent`, `mountIntentCiPage` and
`board-mount.ts`; `pageReads.tsx` holds per-project values through
`useHeldOnPage` and imports nothing that imports it back. The new
`intent-ci-status-layout.spec.ts` case fails with the container removed.
Learning for Slices 3–6: with production layout, the Board fits its columns
at 1280px and pages later columns out of view, so the development-card page
object pages to the card's column (`showColumnOf`) before clicking.

### 2. CI status test support has one owner per concern and the freshness race discriminates its abort guard

Type: Structure
Status: done

Consolidate `noSessions` into the `machineSessionsAnswering` adapter (or
record why both stay), the duplicated Taken `WorkEntry` and never-settling
helpers; retire `act` and `IS_REACT_ACT_ENVIRONMENT` from
`story-notes-dialog-page.ts`; add the positive wait for the current story's
answer after each late resolve in the freshness case. Directly owned
retrospective correction.

Proof: removing the abort in `useIntentCiJudgment.ts` (scratch) fails
freshness case 3, restoring it passes; consumers of every consolidated helper
pass with unchanged titles; typecheck.

Accepted: `machineSessionsAnswering(answer, refusal)` owns the throwing
variant; `takenEntry` owns the Taken `WorkEntry`; `unanswered`
(`dashboard/test-support/support/waitUntil.ts`) is the one never-settling
promise; the story-notes dialog mounts through `mountComponent`. Learning:
a positive wait after a late resolve discriminates only once the late update
has rendered; the freshness case's `afterArriving` awaits the held read and
two animation frames.

### 3. Done wall-time history keeps its compact readout words and cues

Type: Behavior
Status: done

Add `aDoneWallTimeHistory` to `publishedReadingMakeMe.mjs`. First observe one
held Done wall-time history read resolving beside live comparison proof
through `mountIntentCiPage` without rereading comparison proof, then move
`intent-ci-compact-readout` (3 cases).

Behavior: a Done story whose baseline is missing, pending, outside retention,
insufficient, unusable-selected or zero-average, or a stand-in landing → the
compact readout shows its exact words and cue.

Proof: the moved Vitest spec; 0 legacy cases remain on the file.

Accepted: `intent-ci-compact-readout.spec.ts` runs on Vitest through
`openDoneStoryComparison` → `mountIntentCiPage` (4 cases: the 3 legacy titles
plus "a held history read resolves beside the live comparison proof without
rereading it"); `aDoneWallTimeHistory` lives in
`Distribution/tests/support/doneWallTimeHistoryTestData.mjs`; page object
`intent-ci-done-history-page.ts`. 3 passed in 6.27 s including preparation
before the refactor added the held-read case. Learning for Slice 4:
`openDoneStoryComparison(review, readDoneWallTimeHistory)` is the entry; the
held-read case may fold into the moved reference-lifecycle spec when it
observes the same no-reread signal. The builder computes the prior average
and change the read answers with, restating `priorBuildReferenceOf`; reusing
it would load dashboard source into the shared makeMe builders.

### 4. Done glance and reference lifecycle keep history beside live proof

Type: Behavior
Status: done

Move `intent-ci-done-glance` (1) and `intent-ci-done-reference-lifecycle` (2).

Behavior: Done glance marks and hover/focus details match the landing;
changing or retrying the Done reference updates or keeps history without
perturbing live proof.

Proof: the moved Vitest specs; 0 legacy cases remain on the 2 files.

Accepted: both specs run on Vitest at their paths through
`openDoneStoryComparison(review, readDoneWallTimeHistory, readComparison)`;
lifecycle case 2 absorbed the compact-readout held-read case (compact readout
keeps its 3 legacy cases); `mountedDoneWallTime.ts` was deleted and
`doneWallReferenceHistory.ts` keeps only what the two e2e prior-build specs
use. Moved specs: 4.53 s including preparation. The glance's "later landings
stay out" and column-header checks belong to the server projection
(`ci-done-wall-reference`, `ci-history-reader-compatibility`) and
`intent-ci-comparison-endpoints`. Learning: a successful Check again rereads
the Done history (`checkedAgain` keys the read); the legacy "asks the provider
nothing" was the server cache. `.intent-ci-gap` is still read by the
sibling-owned `intent-ci-evidence-page.tsx` and by `intent-ci-done-history-page.ts`.

### 5. Project CI wall-time history refreshes without `act` wrapping

Type: Behavior
Status: done

Narrow `JudgedBranch` to `Omit<JudgedReading, "round">` and refresh
`intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts` onto the shared
mount, retiring `createRoot`, React `act` and `IS_REACT_ACT_ENVIRONMENT`.

Behavior: Project CI wall-time history refreshes through `Check again` →
`Builds and evidence` in keyboard order and keeps its refresh round.

Proof: the 5 refreshed cases pass with no `act` helper; typecheck.

Accepted: `JudgedBranch` and `previouslyRetrievedAt` take
`Omit<JudgedReading, "round">`; the 3 specs mount through
`mountJudgedRunProof` (`openTrunkHistory`, intent-ci-wall-time-history-page.ts)
with MakeMe inputs, 2.54–2.77 s including preparation at load ~5.
`mountIntentCiPage` takes an optional viewport. Learning: on the page mount
the history region and heading appear before the history answers; cases wait
on answered content.

### 6. History chart marks keep labels, links, keyboard and narrow fit, and the story's proof runs faster

Type: Behavior
Status: planned

Move `intent-ci-history-chart-marks` (2) and
`intent-project-ci-history-chart-marks` (2). Remove any history
`test-support` module whose last consumer across `e2e/` and
`dashboard/frontend-tests/` moved. Record the case-disposition table and the
two-worker before/after timing including preparation against P3 + P4, under
comparable load.

Behavior: Project and Done chart marks keep build/date labels, accessible
descriptions and run links, and fit a narrow viewport in light and dark.

Proof: the moved Vitest specs; 0 legacy cases remain across the 5 owned
files; no `act`/`IS_REACT_ACT_ENVIRONMENT` in owned specs; full frontend
group; `e2e/intent/intent-ci-done-prior-build.spec.ts` and
`e2e/intent/intent-ci-wall-time-history-provenance.spec.ts` E2E.

## Concern evidence

Slice-plan refinement was not needed: each slice holds one outcome sized to
one or two legacy files or one correction concern, below the eight-slice
limit. This review found no remaining slice-specific concern.
