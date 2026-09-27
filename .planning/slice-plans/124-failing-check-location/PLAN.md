# Name the file, line, and command where a failing shell check stopped

## Source

**Identity:** SEED-049#native-result-path-diagnosis

[Refined story](../../seeds/SEED-049-native-result-path-diagnosis.md#native-result-path-diagnosis),
refined with the maintainer on 2026-09-27, who chose the runner-wide report
over a shared result-path reader and kept the story first in the queue. The
instruction authorizes refinement, planning, and plan refinement, not
implementation.

## Goal and scope

A maintainer or agent whose shell check fails, locally or on CI, sees in the
runner's report the file, line, and command that stopped it, instead of a bare
`FAIL: <check>` over an empty log.

Included: `scripts/test.sh` gives every shell check it starts a stop-location
report; handled failures, passing checks, and scripts a check launches stay
silent; `tests/native-delivery-updated-use.sh` drops its own `ERR` trap; the
tests README describes the report.

Excluded: showing the native wrapper's output or consolidating the eight
copied `result-path:` parses; why a wrapper printed no result path; messages
on individual assertions; `node --test` files; running a check file outside
the runner; product and installer scripts; paid native runs.

Assumption: checks run under the runner's Bash 5 (`scripts/test.sh` already
enforces it), locally and on CI's Ubuntu Bash.

## Outside-in proof

| Promise (story scope) | Example | Owning slice and observation |
| --- | --- | --- |
| A bare assertion's stop names file, line, and command | 1 | 1: substitute check through the runner; log names `<check>:<line>: [[ a == b ]]` |
| A stop in a sourced support file names that file | 1 | 1: substitute check sourcing `support/…`; log names the support file and its line |
| A failure inside `$(...)` is named at the substitution's line | 2 | 1: substitute check with `attempt=$(awk … exit 1 …)`; log names that line and command |
| Handled failures are never reported | 3, 4 | 1: substitute checks with `set +e`, `if`, `||`, and a mid-substitution failure pass silently; a check that prints its own `FAIL:` and exits 1 after a handled failure shows no location |
| Passing checks stay silent | 3 | 1: existing passing-suite assertion (no output, status 0) stays green |
| Launched scripts see no reporter | 3 | 1: substitute check runs a failing `bash -c` under `set +e` capturing its stderr, and asserts that stderr is exactly the child's own line |
| One mechanism | — | 1: `tests/native-delivery-updated-use.sh` has no `ERR` trap and still passes; README section updated |
| Holds on CI | — | 1: CI `test` check green on the slice's revision, with `tests/test-runner-failure-report.sh` among its jobs |

## Current decisions and existing solution

- **Existing solution (PFE).** `tests/native-delivery-updated-use.sh` already
  names its failing line through an `ERR` trap (`146c373`). This plan moves
  that behavior to the runner so every check gets it, and removes the
  per-check copy. `tests/test-runner-failure-report.sh` already runs
  substitute checks through the runner via `OPEN_DOUGH_TEST_DIR` and is the
  outside-in proof entry point.
- **Mechanism, proven on 2026-09-27.** The runner starts each shell job with
  `BASH_ENV` pointing at one small support file (for example
  `tests/support/check-stop-report.bash`). That file unsets `BASH_ENV` so no
  script the check launches loads it, duplicates stderr to a spare
  descriptor so a report survives a redirected function, sets `-E`, and
  installs an `ERR` trap that prints
  `FAIL: stopped at <BASH_SOURCE>:<LINENO>: <BASH_COMMAND>` only while
  `errexit` is on. Bash fires `ERR` under the same conditions as `errexit`,
  so a report means the check is exiting there; a handled failure fires no
  `ERR`, or fires with `errexit` off inside `$(...)`, and prints nothing. The
  exact wording may change during implementation if it reads better beside
  the runner's `FAIL: <job>` heading.
  Probe (Bash 5.3.20, macOS), a scratch reporter file and five scripts run as
  `BASH_ENV=<reporter> bash cN.sh`:
  bare `[[ -f /nonexistent ]]` → `STOPPED: c1.sh:4: [[ -f /nonexistent ]]`,
  exit 1; a sourced function's `awk` failing inside `attempt=$(parse out.txt)`
  → `STOPPED: c2.sh:4: attempt=$(parse out.txt)`; `set +e` failing child
  with captured stderr, `if false`, `false || true`, `$(false; echo after)`
  → silent, exit 0, child stderr unchanged; `set +e; false; set -e` then an
  own `FAIL:` and `exit 1` → only the own message; a function failing under
  `f 2>/dev/null` → `STOPPED: c5.sh:2: [[ 1 -eq 2 ]]`.
