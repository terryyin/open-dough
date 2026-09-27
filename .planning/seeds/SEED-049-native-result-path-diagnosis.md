---
id: SEED-049
status: active
planted: 2026-09-27
planted_during: Refinement of SEED-046#ci-verdict-round-2
trigger_when: A shell check fails without saying where it stopped
scope: 1 story
---

# SEED-049: Say where a failing shell check stopped

## Why This Matters

Most shell checks under `tests/` assert with bare commands such as
`[[ -f ${attempt}/record ]]` or `attempt=$(awk ...)` under `set -e`. When one
fails, the check exits without a word, and `scripts/test.sh` reports only
`FAIL: <check>` over an empty log. On 2026-09-27, 39 of the 55 shell checks
used bare `[[ ]]` assertions; only `tests/native-delivery-updated-use.sh`
named its failing line, through its own `ERR` trap added in `146c373` after
one such silent CI failure. The same gap hides a missing `result-path:` line:
eight scripts copy one `awk` parse that exits 1 silently, and only the Codex
updated-use helper explains it. The cost is slow diagnosis, not a false
pass: the check still fails.

## Alternatives and Decision

The runner names where any failing shell check stopped: file, line, and
command. One change covers every bare assertion, including each result-path
parse, without editing the checks. Considered and set aside on 2026-09-27:

- Adding the missing-result-path message to the updated-use adapters check
  alone fixes one of the eight copies and leaves the rest silent.
- One shared result-path reader in all eight copies would also show the
  wrapper's output, but it fixes only that one failure among many bare
  assertions. It stays available if a stop location proves insufficient.

The maintainer kept this story first in the queue.

## Stories

<a id="native-result-path-diagnosis"></a>

### Name the file, line, and command where a failing shell check stopped

**Identity:** SEED-049#native-result-path-diagnosis
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/124-failing-check-location/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"78499a2bec7b237789ef33b15ed4507352b4e1b6cddeb7d456901ebf5a634dfc","plan":"3c1f38098ba8102ea903b88052230b333911c60d1ecbb11821e1111aeaf85e52"}}
```

**Goal:** A maintainer or agent whose shell check fails, locally or on CI,
sees in the runner's report which file, line, and command stopped it, instead
of a bare `FAIL: <check>`. Parallel agents publishing to trunk then diagnose a
red CI verdict from the report instead of rerunning to find the failing
assertion.

**Scope:**

1. **Every shell check the runner starts.** When a check started by
   `scripts/test.sh` stops on a failing command under `set -e`, its reported
   log names that command, its file (the check itself or a support file it
   sources), and its line. A command that fails inside a command
   substitution such as `attempt=$(...)` is named by the line running that
   substitution, where the check stopped. No check file needs its own trap or
   prelude for this. It holds on CI, which runs checks through the same
   runner.
2. **Only the command that stopped the check.** A failure the check handles
   (under `set +e`, in an `if`, or after `||`) is never reported as a stop
   location, and a check that exits nonzero by its own `exit` or `FAIL:`
   message is not given a location it did not stop at.
3. **Passing checks and launched scripts stay unchanged.** A passing check
   still prints nothing, so the runner's rule that a check which prints fails
   the run keeps holding. Scripts a check launches, such as the wrappers and
   product scripts it asserts on, see no reporter and print nothing extra.
4. **One mechanism.** `tests/native-delivery-updated-use.sh` drops its own
   `ERR` trap for the runner's report, and the tests README describes what a
   failing check's report shows.

**Constraints:**

- No per-check prelude or trap: the SEED-048 plan (`120-explicit-test-environment`)
  chose to extend the runner rather than add one, and running a check file
  directly outside the runner is unsupported.
- Shipped product and installer scripts are not changed and keep supporting
  macOS Bash 3.2; the runner already requires Bash 5 for checks.

**Deferred promises:**

- Showing the native wrapper's output when no `result-path:` line appears,
  and consolidating the eight copied result-path parses.
- Why a wrapper printed no result path; that is a wrapper defect.
- Adding explanatory messages to individual assertions.
- `node --test` files, which already report through
  `tests/support/node-test-failures-reporter.mjs`.
- Paid native-agent runs, which stay manual.

**Key examples:**

1. `tests/native-run-timeout.sh` runs and its `[[ -f ${attempt}/record ]]` is
   false → `npm test` → the report under `FAIL: tests/native-run-timeout.sh`
   names `tests/native-run-timeout.sh`, that line, and
   `[[ -f ${attempt}/record ]]`.
2. The wrapper that `tests/native-run-timeout.sh` runs prints no
   `result-path:` line → `npm test` → the report names that check's
   `attempt=$(awk '/^result-path: / ...` line, so the maintainer knows the run
   reported no result path. In `tests/native-delivery-updated-use-adapters.sh`,
   whose parse runs inside `success=$(run_selected "${host}" 0)`, the report
   names that line and so which host's run stopped the check.
3. A check expects a wrapper to fail, runs it under `set +e`, and passes →
   `npm test` → the check reports nothing, and the wrapper's captured stderr
   that the check asserts on has no reporter text in it.
4. A check prints its own `FAIL: ...` message and runs `exit 1` after an
   earlier handled failure → `npm test` → the report shows that message and
   no stop location from the earlier handled failure.

## When to Surface

Now: queued after SEED-046, split from its leftovers by the maintainer on
2026-09-27.

## Breadcrumbs

- Leftover recorded in SEED-037's correction plan, recoverable at
  `f10d52e:.planning/slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`.
