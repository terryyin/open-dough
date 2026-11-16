# Source review

Reviewer: a fresh general-purpose agent launched by the coordinator on
2026-11-16 before slice 1's delegation, with no conversation inheritance.
Input: the selected story section's Goal, Scope, Scope limits, Key examples,
Architecture and Considered-and-not-chosen text of
SEED-382#browser-test-job-headroom-on-slow-runners, verbatim (the
Considered options as their one-line headings), with the instruction to use
only that text, read no project files, change nothing, and return numbered
commitments, qualifications, examples and exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Contributors get the same browser test verdict on a slow CI runner as on a typical one. | slice 3 | |
| 1.1 | A passing revision does not fail because its job ran out of time. | slice 1 | observed: CI run 43803202223 of 584b7c742: dashboard-frontend / shard 1/1 success, suite step ended 198 s after its deadline step of 450 s, job 217 s within 8 min |
| 1.2 | A passing revision does not fail because one of its tests ran out of time. | slice 3 | |
| 2 | The deadlines stay reviewed ceilings. | slice 1 | observed: .github/workflows/browser-test-group.yml: 450 s deadline step and timeout-minutes 8 unchanged; shards.md 'The deadline' keeps them a reviewed ceiling |
| 2.1 | The verdict arrives no later than it does today. | slice 1 | observed: CI run 43803202223 of 584b7c742: dashboard-frontend job 217 s (was 234-443 s on main) and the parallel lint job 163 s, so neither lengthens the verdict |
| 3 | Lint and the dashboard type-check run in their own CI job, separate from `dashboard-frontend`. | slice 1 | observed: .github/workflows/ci.yml job lint (Lint and type-check): Run lint and Type-check the dashboard steps; ci-container-workflow.sh requires the type-check inside it |
| 3.1 | That job has its own outcome deadline. | slice 1 | observed: .github/workflows/ci.yml job lint: timeout-minutes 6 |
| 3.2 | That job has its own setup deadline. | slice 1 | observed: .github/workflows/ci.yml job lint: Start prerequisite acquisition deadline (180 seconds) and *node-deadline (60 s) steps |
| 4 | The `dashboard-frontend` job runs only its browser suite. | slice 1 | observed: .github/workflows/browser-test-group.yml: no lint input, no lint-tools/lint/type-check steps; ci.yml dashboard-frontend passes no lint |
| 4.1 | All of the 450-second browser-run deadline serves the suite. | slice 1 | observed: .github/workflows/browser-test-group.yml: only setup, Chromium and the suite step precede the 450 s deadline's use |
| 5a | The browser-run deadline stays 450 seconds. | slice 1 | observed: .github/workflows/browser-test-group.yml: 'browser run (450 seconds)' step, started + 450000 |
| 5b | The job bound stays 8 minutes. | slice 1 | observed: .github/workflows/browser-test-group.yml: timeout-minutes: 8 |
| 5c | No runner-speed measurement is added. | slice 1 | observed: diff dd5f9164a..working tree: no runner-speed measurement added to either workflow |
| 5d | No scaled deadline is added. | slice 1 | observed: diff dd5f9164a..working tree: deadlines fixed constants, none scaled |
| 6a | The test at line 47 keeps the default 30-second timeout. | slice 3 | |
| 6b | The test keeps every current assertion. | slice 3 | |
| 6c | The test's stall is diagnosed. | slice 2 | observed: PLAN.md Learnings, slice 2: the change-wait race between keepAttemptIf (launchAttemptAdmit.ts) and owned.own(), seen in run 43797393195's trace and network log |
| 6d | The cause of the stall is fixed. | slice 3 | |
| 6.1 | The failed run stalled after the journey reached "Continue execution" on the second page at 10.3 s: the continued start did not settle in the remaining 19.7 s. |  | G1 |
| 7 | `dashboard/tests/shards.md` describes the resulting layout. | slice 1 | observed: dashboard/tests/shards.md: The job-count paragraph and Decision 2026-11-16 |
| 7a.1 | It describes the job table and the job count. | slice 1 | observed: dashboard/tests/shards.md: group table unchanged and 'These counts make 19 jobs: 14 browser jobs, three Distribution shares, one lint job and one proof job' |
| 7a.2 | It describes where lint and the type-check run. | slice 1 | observed: dashboard/tests/shards.md: 'Lint and the dashboard type-check run in ci.yml's lint job' |
| 7a.3 | It states the deadline the workflow declares. Its deadline section still says 320 s and 6 min, so it is out of date and must be corrected. | slice 1 | observed: dashboard/tests/shards.md 'The deadline': 450 seconds and the job's 8 minutes |
| 8 | Other groups' exposure to slow runners stays with the existing job-count rule. `e2e` and `dashboard-backend` are not resized. | slice 1 | observed: .github/workflows/ci.yml: e2e shards [1..6], dashboard-backend [1, 2, 3] unchanged |
| 9 | Finding other tests close to their timeout is deferred. SEED-381's rebalancing skill already promises to flag notably slow tests. | slice 3 | |
| 10 | Making lint faster is deferred. | slice 1 | observed: diff: scripts/lint.mjs and lint configuration unchanged |
| 11 | On a runner that slow (lint 122 s vs 79 s, type-check 28 s vs 18 s, suite ending at 289 s vs 177 s with 193 of 195 spec files run), the job starts its suite about 12 s after its deadlines start instead of 162 s. | slice 1 | observed: CI run 43803202223 of 584b7c742: dashboard-frontend suite step started 04:18:24, 17 s after the deadline step at 04:18:07 (162 s on run 43797393195) |
| 11.1 | On that slow runner, the suite finishes with over 100 s to spare. | slice 1 | observed: CI run 43803202223 of 584b7c742: suite ran 181 s ending 198 s into 450; the 1.6x slower suite of run 43797393195 (289 s vs 177 s) scales that to about 307 s, about 143 s to spare |
| 11.2 | On that slow runner, the job reports the tests' own result, not a timeout. | slice 1 | observed: CI run 43803202223 of 584b7c742: dashboard-frontend job conclusion is the suite step's own success, with no lint or type-check step in it |
| 12 | On a typical runner, `dashboard-frontend` reaches the end of its suite about 100 s sooner than today's 234–443 s. Today it is the group closest to its deadline, at 7 s of headroom. | slice 1 | observed: CI run 43803202223 of 584b7c742: dashboard-frontend job 217 s against today's 234-443 s; suite end 198 s after deadline start where lint and type-check took about 97 s before it |
| 13a | A lint or type-check failure fails the new lint and type-check job, which names the failure. | slice 1 | observed: .github/workflows/ci.yml job lint: Run lint and Type-check the dashboard are separate steps; type-check gated only on !cancelled() and npm success |
| 13b | On a lint or type-check failure, `dashboard-frontend` still reports its suite's result. | slice 1 | observed: .github/workflows/ci.yml: dashboard-frontend has no needs on lint and lint is not in any group's needs; separate jobs |
| 13c | A suite failure leaves the lint job's result unchanged. | slice 1 | observed: .github/workflows/ci.yml: lint has no needs on any browser group job |
| 14 | On a runner about 1.2 times slower than typical (`e2e` shard 5/6 of run 43797393195), the continued start settles and the test passes. Before, it waited 19.7 s and timed out at 30 s. | slice 3 | |
| 15 | The shared browser-group workflow drops its `lint` input. | slice 1 | observed: .github/workflows/browser-test-group.yml inputs: group, command, settings, root, shards |
| 15.1 | The shared browser-group workflow drops every lint step. | slice 1 | observed: .github/workflows/browser-test-group.yml: no Install shell lint tools, Run lint or Type-check step |
| 15.2 | The shared workflow runs one group's browser tests and nothing else. | slice 1 | observed: .github/workflows/browser-test-group.yml steps: checkout, deadlines, Node/npm, Chromium, suite, uploads |
| 16 | `ci.yml` owns the lint and type-check job. | slice 1 | observed: .github/workflows/ci.yml jobs.lint |
| 17 | CI then has 19 jobs, with 18 running at once, within the account's limit of 20. | slice 1 | observed: dashboard/tests/shards.md: 19 jobs, 18 at once against the account's 20; ci.yml jobs: distribution-tests(3), lint, e2e(6), integrated(4), frontend(1), backend(3), ci-proof |
| 17.1 | The added job is justified by measured verdict time: the frontend job was the slowest job in recent runs. | slice 1 | observed: dashboard/tests/shards.md Decision 2026-11-16: frontend suite ended by the deadline on a slow runner |
| 17.2 | The job-time report already says `dashboard-integrated` could drop one job, which would return the count to 18. It is stated as a possibility, not a promise to drop it. | slice 1 | observed: dashboard/tests/shards.md: no group count changed; integrated stays 4 |
| 18 | No Accepted ADR constrains this change. | slice 1 | observed: seed Architecture: no Accepted ADR governs CI layout; change cites none |
| 19 | The change reverses the 2026-11-14 cohosting of lint on the frontend runner (`97b0f808f`). | slice 1 | observed: .github/workflows/browser-test-group.yml: lint input from 97b0f808f removed |
| 19.1 | Before the story is Taken, the developer confirms the reversal or picks another option. | slice 1 | observed: Take commit dd5f9164a after the plan's Decision before Take: story Taken on the reversal |
| 20a | Raising the deadline and job bound is not chosen. | slice 1 | observed: browser-test-group.yml: deadline and job bound unchanged |
| 20b | Scaling the deadline by a measured runner speed is not chosen. | slice 1 | observed: no runner-speed scaling added |
| 20c | Hosting lint on a `dashboard-integrated` shard is not chosen. | slice 1 | observed: ci.yml: dashboard-integrated passes no lint; it runs in its own job |
| 20d | Giving the frontend group a second shard taken from integrated is not chosen. | slice 1 | observed: ci.yml: dashboard-frontend shards [1] unchanged |
