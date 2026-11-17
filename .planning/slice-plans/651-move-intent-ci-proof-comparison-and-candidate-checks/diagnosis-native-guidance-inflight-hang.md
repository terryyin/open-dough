# Diagnosis: native-guidance-inflight-hang

## Signature

`Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-inflight.sh`
never finished: `TIMEOUT: ... (exhausted run deadline; after 154.1s)`. No other
failure in the job log.

## CI references

- Run 44079796018 attempt 1, job "Distribution Tests (2/3)" (134027100953),
  revision 9f54296e2a4e543a63057dd7d28b80dbf2dc71d0, ubuntu runner, bash 5.2.
- Normal duration: 0.8 s in main run 44072090789 (test-times artifact).

## Attribution

Pre-existing. This story changed only dashboard tests and docs; the script,
`native-run-owned.sh`, `native-run-supervise.sh` and
`scripts/owned-process-group.bash` are untouched by it. Still owned.

## Analysis

Every section is bounded by the 30 s safety watchdog except loops the
watchdog cannot end: a busy loop in `native_run_wait_first`, and the test's
own unbounded `wait "${supervisor}"` on the interrupt subshell. A 154 s hang
therefore needs one of those, or a section where the watchdog was stopped.

## Round 1

Hypothesis H1: a scheduling race leaves the script blocked or spinning
under load. Experiment: loop the script with Homebrew bash 5.3 and a 25 s
per-run alarm (`/Users/terryyin/.claude/jobs/db6d2416/tmp/ci1/loop.sh`),
load ~40-50 from external work. Stopping count: 200 runs, or the first hang.

Hypothesis H2: `native_run_wait_first` relies on `wait -n`, which on Bash
5.2 can miss a child's exit (the same defect reproduced on Ubuntu/Bash 5.2 by
commit 4fda2d1ec for the test runner, evidence in
`~/.cache/seed296-runner-race/`). In the timeout section the watchdog kills
the model and then exits itself; the controller blocks on its hold FIFO
forever, so a missed model exit leaves `wait -n` blocked with nothing left to
end it. Other sections still have a live 30 s watchdog, so a miss there fails
at ~30 s instead of hanging. Experiment: loop the script in `ubuntu:24.04`
(bash 5.2.21, colima, `--cpus 2`) through
`/Users/terryyin/.claude/jobs/db6d2416/tmp/ci1/linux-loop.sh`, a run alive
after 25 s counted as a hang with `ps` captured. Stopping count: 300 runs, or
the first hang.

## Round 1 results

- macOS (bash 5.3.20, load ~40-50, no test runner, `-x` trace): 200 runs,
  1 hang (run 86), 0 other failures. Trace
  `/Users/terryyin/.claude/jobs/db6d2416/tmp/ci1/hang-86.out` ends in
  `wait -n -p native_run_finished <model> <controller>` in the
  controller-failure section. The controller (`exit 19` once the model
  file exists) had already ended. `wait -n` missed its exit and blocked
  past the 25 s alarm on the model, which runs until killed. This matches
  the signature class: `wait -n` misses a finished child.
- Linux container (ubuntu:24.04, bash 5.2.21, `--cpus 2`, no test runner):
  300 runs, 0 hangs, 0 failures. The rate there is too low to measure
  without the CI scheduler.

Cause: `native_run_wait_first` (`Distribution/evaluation/src/native-run-owned.sh`)
trusts `wait -n` to report the first finished child. When it misses one,
it waits on the other alone. In the controller-failure, early-model and
host-failure sections, the 30 s watchdog ends that wait, so the test fails
with 124 instead of hanging. In the timeout section, the watchdog has
already expired and exited after killing the model. If `wait -n` misses that
model exit, only the controller is left, blocked on its hold FIFO forever.
That hang is unbounded, which matches CI's 154 s run-deadline cut. The test
runner hit the same Bash defect earlier (commit 4fda2d1ec).

Repair: `native_run_wait_first` no longer calls `wait -n`. It observes each
child's exit (`kill -0`) every 50 ms and reaps that child by pid, which
returns its cached status. The watchdog still bounds the wait. Product
supervisor change.

Hypothesis H3 (repair): with the repair, the same loop does not hang.
Experiment: 4 parallel macOS loops of 200 runs each (800 runs, extra load)
with the same 25 s alarm. Stopping count: 800 runs. At the pre-repair rate of
1 in 200, 0 hangs in 800 runs has about a 2 % chance if the defect remained.

## Repair results

- H3 confirmed. macOS: 4 parallel loops of 200 runs (`par.sh`), 800 runs, 0
  hangs, 0 failures, at higher load than the pre-repair batch.
- Linux container (bash 5.2.21): 200 runs, 0 hangs, 0 failures.
- Consumers (`consumer-trace.mjs --term native_run_wait_first`): only
  `native_run_owned_controlled`. Its callers are the controlled native runs
  (`native-guidance-check-run.sh`, `native-guidance-check-turn.sh`, the
  supplier-watch case). Proof: `env PATH=/opt/homebrew/bin:$PATH bash
  scripts/test.sh Distribution/evaluation/tests/native-guidance-checks/native-guidance-check*.sh
  Distribution/evaluation/tests/native-harness/*.sh
  Distribution/evaluation/tests/native-harness/*.test.mjs`: 31 files, exit 0.
- `native-run-owned.sh` is a supervision input
  (`native_run_supervision_inputs`), so new native evidence records get a
  new input hash. No committed record holds the old hash.
- No deterministic forced reproduction: the miss is inside Bash's `wait -n`
  and could not be triggered on demand. The evidence is the natural
  reproduction (1/200 before, 0/800 after).

Round 1, cumulative 4.7 active minutes.
