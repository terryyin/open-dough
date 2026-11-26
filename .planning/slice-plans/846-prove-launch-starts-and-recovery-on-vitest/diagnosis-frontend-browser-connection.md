# Frontend browser connection closed during the hosted shard

Story branch revision `0e58f2b6b2d1b8dd19448887d2fb5203b134ba5c` failed
CI run 45775533807, attempt 1, Dashboard frontend shard 1/2 job
139758172341. The rest of that run passed. Slice 5 is preserved by the
managed CI stash at
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-9eBPB0/record.json`
with OID `fb912b73b25715ba9388f02248c51b6fae666a83`.

Git evidence retains the full job log, diagnostic and partial report.
The failure was `VITEST_BROWSER_CONNECTION_CLOSED` with nested
`createTesters`. The partial report contains 566 passed cases and 196
of 217 files with results. Vitest cleared queued files after the RPC
failure. The outcomes spec named in the error had no assertions run,
so the name does not identify a trigger. The published increments
before this failure change backend tests and planning records only.

The detailed first two rounds, the exact hypotheses, commands, and
mechanical corrections are recoverable in this file at `91f7d9c2c`.
Prior project investigation is at
`79475eaef:.planning/slice-plans/847-prove-installed-story-starts-on-vitest/diagnosis-frontend-browser-disconnect.md`.

## Controlled local evidence and hosted trial

Each local probe ran with one worker on awake macOS arm64 on AC. The
corresponding scripts, outcomes, terminal times and commands are in
worktree Git evidence.

| Round | Bounded experiment | Decisive observation |
| --- | --- | --- |
| 1 | One server-side orchestrator TCP close after a case passed | Exact error with Chromium still connected, the orchestrator open, followed by provider cleanup. See `frontend-socket-causality-probe.log`. |
| 2 | One quiet pass and one validation each with forced transport loss and forced top-level navigation | Both faults emit the same Vitest error. TCP can be reported first even when the browser subsequently reports navigation. The quiet pass emitted no diagnostic. See `frontend-capture-*-reviewed.log`. |
| 2 | One instrumented hosted push 45778980880 for `2b7802bd0` | Frontend job 139769509169 passed 217 files and 590 tests and emitted no marker. The temporary capture was removed at `91f7d9c2c`, which passed all jobs in 45781390123. |
| 3 | One forced Chromium DevTools renderer crash at file dispatch | Exact error with TCP close at 09:26:39.915Z while the page appeared open, then Playwright's `page-crash` at .916Z and provider cleanup at .923Z. No attributed Vitest crash message appeared. See `frontend-renderer-crash-probe.log` and its clock record. |

Vitest removes an orchestrator session when the socket closes. The
provider's separate crash handler can then miss its lookup and emit
no specific crash message. The generic error, a cached open page
and a TCP-first event do not distinguish transport failure, navigation,
and renderer termination without the later same-session events.

## Hosted archive comparison

All four matching shard jobs used Ubuntu 24.04 x64, Node 24.21.0,
Vitest 5.1.0 and Playwright 1.65.0. Times below are from the Vitest
`RUN` line to the reported browser error.

| Run / attempt / job | Ubuntu image | Seconds | Completed files | Passed cases |
| --- | --- | ---: | ---: | ---: |
| 45345208843/1/138278006284 | 20261116.133.1 | 94.227 | 170/205 | 478 |
| 45514916618/1/138871754089 | 20261116.133.1 | 99.570 | 189/200 | 496 |
| 45733591466/1/139621469022 | 20261116.376.1 | 160.739 | 190/212 | 539 |
| 45775533807/1/139758172341 | 20261122.23.1 | 117.806 | 196/217 | 566 |

All closed 271–336 seconds before the group deadline, naming different
pending files. The ResizeObserver warning preceded the reported error
by 32–59 seconds and also appears in passing runs. No natural crash,
OOM, browser exit, or navigation was observed at the close. The current
failure occurred with the history guard from `6a5ce378a` active and no
guard refusal logged.

Earlier branch job 45773942749/1/139753065370 passed the same 217 files
and 590 cases on the same runner image in 121.363 s. The rollback's
45781390123/1/139777587712 did so in 124.083 s on 20261116.133.1.
Five of six branch shard jobs passed, including three whose parent
workflows were cancelled later. Main run 45775714235/1/139758883468
accounted for all 590 cases and failed a separate folder-label assertion.
Likewise, 45756056000 and 45783681400 were distinct matcher failures.
The logs and measured times are in `ci-<run>-frontend.log` and
`frontend-disconnect-archived-timings.txt` in Git evidence.

The earlier hosted DEBUG run set Vitest and Playwright process logging
in `908b7ad98`, and did not enable GitHub Actions runner diagnostics.
The lifecycle capture at `5c4e1a2b6` also passed without a natural close.
Earlier focused, whole-suite, shard, Linux arm64 and hosted diagnostic
runs did not naturally reproduce the disconnect. There is no exact
active repair owner. A prior developer exception applied only to run
45733591466/1/job 139621469022.

## Remaining decision

Three rounds used 20.9 cumulative active minutes. The required evidence
is one natural failing hosted x64 shard with socket and same-session
page events retained through provider teardown, plus browser process exit,
cgroup OOM and temporary storage indicators. A candidate window covers
ordinary shard 1/2 pushes on trunk and the selected branch until one
matching failure, 12 completed shard jobs, or 72 hours, whichever comes
first. It needs a developer-approved scope, owner and removal boundary.
An unchanged rerun or a single additional passing probe would not
resolve the failure under the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
