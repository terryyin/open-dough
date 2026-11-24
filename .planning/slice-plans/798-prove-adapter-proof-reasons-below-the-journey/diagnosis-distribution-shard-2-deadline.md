# Distribution shard 2 exceeded its CI run deadline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Round 1 started with 15 active minutes. The registered slice 1 revision
`f742e02fbbffc4a2d263694f284880b3ea0d9afb` failed in [CI attempt 1](https://github.com/terryyin/open-dough/actions/runs/45298081463/attempts/1),
[Distribution Tests 2/3](https://github.com/terryyin/open-dough/actions/runs/45298081463/job/138123446565).
The absolute `OPEN_DOUGH_TEST_DEADLINE_MS` expired during the Distribution
runner. Four file tests were interrupted together, including three supplier
trunk closure tests. More files were unstarted. The initial bounded diagnostic
is in `ci-45298081463-1.json` in the execution Git evidence directory. It was
captured while a separate shard was still running. The inventory still needs
settlement when all jobs finish. No individual assertion failure has been
attributed yet. The completed slice added two subprocess cases to the scoped
Distribution adapter proof file, which had passed locally.

Slice 2 implementation and coordinator plan edits are parked in managed stash
`377670b57d5bc2bcc0ae08c58bd53004fd9e53dd`. The checkout is at the registered
revision with that stash excluded. Refactor had made no edits. No other repair
owner is known. Recent shard changes in `ff7fdc2f1` and `d45528326` are already
in the base.

Leading hypothesis, to be tested: current shard 2 workload plus prerequisite
startup exceeds the absolute CI budget on this runner. Collect this run's job
steps and file timings plus recent comparable runs and their shard mapping.
Distinguish setup delay, an individual test defect, and accumulated workload.
If a workload imbalance is demonstrated, test one candidate pattern move with
selection and matching timing evidence before any CI publication. Keep the
same test identities, checks, worker settings and deadlines unless evidence
shows another specific cause. Do not repeat CI merely to look for a pass.

## Recovered timing evidence

The terminal diagnostic finds just Distribution 2/3. Its recognizer reports
`no-recognized-failure` because the raw job log uses `TIMEOUT`. The log names
only the run-wide cutoff and the four checks it interrupted. Another thirteen
checks never started. All setup steps passed. The test step started 15s into
its 320s absolute budget and ran 306s. The other two test steps ran 163s and
158s. The timed part of shard 2 alone consumed 1,218.1 file-seconds. The target
adapter proof file ran in 1.7s, compared with 1.0–1.1s before the story's two
additional cases. No individual failure preceded the cutoff.

The three successful, same-workflow main runs `45291569324`, `45288034203`,
and `45221053866` ran this shard in 180s, 181s, and 232s. The comparable
support files were 1.6 times slower at the median in the failed shard. This
was broader than the adapter proof file. The 1,218.1s excludes all thirteen
unstarted files and truncates four durations. The terminal log, job step
clocks, and all twelve file-time artifacts are in this worktree's Git
evidence directory.

A four-slot replay in bytewise runner order uses the observed times and
job setup clocks. It estimates the incomplete files using the prior runs'
median times multiplied by the observed 1.6 slowdown. It predicts 327.6s
for the old shard 2 workload from the deadline's start. Removing only
`Distribution/evaluation/tests/git-publication/**` from shard 2 assigns
its 15 files to shard 3 and lowers that estimate to 258.7s. Shard 3 then
estimates 244.4s, using those files' respective shard 2 timings at full cost.
The same candidate's largest estimate across the three earlier inputs is
208.4s on shard 3. Moving the native harness group instead leaves 277.8s on
shard 2 with the failed-run inputs. The Git publication move leaves the
native guidance and support additions from `d45528326` and `ff7fdc2f1` in
place. The production selector partitions all 657 files once in both arms.

One bounded local replay batch will run the old and proposed shard 2 queues
through the real shell runner with four slots and an absolute cutoff. Isolated
sleep fixtures preserve the measured order, timing proportions, and cutoff.
The old arm should report the global cutoff in its tail. The candidate should
finish all its selected checks. Stop after these two arms, with no timing
repetition. This tests how the workload reaches the cutoff under the real
scheduler. It does not measure the real jobs on macOS or replace the hosted
CI gate.

The first driver launch stopped before any check because the isolated copy
omitted the runner's `Distribution/tests/helpers/wait-for.bash` dependency.
Supply that exact helper and launch the two-arm batch once. The workload,
scaling, cutoff, and stopping condition are unchanged.

The two-arm batch ran once on AC-powered macOS using Homebrew Bash 5.3,
Node 24.21, and four slots. Local load ranged from about 3.5 to 6.3 during
the diagnosis. The old arm reached the global cutoff in 49.4s with 190
passes, four interrupted and 71 unstarted. The candidate finished all 250
selected fixtures in 46.5s under the same 48.8s compressed cutoff. The
cutoff reached an earlier point in the compressed tail because process
startup overhead is not scaled. This confirms the global timeout mechanism,
not per-file elapsed time. Both arms ran in an isolated temporary directory
which the driver cleaned. Details are in `ci-distribution-2-replay-ready.log`
and its per-arm logs, outcomes and run receipt. Round 1 had used 3.8 active
minutes when the replay finished. No other test defect was observed.

The repair removes the single Git publication pattern from explicit share 2
claims. The existing remainder rule then runs the same 15 checks in share 3.
Verify one actual selector listing across all three shares and one focused
batch of runner selection and cutoff checks. Confirm the change in one normal
published CI attempt. The hypothesis is that the measured transfer leaves
both affected shards under the existing 320s cutoff while retaining every
check. Stop after that attempt and reassess any different failure signature.

The applied workflow's real runner listings match the 268/250/139 partition.
Run one four-slot focused batch of the split, matrix and cutoff checks plus all
four files interrupted by CI. These should pass under the maintained local
runner and distinguish scheduler cutoff from a defect in a named check. This
batch leaves the exact hosted workload and actual receiving share to the one
CI verification. No shared local test run is needed for unchanged checks.

Actual selector proof passed. The focused runner batch passed all eight files,
including every check interrupted by the failed CI run. The CI workflow and
reporting consumer batch passed four more files. Dashboard's workflow timing
reader passed nine cases, including parsing the repository's own workflow.
The repair is ready for one published CI observation. The evidence directory
contains `ci-distribution-2-repair-return.md` and all terminal run receipts.
