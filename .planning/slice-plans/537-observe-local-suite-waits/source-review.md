# Source review

Launch: fresh general-purpose reviewer spawned by the coordinator on
2026-11-08 without conversation inheritance, given only the story's Goal,
Scope, and Key examples text from
[SEED-277#observe-local-suite-waits](../../seeds/SEED-277-observe-local-suite-waits.md#observe-local-suite-waits),
instructed to read no files and change nothing. Its numbered return follows.
Reviewer exclusions: E1 slot-count changes; E2 worktree admission policy
changes; E3 the separate stale-reclaimer timing check; E4 resource-rule changes.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers can verify job limits even when the runner is slow to reach a gate. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: await run.gate (runner's slot-gate marker via repositoryAtSlotGate) replaces delay(150); no elapsed-time assertion |
| 2 | Maintainers can verify linked-worktree suite admission even when the runner is slow to reach a gate. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…' and tests/support/local-test-suite.test.mjs 'nested full invocations…': await gate on acquireLocalSuite's admission-gate marker; no elapsed-time assertion |
| 3 | An absence of starts no longer stands in for evidence that the runner reached its blocking decision. | slice 2 | observed: tests/support/local-test-suite.test.mjs: grep finds no delay/setTimeout; contenders assert gate === owner oid before checking startedChecks === 0 |
| 4 | Replace the three fixed waits in the local suite tests with observations. | slice 2 | observed: tests/support/local-test-suite.test.mjs: all three delay(150) waits replaced (slice 1 slot gate, slice 2 two admission gates); delay import removed |
| 4a.1 | An observation of the dispatcher's capacity decision. | slice 1 | observed: scripts/test.sh OPEN_DOUGH_TEST_SLOT_GATE write before blocking read on slot FIFO; observed by repositoryAtSlotGate in tests/support/local-test-suite-gates.mjs |
| 4a.2 | An observation of the contender's admission decision. | slice 2 | observed: scripts/local-test-suite.mjs acquireLocalSuite writes OPEN_DOUGH_TEST_ADMISSION_GATE after the inheritance decision when a live non-ancestor owner blocks; observed by repositoryAtAdmissionGate in tests/support/local-test-suite-gates.mjs |
| 5 | Hold the relevant jobs or owner until the test explicitly releases them or cancels the contender. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…': owner held until release file; contenders held until SIGTERM; tests/support/local-test-suite.test.mjs 'nested full invocations…': outer held until release |
| 6 | Preserve the current resource rules. | slice 2 | observed: scripts/local-test-suite.mjs diff adds only the marker write; slot counts, policy, 250 ms pacing and cleanup unchanged; tests/test-runner-*.sh pass |
| 7a.1 | Preserve the neighboring coverage for independent runs. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…' focus/share/ci/outside-pathless runs and tests/support/local-test-suite.test.mjs 'independent repositories and copied non-Git runner fixtures remain usable' pass |
| 7a.2 | Preserve the neighboring coverage for owner cleanup. | slice 2 | observed: tests/support/local-test-suite-lifecycle.test.mjs owner exit and stale retirement pass; tests/support/local-test-suite.test.mjs 'repository full suites serialize…' owner release then waiter entry and success |
| 8 | The replacement checks synchronize on events under the test automation rules (no sleeping or wall-clock waits). | slice 2 | observed: tests/support/local-test-suite-gates.mjs fs.watch + immediate inspect raced against run end and starts; no sleeps in tests/support/local-test-suite.test.mjs |
| 9 | The replacement checks follow the failing and flaky test policy. | slice 2 | observed: focused specs passed five consecutive runs; early-exit and overdispatch counterexamples fail the new gates |
| 10.1 | Hold every occupied slot until the dispatcher reaches the slot gate with work still queued. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: probes held on release file until run.gate resolves; gate rejects on extra start-* or early exit |
| 10.2 | Confirm that the configured number of jobs started. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: assert.equal(await run.gate, expected) and started() === expected |
| 10.3 | Then release the held jobs and verify that all checks ran. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: release written, succeeded(run), started() === cases |
| 10.4a.1 | Exercise the local default limit. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: case local, expected 4 |
| 10.4a.2 | Exercise an explicit override limit. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: case override, OPEN_DOUGH_TEST_JOBS=2 |
| 10.4a.3 | Exercise CI's CPU-derived limit. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: case ci, CI=true with getconf cores |
| 11.1 | Start a contender in a linked worktree with a stale token while a full suite holds admission. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…': stale-token contender via repositoryAtAdmissionGate in linked worktree |
| 11.2 | Then start another contender in a linked worktree with a copied current token. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…': copied ownerRecord.tokens[0] keyed by realpathSync(git common dir) |
| 11.3 | Each contender reaches the gate and is blocked by the live owner. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…': assert.equal(await pretender.gate, original) per token |
| 11.4 | Cancelling either contender leaves the owner's admission intact. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…': after SIGTERM exit, git rev-parse gateRef === original |
| 11.5 | Cancelling either contender starts no contender checks. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'repository full suites serialize…': startedChecks(denied) === 0 after contender exit |
| 12.1 | Once a nested full suite returns, a competitor in a linked worktree reaches the gate. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'nested full invocations…': nested-returned and nested/start observed, then waiter gate resolves |
| 12.2 | The outer suite blocks the competitor. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'nested full invocations…': held ref pid === owner.child.pid; await waiter.gate === held; startedChecks(second) === 0 |
| 12.3 | The competitor starts its checks after the outer suite releases admission. | slice 2 | observed: tests/support/local-test-suite.test.mjs 'nested full invocations…': after outer release, succeeded(owner), waiter start-0 observed, succeeded(waiter) |
