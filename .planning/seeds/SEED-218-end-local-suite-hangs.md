---
id: SEED-218
status: active
planted: 2026-11-02
planted_during: SEED-192#review-story-intent-impact stopped after local suite hang
trigger_when: Local npm test or dashboard concurrent runs hang or race in this repository
scope: Open Dough local test-suite reliability for held GitHub fixture calls and concurrent Playwright output dirs
---

# SEED-218: End local suite hangs that stall delivery

## Why This Matters

A developer running Open Dough's full local suite can lose hours when one job
never finishes and progress is invisible. That blocks ordinary story delivery
gates even when product work is otherwise ready.

## Selected Stories

<a id="fix-owned-calls-start-slack-hang"></a>

### 1. End the held-gh start-slack deadlock and concurrent test-results race

**Identity:** SEED-218#fix-owned-calls-start-slack-hang
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/444-fix-owned-calls-start-slack-hang/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"afc43e27f023abd11ea343e834376b1ab462138471ee2323cbd8a77f3fa10f22","plan":"1cce1384b6551cedbab079fc117ccc540edb6e7f1fb7c08c9d44fcca76c8dbc9"}}
```

**Beneficiary:** A developer running `npm test` or local dashboard Playwright
in this repository, including during story delivery publication gates.

**Goal:** The developer's local suite ends with a finite, named result instead
of stalling for hours. `github-request-owned-calls` no longer deadlocks when
its fixture `gh` calls are recorded late under load, a hang in that file
becomes a reported failure rather than silence, and
`tests/dashboard-concurrent-runs.sh` stays green alone and under the full
suite. Story delivery gates that run the full suite can then finish.

**Facts:**

- Seen during SEED-192#review-story-intent-impact (2026-11-02): `npm test`
  sat for tens of minutes on
  `src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`
  with a live fixture `gh api --include repos/owner/repo/actions/jobs/1/logs`
  at 0% CPU.
- Observed in refinement (2026-11-02): the file alone passes through
  `bash scripts/test.sh <file>` in ~7s. A scratch copy of its first test that
  waits 3.5s before `owned.started(left.pid, …)` never ends on its own; under
  `--test-timeout=30000` it is cancelled at 30s and teardown leaves no fixture
  `gh` running.
- Cause (source): `earlierCallsEnded` signals a recorded call only when `ps`
  shows its arguments and a start within `startSlackMs` (2s) of the record's
  `startedAtMs`, which `OwnedCalls.started()` stamps when called. The test's
  `leftCalls().call()` awaits until the fixture has logged the call before
  returning, and every test records only after that await (the first test
  after both calls). Past 2s the call is judged `"another"`, its record is
  removed unsignalled, and `await left.exit` (expecting 143) waits forever;
  the `SIGKILL` teardown runs only after the test ends.
- Production records at spawn (source): `github-request-calls.mjs` calls
  `owned.started(child.pid, …)` synchronously right after `execFile` returns,
  so the late-recording window is the test's, not the owner's.
- No bound applies (source): `scripts/test.sh` runs each file as
  `node --test --test-reporter=…` with no `--test-timeout`, and the file sets
  no per-test timeout; Node's default is unbounded. The CI per-job time
  budget is judged only after jobs end.
- Concurrent runs (observed in refinement): with the pid-qualified run stamp
  and `test-results` parent `mkdirSync` already in
  `dashboard/playwright.config.ts`, `tests/dashboard-concurrent-runs.sh`
  passed 3/3 alone (first run from an absent `dashboard/test-results`) and
  3/3 as three simultaneous copies (six dashboard runs at once, load ~10).
  The two earlier `ENOENT: mkdir '…/dashboard/test-results/<stamp>'` failures
  were seen under the full suite before that mitigation was verified.

- Full suite (observed in refinement, 2026-11-02): with a scratch edit
  recording the owned-calls fixture calls at spawn (reverted), local
  `npm test` passed in 525s at load up to ~14, including
  `tests/dashboard-concurrent-runs.sh`, with no `ENOENT`. Nothing in the tree
  deletes `dashboard/test-results` itself (`quietReporter` removes only its
  own stamp directory), so the in-tree mitigation is taken as the fix; a
  recurrence is a new defect under the failure policy.

**Scope:**

- Record each fixture `gh` call against `OwnedCalls` at spawn, as the
  production owner does, so a test's own held call is recognized however long
  the fixture takes to log it. Keep `startSlackMs` and the production
  recognition rule unchanged.
- Give `github-request-owned-calls.test.mjs` a finite per-test bound, so any
  remaining wait on an exit that never comes fails fast with the test named,
  and teardown still ends its `gh`.
- Prove with a focused regression that a call logged by the fixture more than
  2s after spawn is still ended (exit 143) and its record removed, and that the
  file passes alone and under suite-like parallelism.
- Run full local `npm test` after the fix: it completes, and
  `dashboard-concurrent-runs` does not fail with `ENOENT` on
  `dashboard/test-results/<stamp>`. If the race recurs, find what removes or
  never creates the parent and fix it in this story.
- Scope limits: no change to the GitHub request-owner production path or its
  recognition slack; no runner-wide test timeout; no progress output while the
  local suite runs. The `| tee | tail` buffering seen during the original hang
  belongs to the caller's pipe, not the runner.

**Considered and deferred:** A runner-wide `--test-timeout` in
`scripts/test.sh` would turn any future hung `node --test` file into a named
failure for the developer, but it gives every file one bound, so long
legitimate files need a value chosen and exempted or tuned, and it changes the
runner contract every check relies on. Live progress for a long local run
would show which job is still running, at the cost of the runner's
silent-on-pass contract. Neither is needed for this story's hang; either is
a separate story if hangs recur elsewhere.

**Key examples:**

1. A held fixture `gh` call whose log entry appears 3.5s after spawn, recorded
   at spawn by generation 1 → generation 2's `earlierCallsEnded` → answers
   `[]`, the call exits 143 after `told-to-end`, and no record remains.
2. A test in the owned-calls file that still awaits an exit no signal will
   produce → the per-test bound passes → that test fails with its name and a
   timeout, the file ends, and no fixture `gh` is left running.
3. `bash scripts/test.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`
   passes alone and while other owned-calls copies or CPU load run beside it.
4. Full local `npm test` → finishes with a finite result, with no indefinite
   owned-calls job and no `ENOENT` from `tests/dashboard-concurrent-runs.sh`
   on `dashboard/test-results/<stamp>`.
