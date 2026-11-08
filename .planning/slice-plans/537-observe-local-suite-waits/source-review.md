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
| 2 | Maintainers can verify linked-worktree suite admission even when the runner is slow to reach a gate. | slice 2 | |
| 3 | An absence of starts no longer stands in for evidence that the runner reached its blocking decision. | slice 2 | |
| 4 | Replace the three fixed waits in the local suite tests with observations. | slice 2 | |
| 4a.1 | An observation of the dispatcher's capacity decision. | slice 1 | observed: scripts/test.sh OPEN_DOUGH_TEST_SLOT_GATE write before blocking read on slot FIFO; observed by repositoryAtSlotGate in tests/support/local-test-suite-slot-gate.mjs |
| 4a.2 | An observation of the contender's admission decision. | slice 2 | |
| 5 | Hold the relevant jobs or owner until the test explicitly releases them or cancels the contender. | slice 2 | |
| 6 | Preserve the current resource rules. | slice 2 | |
| 7a.1 | Preserve the neighboring coverage for independent runs. | slice 2 | |
| 7a.2 | Preserve the neighboring coverage for owner cleanup. | slice 2 | |
| 8 | The replacement checks synchronize on events under the test automation rules (no sleeping or wall-clock waits). | slice 2 | |
| 9 | The replacement checks follow the failing and flaky test policy. | slice 2 | |
| 10.1 | Hold every occupied slot until the dispatcher reaches the slot gate with work still queued. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: probes held on release file until run.gate resolves; gate rejects on extra start-* or early exit |
| 10.2 | Confirm that the configured number of jobs started. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: assert.equal(await run.gate, expected) and started() === expected |
| 10.3 | Then release the held jobs and verify that all checks ran. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: release written, succeeded(run), started() === cases |
| 10.4a.1 | Exercise the local default limit. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: case local, expected 4 |
| 10.4a.2 | Exercise an explicit override limit. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: case override, OPEN_DOUGH_TEST_JOBS=2 |
| 10.4a.3 | Exercise CI's CPU-derived limit. | slice 1 | observed: tests/support/local-test-suite.test.mjs first test: case ci, CI=true with getconf cores |
| 11.1 | Start a contender in a linked worktree with a stale token while a full suite holds admission. | slice 2 | |
| 11.2 | Then start another contender in a linked worktree with a copied current token. | slice 2 | |
| 11.3 | Each contender reaches the gate and is blocked by the live owner. | slice 2 | |
| 11.4 | Cancelling either contender leaves the owner's admission intact. | slice 2 | |
| 11.5 | Cancelling either contender starts no contender checks. | slice 2 | |
| 12.1 | Once a nested full suite returns, a competitor in a linked worktree reaches the gate. | slice 2 | |
| 12.2 | The outer suite blocks the competitor. | slice 2 | |
| 12.3 | The competitor starts its checks after the outer suite releases admission. | slice 2 | |
