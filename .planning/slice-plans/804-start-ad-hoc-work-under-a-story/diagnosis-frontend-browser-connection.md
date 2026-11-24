# Frontend browser connection closed during CI

Run 45345208843 attempt 1 tested the branch's published Slice 2 revision,
`efca0e5a9ecd3686eaa38abe0ab359f81f26a7fb`. Job 138278006284
(frontend shard 1/2) passed 478 observed cases and reported an unhandled
`VITEST_BROWSER_CONNECTION_CLOSED` while running
`intent-project-scope-history-source-identity.spec.ts`. Vitest listed 170 of
205 files as passed. The proof-fragment step then refused the incomplete
record. No failed assertion was identified in this job. A separate
ResizeObserver stderr line came more than 30 seconds earlier in a passed
test. The job's explicit suite cutoff had over two minutes remaining.
The attempt was still in progress at first inspection.

Slice 2 touched Distribution's admission and identity scripts. This
frontend job uses unchanged application, Vitest, Playwright, and proof
runner paths. The paths alone do not settle cause or repair ownership.
No other owner of this exact failure has been established.

The immutable failed job log and diagnostic JSON are in the worktree Git
evidence directory as `ci-45345208843-frontend.log` and
`ci-45345208843-attempt-1.json`. Slice 3 work is parked with the managed
repair stash. Diagnose from the published HEAD.

Round 1 will inspect the reported test and runner teardown/worker setup.
Hypothesis to test before a repeat: the browser-side connection closes
when the runner navigates or tears down a context still needed by another
case. Start at the smallest discriminating supported selection, once.
Record any different experiment before launching it.

### Round 1 reproduction

The reported mounted spec and its mount helpers contain no browser close
or navigation across the Vitest runner page. The group runner closes
browser providers on an explicit abort, but the failed job did not reach
its reported suite cutoff. Test whether running the reported spec beside
its mounted scope-history siblings is sufficient to close an active
browser connection. Run one focused batch with two local workers and
Playwright browser-process diagnostics, under the macOS AC power guard.
A passing batch only bounds this trigger on macOS. No full rerun planned
for this round.

The one macOS focused run passed all four cases in the three selected files.
Playwright logged both browser processes exiting normally after the JSON
report. The mounted fixture and two-worker context turnover alone did not
reproduce the failure (0/1 runs). Run record `ci-browser-round1-focused.log.run.json`.

The terminal hosted attempt confirmed one failed shard. Its archived report
contains 478 passed assertions and no failed assertions. The earlier failed
shard on run 45338298609 is a different keyboard assertion. Relevant
frontend inputs match the successful main revision `cd152e625`, although
the trigger's exact hosted conditions are unknown. Installed Vitest
distinguishes a page crash and heartbeat timeout from a generic orchestrator
socket close, and Vite emits a warning when dependency optimization reloads
a test. None of those signals is present in the original job log.

### Round 1 runtime instrumentation

Hypothesis for one instrumented Ubuntu replay: sustained shard work causes
the orchestrator connection to close by Chromium process exit, resource
pressure, or runner teardown. These should be distinguishable by browser
process exit, provider/pool chronology and memory or temp-volume evidence.
Run the CI frontend 1/2 selection once with locked dependencies, native
Ubuntu 24.04 arm64 on colima-work (4 CPUs, 8 GiB VM, only an idle buildkit
container). Host has 48 GiB, load 2.8 immediately before launch, AC power,
and 132 GiB free. The disposable source archive is the published HEAD.
The diagnostic VM differs from hosted x64 and its OS image provisioning.
The browser baseline image is already installed, while pinned Node and
the repository-locked Chromium are acquired to the disposable container.
The shard has a 330-second deadline and the whole container a 450-second
deadline. Use lifecycle debug logs and read-only cgroup and /tmp samples.
No retries in this batch. Preserve report and samples in private evidence.

The one Ubuntu replay passed 205/205 files and 526/526 cases in 59.20
seconds of Vitest service time. Both named source-identity cases ran.
The combined reporter wrote completed proof for all 526 cases. Browser
processes exited normally after the suite and no cgroup OOM event
occurred. Peak cgroup memory was 4,732,129,280 bytes and the temp
filesystem had more than 40 GB available. The container was removed.
The hosted signature reproduced in neither the focused native run nor
the instrumented shard. The Ubuntu run narrows the difference to hosted
conditions or x64, without proving an infrastructure cause. It used a
different runner image provisioning and VM architecture. Its lower
timing also means equivalent concurrency pressure is unproved.

