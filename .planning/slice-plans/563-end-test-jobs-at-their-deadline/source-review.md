# Source review — SEED-289#name-a-test-job-past-its-deadline

**Launch:** Fresh general-purpose reviewer via Cursor Task, no conversation
inheritance, model inherit. Instruction: use only the supplied story Goal,
Scope, key examples, exclusions, and Terry 2026-11-10 decision; read no other
project files; change nothing; return numbered commitments with compound ids.

**Input:** Exact Goal, Scope, Key examples, proof qualification, and Decision
text from `.planning/seeds/SEED-289-named-test-results-locally-and-in-ci.md`
section `End a node test job at its deadline with a named result`. No plan,
return, product, proof, or current-slice scope was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers and agents running `scripts/test.sh` locally or in CI receive a named, recorded failure when a check hangs or the CI run exhausts its available test time. | slice 2 | observed: test-runner-deadline-cutoff.test.mjs E3/E4 named RUN DEADLINE; cutoff-proof.test.mjs fragments feed |
| 2 | The deadline actively ends stuck work. | slice 1 | observed: tests/support/test-runner-deadline.test.mjs blocked Bash/Node TIMEOUT ends owned pid; scripts/test-job-deadline.bash arm+watchdog |
| 3 | Detecting slow tests or builds is not the purpose of this deadline. | slice 1 | observed: tests/README.md + runner-settings.md safety-stop wording; tests assert fixed 180s not budget |
| 4 | An overrun must end without requiring someone to kill the run. | slice 1 | observed: tests/support/test-runner-deadline.test.mjs timedOutRun ends hang without manual kill |
| 5 | An overrun must unblock every worktree’s whole-suite admission. | slice 1 | observed: test-runner-deadline-continuation.test.mjs timed-out whole run releases admission for waiter |
| 6 | This addresses DD-476’s hung check and DD-426’s unnamed hosted cancellation. | slice 2 | observed: per-job hang stop (slice1) + absolute cutoff before outer cancel (cutoff.test.mjs + ci.yml 320s) |
| 7 | Give each runner job a 180-second wall-clock safety deadline, locally and in CI. | slice 1 | observed: scripts/test-job-deadline.bash JOB_DEADLINE_SECONDS=180; deadline.test.mjs duration assertion |
| 8 | A runner job means one Bash check or one `node --test` file, matching the runner’s existing scheduler. | slice 1 | observed: deadline.test.mjs Bash hang.sh and Node hang.test.mjs both TIMEOUT |
| 9 | Start that job’s deadline clock when that job starts, rather than while it is queued or waiting for suite admission. | slice 1 | observed: scripts/test.sh arms deadline at job start; OPEN_DOUGH_TEST_JOB_DEADLINE_READY publishes after arm |
| 10 | At expiry, stop the affected job and its owned process group with bounded cleanup. | slice 1 | observed: scripts/owned-process-group.bash terminate TERM→grace→KILL; TERM-resistant case group death |
| 11 | At expiry, fail the run. | slice 1 | observed: deadline.test.mjs assert.notEqual(result.code, 0) on TIMEOUT cases |
| 12.1 | At expiry, report the job’s label | slice 1 | observed: TIMEOUT: ${labels[index]} in scripts/test.sh report_job; deadline.test.mjs match |
| 12.2 | At expiry, report the deadline reason | slice 1 | observed: safety deadline ${JOB_DEADLINE_SECONDS}s in TIMEOUT heading; deadline.test.mjs regex |
| 12.3 | At expiry, report elapsed time | slice 1 | observed: after ${seconds}s in TIMEOUT heading; deadline.test.mjs after [0-9]+.[0-9]s |
| 12.4 | At expiry, report useful captured output | slice 1 | observed: scripts/test.sh report_job TIMEOUT path cats launch+log after heading |
| 13 | A check ignoring TERM must not leave the deadline path waiting indefinitely. | slice 1 | observed: test-runner-deadline-continuation.test.mjs TERM-resistant owned group dies before second-ready |
| 14 | Deliberately detached workers retain their existing check-owned teardown contract. | slice 1 | observed: scripts/test.sh detached-worker comment; tests/test-runner-interrupt.sh retained; tests/README.md teardown contract |
| 15 | As with an ordinary failed check, other queued checks may continue after an individual job times out. | slice 1 | observed: test-runner-deadline-continuation.test.mjs queued second check passed after timeout |
| 16 | The run still fails after an individual job timeout. | slice 1 | observed: deadline.test.mjs TIMEOUT cases nonzero exit; status=1 in report_job |
| 17 | An absolute CI cutoff instead stops the whole run so reporting has time to finish. | slice 2 | observed: scripts/test-run-deadline.bash stop_running_jobs_for_run_deadline; cutoff.test.mjs mid/past cases |
| 18 | Preserve timing and `passed`/`failed` outcome rows for jobs that started, including the timed-out job. | slice 1 | observed: deadline.test.mjs times and outcomes rows for timed-out jobs |
| 19 | A completed local whole run releases `refs/dough/local-test-suite` through its existing admission owner, so the next waiting worktree can enter. | slice 1 | observed: test-runner-deadline-continuation.test.mjs admission waiter enters; gate ref gone after waiter |
| 20 | In CI, also bound the run against a 320-second absolute cutoff established before dependency setup, following the existing dashboard model. | slice 2 | observed: ci.yml OPEN_DOUGH_TEST_DEADLINE_MS=$((started+320000)) beside setup epoch; cutoff.test.mjs workflow assertion |
| 21 | Slow setup or many uniformly slow checks must not defeat the report by reaching the outer six-minute cancellation first. | slice 2 | observed: ci.yml comment+epoch; cutoff stops before six-minute outer; artifact steps keep !cancelled() |
| 22.1 | At the absolute CI cutoff: stop running work | slice 2 | observed: cutoff.test.mjs mid-cutoff stops running.sh; owned group terminated |
| 22.2 | At the absolute CI cutoff: identify unfinished jobs | slice 2 | observed: cutoff.test.mjs unfinished running: label + TIMEOUT exhausted run deadline |
| 22.3 | At the absolute CI cutoff: identify work not started | slice 2 | observed: cutoff.test.mjs queued unfinished outcome; past-cutoff zero starts |
| 22.4 | At the absolute CI cutoff: leave timing/outcome files available to the existing artifact and CI proof steps | slice 2 | observed: cutoff.test.mjs + cutoff-proof.test.mjs feed real outcome/time files to fragments; ci.yml artifact ifs |
| 23 | Unstarted checks have an unfinished outcome and no invented execution time. | slice 2 | observed: cutoff.test.mjs unfinished rows without timing lines for unstarted |
| 24 | CI proof must retain unstarted checks as other, rather than present them as passing or omit them as though no work remained. | slice 2 | observed: cutoff-proof.test.mjs fragments replay other counts for unfinished files |
| 25 | Keep normal silent success. | slice 1 | observed: deadline.test.mjs retirement case silent pass without TIMEOUT |
| 26 | Keep ordinary failure reporting. | slice 1 | observed: tests/test-runner-failure-report.sh retained in focused suite |
| 27 | Keep signal handling. | slice 1 | observed: tests/test-runner-interrupt.sh 130/143 retained after watchdog-before-wait |
| 28 | A completed check leaves no deadline worker that can later kill other work. | slice 1 | observed: test-runner-deadline-continuation.test.mjs retirement: first FIFO removed; successor alive |
| 29 | Keep the existing normalized 64-second per-job performance budget and its CI-only, post-run judgment unchanged. | slice 2 | observed: cutoff.test.mjs asserts 64s budget unchanged; test-runner-budget.sh retained |
| 30 | Keep the existing 694-job-second total performance budget and its CI-only, post-run judgment unchanged. | slice 2 | observed: cutoff.test.mjs asserts 694 job-seconds unchanged; test-runner-budget.sh retained |
| 31 | Those budgets measure performance at recorded runner speed. | slice 2 | observed: tests/runner-settings.md + README: budgets at recorded speed; safety wall-clock separate |
| 32 | The safety deadline measures wall time and must remain a separate policy. | slice 1 | observed: tests/README.md + runner-settings.md wall-clock safety separate from performance budgets |
| 33.1 | Outside this increment: the dashboard suite’s deadline | slice 2 | observed: no dashboard suite deadline edits; OPEN_DOUGH_DASHBOARD_DEADLINE_MS unchanged in ci.yml |
| 33.2 | Outside this increment: performance-budget recalibration | slice 2 | observed: budget ceilings asserted unchanged in cutoff.test.mjs |
| 33.3 | Outside this increment: hosted font parity | slice 2 | observed: no font-related edits in this slice diff |
| 33.4 | Outside this increment: automatic retries | slice 2 | observed: no retry-policy edits in this slice diff |
| 33.5 | Outside this increment: changes to test-level timeouts | slice 2 | observed: no test-level timeout edits; only runner safety/cutoff |
| E1 | A local whole run starts a check that announces readiness and then blocks. Its safety deadline expires. The run names that check and its elapsed time, records a failed outcome and timing, ends its owned processes, and admits a whole run waiting in another worktree once the run ends. | slice 1 | observed: deadline.test.mjs Bash hang TIMEOUT + continuation.test.mjs admission waiter journey |
| E2 | A check finishes silently before its deadline. Its outcome remains passed, and a later check remains alive when the first check’s old deadline would have expired. Ordinary check failures retain their existing diagnostics. | slice 1 | observed: continuation.test.mjs retirement successor survives; failure-report suite retained |
| E3 | CI setup consumes part of the available time; no single check has yet reached its own deadline when the absolute run cutoff arrives. The runner ends with named unfinished checks and retained reports before the hosted outer timeout. Checks not started are not reported as successes. | slice 2 | observed: cutoff.test.mjs mid-cutoff + cutoff-proof.test.mjs fragments failed/other |
| E4 | The CI cutoff has already passed when the runner starts. It fails naming the exhausted run deadline without starting checks, and leaves an honest unfinished report for the selected checks for the existing artifact consumers. | slice 2 | observed: cutoff.test.mjs past cutoff zero starts; cutoff-proof.test.mjs unfinished→other fragments |
| 34 | Proof advances a controlled clock or triggers an observable deadline event after job readiness; it never waits for wall-clock time to pass. | slice 1 | observed: deadline fixtures expireDeadline FIFO write; no wall-clock wait for 180s |
| 35 | The local deadline/report/admission journey is a useful safe stopping point before the CI cutoff and artifact journey is added. | slice 1 | observed: slice 1 local journey only; no CI 320s cutoff in scripts/test.sh |
| 36 | Accepted 180 seconds to actively stop a never-ending check and identify the failure. | slice 1 | observed: JOB_DEADLINE_SECONDS=180 + TIMEOUT named failure proof |
| 37 | That 180-second value is not a new threshold for detecting slow tests or builds. | slice 1 | observed: docs and discriminating disable/enable: safety stop not slow-test threshold |
| 38 | The CI cutoff follows the dashboard’s existing 320-second allowance before the six-minute outer bound, preserving time to save reports without changing either performance budget. | slice 2 | observed: ci.yml 320s test epoch before outer bound; budgets unchanged |
