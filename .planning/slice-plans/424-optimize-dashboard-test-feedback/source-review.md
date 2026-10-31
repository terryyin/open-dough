# Independent source review

Fresh reviewer general-purpose agent (`41297cf7-1fc5-41b6-997e-fd99c4c92897`) for
SEED-197, received only the selected story Goal, Scope, key examples, and
exclusions pasted in its launch. It was instructed to read no files, change
nothing, and derive individual source clauses without plan, product, proof, or
slice context. Its numbered commitments are allocated below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | Shorten the local wait time for trustworthy dashboard test results (or satisfy the story via recorded evidence of no worthwhile improvement under 11a.1–11a.2) | slice 6 | |
| 1b | Preserve behavioral coverage across the dashboard test suite | slice 6 | |
| 1c | Preserve confidence in trustworthy local dashboard test results | slice 6 | |
| 2a | Run measured test optimization against the ordinary local command npm run test:dashboard | slice 1 | observed: /tmp/SEED-197-optimize-dashboard-test-feedback/baseline-proof.json strictStatus passed |
| 2b.1 | Include dashboard browser journeys in the optimization surface | slice 1 | observed: baseline selectedCount 1746 includes browser journeys |
| 2b.2 | Include dashboard boundary tests in the optimization surface | slice 1 | observed: baseline selectedCount 1746 includes boundary specs |
| 2b.3 | Include shared setup across browser journeys and boundary tests in the optimization surface | slice 1 | observed: baseline-times.tsv includes hook-weighted file costs and PLAN.md Slice 2 targets shared publishPreparingJourney setup |
| 3a | Profile npm run test:dashboard before selecting optimization experiments | slice 1 | observed: PLAN.md Slice 1 baseline profile and top-40% analysis recorded before Slice 2–5 experiments |
| 4a.1 | Seed investigation from the individual tests that make up the top 40% of suite cost by recorded duration contribution under the baseline profile | slice 1 | observed: PLAN.md Slice 1 top-40% case ranking (158 cases / 40.0%) |
| 4a.2 | Seed investigation from the test files that make up the top 40% of suite cost by recorded duration contribution under the baseline profile | slice 1 | observed: PLAN.md Slice 1 top-40% file ranking (66 files / 40.3%) |
| 4b.1 | Follow related test families across files when they share behavioral responsibility with those top-40% contributors | slice 1 | observed: PLAN.md Slices 2–5 families across preparing, story-review-since-trunk, start-session-answer-touch, and trunk-worktree-ambiguity |
| 4b.2 | Follow related test families across test tiers when they share behavioral responsibility with those top-40% contributors | slice 1 | observed: PLAN.md Slice 3 checks boundary/story-review-completed-driver.spec.ts alongside story-review-since-trunk.spec.ts |
| 4b.3 | Follow related test families across files when they share setup cost with those top-40% contributors | slice 1 | observed: PLAN.md Slice 2 follows publishPreparingJourney() across session-attribution.spec.ts and backlog-preparing.spec.ts |
| 4b.4 | Follow related test families across test tiers when they share setup cost with those top-40% contributors | slice 1 | observed: PLAN.md Slice 1–5 shared setup and boundary/journey inspection |
| 5a | Evaluate candidate test changes using comparable wall-time measurements taken under like runner conditions | slice 2 | observed: /tmp/SEED-197-optimize-dashboard-test-feedback/slice2-before-1..3.json and slice2-after-1..3.json |
| 5b | Retain only changes backed by comparable wall-time improvement under like runner conditions | slice 2 | observed: dashboard/tests/preparingJourney.ts retained after 3-pass focused improvement (session-attribution 15.23s → 6.90s, summed .tsv 30.07s → 25.83s, durationMs median 32.88s → 30.77s) |
| 6a.1 | Follow the project's dashboard test guidance when simplifying tests | slice 2 | observed: dashboard/tests/preparingJourney.ts caches read-only precondition per worker matching publishStoryColumnsJourney in dashboard/tests/launchJourney.ts |
| 6a.2 | Follow the project's dashboard test guidance when moving behavioral proof between test tiers | slice 2 | observed: dashboard/tests/preparingJourney.ts keeps both browser journeys intact while sharing read-only CLI origin setup |
| 7a.1 | Establish replacement behavioral proof before removing any test case | slice 3 | observed: boundary/story-review-completed-driver.spec.ts (slice3-driver-boundary.json, 3/3 passed) and story-review-since-trunk.spec.ts:35-104 (printing merge driver on integrated-changes journey) verified before dropping empty-diff printing-driver loop iteration |
| 7a.2 | Establish replacement behavioral proof before narrowing any test case | slice 3 | observed: story-review-since-trunk.spec.ts:139-163 retains standard empty-diff restatement while lines 35-104 and boundary/story-review-completed-driver.spec.ts retain printing merge driver proof |
| 8a | Re-run the same local command (npm run test:dashboard) under comparable runner conditions after completing experiments | slice 6 | |
| 8b.1 | Report before-and-after wall time for npm run test:dashboard | slice 6 | |
| 8b.2 | Report before-and-after executed case count for npm run test:dashboard | slice 6 | |
| 8b.3 | Report retained behavioral proof (including replacement or surviving proof for simplified, narrowed, moved, or removed cases) | slice 6 | |
| 8b.4 | Report rejected experiments | slice 6 | |
| 8b.5 | Report remaining optimization candidates | slice 6 | |
| 9a.1 | Update .planning/TEST-OPTIMIZATION-CANDIDATES.md with the latest-pass optimization summary | slice 6 | |
| 9a.2 | Update .planning/TEST-OPTIMIZATION-CANDIDATES.md with the current candidate state | slice 6 | |
| 9a.3 | Remove from .planning/TEST-OPTIMIZATION-CANDIDATES.md any transferred obligation whose receiving story has already closed with its work done | slice 6 | |
| 10a | Preserve tests and journeys recorded as accepted necessary costs | slice 2 | observed: accepted necessary-cost specs untouched in Slice 2 |
| 10b | Leave pending optimization candidates in place when no wall-time-improving approach is found | slice 2 | observed: .planning/TEST-OPTIMIZATION-CANDIDATES.md pending candidates untouched in Slice 2 |
| 11a.1 | Treat a demonstrated absence of worthwhile wall-time improvement as satisfying the story without forcing test changes | slice 6 | |
| 11a.2 | Record the evidence demonstrating the absence of worthwhile improvement when no changes are retained | slice 6 | |
| 12a | Do not change product behavior to make tests faster | slice 1 | observed: Slice 1 touched only dashboard/tests/* and .planning/* |
| 12b | Do not expand optimization into non-dashboard test suites | slice 1 | observed: Slice 1 ran only npm run test:dashboard |
| 12c.1 | Do not claim speedup from a reduced test case count alone | slice 6 | |
| 12c.2 | Do not claim speedup from fewer lines of test code alone | slice 6 | |
| 12c.3 | Do not claim speedup from focused/isolated test timings without a comparable full local re-run of npm run test:dashboard | slice 6 | |
| 12c.4 | Do not claim speedup from CI-only allocation or sharding changes that leave the local npm run test:dashboard wait unchanged | slice 6 | |
| 12d | Do not thin journeys already recorded as accepted necessary costs unless new evidence supports reopening them | slice 2 | observed: accepted necessary-cost journeys untouched in Slice 2 |
| 13a.1 | Record the git revision used for the baseline run of npm run test:dashboard | slice 1 | observed: PLAN.md Slice 1 revision f351073d060ba25620d0c0a861b5b4c5cc9710d6 |
| 13a.2 | Record the named runner conditions used for the baseline run | slice 1 | observed: PLAN.md Slice 1 8 default local workers on 16-CPU / 48-GiB Mac, NO_COLOR and FORCE_COLOR unset |
| 13a.3 | Record the baseline wall time of npm run test:dashboard | slice 1 | observed: PLAN.md Slice 1 1061.10s outer / 1060.4s durationMs |
| 13a.4 | Record the baseline executed case count of npm run test:dashboard | slice 1 | observed: PLAN.md Slice 1 1,746 passed, 0 skipped |
| 13a.5 | Record the ranked top 40% cost contributors from the baseline profile | slice 1 | observed: PLAN.md Slice 1 66 files / 40.3% and 158 cases / 40.0% |
| 13b | When experiments on families rooted in the top-40% band succeed, confirm that npm run test:dashboard finishes sooner under comparable conditions with behavioral coverage preserved and replacement proof established for any removed cases | slice 6 | |
| 14a.1 | Undo or leave out any experiment that fails to improve comparable wall time | slice 6 | |
| 14a.2 | Undo or leave out any experiment that weakens behavioral coverage | slice 6 | |
| 14a.3 | Undo or leave out any experiment that weakens confidence | slice 6 | |
| 14b | List each undone or excluded experiment under rejected experiments in the report | slice 6 | |
| 15a.1 | Leave the test suite unchanged when profiling and credible experiments within the top-40% band yield no worthwhile wall-time saving | slice 6 | |
| 15a.2 | Record the no-worthwhile-saving outcome in the report together with its measurements and remaining candidates | slice 6 | |
| 16a.1 | Support moving or dropping a browser journey variant that duplicates what a boundary-tier check can answer (following dashboard test guidance), with the cheaper surviving check retaining the behavioral proof | slice 3 | observed: dashboard/tests/story-review-since-trunk.spec.ts:139-163 drops redundant printing-driver empty-diff journey while boundary/story-review-completed-driver.spec.ts and story-review-since-trunk.spec.ts:35-104 retain printing-driver proof |
| 16a.2 | Retain that tier-shift or journey-drop change when comparable local npm run test:dashboard wall time improves, or reject and undo it when local wall time does not improve | slice 6 | |
