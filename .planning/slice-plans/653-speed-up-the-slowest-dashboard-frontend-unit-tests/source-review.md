# Source review

Reviewer: a fresh general-purpose agent with no conversation inheritance, launched 2026-11-16 by the executing coordinator. Input: only the selected story section's Goal, Scope, Tactics, Outcome and Key examples from SEED-380 (links stripped), with instructions to read no files, change nothing, and return numbered commitments and exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: Dashboard contributors get faster local frontend test feedback. | slice 7 | observed: PLAN.md slice 7 Result: kept cases 20.22 → 7.79 s in CI (about 8.5 s runner-adjusted); slices 4 and 6 local pairs −36% and −31% |
| 2 | Goal: the same behavioral protection is kept while feedback gets faster. | slice 7 | observed: slice 4 and 6 Results: scratch breaks fail survivors at startup-host-words.spec.ts:59, intent-done-project-refresh.spec.ts:131 and :157; CI 43789763452 455 of 455 passed |
| 3 | Retained CI case timings are used to rank individual cases in Dashboard Frontend Test (`npm run test:dashboard:frontend`). | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 4 | Work focuses on the slowest 10% of cases by duration, with the case count rounded up. | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 5 | Ranking uses a complete, comparable baseline. | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 6 | Within the group, the cases with the most removable cost come first. | slice 1 | observed: PLAN.md Evidence read cost families and Ordered slices 1–6 by family |
| 7a.1 | Baseline: the `dashboard-frontend` job's report of CI run 43773156778, attempt 1, green, at `09e70e926`. | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 7a.2 | Baseline facts: 456 cases and 975 s of summed case time. | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 7a.3 | Baseline group: the 46 slowest cases, each 3.9 s or longer, 240 s in total. | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 8 | Variation reference: the preceding green run 43755447775 timed the same 46 cases at 247 s and ranked 43 of them among its own slowest 46, so about 3% of the group's time is run-to-run variation. | slice 1 | observed: PLAN.md Evidence read: run 43755447775 timed the same 46 at 247 s (3%) |
| 9 | Qualification: if cases have changed when execution starts, the cases are re-ranked from the latest complete green run. | slice 1 | observed: PLAN.md slice 1 Result: newest green main run is still 43773156778; no re-rank |
| 10 | When a shared cause in the group, such as a harness setting or a helper, is found, it is changed once for all its consumers. | slice 7 | observed: PLAN.md slice 7 Result: no shared-cause change kept; slices 1 and 2 (harness stylesheet, passTimeUntilAsked) undone |
| 11 | Cases outside the group benefit from a shared-cause change without being investigated one by one. | slice 7 | observed: PLAN.md slice 7 Result: no shared-cause change kept, so no outside-group case changed |
| 12a.1 | The CI job layout stays as it is. | slice 7 | observed: PLAN.md slice 7 Result: .github and Playwright configs unchanged against d9c35d51f |
| 12a.2 | Worker counts stay as they are. | slice 7 | observed: PLAN.md slice 7 Result: .github and Playwright configs unchanged against d9c35d51f |
| 13 | The test optimization tactics are followed. | slice 7 | observed: PLAN.md slices 1–7 Results follow the dough-test-optimization measure, keep or undo, and candidate record |
| 14 | Other approaches are tried when measurements show a better opportunity. | slice 7 | observed: PLAN.md slices 3–6 Results: layout reads, reloads, paging waits and twin merges tried after slices 1–2 |
| 15 | Disabling animations in the test harness is tried where animations only delay the assertion. | slice 1 | observed: PLAN.md slice 1 Result: stylesheet verified applied, three alternating pairs timed |
| 16 | Cases still check the same observable result after a change. | slice 7 | observed: slice 4 and 6 Results and obligations G4 and G6: same assertions, scratch breaks still fail |
| 17 | Cases that test real motion or timing keep real motion or timing. | slice 1 | observed: dashboard/tests/support/pageTest.ts unchanged; motion specs run on real motion |
| 18a.1 | A change is kept only if comparable before and after measurements show a worthwhile gain. | slice 7 | observed: slice 1–6 Results: only slices 4 and 6 had every after-run below every before-run and were kept |
| 18a.2 | A kept change preserves behavioral proof. | slice 7 | observed: slice 4 and 6 Results: scratch breaks fail the kept cases |
| 19 | A gain is worthwhile when the affected cases' time drops by more than repeated unchanged runs of those cases differ. | slice 7 | observed: slice 4 and 6 Results: −36% and −31% against the 3% CI variation and the local unchanged spread |
| 20 | The report states the gain for the affected cases. | slice 7 | observed: PLAN.md slice 7 Result: affected cases 20.22 s before, 7.79 s after in CI |
| 21 | Suite wall time is measured separately when the report claims faster feedback for the whole suite. | slice 7 | observed: PLAN.md slice 7 Result: suite wall alternating runs; no shorter-suite claim |
| 22 | Example (ranking): given the baseline's 456 timed cases, ranking by duration selects the 46 slowest. "scrolling Recently done reaches all 45 retained sessions" (9.5 s) is in the group; a 2 s median case is outside it. | slice 1 | observed: PLAN.md slice 1 Result (re-derived from CI run 43773156778 dashboard-frontend report) |
| 23 | Example (removable cost): for a group case whose time goes to waiting for the page's next periodic read, extra page loads, or repeated arrangement (these are alternatives), the cost is removed, the case still checks the same observable result, alternating before and after runs of the affected cases show the drop, and the change is kept with its measured gain. | slice 4 | observed: PLAN.md slice 4 Result: startup-host-words reloads 8 → 0, −36% over three alternating pairs, scratch break fails startup-host-words.spec.ts:59 |
| 24a.1 | Example (animations): cases that only wait for a transition to finish before asserting reach the same result sooner when the harness disables animations. |  | G1 |
| 24a.2 | Cases that prove motion or its reduced-motion alternative keep real motion. Examples given: the board swipe, the keyboard start under reduced motion, and the connection logo. These are examples, not a complete list. | slice 1 | observed: dashboard/tests/support/pageTest.ts unchanged; board-swipe, responsive-session-access*, dashboard-connection-logo keep real motion |
| 25 | Example (no gain): a tried change whose before and after times differ by no more than the unchanged cases' own variation is undone and reported as no demonstrated gain. | slice 7 | observed: slice 1, 2, 3 and 5 Results and obligations G1, G2, G3 and G5 |
| 26 | Example (redundancy): when two group cases prove the same rule, one is removed or merged (either one) only after the surviving case is shown to catch the same failure. | slice 6 | observed: PLAN.md slice 6 Result: survivor intent-done-project-refresh.spec.ts fails both scratch breaks at :131 and :157 before the twins were removed |
| 27a.1 | Example (report): for kept changes, the report states the affected cases' summed time before and after. | slice 7 | observed: PLAN.md slice 7 Result: affected cases summed 20.22 s before and 7.79 s after |
| 27a.2 | The report claims a shorter whole-suite wait only with before and after wall times of the unfiltered `npm run test:dashboard:frontend`. | slice 7 | observed: PLAN.md slice 7 Result: one after-run exceeds both before-runs, so no shorter-suite claim |