Retained shell scripts in the worktree Git evidence directory are
`ci-browser-round1-linux-launch.zsh` and
`ci-browser-round1-linux/replay.sh`. The outer run record is
`ci-browser-round1-linux.log.run.json`. Its output includes the exact
browser launch and close chronology. The failed hosted artifact, local
capture, and runner commands remain outside the product checkout. No
temporary diagnostic product or test edit needs reversal. Round 1 spent
about six active minutes.

### Next discriminating experiment

The hosted job says the orchestrator socket closed while
`createTesters` was pending. Page crash, heartbeat expiry, and Vite
dependency reload have distinct diagnostics absent from that log.
Chromium host-process termination, provider close, and a transport or
navigation close are still possible. There is no failing-before case on
which to base a repair.

GitHub CLI's `--debug` adds GitHub runner and worker diagnostic logs plus
step debug events. It can test a specific hypothesis involving Actions
cancellation or a worker process error. The ordinary step and upload
continued normally in this attempt. The workflow does not translate
Actions debug to the test program's `DEBUG` setting, so a blank
debug rerun may still leave the browser cause unobservable.
[GitHub CLI rerun](https://cli.github.com/manual/gh_run_rerun)
[GitHub debug logging](https://docs.github.com/en/actions/how-tos/monitor-workflows/enable-debug-logging)

An evidence-bearing hosted replay should preserve the locked frontend
shard 1/2 and its execution/timeout semantics. Before its normal npm
runner, set only this shard's program environment to:

```sh
DEBUG=vitest:browser:pool,vitest:browser:api,vitest:browser:playwright,vitest:browser:gc,pw:browser
```

Retain Playwright browser exit code and signal, Vitest pool/provider
close order, API heartbeat/socket chronology, and the default Vitest GC
space checks. If host-memory termination is the specific hypothesis,
also retain before/after cgroup `memory.events` where readable, or the
runner's kernel OOM evidence when available. One instrumented hosted run
is the next proposed observation, with no source-level test or timeout
change. Accept a diagnosis only from the signal that precedes a repeat
failure. A pass without that signal leaves the original failure owed.

### Round 2 hosted instrumentation

Hypothesis: Chromium exits before Vitest loses its orchestrator connection.
On a matching failure, a preceding Playwright exit code or signal supports
process termination. With Chromium still running, an earlier Vitest
pool/provider close supports runner teardown, while an API heartbeat or
socket event can identify a transport-side interruption. If the chronology
is incomplete, leave attribution unresolved.

Observe one push-triggered hosted attempt on
`refs/heads/codex/start-ad-hoc-work-under-a-story` with commit subject
`Diagnose the hosted frontend browser disconnect`. The temporary
`.github/workflows/browser-test-group.yml` change enables the listed DEBUG
namespaces only in the suite step for frontend shard 1 on a push to that
ref whose head commit message starts with this subject. The locked test
selection, suite command, timeouts and reporters stay in place. Keep the
revision, run, job, attempt, terminal logs and proof artifacts from that
one run. This is diagnostic proof of event order, not delivery proof or a
repair. A passing run or an ambiguous failure leaves the original failure
owed under the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Stop after this one attempt, even if it passes or fails for a different
reason. Return the terminal outcome and the earliest relevant events to
the coordinator before any further experiment. Remove the temporary DEBUG
entry after collecting the evidence and before continuing delivery or
resuming the parked work. Record the cleanup and use this record to
decide whether the evidence supports a repair or a different experiment.

Local preflight passed at base `efca0e5a9ecd3686eaa38abe0ab359f81f26a7fb`
with the uncommitted instrumentation. Parsing the workflow and comparing
it to that base found only the suite step's DEBUG entry. Bash syntax,
the CI container and browser-cache guards, and 21 existing checks of
browser-group selection and proof passed. The worktree Git evidence log
and clock run record are `ci-browser-round2-verify.log` and
`ci-browser-round2-verify.log.run.json`. Round 2 was at 2.1 active minutes
after these checks, 9.1 active minutes cumulative. Hosted observation is
pending coordinator publication.
