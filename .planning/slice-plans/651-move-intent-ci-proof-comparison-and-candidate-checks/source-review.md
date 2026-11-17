# Source review

Launch: fresh general-purpose reviewer without conversation inheritance,
2026-11-17, before slice 1 delegation. Input: only the seed section
`SEED-334#move-intent-ci-proof-comparison-and-candidate-checks` (Goal, Scope,
scope limits, key examples, provenance) at `9aa696980`; no plan, product,
proof or slice scope. Instructed to read no files, change nothing and number
independently observable promises.

Unnumbered context returned: the Goal's reason (maintainers trust the checks in
Frontend/Backend with real acquisition in E2E); scope limits (no navigation or
reading/review conversion, runner/group retirement, `integratedStateCompletion`
change, E2E naming, tagged-install proof, shard rebalance or speed target; no
extra journeys for detailed variants); the navigation/retirement story's
independence; provenance; `makeMe.aCiProof` is not acquisition proof (folded
into 14).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The 20 Intent CI specs are moved out of the interim Dashboard Integrated UI Test group (Goal; Scope ¶1) | slice 8 | |
| 2 | Every distinct existing assertion retains an explicitly named maintained home in Frontend, Backend or E2E, including negative effects, accessibility, focus, keyboard/touch, source pinning, reading position, request counts and stale-answer exclusion; a mixed case may have several named owners with no assertion silently dropped or weakened (Goal; Scope ¶1, ¶2) | slice 8 | |
| 3 | Each interim case is removed only once its equivalent proof is in place (Scope ¶1) | slice 8 | |
| 4 | Presentation and interaction checks run through the real production UI with controlled service answers (Scope ¶1) | slice 8 | |
| 5 | Backend or E2E checks retain real parsing, ZIP/artifact acquisition, refusal, cache identity and upstream request accounting (Scope ¶1) | slice 8 | |
| 6 | The converted checks reuse the delivered CI-status, history, full-app Done-story, comparison and published-source arrangements (Scope ¶1) | slice 8 | |
| 7 | Published-project arrangements are separated from the CI-status answer family before its run-Proof support is extended (Scope ¶1) | slice 2 | observed: dashboard/tests/support/frontendServiceState.ts owns publishCiStoryBoard/publishUnconfiguredDoughnut; frontendCiStatusAnswers.ts (151 lines) keeps status answers only; run Proof extended afterwards in frontendCiRunProofAnswers.ts openFrontendRunProof hold/proof |
| 8 | Existing E2E connections remain (Scope limits) | slice 8 | |
| 9 | Product behavior is unchanged by the move (Goal; Scope limits) | slice 8 | |
| 10a | Drilling entry → folder → file Proof for a Done story with selected-landing and prior-build scope evidence keeps each scope's values and history above its table, all seven marks including the failed build, unit-specific scales and touch/keyboard selection (Example 1) | slice 1 | observed: dashboard/frontend-tests/intent/intent-scope-glance.spec.ts: entry/folder/file expectScopeReadout + expectStackedInOrder history above table, entryChart.marks 7 with failed × painted, average placement, case 90–130 / file 5–20 axes, touch and keyboard chooseTimingUnit |
| 10b | In the same journey, the Purpose and CI-comparison destinations are reachable from Proof (Example 1) | slice 1 | observed: dashboard/frontend-tests/intent/intent-scope-glance.spec.ts: 'View story CI comparison' button and fileReadingTab Purpose / purposeRegion visible in file Proof |
| 10c | In the same journey, Proof stays readable in dark mode (Example 1) | slice 1 | observed: dashboard/frontend-tests/intent/intent-scope-glance.spec.ts: emulateMedia dark then expectChangeCue slower and expectReadableContrast on unit controls, selected and cases readout |
| 11 | Reading retained scopes makes no extra upstream CI requests, proved at the Backend read boundary (Example 1) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-scope-proof-completion.spec.ts:141 expect(github.calls).toHaveLength(beforeRead) after entry/folder/file reads through a restarted reader |
| 12a | When a run's proof is held, partial, multi-unit, unavailable or previously retrieved, its judgment stays readable independently (Example 2) |  | G1 |
| 12b | In those states, Proof and Summary keep run/attempt labels, counts, timings, full accessible gap explanations, layout and sorting (Example 2) | slice 3 | |
| 13 | A proof query omitting the attempt receives HTTP 400 without asking GitHub, at the Backend HTTP proof-read boundary (Example 2; Scope ¶2) | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-proof-read.spec.ts 'a CI proof query that omits the attempt is refused before asking GitHub': status 400 and server.github.calls.slice(before) equals [], with attempt=1 positive control |
| 14 | Real collector bytes survive ZIP extraction and retain a missing part and an untimed result, proved by real extraction rather than a supplied `makeMe.aCiProof` answer, preserving the plan 633 obligation (Example 2; Scope ¶2) | slice 2 | observed: dashboard/backend-tests/intent/ci-proof-extraction.spec.ts: real collector CLI fragment --by-file/summarize bytes → zipOf → ciProofArtifactReader keep part 1 present untimed 1 and part 2 missing |
| 15 | A comparison with partial Baseline counts, signed timing changes or a held/failed locations answer keeps real controls preserving unavailable differences, independent units, marks, Show %, scope/file navigation, focus and reading position, sort continuity/fallback and the selected revision (Example 3) | slice 6 | |
| 16a | Comparison summaries ask for no source text (Example 3) | slice 5 | |
| 16b | Navigating a comparison adds no comparison or proof rereads (Example 3) | slice 5 | |
| 17 | File Purpose and Proof retain the changed, added, renamed and merge-edited distinctions (Example 3) | slice 5 | |
| 18 | A candidate naming a full path, ambiguous or moved path, unique or duplicate case, or explicit line keeps accurate recorded fields and pinned links (Example 4) | slice 7 | |
| 19a | Supported candidate targets open Purpose at the same position (Example 4) | slice 7 | |
| 19b | Returning from Purpose restores entry focus without a reread (Example 4) | slice 7 | |
| 19c | Unavailable candidate targets retain their explanations (Example 4) | slice 7 | |
| 20 | Live, empty, absent, unreadable or mismatched candidate records, project switches and Show latest preserve the selected record's revision (Example 4) | slice 8 | |
| 21 | An old held answer cannot replace the current candidate selection (Example 4) | slice 8 | |
