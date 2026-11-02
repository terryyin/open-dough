# End the held-gh start-slack deadlock and concurrent test-results race

**Identity:** SEED-218#fix-owned-calls-start-slack-hang
**Source:** [selected story](../../seeds/SEED-218-end-local-suite-hangs.md#fix-owned-calls-start-slack-hang).

## Goal and scope

A developer's local `npm test` ends with a finite, named result.
`github-request-owned-calls.test.mjs` records each fixture `gh` call against
`OwnedCalls` at spawn, as the production owner does, so a held call the test
owns is recognized and ended however late the fixture logs it. Each test in the
file has a finite bound, so a wait on an exit that never comes fails fast with
the test named, and its teardown still ends the fixture `gh`. The full local
suite, `tests/dashboard-concurrent-runs.sh` included, passes.

Exclusions, from the story: no change to the request-owner production path or
`startSlackMs`; no runner-wide test timeout; no live progress output for local
runs.

## Existing solutions and decisions

- **Production recording.** `github-request-calls.mjs` calls
  `owned.started(child.pid, …)` synchronously right after `execFile`. The
  test helper `leftCalls().call()` adopts that order: record, then wait for
  the fixture to log the call. Keep the recognition rule and slack in
  `github-request-owned-calls.mjs` unchanged.
- **Tests with other records.** The "never signalled unless" test records
  other arguments, a start an hour early, and this test process. It keeps
  its own explicit `owned.started` calls; only tests that record the very
  call they spawned move to recording at spawn. The "cannot be looked at"
  test records resource `search`, so the helper takes the resource along
  with the owner.
- **Bound.** Use Node's per-test `timeout` option (the same mechanism as
  `--test-timeout`, which cancelled the scratch repro at its bound with no
  `gh` left behind). Choose a value well above the file's loaded worst case;
  alone, its slowest test takes ~1.2 s.
- **Concurrent runs.** The pid-qualified run stamp and the `test-results`
  parent `mkdirSync` in `dashboard/playwright.config.ts` stay as they are.

## Decisive premises

Observed in this preparation workspace on 2026-11-02. Each scratch edit was
reverted before the records were written.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Late recording reproduces the hang | First owned-calls test | Scratch copy with a 3.5 s wait before `owned.started(left.pid, …)`, run as `env -u NO_COLOR -u FORCE_COLOR node --test --test-timeout=30000 --test-name-pattern="asked to end, and its record" <copy>` | Cancelled at 30 s (`test timed out after 30000ms`); no fixture `gh` left running |
| Recording at spawn ends a call the fixture logs late | First two owned-calls tests | Scratch helper recording at spawn, then waiting `SCRATCH_DELAY` before the fixture-logged await; `SCRATCH_DELAY=0` and `3500` with `--test-name-pattern="asked to end, and its record\|killed a second later"` | Both pass at each delay (7.0 s and 4.5 s at 3.5 s) |
| The file passes alone today | Focused runner | `bash scripts/test.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs` with Homebrew Bash first on `PATH` | Passed, ~7 s |
| Concurrent dashboard runs no longer race | `tests/dashboard-concurrent-runs.sh` | Three runs in turn through `bash scripts/test.sh` (the first from an absent `dashboard/test-results`), then three copies at once | 3/3 and 3/3 passed, load ~10 |
| The full suite finishes with the fix in place | Full local runner | With the scratch at-spawn helper (drafted-record test included), `env -u NO_COLOR -u FORCE_COLOR npm test`; `scripts/test-jobs.sh` lists both the owned-calls file and `tests/dashboard-concurrent-runs.sh` | rc 0 in 525 s, load up to ~14 |

## Outside-in proof

- The owned-calls file passes through
  `bash scripts/test.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`
  alone, and with four copies of that command running at once.
- Discrimination by scratch edit, then revert: a 3.5 s wait in the helper
  between spawn and its fixture-logged await keeps the file green. The same
  wait with recording moved back after that await fails the first test at its
  bound, naming it, with no fixture `gh` left (key examples 1 and 2).
- Full local `env -u NO_COLOR -u FORCE_COLOR npm test` passes, with no
  `ENOENT` from `tests/dashboard-concurrent-runs.sh` (key example 4). The
  [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  policy applies as written. Run the full suite because the story's promise
  is about that run, not because the change touches shared runtime paths.

## Ordered slices

### 1. A held call the test owns is ended however late its fixture logs it
Type: Behavior
Status: planned
Proof: the outside-in proof above.

Behavior: an owned-calls test spawns a held fixture `gh`, and the fixture logs
the call 3.5 s after spawn → generation 2's `earlierCallsEnded` runs → it
answers `[]`, the call exits 143 after `told-to-end`, and no record remains. A
test still waiting on an exit no signal will produce fails at its bound with
its name, and teardown ends its `gh`.

## Concern evidence

Refinement was not needed: one cohesive Behavior slice with settled premises
and one proof loop. No numeric slice target, hard limit, or sizing exception
was supplied.

Remaining slice-specific concerns: none identified in this review.
