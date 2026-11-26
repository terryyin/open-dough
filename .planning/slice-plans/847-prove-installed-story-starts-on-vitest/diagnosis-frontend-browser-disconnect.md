# Frontend browser disconnect

The applicable CI basis for completion revision `4c31d40b4` is
`64018ca45`. GitHub Actions run 45733591466, attempt 1, failed in
frontend shard 1, job 139621469022. The checkout was clean at the repair
boundary. The Dashboard backend migration does not change the failing
frontend test, its shard assignment, or the browser runner.

The job log records 539 passing assertions in 190 of 212 files before
Vitest reported `VITEST_BROWSER_CONNECTION_CLOSED` while opening
`intent-project-scope-history-remount.spec.ts` at 01:11:05.886 UTC.
The incomplete proof fragment is downstream of that disconnect. The
setup deadline was 01:11:07 and the suite deadline was 01:15:37. The
timestamps suggest checking resource lifetime and cancellation, and
do not establish which process closed the connection. Full log and
diagnostic are in the checkout's Git evidence directory.

Round 1 hypothesis: a CI boundary or browser resource failure stopped
the shard, or the named spec caused its browser context to close. Inspect
the job and runner lifecycle and compare existing runs before authorizing
one focused reproduction of a supported cause. Preserve all test cases
and default timeouts. Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Round 1 evidence

The selected branch, `codex/prove-installed-execution-and-refinement-starts`,
is at `4c31d40b4f47ba1a08f3b6e9bf4cd55302bdddde`. The plan-only
completion inherits CI from `64018ca4590afbec200848fc082fd83b50a43797`.
Compared with the start `52544c358`, this branch leaves the frontend
test files, Vitest configuration, browser dependencies and CI workflow
untouched. None of the four changed launch helpers in shared Test Support
is imported by the frontend tests. The candidate did change backend
launch implementation and test setup. Attribution alone leaves the CI
repair owed.

The full x64 hosted job log is `847-frontend-job-139621469022.log`, the
normalized run diagnosis is `847-ci-45733591466-1.json`, and Vitest's
report from artifact 15078500605 is `847-frontend-report-139621469022.json`.
All are under `git rev-parse --path-format=absolute --git-path
open-dough/evidence`. The report has 539 passing assertions and 22
unfinished files. The job logged its last complete case and immediately
lost an orchestrator WebSocket at 01:11:05.886 UTC. The matching
`[birpc] rpc is closed, cannot call "createTesters"` occurs when the
Vitest pool selects its next file and invokes the existing orchestrator;
the assigned `intent-project-scope-history-remount.spec.ts` had no
completed case. ResizeObserver stderr 58 seconds earlier precedes many
passing cases and gives no close cause.

The setup command already returned at 01:08:22.593 UTC. Its deadline
was scoped to acquisition and its timer was cleared upon exit.
`groupVitest.mjs` uses the suite deadline at 01:15:37 UTC and reports an
explicit deadline or cancel message; neither precedes this disconnect.
The remaining job steps recorded and uploaded evidence. WebSocket close
in `@vitest/browser` emits this generic error. Its heartbeat termination
and the Playwright provider's page-crash handler have distinct messages.
Neither message appears. A process exit, independent top-level
navigation or close, or a socket-only failure can produce the generic
close. This log cannot establish their order.

The historical record at
`git show 6a5ce378a:.planning/slice-plans/819-read-published-board-and-review/diagnosis-frontend-browser-connection.md`
has two x64 shard 1/2 failures with the same signature and different
in-flight files, run/attempt/job `45345208843/1/138278006284` and
`45514916618/1/138871754089`. Historical natural reproduction: focused
macOS 0/1, whole macOS 0/1, macOS shard at 4 workers 0/1, Ubuntu arm64
shard at 4 workers 0/1, and a hosted DEBUG observation 0/1. A forced
history traversal past the tester frame reproduced the signature 2/2.
The permanent guard at `6a5ce378a` refuses that traversal before it can
close the socket. The current hosted run uses the guard, with no guard
refusal in the error or test report, which refutes confidence that an
unguarded `history.back/forward/go` in a mounted spec caused this
occurrence. It does not exclude all top-level navigation or browser
lifecycle causes. The former DEBUG workflow from `908b7ad98`, removed by
`aabca7d19`, enabled Vitest pool/API/provider/GC timings and Playwright
browser process output. It had no explicit main-frame navigation,
page-close or browser-disconnect listeners and no hosted resource
samples. Repeating it or the earlier local shard has no new discriminator.

