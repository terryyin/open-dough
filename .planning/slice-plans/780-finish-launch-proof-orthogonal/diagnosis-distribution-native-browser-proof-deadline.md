# Distribution native browser proof deadline

## Round 1

Story branch run 45111168729 attempt 1 at
`e6ecba906120805687154b1ae827ecb686e45eee` failed only Distribution
share 2/3, job 137483613708. Setup took 14 seconds of the 320-second
job-relative test budget. The runner exhausted its absolute cutoff
after 306 seconds in the suite. The only unfinished check was
`Distribution/evaluation/tests/page-objects/page-object-native-browser-proof.mjs`,
which received 7.7 seconds before the job deadline. The live notification
is acknowledged. The completed provider inventory still reports
`no-recognized-failure` because its parser does not recognize the
runner's TIMEOUT marker. The raw job log and full per-file timings are
in `open-dough/evidence/ci-45111168729`.

No Distribution, workflow or runner source changed in the failing
increment. The subsequent attachment slice was already in foreground
commit and publication and completed at
`f35f91b1e69eff3c9956c76bea558b68c47e3e65`. That head is the clean
repair checkout. The preservation tool reported clean with no stash
entry. No new slice has started. A different worktree's combined
Distribution run has no changes to this named check or shared
selection and no established ownership of this failure.

Compare this share's selection, per-file timing, and launch position
against the nearest successful same-branch run and one current main
attempt. Test the hypothesis that the runner delays a required
browser check behind the longer jobs, leaving too little time from
the unchanged deadline. Inspect the test and scheduling before
choosing a failing-before reproduction. Stop after bounded evidence
and one focused mechanism test if it can discriminate the cause.
Hold further expensive work while recording the pre-launch condition.
Use the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

### Focused scheduling replay before launch

The failed run and the successful controls (same branch 45108770652 job
137476056297, main 45108979111 job 137476723074) selected the same 74 checks.
They used runner version 20261111.635 and Ubuntu 24.04.5 image
20261116.376.1. Their shard-2 case-file times sum to 1213.6s (at cutoff),
924.7s, and 853.9s. Among 51 comparable files over one second, 46 were
slower than the branch control and 49 slower than main. Median ratios were
1.31 and 1.41. The same check took 7.5s and 7.1s on the successful controls.
Failed setup took about 15s from the declared starting epoch, versus about
11s and 10s. Failed shares 1 and 3 ran their suites in 171s and 168s.

The path-ordered launch puts the browser proof 72nd. Replaying four slots
with the failed run’s measured times predicts it starts 297.1s into the suite.
The log’s 7.7s of execution before 04:25:10.445Z puts its actual start at
04:25:02.7Z, about 297.6s after npm began running the suite. The runner’s
180s per-check limit was not approached. The browser check performs two
real Chromium launches to verify success and expected/actual diagnostics.
Its test log was empty at cutoff. No assertion failure, image transition,
missing worker slot, or unexplained runner delay emerged from these comparisons.
The logs expose a broad slowdown within this shard, while they do not identify
the VM’s underlying resource conditions. Inspected the exact Distribution,
workflow, runner, and lockfile paths across branch and main. No story change
in those paths or known other owner accounts for this failure. A first listing
attempt resolved macOS Bash 3.2 and stopped before check selection. The
corrected listing used Homebrew Bash 5 and verified the order.

Run one disposable production-selector and production-runner replay, maximum
two launches in this batch (one original, one proposed). The hypothesis is
that the bytewise queue consumes the fixed run budget before the browser check
can finish, and that moving the comparison family restores sufficient room.
Build the same 667 paths and preserve each job’s kind, with sleep stubs for
their work. Use measured failed-input durations scaled 1:10, except a 12s
browser stub intentionally widens the discrimination interval. Use the same
38s cutoff and four lightweight slots on both arms. Expect the original arm
to report only the named browser cutoff and stop on any other result. Expect
the proposed arm to select all 667 paths across shards without overlap, move
only the seven `native-comparison-*` checks from share 2 to 3, and pass the
compressed share 2 replay. Also replay the three unchanged timing rosters
without compression to estimate the receiving shard’s capacity. Keep timing,
start, outcome, and cutoff output in `open-dough/evidence/ci-45111168729`.
The sleep stubs exercise scheduling with a margin and do not measure product
runtime or a hosted VM. No full suite, external runs, or retries are selected.
The associated clock `run` wraps the batch in `caffeinate -s -i` on AC power.

### Round 1 result

