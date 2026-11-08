# Verify local suite limits without wall-clock waits

**Identity:** SEED-277#observe-local-suite-waits
**Source:** [Refined story](../../seeds/SEED-277-observe-local-suite-waits.md#observe-local-suite-waits)
**Source review:** [source-only review](source-review.md)

## Goal and boundaries

Give maintainers deterministic evidence for the three wait checks in
[`local-test-suite.test.mjs`](../../../tests/support/local-test-suite.test.mjs).
Preserve the [suite resource rules](../../../tests/local-test-resources.md),
including existing bypasses, retry pacing, and owner cleanup. The
stale-reclaimer timing check in the separate lifecycle spec is outside the
three replacements.

## Reuse and decisions

- Keep the dispatcher in [`scripts/test.sh`](../../../scripts/test.sh) and
  admission in [`acquireLocalSuite`](../../../scripts/local-test-suite.mjs).
  The slot FIFO owns job capacity and the Git ref and live ancestry own
  admission. Observe those decisions where they occur. Configured slot
  counts, startup markers, and the existing end-of-run timing
  and outcome files cannot establish that either gate blocked.
- Use the [controlled suites fixture](../../../tests/support/local-test-suite-fixtures.mjs)
  to run the real entry points in temporary linked worktrees. Reuse its
  MakeMe repository setup and the existing marker and child-completion
  pattern from the
  [backlog lock fixture](../../../tests/support/product-backlog-lock-fixture.mjs).
  For a file signal, subscribe and inspect the current marker so an event
  written before the listener is retained. Race gate observations against
  premature exit and any prohibited start. Give each invocation its own
  observations so a nested or parallel run cannot satisfy its wait.
- Keep observation opt-in and silent during ordinary runs. Leave the policy,
  release and cancellation on their real paths. Keep coordination and
  deliberate stale or copied token inputs in the harness, with valid domain
  setup through [MakeMe](../../../tests/README.md#test-data-architecture).
  Follow [ADR 0002 §5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  for direct domain mapping and
  [ADR 0005 §2](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci)
  for deterministic proof through the maintained runner.

## Preparation evidence

The observations used this preparation worktree at `e7ca34729` on macOS
with Node 24.21.0, the lockfile's Playwright installation, Homebrew Bash
first on `PATH`, and AC power. `node scripts/setup-native.mjs check`
launched Chromium 153.0.8010.12 successfully.

| Consuming operation | Result |
| --- | --- |
| `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/local-test-suite.test.mjs tests/support/local-test-suite-lifecycle.test.mjs` ran the copied Bash runner and admission code against the controlled linked worktrees and Playwright configuration. | The focused baseline passed. The first spec exercised default, overridden, and CI slot counts, pretender cancellation, and nested admission followed by linked-worktree entry. The second exercised owner exit and stale retirement through the same fixture. The three selected assertions still depended on elapsed time. |
| Reran `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/local-test-suite.test.mjs` with a scratch edit that made only the stale and copied-token contenders log a receipt and exit 143 immediately before `acquireLocalSuite`. | The spec passed and logged two pre-admission exits. The old cancellation proof accepts an exit with the expected code even when the contender never reached the gate. The scratch edit was reverted. |

## Proof and delivery gates

Run the two named Node checks through the repository runner after each
slice. For the dispatcher change also run its direct shell consumers with
`npm test -- tests/test-runner-*.sh` and the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for any additional affected path. At story completion inspect the three
replacement paths for elapsed-time assertions and implicit sleeps. Preserve
the existing regression assertions in both specs. Use the
[wait and teardown rules](../../../tests/README.md#waits-fixtures-and-teardown)
to close observation resources and stop or release children before removing
their fixture.

Local gate — Follow [test automation](../../../AGENTS.md#test-automation) and
carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into each delegation and repair handoff. Use the focused checks
above with Bash 5 first on `PATH`. Start long runs fully awake. On macOS
with AC power wrap any full run in `caffeinate -s -i`. On battery, plug in
or start fully awake with the lid open under `caffeinate -i` and check the
sleep log afterward. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

## Slices

### 1. Queued checks wait when every job slot is occupied

Type: Behavior
Status: done
Proof: Key example 1 through `npm test -- tests/support/local-test-suite.test.mjs`
and the dispatcher consumers in the local gate.

With more checks than slots and the first jobs held, observe the dispatcher
reach the unavailable FIFO slot with work queued. Check the actual number of
dispatches and the starts of the held jobs so a child that has launched but
has yet to mark its start cannot hide an extra dispatch. Release explicitly
and observe every queued check run to completion. Exercise local default
four, the explicit override, and the CI CPU-derived limit. Confirm that a
scratch overdispatch fails on an excess dispatch or start, then restore it
and run the focused checks.

Accepted: `scripts/test.sh` writes the opt-in `OPEN_DOUGH_TEST_SLOT_GATE`
marker (the dispatch count) just before blocking on an empty slot FIFO;
`repositoryAtSlotGate` in `tests/support/local-test-suite-slot-gate.mjs`
watches it and rejects on an excess `start-*` marker or early exit. The
first spec asserts the gate count, the held starts, release and all checks
run for local, override and CI. Focused specs and `tests/test-runner-*.sh`
passed; a scratch `slot <= job_slots` overdispatch failed with "5 checks
started before the slot gate" and was restored. Refactor moved the
slot-gate helper into its own module to keep the fixtures file under the
size limit.

### 2. A linked worktree waits while a live outer suite holds admission

Type: Behavior
Status: planned
Proof: Key examples 2 and 3 through
`npm test -- tests/support/local-test-suite.test.mjs tests/support/local-test-suite-lifecycle.test.mjs`.

Observe a contender being blocked by the live owner's admission record,
after the inheritance decision. Use that same observation for the stale
and copied tokens and for the contender after nested completion. For each
token, establish the gate was reached, cancel the contender, observe its
exit, and verify no checks started and the original owner ref is intact.
Key the copied token by the real Git common directory. In the nested case
observe the nested return and the outer ref still held, then observe the
linked-worktree contender blocked. Release the outer suite and verify the
contender starts and succeeds. Replay the preparation's early-exit
counterexample in scratch to verify the new gate observation rejects it,
then restore and rerun the focused checks.

## Concern evidence

Slice-plan refinement was unnecessary. The dispatcher and admission gates
have independent proof loops. Both admission cases use one observation at
the existing ownership decision. This review found no remaining
slice-specific concern.
