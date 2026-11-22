# Get fast proof of Intent scope timing history

**Identity:** SEED-413#speed-intent-scope-timing-history
**Source:** [Get fast proof of Intent scope timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history)
**Split from:** SEED-413#speed-intent-timing-history-on-vitest ([plan 772](../772-speed-intent-timing-history-on-vitest/PLAN.md), former Slices 4–6) before readiness on 2026-11-22, when its 19 legacy files exceeded one plan.
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

## Provisional input

Resize at refinement: plan 764's three-file history port overran, so one or
two legacy files fit a slice. Mount through the page entry that plan 772
Slice 1 corrects; apply the carried decisions of plan 772 and the
[campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).
`readScopeHistory` is already a required member of `IntentCiReadSource`.
Capture this story's own 16-file legacy baseline at two workers before the
first move (the 19-file baseline was 31 cases in 184.99 s, load 33–41,
22 November 2026).

## Correction of the delivered CI wall-time history entry

Execution retrospective of SEED-413#speed-intent-timing-history-on-vitest
(plan 772; commits `4e4e753a2`, `7650362be`, `a08b5556f`, `bdca8b1f4`,
`14c5c3bc4`, `3f8611de3`, `846d118fa` on its story branch), 22 November
2026, a read-only outcome review of `git diff 20719a2ae 846d118fa`. No
product bug was found. Every scope history case mounts through the same
entries, so these come first:

- **Board position leaks between Vitest files.** With production layout the
  Board pages its columns; `showColumnOf`
  (`intent/intent-ci-development-card-page.ts`) chooses a column through
  `keptPosition.choose` (`dashboard/src/columnPaging.ts`), which keeps
  `open-dough.board.position` in localStorage and module state.
  `mountIntentCiPage` resets only the Sessions sidebar
  (`withClosedSessionsSidebar`), so a later file in the same worker can
  start on a paged Board, the class of leak CI run 45015905953 showed for
  the sidebar. Give every page mount (Board, frame, Intent) one shared reset
  and restore of the page preferences it can change; prove a paging case
  leaves the stored position restored and run an Intent compare spec with
  `board-paging.spec.ts` in one `--workers 1` invocation.
- **The Done history builder restates the production prior-build rule.**
  `Distribution/tests/support/doneWallTimeHistoryTestData.mjs` `through()`
  averages measured priors itself, without `priorBuildReferenceOf`'s
  20-build window and slow-outlier exclusion
  (`dashboard/src/ciPriorBuildReference.ts`), against the carried decision
  "no production transforms to make inputs". Give the reference figures
  domain-named steps (e.g. `.averaging(ms, used)`) instead of deriving them,
  and decide the same for the scope history builder before writing it
  (`ciScopeHistoryReference.ts` also uses `priorBuildReferenceOf`).
- **Test entries accrete positional optional parameters.**
  `openDoneStoryComparison(review, readDoneWallTimeHistory = unanswered,
  readComparison?)` hard-codes `readScopeHistory: unanswered`;
  `mountJudgedRunProof(entries, extra = {}, page = {})`;
  `machineSessionsAnswering(answer, refusal?)` switches behaviour on an
  optional string. Take one options object with a `ci:
  Partial<IntentCiReadSource>` bag before adding `readScopeHistory`, and a
  named `machineSessionsRefusing` beside `machineSessionsAnswering`.
- **`HeldKind` is an opaque registry.** `dashboard/src/pageReads.tsx`
  `HeldKind<T>` carries an unread `name` and a phantom `held?: T`, stores in
  an untyped `Map`, and `storyNoteAnnouncement.ts` keys a page singleton
  `"page"`. Replace it with a typed per-kind factory and a keyless per-page
  variant, same semantics.
- **The Project history page object left a duplicated journey.** The
  `Check again` → Shift+Tab → `Builds and evidence` → Enter walk and the
  phone sideways-overflow scan are written out in both
  `intent-ci-wall-time-history.spec.ts` and `-gaps.spec.ts`; move them into
  `openTrunkHistory` (`intent-ci-wall-time-history-page.ts`).
- **The Done history `gap()` reads the page's first gap.**
  `intent/intent-ci-done-history-page.ts` uses
  `document.querySelector(".intent-ci-gap")` unscoped, while CI status and
  judgment render the same class; scope it to the CI comparison region.

Compact readout case 1's trailing chart-mark assertions repeat what the Done
glance owns; review them beside group D.

### A. Scope glances and project/source history keys stay isolated to their source

Move `intent-project-scope-glance` (1), `intent-scope-glance` (1),
`intent-project-scope-history-source-identity` (2) and
`intent-project-scope-history-project-isolation` (2) over
`IntentScopeTimingHistory` / `useIntentCiScopeHistory` within its production
owner and typed `readScopeHistory` replies recording requested source,
endpoint, scope and `AbortSignal`.

Proof: Project and Done scope glances show accurate summary cues; switching
source identity or project issues the right request and aborts or ignores
other projects' or sources' answers.

### B. Project scope history isolates scope keys, keeps live proof on failure, and recovers on Retry

Move `intent-project-scope-history-key-isolation` (1),
`-recovery` (2), `-refresh` (1) and `-remount` (1) beside live Scope Proof.

Proof: entry, folder, file and revision keys keep distinct kept histories
across remounts; a failed or empty read keeps the last history and live Scope
Proof, offers `Retry`, and recovers without borrowing another endpoint's or
scope's history.

### C. Collected scope timing preserves units, provenance, segments and gaps

Move `intent-scope-timing-history-absent` (2), `-gaps` (3), `-provenance`
(1), `-reading` (1), `-segments` (1) and `-units` (2), with direct pure timing
checks only where DOM rendering is not the proof. Remove spent history
support and record the two-worker before/after timing and case disposition.

Proof: absent, partial and unavailable reasons, separate case and file
units, interrupted segments, build dates and provenance stay readable and
accessible; 0 legacy cases remain across the 16 files.

### D. The shared history chart marks keep labels, links, input and narrow fit

Move `intent-ci-history-chart-marks` (2, Done) and
`intent-project-ci-history-chart-marks` (2, Project), received from plan 772
on 2026-11-22: they drive the shared history chart on the Summary's scope
timing history (`readScopeHistory`, `makeMe.aScopeHistoryGlance`,
`historyChartPage.ts`), not CI wall-time history. A faithful Vitest port
needs a typed `readScopeHistory` answer in `openDoneStoryComparison` and
`mountJudgedRunProof`, a Summary scope-history page object, and touch input.

Proof: zero-ms and incompatible-segment marks, the Tab walk across marks,
touch taps at 390×844, marks painted with focus in light and dark, and whole
"0 ms" axis labels at the narrowest width.