Run 45111168729 attempt 1's
[file proof](https://github.com/terryyin/open-dough/actions/runs/45111168729/artifacts/14790235994)
records 73 passed, one failed and zero other, with 7700ms for the browser
proof. The [times artifact](https://github.com/terryyin/open-dough/actions/runs/45111168729/artifacts/14789373881)
and the [job log](https://github.com/terryyin/open-dough/actions/runs/45111168729/job/137483613708)
identify the absolute cutoff. The completion diagnostic recognizes `FAIL`,
`INTERRUPTED`, and `PRINTED` but omits `TIMEOUT`, accounting for its
`no-recognized-failure` result. That is a separate diagnostic gap.

The one replay batch matched the CI cutoff signature in its original arm.
The browser stub launched at 32.0s and ran for 6.9s. Its lone timeout
left 73 passed, one failed and zero unstarted. With the proposed pattern,
the browser stub launched at 22.9s and ran for 12.1s. All 67 share-2 checks
passed in 35.1s. The production selector verified the partition of all 667
checks in both arms, with shares 281/74/312 and 281/67/319. The exact moved
set is the existing `native-comparison-archive-usage.test.mjs`,
`native-comparison-baseline-misses.sh`, `native-comparison-baseline-reuse.sh`,
`native-comparison-baselines.sh`, `native-comparison-incomplete.sh`,
`native-comparison-pairs.sh`, and `native-comparison-refresh.sh` in
`Distribution/evaluation/tests/native-guidance-checks/`.

| Timing input | Current share 2 | Candidate share 2 | Current share 3 | Candidate share 3 |
| --- | ---: | ---: | ---: | ---: |
| Failed branch run 45111168729 | 304.8s | 212.6s | 167.1s | 260.4s |
| Same branch 45108770652 | 233.2s | 163.2s | 166.2s | 236.6s |
| Main 45108979111 | 215.3s | 152.3s | 164.1s | 227.7s |

The table estimates four-slot completion with measured job durations and
omits runner overhead. The failed-input 7.7s browser sample is censored, so
304.8s is a lower-bound finish estimate for share 2. Replaying the successful
inputs corroborates the model within roughly one second of their actual
suite durations. The replay stubs show the scheduler mechanism and exact
selection. A normal story-branch CI attempt on the published repair supplies
the real Chromium, receiving-share, and hosted proof.

The confirmed repository cause is insufficient headroom in share 2 for
ordinary hosted timing variation. Its path-sorted queue reached the late
browser check with only 7.7s available. The proposed one-line repair in
`.github/workflows/ci.yml` narrows the share-2 native-guidance pattern from
`Distribution/evaluation/tests/native-guidance-checks/**` to
`Distribution/evaluation/tests/native-guidance-checks/native-guidance-check*`.
The existing remainder rule assigns the seven comparison checks to share 3.

Evidence is in `open-dough/evidence/ci-45111168729` under this worktree's
private Git directory. `replay-distribution-cutoff.py` ran with
`caffeinate -s -i python3 <driver>` through slice-clock `run`, yielding
`compressed-replay.log`, `compressed-replay.exit`, and the per-arm starts,
outcomes, timings and scheduler logs. Conditions were AC power on macOS,
16 cores, Homebrew Bash 5.3, Node 24.21, and a natural one-minute load of
6.11–6.41 with independent work on the host. One original reproduction
matched and one candidate launch passed. Scratch was removed by the driver.
Round 1 recorded 5.1 active minutes at the result review. The coordinator
owns the pause and the separate repair clock. The diagnosis record is the
only untracked checkout path at this handoff. Follow the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The coordinator paused the diagnosis at 5.9 active minutes and
applied the exact one-line candidate under the separate repair clock.
Verify the existing runner split and deadline checks once at two
workers under the AC guard. The normal story-branch CI will verify
both affected real shares, including the native browser witness and
the seven comparisons on their receiving share.

The first local verification stopped before any test because the npm
entry selected macOS Bash 3. Run the same two checks once with the
installed Homebrew Bash first in this command's PATH. This tests the
unchanged selector and cutoff under their documented Bash 5 requirement.

Both maintained checks passed with Bash 5, two workers and the
AC guard. See `repair-local-bash5.log.run.json` and its exit receipt.
Independent review found the matrix edit already cohesive with the
existing selector and reused the accepted proof without edits.
Real hosted execution of the two affected shares remains the
normal branch CI gate. Source freshness was unchanged at `3bb16a07`.
