# Source review: SEED-413#speed-intent-scope-timing-history

Launch: fresh general-purpose reviewer (no conversation inheritance), 2026-11-22,
before Slice 1 delegation. Input: the story section text (seed lines 546–607 at
`0ca3d0028`), the shared acceptance it references (seed lines 483–535), and the
correction input it requires first (this plan's "Correction of the delivered CI
wall-time history entry"). Instructed to read nothing else and change nothing.

Unnumbered context returned: split/resplit history; correction rationale (plan
772 retrospective, CI run 45015905953); benefit to attempt-proof mounts and the
scope-timing-reading story; scope exclusions (collected timing, chart marks,
CI wall-time history, attempt proof and Summary); the per-slice sizing
hypothesis; E2E vs unit split, guidance links, MakeMe/page-object preferences,
campaign one-minute target, separate follow-up owners, SEED-341 coordination.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Every page mount (Board, frame, Intent) shares one reset and restore of the page preferences it can change (Board column position included, `open-dough.board.position` in localStorage and module state, not only the Sessions sidebar). A paging case leaves the stored position restored. | slice 1 |observed: `withPagePreferences` in `dashboard/test-support/component-mount/framePreferences.ts` called by `board-mount.ts`, `board-frame-mount.ts`, `intent-ci-page-mount.ts`; scratch spec after `board-paging` + `intent-story-compare-done` in one `--workers 1` run read `open-dough.board.position` restored (8/8) |
| 2 | An Intent compare spec run together with `board-paging.spec.ts` in one `--workers 1` invocation does not start on a paged Board (no Board position leak between Vitest files). | slice 1 |observed: `intent-story-compare-done.spec.ts` + `navigation/board-paging.spec.ts` in one `--workers 1` run, 7/7 |
| 3 | The Done history builder (`doneWallTimeHistoryTestData.mjs` `through()`) takes domain-named reference figures (e.g. `.averaging(ms, used)`) instead of restating or deriving `priorBuildReferenceOf` (20-build window, slow-outlier exclusion). | slice 2 |observed: `averaging(ms, used)` / `tooFewToAverage(used)` in `Distribution/tests/support/doneWallTimeHistoryTestData.mjs`; `through()` no longer filters or averages priors; callers `intent-ci-done-glance.spec.ts`, `intent-ci-compact-readout.spec.ts` state figures and pass |
| 4 | The scope history builder follows the same decision (domain-named reference steps, no production transforms to make inputs), decided before it is written. | slice 2 |observed: PLAN.md Current decisions, scope history builder reference figures |
| 5 | Test entries take one options object with a `ci: Partial<IntentCiReadSource>` bag (replacing positional optional parameters in `openDoneStoryComparison`, `mountJudgedRunProof`, `machineSessionsAnswering`) before gaining `readScopeHistory`. | slice 1 |observed: `openDoneStoryComparison({ ci, ...review })`, `mountJudgedRunProof({ entries, judgment, viewport, ci })`, `machineSessionsAnswering({ answer })`; 70 consumer specs / 160 tests green at `--workers 2` |
| 6 | A named `machineSessionsRefusing` exists beside `machineSessionsAnswering` (no behaviour switch on an optional string). | slice 1 |observed: `machineSessionsRefusing({ answer, refusal })` in `machineSessionsAnswering.ts`, used by `noSessions` in `board-mount.ts` |
| 7 | `HeldKind` is replaced by a typed per-kind factory plus a keyless per-page variant (no unread `name`, phantom field, untyped `Map`, or `"page"` key), with the same semantics. | slice 2 |observed: `heldOnPagePerKey` / `heldOnPage` in `dashboard/src/pageReads.tsx` (typed WeakMap per page identity) used by `storyNotes.ts`, `storyReviewStates.ts`, `storyNoteAnnouncement.ts`; typecheck; 43 consumer specs green; e2e story-review note/follow-up, recently-done follow-up, Intent CI status story and Done prior build green |
| 8 | The Project wall-time page object (`openTrunkHistory` in `intent-ci-wall-time-history-page.ts`) owns the duplicated keyboard journey (`Check again`, Shift+Tab, `Builds and evidence`, Enter) and the phone sideways-overflow scan, no longer written out in both `intent-ci-wall-time-history.spec.ts` and `-gaps.spec.ts`. | slice 2 |observed: `openEvidenceByKeyboard()` and `scrollingSideways()` returned by `openTrunkHistory` in `intent-ci-wall-time-history-page.ts`, called by `intent-ci-wall-time-history.spec.ts` and `-gaps.spec.ts` (green) |
| 9 | The Done history `gap()` is scoped to the CI comparison region and no longer reads the page's first `.intent-ci-gap` unscoped. | slice 2 |observed: `gap()` in `intent-ci-done-history-page.ts` queries inside the `tabpanel "CI comparison"`; `intent-ci-done-reference-lifecycle.spec.ts` green |
| 10 | All 11 legacy cases across the 8 owned legacy specs have a traceable disposition and run on Vitest, mounted through the production Intent page entry (as corrected). | slice 7 | |
| 11 | Changing repository or ref with the same project ID, or switching projects, issues the right scope-history request and aborts or ignores other sources' and projects' answers. Project and Done scope histories stay isolated by project, source and scope key. | slice 4 | |
| 12 | Project and Done scope glances show accurate summary cues. | slice 3 | |
| 13 | Entry, folder, file and revision keys keep distinct kept histories across remounts. | slice 5 | |
| 14 | A failed or empty collected history read keeps the last history and live Scope Proof, offers Retry, and recovers without borrowing another endpoint's or scope's history. Scope history reads stay a separate boundary from live Scope Proof. | slice 6 | |
| 15 | Shared acceptance timing, case-count, spent-support and coverage checks hold for this cohort: comparable two-worker before/after selections with elapsed time including preparation, counts by engine and destination, remaining slow cases; fewer maintained cases, retired cases' distinct assertions mapped to a new owner or named equivalent, consolidation reasons reported. | slice 7 | |
| 16 | Any history `test-support` module whose last consumer among these 8 files moves is removed (spent support removed; shared test-support surface keeps shrinking). | slice 7 | |
| 17 | The two-worker before/after elapsed comparison is recorded for this cohort. | slice 7 | |
| 18 | Tests follow shared typing rules: production owner rendered at its typed entry with explicit typed sources, no test copy of a production composition or restated provider stack, no private pipeline calls, reads added to a required typed source (never optional member, context default or defaulted parameter). | slice 7 | |
| 19 | Cases use plain Vitest, exercise the actual reader and typed collaborator for retry, abort, caching and stale answers, render and act directly and wait on the observed result, and retire React `act` wrapping and `IS_REACT_ACT_ENVIRONMENT` as their families move. | slice 7 | |
