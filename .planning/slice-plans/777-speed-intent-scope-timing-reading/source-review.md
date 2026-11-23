# Source review: SEED-413#speed-intent-scope-timing-reading

Launch: fresh general-purpose subagent on 2026-11-23, no conversation
inheritance, after the developer's amendment of Key example 6 (abort guard in
place of the key filter) during slice 1. It replaces the review obtained before
slice 1. Input: the selected story section (Goal, Scope, Key examples,
Evaluation) of
`.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-reading`
as amended, plus the shared acceptance section its Evaluation applies
(`#acceptance-shared-by-the-eight-stories`). Instructed to read no other file
and change nothing. Unnumbered context returned: split provenance, ownership
exclusions, legacy baseline, the reason for the key-isolation proof, the
rationale for 8b, test-level placement rules, guidance references,
case-reduction aims, measurement method, the campaign target owned by the
final story, and coordination.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | Done selected landing without its own build, later trunk build stands in: readout names the expired proof and the later build | slice 4 | |
| 1b | Same stand-in case: the average reads Insufficient history and no chart is drawn | slice 4 | |
| 1c | Same stand-in case at 390 px: nothing scrolls sideways | slice 4 | |
| 1d | A pending selected build reads `Pending · CI queued or running` with no measured time | slice 4 | |
| 2a | One attempt with case and file timing: choosing Test files redraws the chart with file values and their own selected gap | slice 5 | |
| 2b | Legacy-only evidence states that its unit is unknown | slice 5 | |
| 3a | Earlier segments stay readable beside a selected gap | slice 5 | |
| 3b | The line never joins incompatible segments | slice 5 | |
| 3c | A later trunk build that supplies the selected timing stays named | slice 4 | |
| 3d | Each mark names its build's role | slice 4 | |
| 4 | A failed entry history read keeps the selected Done story and comparison and offers its own Retry | slice 3 | |
| 5a | Done and Project charts show failed, unavailable, zero and selected marks | slice 7 | |
| 5b | Hovering a mark shows the matching readout (Done and Project) | slice 7 | |
| 5c | A Tab walk across the marks shows the matching readout (Done and Project) | slice 7 | |
| 5d | A tap at 390×844 shows the matching readout (Done and Project) | slice 7 | |
| 5e | Focused marks stay painted in light and dark | slice 7 | |
| 5f | At the narrowest width, "0 ms" axis labels stay whole | slice 7 | |
| 6a | A late answer for an older endpoint key after the newer revision's history is shown changes nothing | slice 1 | observed: dashboard/frontend-tests/intent/intent-project-scope-history-key-isolation.spec.ts "a newer timestamp at the same head issues no history read, and a late old…": old.resolve, page.showIntent() commit, readout still names the newer endpoint |
| 6b | The key-isolation case fails when `useIntentCiEndpointHistory`'s success-branch abort guard is removed | slice 1 | observed: slice 1 break check — abort guard scratch-removed in dashboard/src/useIntentCiEndpointHistory.ts, the key-isolation case failed (newer history erased); restored, it passed |
| 7a | Cases wait for the late key-isolation answer and the drawn Done glance chart before asserting | slice 1 | observed: key-isolation spec awaits old.ask() then page.showIntent() before its synchronous read; intent-ci-done-glance.spec.ts polls averageLabel until the drawn chart's "Prior-build average 8 min 24 s" before reading marks |
| 7b | The history page objects provide one full no-sideways-scroll check | slice 1 | observed: scrollingSidewaysIn in dashboard/frontend-tests/intent/intent-scope-history-page.ts (page, area, every descendant), used by intent-ci-wall-time-history-page.ts, the recovery spec and intent-scope-glance.spec.ts at 390 px; slice 1 break check — a 20 px descendant overflow failed it where the old region-only check passed |
| 7c | The failed build's vertical position is checked | slice 1 | observed: failedUnder in intent-scope-history-page.ts compares vertical centres; slice 1 break check — the failed × moved vertically only failed intent-scope-glance.spec.ts:114 |
| 7d | The builder has one settled default rule | slice 3 | |
| 7e | Mismatched failed positions are rejected | slice 3 | |
| 7f | Page-object residue is removed | slice 2 | |
| 7g | The Board mounts' redundant `withBoardStorage("0")` calls are removed | slice 2 | |
| 8a | The 8 legacy specs (14 cases) move to mounted Vitest cases with typed `readScopeHistory` answers built as data through `makeMe.aScopeHistoryGlance`; the legacy specs no longer run | slice 8 | |
| 8b | Mounted cases do not call server glance projections such as the pending landing | slice 8 | |
| 8c | Every case runs through the production Intent page entry with typed sources production supplies | slice 8 | |
| 8d | No test copy of a production composition, restated provider stack, or private pipeline call | slice 8 | |
| 8e | Any added read goes on a required typed source, never optional member, context default or defaulted parameter | slice 8 | |
| 8f | All 14 legacy cases have a traceable disposition; each retired case's assertions are mapped to their new owner before deletion | slice 8 | |
| 8g | History support whose last consumer moves is removed; the shared test-support surface shrinks | slice 7 | |
| 8h | React `act` wrapping and `IS_REACT_ACT_ENVIRONMENT` are retired for the moved family | slice 8 | |
| 8i | The report says why repeated cases were consolidated or kept | slice 8 | |
| 8j | Exact wording, accessibility, viewport and input distinctions, races and error/retry boundaries preserved where they are the proof | slice 8 | |
| 9a | Two-worker before/after comparison for the 8 files: elapsed incl. preparation, counts by engine and destination, slow cases remaining | slice 8 | |
| 9b | Runtime of any proof promoted to E2E is included | slice 8 | |
| 9c | The actual time and any remaining cost are reported | slice 8 | |