Earlier exact publications of the same branch had separate failures.

| Basis | Run / attempt / job | Finding |
| --- | --- | --- |
| `419e10dc658e13406c4b7fa7b27c51a5097eb000` | `45731274021/1/139613591962` | Frontend shard 2 hit the explicit suite deadline at 00:56:26 UTC. Report artifact 15076967063 had 115/116 completed files. The last test report at 00:50:31 preceded two pending cases in `stories/agent-roster-collection.spec.ts`. |
| `069b26a068c7342d9db96168e9d9fe68303fec53` | `45729900689/1/139609020893` | E2E shard 2 reported a Playwright timeout at `e2e/sessions/agent-launch-done-question.spec.ts:114`, locating a Taken row's Mark as done control in `dashboard/test-support/support/markDone.ts:55`. |

The earlier artifacts are `847-ci-45731274021-1.json`,
`847-frontend-job-139613591962.log`,
`847-frontend-report-139613591962.json`, and
`847-ci-45729900689-1.json`. Active worktrees and plans show no exact
competing repair owner. The nearest active checkout, `60677275a`
(plan 833), records a separate focus problem after terminal Mark as done
completes. Its copy of the failing E2E spec and the shared Mark as done
helper match this branch. The older failures remain separate from the
current revision's shard-1 disconnect.

### Private lifecycle instrument validation

Hypothesis: Playwright's orchestrator main-frame navigation, page close
or crash, and browser disconnect events are observable through the
existing provider without changing test execution. A single controlled
main-frame navigation should leave an identifiable event near the
generic orchestrator disconnect. This validates the instrument and is
not a reproduction of the cause on hosted CI. Stopping count: one local
focused run with two existing files and one worker under
`caffeinate -s -i`. Keep the temporary config and log only in Git
evidence, with no source, runner policy, or test changes. A passing run
with explicit events validates listeners only. A forced generic close
with a navigation event validates its distinction from a process close.

Result: **1/1 intentional navigation reproduced the exact error signature.**
macOS arm64 on AC power, 16 logical CPUs, one worker, load averages about
10 to 13, two existing Intent project-scope files. One case passed and
the next file was dropped. Evidence under the Git evidence directory is
`847-browser-lifecycle-validation.log`, `.exit` (exit 1), and
`.log.run.json` (exact command and revision). The private config was
`847-browser-lifecycle.config.mts` with
`847-browser-lifecycle-observer.mts`. It injected the navigation after
the first test case result. The observer recorded:

| UTC | Event |
| --- | --- |
| 01:50:06.957 | Validation calls `page.goto("about:blank")` |
| 01:50:06.963 | The orchestrator's main frame reaches `about:blank` and its WebSocket disconnects |
| 01:50:06.970 | After pool teardown starts, Playwright reports page close |
| 01:50:06.977 | Playwright reports browser disconnect |
| 01:50:06.989 | Chromium exits normally with code 0 and no signal |

That sequence validates that the lifecycle observation distinguishes a
top-level navigation from an unexpected browser exit. It adds no natural
reproduction in the hosted environment.

### One hosted lifecycle observation

Hypothesis: in the hosted failure, either an unexpected page navigation
or page/browser shutdown causes the orchestrator close, or the socket
closes while the page and Chromium are still running. A resource-driven
shutdown should leave a Chromium exit signal and system or cgroup OOM
counter delta, or preceding extreme depletion of space and relevant
Chromium stderr. Failing that, the resource record describes measured
available headroom and cannot alone exclude every resource limit.

