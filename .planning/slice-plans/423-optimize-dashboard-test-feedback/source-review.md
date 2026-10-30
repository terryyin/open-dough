# Independent source review

Fresh reviewer general-purpose agent for SEED-196, received only the selected
story Goal, Scope, key examples, and exclusions pasted in its launch. It was
instructed to read no files, change nothing, and derive individual source
clauses without plan, product, proof, or slice context. Its numbered
commitments are allocated below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Shorten the wait for trustworthy local dashboard test results while preserving behavioral coverage and confidence | slice 6 | |
| 2 | Run measured test optimization against the ordinary local command npm run test:dashboard | slice 1 | observed: /tmp/SEED-196-optimize-dashboard-test-feedback/baseline-proof.json strictStatus passed |
| 2.1 | Cover browser journeys, boundary tests, and their shared setup | slice 1 | observed: baseline selectedCount 1746 includes journey and boundary specs; baseline-times.tsv includes hook-weighted file costs |
| 3 | Profile before choosing experiments | slice 1 | observed: PLAN.md slice 1 baseline and top-40% analysis before experiment slices |
| 4 | Seed investigation from the top 40% of suite cost by recorded duration contribution | slice 1 | observed: PLAN.md top-40% file and case rankings |
| 5 | Follow related families across files and tiers when they share responsibility or setup cost | slice 1 | observed: PLAN.md completed-review, scoped Cursor, and recent-delete families |
| 6 | Retain only changes supported by comparable wall-time measurements under like runner conditions | slice 2 | observed: journey tail trim undone after focused wall 9.69–10.00s → 11.07–11.51s |
| 7 | Follow the project's dashboard test guidance when simplifying tests or moving proof between tiers | slice 2 | observed: trial kept gaps boundary as surviving Landed-runs proof; journey restored |
| 8 | Establish replacement proof before removing or narrowing cases | slice 2 | observed: gaps boundary still proves unusable capture before any journey removal; removal undone |
| 9 | Re-run the same local command under comparable conditions after experiments | slice 6 | |
| 10.1 | Report before/after wall time | slice 6 | |
| 10.2 | Report executed case count | slice 6 | |
| 10.3 | Report retained behavioral proof | slice 6 | |
| 10.4 | Report rejected experiments | slice 6 | |
| 10.5 | Report remaining candidates | slice 6 | |
| 11 | Update .planning/TEST-OPTIMIZATION-CANDIDATES.md with the latest-pass summary and current candidate state | slice 6 | |
| 11.1 | Remove any transferred obligation whose receiving story has already closed with its work done | slice 6 | |
| 12 | Preserve accepted necessary costs unless new evidence supports reopening them | slice 2 | observed: accepted necessary-cost specs untouched in slice 2 trial |
| 13 | Leave pending candidates unless a wall-improving approach appears | slice 2 | observed: three pending collapses untouched |
| 14 | A demonstrated absence of worthwhile improvement, with that evidence recorded, satisfies the story | slice 6 | |
| 15 | Do not change product behavior to make tests faster | slice 2 | observed: trial touched only dashboard tests and planning records; restored |
| 16 | Do not expand into non-dashboard suites | slice 2 | observed: only npm run test:dashboard scope |
| 17 | Do not claim speedup from fewer cases or lines alone | slice 6 | |
| 18 | Do not claim speedup from focused timings without a comparable full local re-run | slice 6 | |
| 19 | Do not claim speedup from CI-only allocation changes that leave the selected local wait unchanged | slice 6 | |
| 20 | Do not thin journeys already recorded as accepted necessary costs without new evidence | slice 2 | observed: accepted necessary-cost journeys untouched |
| 21 | Example 1 baseline records wall time, case count, and ranked top 40% contributors | slice 1 | observed: baseline-ranking.json and PLAN.md slice 1 |
| 22 | Example 1 after retained experiments the same command finishes sooner with coverage preserved | slice 6 | |
| 23 | Example 2 failed or harmful experiment is undone or left out and reported | slice 6 | |
| 24 | Example 3 no worthwhile saving leaves the suite unchanged with measurements recorded | slice 6 | |
| 25 | Example 4 journey repeating a boundary-answerable variant is moved or dropped per guidance | slice 2 | observed: trial dropped Landed-runs journey tail; rejected for wall; restored |
| 25.1 | Cheaper surviving check retains the behavior | slice 2 | observed: gaps boundary retained throughout; journey restored after reject |
| 25.2 | Local suite wall improves or the change is rejected when it does not | slice 6 | |
