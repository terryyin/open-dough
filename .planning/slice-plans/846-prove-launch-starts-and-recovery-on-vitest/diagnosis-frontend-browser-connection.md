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

## Round 4

The developer said “Resume” after the bounded frontend capture proposal.
This round prepares that experiment in the story checkout. Reuse the
validated socket and page correlation. Retain the bounded, redacted ring
through provider teardown and record browser process evidence when
available. Verify a quiet pass and a controlled renderer crash once
each with one worker before hosted use. The selected runner also has
an active Playwright retirement story. Its current accepted change does
not touch the capture's two files. The separate E2E repair at
`148a70d0` must reach its hosted result before a subsequent story push
could supersede it. No new blind CI rerun belongs to this experiment.

Local proof batch, stop after one normal two-case run, one forced renderer
crash and one Dashboard typecheck. The normal run should pass and produce
no capture marker. A renderer crash should yield the target error and one
marker with socket close, page crash and page close on the same anonymous
session, then provider settlement and, where available, process exit.
Playwright's local child handle should show the Chromium process present
when the renderer crashes. Teardown should then account for the process
exit separately from that crash. The existing two Intent cases are
unchanged. The scratch injector reuses the prior DevTools probe and stays
in worktree Git evidence.

Run sequentially on awake macOS arm64 with one browser worker, AC power
and `caffeinate -s -i`. At 09:56 UTC, the 16-CPU host had elevated but
falling load (41.42 one-minute average), about 45% CPU idle and 43% memory
free, with no swap changes in the samples. Other work was active.

The two-case run passed and produced zero markers. The one renderer
injection reproduced `VITEST_BROWSER_CONNECTION_CLOSED` and emitted one
redacted marker with 13 events. Anonymous session, browser and provider
`1` joined TCP close (7614 ms, Chromium present), page crash (7615 ms),
test run end (7620 ms), provider close (7620 ms), and page close
(7649 ms). Chromium disconnected at 7793 ms while the OS process was
still present, exited at 7809 ms with status 0, and provider close
settled at 7862 ms. The marker retained three temporary-storage samples.
Linux cgroup and host OOM counters require the hosted run. This
reproduces the generic error by injection. The cause of the natural
hosted disconnect remains open.

Worktree Git evidence under
`git rev-parse --path-format=absolute --git-path open-dough/evidence`
retains `frontend-round4-quiet.log`, `frontend-round4-renderer-crash.log`,
`frontend-round4-renderer-crash.mjs`,
`frontend-round4-correlation.json`, `frontend-round4-source.patch` and
`frontend-round4-final-source-typecheck.log`, with matching `.exit` and
`.log.run.json` files for the proof commands. Local proof used HEAD
`148a70d04b6f3037e47a9890dca02cf97a8d034c` with the temporary capture
applied.

Dashboard typecheck passed before and after mechanical observer typing and
callback changes. The initial read-only lint flagged seven callback typing
and void-return style errors. One recheck passed after preserving the same
callback arguments, event order and marker fields with explicit closure
bodies or bound callbacks. Prettier also passed for both source files.
The final typecheck recorded round 4 of 4 at 28.5 cumulative active minutes,
with no overrun.

The candidate uses ordinary GitHub-hosted push CI for frontend shard
`1/2` on the story branch. Its embedded cutoff is
`2026-11-29T09:54:00Z`. At publication the coordinator can retain that
cutoff or set it to no more than 72 hours after enablement. The runner
checks the cutoff when configuring the shard. A change to admit
`refs/heads/main` requires explicitly adding it to the branch predicate
and publishing the same temporary source on that branch. The current
candidate covers the story branch.

The hosted hypothesis is that same-session telemetry can distinguish a
browser/renderer or runner failure from transport loss or navigation.
The coordinator should count admitted completed shard jobs and retire
at the first matching failure, the twelfth completed watched shard job
or the cutoff, whichever comes first. Save the matching job's run,
attempt, job, logs and marker before retiring the config change and
`dashboard/test-support/support/frontendDisconnectCapture.ts` from
each enabled branch. This stop count uses coordinator observation and
adds no workflow state or permissions. A job already admitted at the
cutoff may finish collecting its teardown events. The separate E2E
repair run 45793341450 reached a passing terminal result before any
publication of this candidate.

The first watched job, run 45798389009 attempt 1 frontend shard `1/2`
(job 139834868535), completed successfully on `7984549d`: 217 files
and 590 tests passed. The complete log emitted no disconnect marker and
reported no matching Vitest failure. This accounts for one watched job.
The log is retained as `frontend-round4-hosted-45798389009-job-139834868535.log`
in worktree Git evidence. A separate backend assertion in job 139834868547
does not change the frontend result.
