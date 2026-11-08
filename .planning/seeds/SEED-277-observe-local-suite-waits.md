---
id: SEED-277
status: active
planted: 2026-11-08
scope: story
---

# Verify local suite limits without wall-clock waits

<a id="observe-local-suite-waits"></a>

### Verify local suite limits without wall-clock waits

**Identity:** SEED-277#observe-local-suite-waits

#### Goal

Maintainers can verify local job limits and cross-worktree suite admission
deterministically. The three `await delay(150)` checks in
[the local suite tests](../../tests/support/local-test-suite.test.mjs) currently
assume the runner has reached the blocking decision within 150 ms.

#### Acceptance examples

- With more checks queued than there are job slots, hold every occupied slot
  until the dispatcher signals that it has reached capacity with work still
  queued. Verify the configured number of jobs started, then release the jobs
  and verify all checks ran. Preserve coverage of local defaults, explicit
  overrides, and CI concurrency.
- With a full suite holding admission, wait for each contender with a stale or
  copied ownership token to signal it reached the admission gate and is
  blocked. Verify it started no checks. Cancelling it must leave the owner's
  admission intact.
- After a nested suite finishes, wait for a competing worktree to signal it
  is blocked by the outer suite's admission. Verify its checks start only
  after the outer suite releases admission.

Synchronize the three checks on observable runner decisions and explicit
release or cancellation events. A recorded waiting marker is one option.
Remove all three fixed delays. The replacement assertions must work without
waiting for wall-clock time to pass, following the
[test automation rules](../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).
