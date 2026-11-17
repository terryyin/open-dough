# Source-only review

Fresh general-purpose reviewer launched without conversation inheritance on
2026-11-17 by the execution coordinator (Kirara-chan). Its input was only the
selected story's heading, Goal, Scope, Key examples and Evidence from
[SEED-375](../../seeds/SEED-375-keep-container-diagnostics-from-replacing-host-suite-admission.md#keep-container-diagnostics-from-replacing-host-suite-admission).
No plan, slicing, product source, proof or suspected omission was supplied; it
read no project files and changed none. Its numbered return (C1–C17) is kept
below as C001–C017 with its source locations.

Unnumbered context it returned: the DD-432 reason; the "unseen host PID is not
evidence that its owner died" rationale behind C002; the local container/host
scope boundary; the non-commitments (general PID-namespace ownership,
scheduling diagnostics against each other, new resource limits, admission-record
migration); the qualified DD-432 evidence; and the disposable repository as an
observation condition.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | With a host full suite owning admission and a linked worktree's container unable to see that host PID, the plain pathless diagnostic returns success when its checks pass; its verdict comes from its own checks, not host admission. (Goal; Scope ¶1, ¶2 "pathless suite"; Key example 1) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container-admission.test.mjs 'a passing pathless container diagnostic keeps the host's suite admission' (result.code 0 with host PID hidden by ps stand-in); real Colima pass replay exit 0 |
| C002 | Under C001's conditions the host's exact owner ref stays unchanged until the host releases it; the diagnostic does not acquire, replace or release it, nor treat the unseen host PID as a dead owner. (Goal; Scope ¶1; Key example 1) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container-admission.test.mjs exact rev-parse gateRef === owner before host release (passing and failing cases); fails without plain CI=true (discrimination: ref gone); Colima replays ref unchanged |
| C003 | After a passing diagnostic during host ownership, the host's own admission release succeeds and the host keeps its valid verdict. (Goal; Key example 1) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container-admission.test.mjs succeeded(host) then ref absent after release; Colima host exit 0 both variants |
| C004 | While the same host owner is active, a diagnostic whose check fails returns that failing verdict. (Scope ¶1; Key example 2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container-admission.test.mjs 'a failing pathless container diagnostic…' probe exits 7, diagnostic code 1; Colima fail replay exit 1 |
| C005 | When a diagnostic check fails during host ownership, the host keeps its admission and then releases it successfully. (Goal; Scope ¶1; Key example 2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container-admission.test.mjs failing case ref unchanged then succeeded(host); Colima fail variant host exit 0 |
| C006 | The dashboard container diagnostic path also stays outside host full-suite admission, leaving the host owner record untouched and returning its own checks' verdict. (Scope ¶1) | slice 1 | observed: Slice 1 accepted: dashboard entry unchanged with CI=true (scripts/ci-container.sh); Distribution/tests/support/local-test-suite.test.mjs 'native Playwright config shares repository admission and preserves … CI worker settings' observes CI skips dashboard admission |
| C007 | Host full-suite serialization across linked worktrees still works: a second host full suite waits and starts only after the first releases. (Scope ¶1; Key example 3) | slice 1 | observed: Slice 1 accepted: Distribution/tests/support/local-test-suite.test.mjs waiting full suite enters only after owner release, in passing focused gate |
| C008 | Stale-owner recovery still works: after an abruptly killed owner, a later full suite recovers the stale admission and enters. (Scope ¶1; Key example 3) | slice 1 | observed: Slice 1 accepted: Distribution/tests/support/local-test-suite-lifecycle.test.mjs '…releases admission and stale retirement finishes before competing waiters enter' (SIGKILL variant), in passing focused gate |
| C009 | During stale-owner recovery, surviving marked processes are retired before the next suite enters. (Scope ¶1; Key example 3) | slice 1 | observed: Slice 1 accepted: same lifecycle test's predecessor-state retirement assertions before waiters enter, in passing focused gate |
| C010 | An admission-release failure stays visible and is not accepted as an ownership loss. (Scope ¶1) | slice 1 | observed: Slice 1 accepted: strict release throw unchanged at scripts/local-test-suite.mjs ('Could not release local test-suite admission.'); plan premise baseline observed host exit 1 with it; discrimination run surfaced the loss as failure |
| C011 | The diagnostic still runs the checks selected by the paths it is given. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container-admission.test.mjs 'a selected container diagnostic…' runs Distribution/tests/probe/probe.sh (ran marker, exit 0) |
| C012 | The dashboard diagnostic still runs its established dashboard checks. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container.sh and ci-container-workflow.sh dashboard step agreement, in passing focused gate |
| C013 | The diagnostic still refuses an unavailable container runtime. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container.sh runtime refusal checks, in passing focused gate |
| C014 | The diagnostic still refuses paths outside the checkout. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container.sh outside-checkout refusal checks, in passing focused gate |
| C015 | The diagnostic still mounts the checkout and common Git directory and writes as the host user. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container.sh mount and --user argument checks; Colima replay ran as host user with common-Git mount |
| C016 | The diagnostic still uses dependencies isolated from the host's. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container.sh module-volume checks; Colima replay used a fresh isolated module volume |
| C017 | The diagnostic still reuses the cached container image. (Scope ¶2) | slice 1 | observed: Slice 1 accepted: Distribution/tests/ci/ci-container.sh image cache reuse check; Colima replay reused open-dough-ci:2835799436 |