- **No per-check edits.** The SEED-048 plan (`120-explicit-test-environment`)
  extends the runner rather than adding a per-check prelude; this plan keeps
  that direction. No check file changes except removing the one duplicate
  trap.
- **Concurrent runner changes.** Plans 120 (SEED-048) and 122 (SEED-046) are
  Taken and also edit `scripts/test.sh`. This change touches only how
  `run_job` starts a shell job; integrate onto whichever has landed and keep
  their behavior intact.

## Ordered slices

### 1. The runner names where a failing shell check stopped
Type: Behavior
Status: done
Proof: `tests/test-runner-failure-report.sh` extended with substitute checks
for every row of the proof table, run through the runner
(`bash scripts/test.sh` with `OPEN_DOUGH_TEST_DIR`); then the whole local
suite with Bash 5 green and silent, and the CI `test` check green on the
slice's revision.

Behavior: a shell check started by `scripts/test.sh` stops on a failing
command under `set -e` → the runner's report for that check names the file,
line, and command where it stopped (the substitution's line for a failure
inside `$(...)`); handled failures, passing checks, and scripts the check
launches print nothing new. `tests/native-delivery-updated-use.sh` no longer
carries its own `ERR` trap, and the tests README's failure-report section
says what the report shows.

Accepted proof, on this branch's base and again on trunk's runner after plan
122 landed its split (the change applied unchanged; `scripts/test.sh` is 218
lines there):
`PATH=/opt/homebrew/bin:$PATH bash tests/test-runner-failure-report.sh`
exit 0 — the `stops` block writes `bare.sh`, `sourced.sh` with
`support/stop-helper.bash` called as `stop_helper 2> /dev/null`,
`substitution.sh`, `handled.sh`, `own-fail.sh`, and `launched.sh`, runs them
through `run_suite stops`, and asserts the exact lines
`stopped at <dir>/bare.sh:3: [[ a == b ]]`,
`stopped at <dir>/substitution.sh:3: attempt=$(awk 'BEGIN { exit 1 }')`, and
`stopped at <dir>/support/stop-helper.bash:2: [[ 1 -eq 2 ]]`, and that no other
`stopped at` line appears (own-fail keeps only its own `FAIL:` message;
launched asserts its child's stderr is exactly `child-line`);
`bash tests/native-delivery-updated-use.sh` exit 0 without its trap; the whole
local suite `bash scripts/test.sh` exit 0 and silent. The report reads
`stopped at <file>:<line>: <command>` under the runner's `FAIL: <job>`
heading, without its own `FAIL:` prefix. CI `test` verdict is observed on the
published revision.

## Execution complete

Product advice: no queue change. The report serves the near-future direction:
parallel agents diagnose a red CI verdict from it. Keep the deferred wrapper
output and result-path parse consolidation unqueued until a real failure shows
the named `attempt=$(awk ...)` line is not enough. Whichever of this story and
plan 120 integrates second keeps the runner's `BASH_ENV` reporter when it
changes how `run_job` starts a shell job.

## Learnings

- Inside a command substitution `errexit` is off (no `inherit_errexit`), so
  the report names the line that runs the substitution, not the command that
  failed within it. `tests/native-delivery-updated-use-adapters.sh` therefore
  reports `success=$(run_selected "${host}" 0)`, not the `awk` parse inside.
  Turning on `inherit_errexit` would change which existing checks pass and is
  not part of this story.
- A child `( ... )` subshell that fails under errexit reports twice: once for
  the inner command and once for the subshell's line. Both are true and no
  test pins it.
- The dashboard port test that bound the real port 43127 failed locally
  whenever a developer's dashboard server was running; trunk fixed it
  independently (`a034dfd`) while this slice ran, so this execution adopted
  that fix instead of its own equivalent one.
