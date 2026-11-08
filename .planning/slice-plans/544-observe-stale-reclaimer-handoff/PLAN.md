# Observe stale-reclaimer handoff before asserting exclusion

**Source:** [Verify stale-reclaimer exclusion without a fixed wait](../../seeds/SEED-279-observe-stale-reclaimer-handoff.md#observe-stale-reclaimer-handoff)

**Identity:** SEED-279#observe-stale-reclaimer-handoff

## Goal and scope

Maintainers can trust the lifecycle check to establish that the losing
contender reached admission and was blocked by the live successor, even when
the contender reaches that decision later. Replace the unconditional 150 ms
delay in `tests/support/local-test-suite-lifecycle.test.mjs` for failure,
SIGTERM, SIGINT and SIGKILL. Preserve predecessor retirement, successful
successor runs, admission-ref cleanup and interrupted-retirement recovery.
In one controlled case, both contenders first observe the original owner;
their earlier observations cannot satisfy the later successor assertion.

Keep the [local admission rules](../../../tests/local-test-resources.md).
Mutual exclusion limits simultaneous full-suite resource use, and predecessor
retirement prevents surviving checks from overlapping the next suite. This
work changes observation and proof. It adds no contender ordering, admission
policy, telemetry framework, or performance target.

Improvement basis, established before the scratch proof: the baseline's
150 ms absence check can pass before a slow contender makes its decision.
The result worth retaining is an exact successor observation with zero checks
started, using the existing small observation seam. No elapsed-time speedup
or sustained flake-rate improvement is claimed. This applies
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Existing solution and current decisions

- PFE: reuse `OPEN_DOUGH_TEST_ADMISSION_GATE` in
  `scripts/local-test-suite.mjs` and the observers in
  `tests/support/local-test-suite-gates.mjs`. The current marker is atomic but
  one-shot; extend it to publish each changed live blocking-owner record ID.
  Keep the path local to the invocation and removed from the environment
  before descendants start. Observation does not control admission.
- Preserve `repositoryAtAdmissionGate(...).gate` as its first-observation
  promise. Add an owner-specific observation, demonstrated as
  `.blockedBy(expectedOid)`, retaining rejection when checks start or the run
  ends before the expected observation. Keep the slot-gate contract intact.
- Read the successor's stable admission record after its first check enters
  and while it remains held. Wait for that exact record, rather than any
  changed record: takeover can publish an intermediate retirement record
  before its final owner record. Do not depend on watcher event counts.
- Reuse the controlled-suite fixture and its existing
  `makeMe.aRepository...please()` arrangement. Git, process observation,
  release markers and teardown remain harness operations. No new domain
  shape or builder is needed.
- Update the admission-marker description in `tests/runner-settings.md` and
  its implementation comment to describe changed owner records. Preserve
  existing admission, inheritance, signal and cleanup behavior.
- One common owner-record observation supports every exit case. Keep the
  seam, observer, scenarios and cleanup together in one Behavior slice;
  no preparatory Structure or new North Star topic is warranted. The current
  `.planning/NORTH-STAR.md` topics govern dashboard work, not this local
  observer. Reusing one representation follows
  [ADR 0002 §5–6](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).

## Outside-in proof ownership

| Promise | Owner | Observable proof |
| --- | --- | --- |
| Failure, SIGTERM, SIGINT and SIGKILL permit a successor only after predecessor checks stop | Slice 1 | Keep the predecessor-state assertion in all four lifecycle cases. |
| The losing contender has reached admission against the successor and started no checks while the successor is held | Slice 1 | Wait for its marker to equal the stable successor record; the observer rejects any started check or early exit. |
| An original-owner observation cannot satisfy the successor observation | Slice 1 | In the failure case, await both original-owner observations before ending the owner, then await the loser's exact successor record. |
| After release, the remaining contender enters; both successors succeed and remove admission | Slice 1 | Preserve entry, exit-code and absent-ref assertions in the lifecycle cases. |
| Interrupted retirement remains recoverable | Slice 1 | Preserve the lifecycle file's killed-reclaimer scenario and its predecessor-state/entry assertions. |
| Existing admission and first-observation consumers retain their behavior | Slice 1 | Run the whole `local-test-suite.test.mjs`, including copied-token refusal, cancellation, native Playwright sharing, nested inheritance, focused/CI independence and non-Git fixtures. |

## Decisive premises

Observed on 2026-11-09 at `59e2da1e0165de997556d85c8325b8369fe1dbc4`
in the owned preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/verify-stale-reclaimer-exclusion-without-a-fixed`.
Profile: macOS 26.6.2, Node 24.21.0, Homebrew Bash 5.3.20, npm 11.19.0,
Git 2.50.1 and Chromium 153.0.8010.12. Native npm setup and native check
succeeded there. Scratch changes were limited to the admission module, gate
helper and lifecycle spec, and all were reverted before preparation writes.

| Premise and consuming operation | Observation | Result and remainder |
| --- | --- | --- |
| Repeated atomic owner reporting and an exact-owner wait can exercise the full handoff, including original-owner reobservation, in the real controlled shell suites | E1 applied the decisions above and ran both complete local-suite test files through the maintained runner. | Exit 0; lifecycle 7.3 s, existing suite 7.7 s. The four exit cases and the controlled original-to-successor case passed. Settled. |
| The existing first-observation and admission consumers can retain their contracts through the same extension | E1's whole existing suite reached the native Playwright config as well as shell, ancestry, token, independent-run and copied-fixture cases. | Exit 0; no consumer assertion changed. The selected profile consumes the actual admission module copied from this checkout. Settled. |
| The strengthened lifecycle proof detects loss of successor exclusion after an earlier owner observation | F1 inserted `if (reportedOwner !== undefined) return async () => {};` in the changed-live-owner branch, allowing a previously observed contender to bypass its successor. | Exit 1 in 6.8 s; the controlled failure case rejected with `Error: 1 checks started before the admission gate`. Settled discrimination; this is a deliberate fault, not a retained defect. |
| Removing the fault restores the complete promised journey | E2 reran both complete files with the exact-owner scratch design enabled. | Exit 0; lifecycle 7.2 s, existing suite 7.7 s. All scratch paths then restored; their diff was empty. Durable implementation and its execution gates remain unpaid. |

Literal consuming commands (run from the named checkout):

```sh
# E1
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed279-exact-enabled-outcomes OPEN_DOUGH_TEST_TIMES=/tmp/seed279-exact-enabled-times npm test -- tests/support/local-test-suite-lifecycle.test.mjs tests/support/local-test-suite.test.mjs
# F1, with the deliberate fault above
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed279-fault-outcomes OPEN_DOUGH_TEST_TIMES=/tmp/seed279-fault-times npm test -- tests/support/local-test-suite-lifecycle.test.mjs
# E2, fault removed
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed279-restored-enabled-outcomes OPEN_DOUGH_TEST_TIMES=/tmp/seed279-restored-enabled-times npm test -- tests/support/local-test-suite-lifecycle.test.mjs tests/support/local-test-suite.test.mjs
```

## Consumer trace

The installed consumer-trace script searched the whole checkout at the revision
above with `--checkout . --path scripts/local-test-suite.mjs --path
tests/support/local-test-suite-gates.mjs --term OPEN_DOUGH_TEST_ADMISSION_GATE
--term repositoryAtAdmissionGate`. Inspection of the located consumers gives
these dispositions; refresh the trace against the delivered change.

| Located consumer | Disposition |
| --- | --- |
| `scripts/test.sh` | run: both focused files drive real full fixture suites through its admission wrapper. |
| `dashboard/playwright.config.ts` | run: existing suite drives its native admission and worker/selection cases. |
| `dashboard/tests/support/globalSetup.ts` | excluded: its unchanged production build/setup does not consume the opt-in marker; controlled native config supplies teardown using the actual release operation. |
| `tests/helpers/copy-runner.bash` | run: controlled checkouts copy the current admission module through this helper. |
| `tests/support/local-test-suite-checkout.mjs` | run: both focused files materialize its MakeMe repository and controlled checks. |
| `tests/support/local-test-suite-fixtures.mjs` | run: both focused files use its environment isolation and teardown. |
| `tests/support/local-test-suite.test.mjs` | run: whole file preserves the first-observation and slot-gate consumers. |
| `tests/support/local-test-suite-lifecycle.test.mjs` | run: whole file owns handoff and recovery proof. |
| `tests/runner-settings.md` | run: review its updated marker description against the implemented contract. |
| `.planning/done/SEED-277_observe-local-suite-waits.json` | excluded: retained historical proof; no runtime consumer or mutable contract. |
| `docs/maintainer/findings/ODF-405.md`, `docs/maintainer/project-test-findings.md`, `ProjectFindings.md` | excluded: historical observations do not consume the marker or require revision for this extension. |

## Slice

### 1. A losing contender observes its successor before exclusion is asserted
Type: Behavior
Status: planned
Proof: `npm test -- tests/support/local-test-suite-lifecycle.test.mjs tests/support/local-test-suite.test.mjs`; `npm run typecheck:dashboard`; staged lint before commit.

Behavior: a full suite holds admission with two competing local suites → the
owner fails or receives SIGTERM, SIGINT or SIGKILL → one successor enters only
after predecessor checks stop; while held in its first check, the other suite
observes that successor's exact current admission record and has started no
checks → releasing the successor lets the other enter, both succeed, and the
admission ref disappears.

Implement the existing-seam and observer extensions above, replace the fixed
delay and remove its unused timer import, and establish both original-owner
observations first in the controlled failure case. Keep the interrupted
retirement scenario. Retain zero-start and early-exit failures and close every
watcher through the fixture's lifecycle on success, failure or cancellation.
Update the marker documentation and complete slice-local refactoring in the
same slice. The scratch proof supplies feasibility, not delivered code or a
done slice.

## Local and delivery gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written; carry that policy link into every delegation and repair handoff.
Wait for observable state, keep default timeouts, and arrange domain data
through MakeMe. Reuse [native prerequisites](../../../tests/native-setup.md).
Run the two whole focused files with Homebrew Bash first on `PATH`, then
`npm run typecheck:dashboard` for the shared JavaScript test-support contract,
and `node scripts/lint.mjs --staged` before commit. No local whole repository
or dashboard suite is required for this opt-in observation extension: the
focused files exercise the changed seam and its real shell/Playwright callers.
Reassess proof if implementation reaches additional consumers.

Local sleep guard: start fully awake; on macOS AC power wrap any long/full
run in `caffeinate -s -i`. On battery, plug in or use `caffeinate -i` with the
lid open and inspect the sleep log afterwards, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Execution retains its ordinary independent refactoring, agent-commit, delivery,
CI and retrospective gates under `dough-execute-plan`.

## Concern evidence

Slice-plan refinement was not needed: one bounded Behavior slice owns the
same observation, four exit variations, preservation proof and cleanup loop.
The intermediate-retirement-record race was resolved by exact-owner waiting
and included in the scratch design. No remaining slice-specific concern or
human-owned decision was identified in this review.
