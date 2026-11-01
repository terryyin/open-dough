# Independent source review

Launch: fresh `/root/source_review`, `fork_turns: none`, source only, no project
reads or edits. Input: the user's implementation request and accepted explanation
of separate scope, local defaults, CI preservation, overrides, focused checks,
nesting, cancellation, abandonment and independent repositories. The reviewer
was given no plan, implementation, test results or suspected omission.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Deliver this as a separate change from dashboard proof-cost plan 432. | slice 1 | observed: separate branch/plan 433; diff leaves plan 432 and its proof families unchanged |
| 2 | Allow at most one full test suite at a time across this repository's worktrees. | slice 1 | observed: local-test-suite.test.mjs, repository full suites serialize across spaced worktrees; held entry blocks the next probe until release |
| 3 | Full dashboard suites and full repository suites share that limit. | slice 1 | observed: native Playwright config shares repository admission; repository probe starts only after dashboard release |
| 4 | Default local dashboard runs to two workers. | slice 1 | observed: native Playwright resolved workers equals 2 under actual production config entry |
| 5 | Default local repository runs to four jobs. | slice 1 | observed: local repository defaults case holds four running probes with no fifth entry |
| 6 | Preserve explicit dashboard worker overrides. | slice 1 | observed: native Playwright explicit --workers=3 resolves to 3 |
| 7 | Preserve explicit repository job overrides. | slice 1 | observed: OPEN_DOUGH_TEST_JOBS=2 holds two running probes |
| 8 | Release the full-suite slot when its owner is cancelled. | slice 1 | observed: SIGINT/SIGTERM lifecycle cases preserve 130/143 and admit one waiting suite after predecessor stops |
| 9 | Let nested test invocations inherit their parent's ownership. | slice 1 | observed: genuine nested full invocation in linked worktree completes before outer release, with differing TZ |
| 10 | Prevent nested test invocations from deadlocking over the slot. | slice 1 | observed: nested-returned event precedes outer release while unrelated waiter remains blocked |
| 11 | Prevent abandoned owners from permanently blocking later runs. | slice 1 | observed: SIGKILL and interrupted-reclaimer cases retire surviving predecessor before successor probe enters |
| 12 | Two workers and four jobs are conservative starting values. | slice 1 | observed: tests/local-test-resources.md states the prospective choice; both guides link it |
| 13 | No measured speedup is claimed. | slice 1 | observed: tests/local-test-resources.md distinguishes peak bounds from unmeasured elapsed benefit |
| 14 | Keep CI unchanged. | slice 1 | observed: repository CI probes retain getconf CPU concurrency; native Playwright CI resolves availableParallelism and bypasses occupied slot; workflow unchanged |
| 15 | Focused checks remain independent of full-suite serialization. | slice 1 | observed: named paths, shares, dashboard grep and list commands complete while full suite still owns admission |
| 16 | Independent repositories must not block one another. | slice 1 | observed: independent repository suite completes while first repository holds admission |
| 17 | A full dashboard suite owns the slot in one worktree; a full repository suite started in another worktree waits. | slice 1 | observed: native Playwright config shares repository admission scenario, spaced linked worktrees |
| 18 | A full repository suite owns the slot; a second full repository suite in another worktree waits. | slice 1 | observed: repository full suites serialize across spaced worktrees scenario |
| 19 | A focused check can proceed while a full suite owns the slot. | slice 1 | observed: named probe completes before owner releases and before waiting full suite enters |
| 20 | Cancelling the owning suite releases the slot for a waiting full suite. | slice 1 | observed: SIGINT/SIGTERM cases inspect predecessor state at successor entry and drain both waiters |
| 21 | A nested test invocation inherits ownership and does not wait for its own parent to release the slot. | slice 1 | observed: nested-returned signal and retained outer admission; copied tokens without ancestry remain denied |
| 22 | A full suite in another independent repository can proceed concurrently. | slice 1 | observed: independent repositories and copied non-Git runner fixtures remain usable scenario |
| 23 | An abandoned owner does not leave subsequent full-suite runs blocked permanently. | slice 1 | observed: SIGKILL and reclaimer-killed-during-retirement scenarios preserve cleanup ownership and complete successor |

Scheduling observations are in `tests/support/local-test-suite.test.mjs`;
failure/signal/reclaimer observations are in
`tests/support/local-test-suite-lifecycle.test.mjs`. Shared real fixtures are in
`tests/support/local-test-suite-fixtures.mjs`. The coordinator inspected setup,
entry calls and observing assertions. Three terminal passing commands and logs,
plus post-extraction verification, are retained in the plan's accepted proof.
Dashboard reporter and run-lifetime proof independently observe normal
setup/teardown integration.