Use one temporary candidate on the same story branch. Enable the
observer only for push CI on frontend shard 1/2. The changes are in
`dashboard/frontend.vitest.config.mts` and
`.github/workflows/browser-test-group.yml`. The provider emits UTC
main-frame navigation, page open/close/crash and browser disconnect
with browser and session identifiers, and marks the start of provider
cleanup. Existing Playwright browser DEBUG records the Chromium PID and
exit code or signal, and Vitest pool/API DEBUG records the associated
orchestrator. Sample temporary-disk free space and, on Linux when
available, cgroup memory events and host OOM counts at browser entry,
every 15 seconds, and at browser disconnect. No navigation is injected
in the published diagnostic. The hosted worker count, Chromium variant,
shard selection, proof fragments, and deadlines stay at the exact
branch's normal settings.

Before push, run the real group runner for one existing frontend case
with the flag enabled on macOS to verify the provider and normal
teardown, with one worker and the default test timeout. Stopping count:
one local focused validation and one hosted push run, attempt 1. Record
the hosted run, attempt and shard job IDs and retain its full log. If
the generic close recurs, use the first lifecycle/resource transition
to choose a targeted reproducer. A passing recorded run only validates
the observation and must not close the original repair as fixed.
Remove the temporary changes after the bounded observation, keeping
the evidence.

Focused validation passed 1/1 in the real group runner on macOS arm64,
on AC power, with one worker on a 16-logical-CPU host. Load averages
were about 12. The existing `intent-project-scope-history-remount.spec.ts`
case ran normally and emitted its JSON report. The observer recorded
initial free temporary space, browser 1 and its orchestrator session,
the initial `/__vitest_test__/` navigation, provider close before page
close, browser disconnect, and Chromium exit code 0 with no signal.
The exact command, exit 0, and output are in
`847-browser-lifecycle-focused.log.run.json`,
`847-browser-lifecycle-focused.exit`, and
`847-browser-lifecycle-focused.log`. macOS has no procfs cgroup/OOM
statistics to exercise; the hosted observer records them when readable.
Dashboard typecheck passed (the `847-browser-lifecycle-typecheck`
evidence), and the browser group and proof declaration checks passed 7/7
(the `847-browser-lifecycle-workflow-checks` evidence). Scoped ESLint,
Prettier, and Git diff checks also passed.

Round 1 handoff at 9.5 cumulative active minutes (5.5 remaining) from
the slice clock. The diagnosis is still open. The temporary config and
workflow are ready for the one coordinator-owned hosted observation.
There are no parked product or test changes on this worktree. This
diagnosis record and the two temporary instrumentation files are the
only uncommitted changes at handoff.

## Hosted result and withdrawal

The single instrumented push at
`5c4e1a2b631c7fdb919199c1a448c302e5045cb7` passed in workflow run
45739110922, attempt 1. Frontend shard 1 job 139639456918 completed
212 files and 564 cases in 112.71 s. The four orchestrator pages loaded
normally and the provider initiated cleanup after the test summary.
Chromium exited with code 0. Cgroup memory and host OOM counters stayed
at zero, and available temporary storage stayed near 93 GB.
`847-diagnostic-45739110922-frontend.log` holds the complete timeline.

The original disconnect did not recur in this one hosted attempt.
The successful timeline validates the instrumentation and leaves the
cause of run 45733591466 open. Existing Linux replay was arm64, and
the available local Colima profiles are also arm64. Another identical
hosted run would repeat the same experiment. The next useful evidence
is a lifecycle trace from a naturally failing hosted x64 run, or a
hosted reproducer that identifies the event preceding the disconnect.

The next publication withdraws the two temporary instrumented files
to their exact pre-diagnosis contents. Its ordinary push-triggered run
checks that restored tree once. That run does not test the previous
disconnect's cause. Stop at its result and preserve the evidence.
