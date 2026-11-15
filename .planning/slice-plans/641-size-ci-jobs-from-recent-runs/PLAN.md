# Reconsider further CI job reduction with a different approach

**Identity:** SEED-355#reconsider-further-ci-reduction
**Source:** [Reconsider further CI job reduction with a different approach](../../seeds/SEED-355-reconsider-further-ci-reduction.md#reconsider-further-ci-reduction)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer changes the CI job count only on evidence. One read-only command
reads recent `main` runs and says, for each test group, how close its slowest
job runs to the job deadline and whether one job fewer would still fit. The
layout stays at 18 jobs, and the rule for later changes is recorded beside it.

Included: the report command with its check, the runner-wait line, the sizing
rule and the stay-at-18 decision beside the layout.

Excluded: any change to a job count, deadline, job timeout, worker count, test
or CI proof declaration; a longer deadline; selecting groups by changed path;
packing groups into one job; reducing test-seconds; tests that assert workflow
configuration; new measurement runs and copied CI data. This plan supplies no
execution authority.

## Existing solution and architectural fit

PFE at `e21ccc303e8d8525a226a7fd41be709c84fca2cf`:

| Responsibility | Existing owner and disposition |
| --- | --- |
| Report recent `main` CI timings with a headroom verdict | `scripts/ci-test-times.sh` reports Distribution check files against `Distribution/tests/time-budget` from times artifacts. The new question is each job's wall seconds against the job deadline, from the jobs API. Add the sibling `scripts/ci-job-times.sh`; do not widen the budget report. |
| List the runs to read and refuse without them | `scripts/ci-test-times.sh` lists the last 10 successful `ci.yml` runs on `main` and ends with `No recent trunk timings were found: <reason>`. Use the same listing call and refusal. When both scripts hold the same lines, move them to one sourced file beside `scripts/gh-message.bash` and keep `Distribution/tests/ci/ci-test-times.sh` green. |
| Quote a failed `gh` call | Reuse `scripts/gh-message.bash`. |
| The reserve that separates a safe margin from a thin one | [Time budget](../../../Distribution/tests/time-budget.md) calls a margin `wide` when headroom is at least the spread. Reuse that reserve for `could drop one`; add no second margin rule. |
| The deadline's value | Each job's deadline step carries it in its name (`… run (320 seconds) deadlines`), set in `.github/workflows/ci.yml` and `browser-test-group.yml`. Read it from each run's own job; keep no second copy. |
| A `gh` stand-in and report assertions | `Distribution/tests/ci/ci-test-times.sh` with `Distribution/tests/helpers/expect-report.bash` and `expect-in-log.bash`. Reuse the helpers and the stand-in shape for `run list` and `api`. |
| Where the layout and its reasons live | `dashboard/tests/shards.md`, "The producers". The rule and decision go there; `Distribution/tests/test-shares.md` and the `ci.yml` layout comment link to it. |

This is maintainer tooling beside an existing report. It sets no product
boundary, shared responsibility or domain meaning, so no Accepted ADR or North
Star topic constrains it and none is added.

[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
basis, set before execution. Beneficiary: a developer or agent sizing CI.
Baseline: SEED-350's six-run layout screen, which stayed inconclusive.
Intended gain: a sizing decision from one read-only command. Worth keeping:
on real recent runs the report says `keep` for every group, including E2E at
six jobs, and its check shows `could drop one` only with the reserve met. No
claim about verdict time or runner demand is made.

Expected edits stay under the 250-line check: `dashboard/tests/shards.md` 162,
`Distribution/tests/test-shares.md` 87, `scripts/ci-test-times.sh` 184,
`.github/workflows/ci.yml` 167. Recheck edited files during execution.

## Decisive premises and preparation observations

Observed in this owned checkout at `e21ccc303e8d8525a226a7fd41be709c84fca2cf`
on 2026-11-15, read-only against GitHub. The arithmetic ran in a scratch
Python script outside the checkout on the rows the planned `gh` calls
returned; the language cannot change the sums.

| Premise and consuming operation | Observation in the form used | Result and remainder |
| --- | --- | --- |
| The run listing gives the runs to read (slice 1). | `gh run list --workflow ci.yml --branch main --status success --limit 10 --json databaseId,createdAt --jq '.[] \| "\(.databaseId)\t\(.createdAt)"'` | Ten rows, 43711604666 (2026-11-15T12:00:07Z) to 43687158526. Settled. |
| The jobs API gives each job's name, creation, start, test-step end and deadline in one call (slices 1 and 2). | `gh api "repos/{owner}/{repo}/actions/runs/43709868512/jobs?per_page=100" --jq` selecting `.name`, `.created_at`, `.started_at`, `.completed_at`, the step named `Run the group's browser tests` or `Run Distribution Tests`, and the step whose name ends `deadlines`, with `fromdateiso8601` | 18 rows a run. `dashboard-backend / shard 1/3` gave creation 1794742685, start 1794742949, test-step end 1794743149 and `Start prerequisite acquisition (180 seconds) and browser run (320 seconds) deadlines`. Distribution jobs are named `Distribution Tests (i/n)` with `… test-run (320 seconds) deadlines`; `ci-proof` has neither step. Settled for first attempts; a rerun attempt was not observed, and it cannot change the outcome because each job still appears once with its own times. |
| The reserve keeps every current group, and does not recommend five E2E jobs (slices 1 and 3). | The rule in Current decisions applied to the ten listed runs. | Distribution 3 jobs, slowest 221–288 s, two would take 324–424 s. Backend 3 jobs, 200–302 s, two 291–439 s. E2E 6 jobs over 9 runs, 208–251 s, five 246–297 s with headroom 23 s below spread 51 s. Integrated 4 jobs over 9 runs, 176–250 s, three 228–328 s. Frontend 1 job, 194–312 s. All `keep`. Runner wait 2–415 s, verdict time 298–802 s. Settled. |
| A new check file fits its Distribution share (slice 1). | `node scripts/test-shares.mjs preview --split-count 3` | Each share predicts 747.8 job-seconds with 178.2 s headroom to 926; an unrecorded job is assumed at 1.5 s. The sibling check is recorded at 1.6 s. Settled. |
| The new check's path selects its conventions (slices 1 and 2). | `node .claude/skills/dough-execute-plan/scripts/test-entry-rules.mjs --project . --source Distribution/tests/ci/ci-job-times.sh` | `makeMe: true`, `pageObjects: false`. Settled. |
| Lint tools for a shell script are present (all slices). | `which shellcheck shfmt`; `npm run lint` is `node scripts/lint.mjs` | Both at `/opt/homebrew/bin`. This workspace has no `node_modules`; execution installs with `npm ci` before lint. |

No scratch edit was made in the checkout. No paid, credentialed or
developer-operated observation is needed: `gh` reads are free and read-only.

## Outside-in proof ownership

| Final promise | Owner and observable proof |
| --- | --- |
| One line per group: job count, runs counted, slowest job lowest–highest, deadline, headroom, and for more than one job the one-fewer projection | Slice 1: the check runs the command against a `gh` stand-in serving fixture runs and compares the whole report. |
| `could drop one` only when the projection's headroom is at least its spread over at least five runs; otherwise `keep` | Slice 1: one fixture group meets the reserve, one projects inside the deadline with headroom below its spread, one projects past it, one has a single job, one has fewer than five runs. Disable the reserve in a scratch edit and see the thin group's line fail. |
| A group is judged over runs at its current job count | Slice 1: an older fixture run with another count for one group is left out of that group's line and counted in the others'. |
| Job seconds run from job start to the end of the test step; the deadline comes from the run | Slice 1: fixture jobs carry later upload steps and a deadline step name with another number; the report follows both. |
| `gh` failure, no successful run, or no readable job gives the reason and exit 1 | Slice 1: three refusals through the stand-in. |
| Runner wait and verdict time appear on their own line and change no group line | Slice 2: the same fixture runs with and without waiting jobs give identical group lines and different wait lines. |
| The rule, the command and the stay-at-18 decision are recorded beside the layout, naming the runs read | Slice 3: run the real command, read the changed documents, `npm run lint`. |
| The rule gives no ground to add a job for verdict time | Slice 3: the recorded rule names deadline failure as the only ground and the 20-job account limit as the reason. |

## Ordered slices

### 1. Report each group's deadline headroom and one-fewer verdict
Type: Behavior
Status: done
Proof: new `Distribution/tests/ci/ci-job-times.sh` through
`bash scripts/test.sh`, with `Distribution/tests/ci/ci-test-times.sh` still
green when the run listing is shared.

Behavior: Given recent successful `ci.yml` runs on `main`,
`bash scripts/ci-job-times.sh` prints a heading naming the runs read, then one
line per group as the promises above describe, each ending `keep` or
`could drop one`. Without readable runs it prints
`No recent trunk timings were found: <reason>` and exits 1. It starts no run
and writes nothing outside its temporary directory.

Follow Current decisions for the listing, the job query, grouping, seconds,
deadline, projection and reserve. Describe the command in the script's header
comment as `scripts/ci-test-times.sh` does. Before authoring the check, apply
MakeMe as selected: build fixture runs from short declarations of group, job
count and seconds, so each case shows only the values its verdict depends on.
Run `node scripts/test-shares.mjs preview --split-count 3` after adding the
check and `bash scripts/ci-test-times.sh` for the share baseline, as
[time budget](../../../Distribution/tests/time-budget.md) asks of a slice that
adds test time. One report-to-verdict proof loop; target 15 active minutes,
commands excluded. Interim: until slice 3 only the header comment describes
the command.

Accepted proof (2026-11-15): `bash scripts/test.sh Distribution/tests/ci/ci-job-times.sh Distribution/tests/ci/ci-test-times.sh`
passes; the check's whole-report `expect_report all` covers each verdict case
and the three refusals. A scratch reserve-off edit made the `thin` and
`sparse` lines say `could drop one`. The listing, refusal and per-run
bookkeeping moved to `scripts/trunk-runs.bash`, shared by both reports with
byte-identical output. Share baseline: all three Distribution share totals
were `thin` (highest 891.6 of 926); a paired A/B of the changed
`ci-test-times.sh` check gave ratio about 1.05 (noise, load 9), so share 1
projects about 893 with the new 1.5 s check. The real command read runs from
2026-11-15T08:11Z to 12:15Z and said `keep` for every group. Learning: the
check's `gh` stand-in applies the `--jq` filter with system `jq`.

### 2. Show runner wait and verdict time apart from job time
Type: Behavior
Status: done
Proof: added cases in `Distribution/tests/ci/ci-job-times.sh`.

Behavior: Given runs whose jobs waited for a runner, the report ends with one
line giving the runs' runner wait (the longest job creation-to-start in each
run, lowest to highest) and verdict time (first job creation to last job
completion, lowest to highest) over the runs read. Every job counts here,
including one without a test step such as `ci-proof`. Group lines are the same
with and without the wait.

One wait-line proof loop; target 15 active minutes, commands excluded.

Accepted proof (2026-11-15): the same focused command passes; `expect_report
waited` compares the `all` report minus its last line plus the waited line,
so group lines stay byte-identical while the wait line reads 0-656 s and
verdict 600-882 s. The wait line covers the runs read; `run_filter` rides the
one jobs call per run. The real command gave runner wait 2-415 s and verdict
time 298-802 s over 10 runs.

CI repair (2026-11-15): run 43715261434 at 96e739e failed `Distribution Tests
(3/3)` over its 926 job-second budget (935.9 at recorded speed; shares
554/779/1025 s observed). `Distribution/tests/longest-first` was stale with
26 unrecorded jobs, several native-comparison checks of 30-40 s assumed at
1.5 s; the new check shifted the bytewise unrecorded deal so they met in
share 3. The list was refreshed from main run 43712947370; the preview now
predicts 898-899 job-seconds a share with one unrecorded job.

### 3. Record the sizing rule and the stay-at-18 decision beside the layout
Type: Behavior
Status: done
Proof: the real `bash scripts/ci-job-times.sh` output read at execution, the
changed documents, and `npm run lint`.

Behavior: Given the layout note in `dashboard/tests/shards.md`, a developer
finds there the sizing rule, the command with how to read a line, and the
decision to stay at 18 with a short rationale naming the runs the report read.
`Distribution/tests/test-shares.md` links the share count to that rule, and
the `ci.yml` layout comment points at it. The note's sentence about the queued
reconsideration is gone.

Record the rule as the seed's Scope states it, once, in a short section of
`shards.md`. Copy no report output, run JSON or API response; give the run
range, the date and each group's verdict in a sentence. Run the real command
from the execution checkout. When it says `could drop one` for a group, record
that verdict and name it in the execution-complete product advice; the count
stays unchanged in this story. One documentation proof loop; target 15 active
minutes, commands excluded.

Accepted proof (2026-11-15): the real report read main runs 43693339004 to
43712947370 and said `keep` for every group; `dashboard/tests/shards.md`
"The job count" records the rule, the command and the decision, linked from
`Distribution/tests/test-shares.md` and the `ci.yml` e2e comment; the
reconsideration pointer is gone; `npm run lint` passes. The refactor pass cut
the section's field-by-field line description, which duplicated the script's
header comment.

## Execution complete

Product advice: keep the 18-job layout; the report said `keep` for every
group. After the duration-list refresh the three Distribution shares predict
898-899 of their 926 job-second ceiling, so that budget, not the 320-second
deadline, is the nearest Distribution limit: the next added check time there
calls for test-second reduction, which the suite-optimization story owns,
rather than a fourth share. The frontend job has the least deadline headroom
(8 s); under the rule it gains a job only after a deadline failure on `main`.

## Verification and consumer trace

Before test changes apply [AGENTS.md test automation](../../../AGENTS.md#test-automation)
and the MakeMe selection above; recheck the selector when a test path changes.
Use default timeouts; no `test.slow()` or suite, file, group or hook override.

Local gates: `bash scripts/test.sh Distribution/tests/ci/ci-job-times.sh Distribution/tests/ci/ci-test-times.sh`
and `npm run lint` after `npm ci`. These checks take seconds and no whole
suite is a local gate: the change adds one script, one check and
documentation, and CI runs every group after publication. A long local run, if
one becomes necessary, follows the maintained
[macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, lid open under
`caffeinate -i`, then read the sleep log.

Follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local and CI failure, and carry that link into each
delegation brief and repair handoff.

Each slice runs the installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`. Add `--term` for any run
listing or refusal moved out of `scripts/ci-test-times.sh` and for
`No recent trunk timings were found`. Give each listed consumer a run, a
reuse or an exclusion with its reason.

## Current decisions and concern review

- Command `bash scripts/ci-job-times.sh`, no arguments; check
  `Distribution/tests/ci/ci-job-times.sh`.
- Runs: the listing call in the premise table. Jobs: one
  `gh api "repos/{owner}/{repo}/actions/runs/<id>/jobs?per_page=100"` a run.
- A group job is a job with a deadline step and a finished test step. Its
  group is its name without the trailing ` / shard i/n` or ` (i/n)`. A run
  where a group job has no finished test step is not counted for that group.
- Job seconds: job `started_at` to the end of its test step. Deadline: the
  number in that job's deadline step name.
- One-fewer projection for `n` jobs: for each job, its seconds before the test
  step plus its test-step seconds times `n / (n − 1)`; the group's projection
  in a run is its highest job.
- `could drop one`: at least five runs at the current count, and the deadline
  minus the highest projection is at least the highest minus the lowest
  projection. Anything else, and a one-job group, is `keep`.
- The report gives no `add` verdict. Adding follows the recorded rule: a
  deadline failure on `main` that a refreshed duration list or a faster spec
  does not cure.
- Line wording follows `scripts/ci-test-times.sh`; the check holds the exact
  text. The premise table's third row shows the values a real line carries.
- No human checkpoint, trunk-only step or blocking dependency.
- Slice-plan refinement was not needed: three slices, each one outcome with
  its own proof loop and a 15-minute target, within the eight-slice limit.
- No remaining slice-specific concern was identified in the inspected
  boundary.
