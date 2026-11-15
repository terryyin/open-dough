# Source review

Launch: fresh general-purpose reviewer, no conversation inheritance, 2026-11-15, during execution start of SEED-355#reconsider-further-ci-reduction.
Input: only the seed section's Goal, Scope (with exclusions) and Key examples, copied verbatim from `.planning/seeds/SEED-355-reconsider-further-ci-reduction.md`; told to read no other file and change nothing. The table holds its returned ids and text (exclusions and examples condensed).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer changes the CI job count only on evidence. | slice 3 | |
| G2 | One command reads recent `main` runs and says, for each test group, how close its slowest job runs to the 320-second job deadline. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all (deadline + headroom per group); real run 2026-11-15 lists five groups vs 320 s |
| G3 | The same command says, for each test group, whether one job fewer would still fit. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all (one-fewer projection + verdict per group) |
| G4 | The layout stays at the 18 jobs that evidence supports, so runner demand is as low as the deadline allows without another layout campaign. | slice 3 | |
| 1 | Developer decision, 2026-11-15: settle at the current 18-job layout. | slice 3 | |
| 1a.1 | Layout includes six E2E jobs. | slice 3 | |
| 1a.2 | Layout includes four integrated jobs. | slice 3 | |
| 1a.3 | Layout includes one frontend job with lint and type-check. | slice 3 | |
| 1a.4 | Layout includes three backend jobs. | slice 3 | |
| 1a.5 | Layout includes three Distribution shares. | slice 3 | |
| 1a.6 | Layout includes one proof job. | slice 3 | |
| 1b | Later changes are justified by rule. | slice 3 | |
| 1c.1 | This story changes no job count. | slice 3 | |
| 1c.2 | This story changes no deadline. | slice 3 | |
| 1c.3 | This story changes no job timeout. | slice 3 | |
| 1c.4 | This story changes no worker count. | slice 3 | |
| 1c.5 | This story changes no test. | slice 3 | |
| 1c.6 | This story changes no CI proof declaration. | slice 3 | |
| 2 | A read-only report command sits beside `scripts/ci-test-times.sh` and follows its conventions. | slice 1 | observed: scripts/ci-job-times.sh beside scripts/ci-test-times.sh; shared scripts/trunk-runs.bash + gh-message.bash |
| 2a | It reads the last 10 successful `ci.yml` runs on `main` through `gh`. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_in_log calls: run list --workflow ci.yml --branch main --status success --limit 10 |
| 2b | It starts no run. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh gh stand-in exits 2 on any call other than run list/api; scripts/ci-job-times.sh calls only those |
| 2c | Without readable runs it says why and exits 1. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report unreadable/empty/gh-fails exit 1 with reason |
| 2d | It reports for each group: | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all; real run prints the five groups |
| 2d.1 | group `e2e` | slice 1 | observed: real run 2026-11-15: e2e line; Distribution/tests/ci/ci-job-times.sh ' / shard i/n' naming |
| 2d.2 | group `dashboard-integrated` | slice 1 | observed: real run 2026-11-15: dashboard-integrated line |
| 2d.3 | group `dashboard-frontend` | slice 1 | observed: real run 2026-11-15: dashboard-frontend line (single job, keep) |
| 2d.4 | group `dashboard-backend` | slice 1 | observed: real run 2026-11-15: dashboard-backend line |
| 2d.5 | group Distribution Tests | slice 1 | observed: real run 2026-11-15: Distribution Tests line; Distribution/tests/ci/ci-job-times.sh ' (i/n)' naming |
| 2e | For each group it prints: | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all line format |
| 2e.1 | the job count; | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: 'N jobs' |
| 2e.2 | the slowest job's seconds from job start to the end of its test step (what the deadline bounds), lowest to highest across the runs read; | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: 'slowest job lo-hi s' ending at test step (upload step to 590 s ignored) |
| 2e.3 | the headroom to the deadline; | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: 'deadline 300 s, headroom H' from run's own deadline step |
| 2e.4 | the projected slowest job at one job fewer; | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: 'N-1 jobs would take lo-hi s' (late, thin, Distribution Tests) |
| 2e.5 | a verdict: `keep` or `could drop one`. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: keep / could drop one |
| 2f | A group is judged over the runs that have its current job count. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: thin over 5 runs excluding run 206 at 5 jobs |
| 2g | Each group's line says how many runs it was judged over. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: 'over R runs' (thin 5, others 6, sparse 4) |
| 2h | `could drop one` requires the projection to stay inside the deadline with a stated reserve for runner-speed variation (a job's slowest recent run took up to 1.6 times its median). | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all: heading states reserve; thin keep (headroom 14 < spread 48); scratch reserve-off made thin say could drop one |
| 2i | One further line gives the runs' runner wait (job creation to start) and verdict time. | slice 2 | observed: Distribution/tests/ci/ci-job-times.sh expect_report all and waited: last line 'Runner wait ... verdict time ... over N runs'; real run 2-415 s, 298-802 s |
| 2j | The wait line is apart from the group lines; a wait never changes the group lines. | slice 2 | observed: Distribution/tests/ci/ci-job-times.sh expect_report waited: group lines byte-identical to all.log, only the wait line differs |
| 3 | The sizing rule is recorded once beside the layout in shards (`dashboard/tests/shards.md`). | slice 3 | |
| 3a.1 | The rule is linked from test shares (`Distribution/tests/test-shares.md`). | slice 3 | |
| 3a.2 | The rule is linked from the `ci.yml` layout comment. | slice 3 | |
| 3b | Rule: each group keeps the smallest job count whose slowest job stays inside the deadline in recent `main` runs. | slice 3 | |
| 3c | Rule: remove a job when the report says `could drop one`. | slice 3 | |
| 3d | Rule: the following `main` runs are the check; a deadline failure restores the count. | slice 3 | |
| 3e | Rule: add a job only after a job of that group is ended by the deadline on `main` and neither a refreshed duration list nor a faster spec restores its headroom. | slice 3 | |
| 3f | Rule: verdict time is never a reason to add a job (it is the slowest job plus runner wait, the account runs 20 jobs at once, and more jobs lengthen the wait). | slice 3 | |
| 3g | Rule: a sizing decision reads the report. | slice 3 | |
| 3h | Rule: a sizing decision needs no matched-run comparison, new measurement run or copied CI data. | slice 3 | |
| 4 | Record the decision to stay at 18 and its short rationale beside the layout. | slice 3 | |
| 4a | The record names the runs the report read when the story is executed. | slice 3 | |
| 4b | Raw CI data stays in CI. | slice 3 | |
| 4c | The rule replaces the layout note's pointer to this queued reconsideration. | slice 3 | |
| 5 | Runner demand below this layout comes from fewer test-seconds (owned by retiring Dashboard Integrated UI Test and suite optimization); the report then shows when a group's count can follow. | slice 3 | |
| X1 | Does not lengthen the deadline to run fewer, longer jobs. | slice 3 | |
| X2 | Does not select groups by changed path. | slice 1 | observed: scripts/ci-job-times.sh takes no arguments and reads every group job |
| X3 | Does not pack several groups into one job. | slice 3 | |
| X4 | Does not reduce test-seconds. | slice 3 | |
| X5 | Does not add tests that assert workflow configuration. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh serves self-contained fixture JSON; no workflow file read |
| E1 | Recent successful `main` runs of present layout → report prints five group lines and one wait line; every group says `keep`. | slice 3 | |
| E2 | E2E six jobs, slowest 215–259 s → five jobs project 253–305 s, inside 320 s but not inside the reserve → `keep`. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh thin: 5 jobs 238-286 s inside 300 s, headroom 14 < spread 48 -> keep; real e2e 246-297 s headroom 23 < spread 51 -> keep |
| E3 | Group whose jobs became much shorter (four integrated jobs, slowest 120–150 s) → three jobs project about 190 s, inside deadline with reserve → `could drop one`. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh Distribution Tests: 2 jobs 145-175 s, headroom 125 >= spread 30 -> could drop one |
| E4 | Run that waited for runners → wait line shows wait and verdict time; no group's seconds, headroom or verdict changes. | slice 2 | observed: Distribution/tests/ci/ci-job-times.sh waited case: ci-proof waits 656 s, thin 282 s -> 0-656 s, verdict 600-882 s; group lines unchanged |
| E5 | Runs across a layout change (E2E five jobs older, six newer) → E2E judged over six-job runs only; its line says how many. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh thin: older 5-job run 206 excluded from thin only (5 runs) while others count 6 |
| E6 | `gh` fails or lists no successful run → command names the reason and exits 1 with no verdict. | slice 1 | observed: Distribution/tests/ci/ci-job-times.sh expect_report gh-fails and empty: reason, exit 1, no verdict |
| E7 | Developer considers a seventh E2E job for a faster verdict with no deadline failure on `main` → rule gives no ground to add it. | slice 3 | |
