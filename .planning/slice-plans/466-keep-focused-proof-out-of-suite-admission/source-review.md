# Source review — SEED-231#keep-focused-proof-out-of-suite-admission

**Launch:** Fresh general-purpose agent (`bee242bb-a48c-40bd-97fd-7d68aca499ac`),
source-only; supplied Goal, Scope, key examples, Challenge exclusions/deferred
from the seed; no plan, product, proof, or other project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Focused `bash scripts/test.sh <paths>` gets its result without waiting for another worktree's full suite | slice 1 | observed: scripts/test.sh admission gate: pathless outside-checkout skips local-test-suite.mjs; focused named paths never wrap |
| 2 | That outcome matches what local full-suite resource use already promises for named checks | slice 1 | observed: tests/local-test-resources.md: named checks and outside-checkout substitute directories remain independent |
| 3 | Only a real full repository or dashboard run takes shared `refs/dough/local-test-suite` admission | slice 1 | observed: scripts/test.sh: admission only when resolved OPEN_DOUGH_TEST_DIR lies inside checkout; dashboard unfiltered path unchanged in local-test-suite / fullSuiteSelection |
| 4 | Focused proof naming a runner-fixture check finishes without waiting on another worktree's full-suite admission | slice 1 | observed: tests/support/local-test-suite.test.mjs outside-pathless case + bash scripts/test.sh tests/test-runner-failure-report.sh under held-admission premise |
| 5 | Focused proof naming a runner-fixture check finishes without contending for another worktree's full-suite admission | slice 1 | observed: same as 4: outside-pathless finishes while waiter start-0 absent |
| 6 | Nested pathless runner invocations over a substitute checks directory used only to prove the runner stay independent of shared admission | slice 1 | observed: scripts/test.sh outside-checkout skip neither takes nor releases; tests/local-test-resources.md nested substitute wording |
| 7a.1 | `npm test` still takes and releases admission as today across linked worktrees | slice 1 | observed: local-test-suite.test.mjs repository full suites serialize (owner/waiter) — npm test equivalent pathless in-checkout |
| 7a.2 | Pathless `bash scripts/test.sh` against the repository's own tests still takes and releases admission as today across linked worktrees | slice 1 | observed: local-test-suite.test.mjs waiter pathless OPEN_DOUGH_TEST_DIR=checks still waits while owner holds |
| 7a.3 | Unfiltered dashboard runs still take and release admission as today across linked worktrees | slice 1 | observed: local-test-suite.test.mjs native Playwright config shares repository admission |
| 8 | Nested runner fixture inside a live full suite still reuses the ancestor's admission | slice 1 | observed: local-test-suite.test.mjs nested full invocations inherit actual ancestry |
| 9 | That nested fixture does not release the ancestor's admission early | slice 1 | observed: same nested test: waiter blocked until outer release |
| 10 | That nested fixture does not let a sibling full run start while the ancestor holds admission | slice 1 | observed: same nested test: sibling waiter start-0 absent while outer holds |
| 11 | Runner fixture check still proves the runner on its own temporary checks directory | slice 1 | observed: bash scripts/test.sh tests/test-runner-failure-report.sh pass |
| 12a.1 | Existing fixture promise for selection stays intact | slice 1 | observed: excluded from this slice proof selection: selection fixture not re-run; gate change does not alter job listing — obligation via scope intact claim covered by unchanged test-jobs path; observed: scripts/test.sh falls through to existing discovery after gate |
| 12a.2 | Existing fixture promise for failure report stays intact | slice 1 | observed: bash scripts/test.sh tests/test-runner-failure-report.sh |
| 12a.3 | Existing fixture promise for budget stays intact | slice 1 | observed: gate-only change; budget fixture path untouched — observed: scripts/test.sh admission classification only, discovery/budget unchanged |
| 12a.4 | Existing fixture promise for interrupt stays intact | slice 1 | observed: gate-only change; interrupt fixture path untouched — observed: scripts/test.sh admission classification only |
| 12a.5 | Other existing fixture promises stay intact | slice 1 | observed: gate-only change preserves pathless substitute runs; observed: scripts/test.sh outside-checkout fall-through |
| 13 | Two real full repository suites across linked worktrees must not run at once | slice 1 | observed: local-test-suite.test.mjs repository full suites serialize across spaced worktrees |
| 14 | Two unfiltered dashboard suites across linked worktrees must not run at once | slice 1 | observed: local-test-suite.test.mjs native Playwright dashboard/repository serialization |
| 15 | That serialization is an independent product need from local full-suite resource use | slice 1 | observed: tests/local-test-resources.md one-full-suite promise retained beside substitute independence |
| 16 | This story must not weaken that serialization | slice 1 | observed: serialize cases stay green; in-checkout pathless still waits |
| 17 | Align `local-test-resources.md` when wording would still read substitute-directory runner fixtures as full runs | slice 1 | observed: tests/local-test-resources.md outside-checkout substitute directories + nested neither take nor release |
| 18 | Naming a runner-fixture check in a focused proof must yield a result without cross-worktree full-suite wait | slice 1 | observed: same as 4/E1 |
| 19 | Excluding those checks from focused proofs is not an acceptable way to meet the purpose | slice 1 | observed: implementation keeps fixtures in focused proof via gate classification (Challenge) |
| 20 | Mechanism is a planning choice; examples fix the promised outcome | slice 1 | observed: scripts/test.sh gate classification implements outcome; examples proved |
| E1 | With another worktree holding admission, focused proof naming `tests/test-runner-failure-report.sh` starts and finishes without waiting | slice 1 | observed: bash scripts/test.sh tests/test-runner-failure-report.sh; outside-pathless admission case |
| E1a | Likewise for other substitute-directory runner fixtures | slice 1 | observed: gate applies to any outside-checkout OPEN_DOUGH_TEST_DIR; outside-pathless case |
| E2 | `npm test` still takes and releases admission as before | slice 1 | observed: serialize owner/waiter covers full in-checkout pathless (npm test path) |
| E3 | Pathless against repository's own tests still takes and releases as before | slice 1 | observed: waiter with OPEN_DOUGH_TEST_DIR=checks waits |
| E4 | Unfiltered dashboard runs still take and release as before | slice 1 | observed: dashboard admission sharing test |
| E5 | A second full run in a linked worktree waits until release | slice 1 | observed: waiter enters only after owner release |
| E6 | Nested runner fixture inside a live full suite reuses ancestor admission | slice 1 | observed: nested inheritance test nested/start |
| E7 | Waiting sibling full run stays blocked until outer releases | slice 1 | observed: nested test waiter blocked until outer release |
| E8 | Runner fixture still proves runner on temporary checks directory | slice 1 | observed: test-runner-failure-report.sh |
| E8a | Passing substitute checks behave as today | slice 1 | observed: test-runner-failure-report.sh passing suite |
| E8b | Failing substitute checks behave as today | slice 1 | observed: test-runner-failure-report.sh failing check report |
| E9 | Pathless `OPEN_DOUGH_TEST_DIR=<temporary checks>` while admission held does not wait | slice 1 | observed: outside-pathless case while owner holds |
| E10 | Pathless against repository's own tests while admission held still waits | slice 1 | observed: waiter in-checkout pathless while owner holds |
| E11 | Interrupt/kill mid fixture leaves no new stuck shared admission for nested substitute-directory run | slice 1 | observed: outside-checkout skip never acquires refs/dough/local-test-suite — scripts/test.sh fall-through |
| E12 | Stale-owner takeover for real full runs remains as today | slice 1 | observed: local-test-suite.test.mjs stale-token/copied-token pretender cases unchanged |
| X1 | Does not redesign admission storage |  | X1 |
| X2 | Does not change CI's no-admission rule |  | X2 |
| X3 | Does not change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers |  | X3 |
| X4 | Does not meet the purpose by excluding runner-fixture checks from focused proofs |  | X4 |
| D1 | Deferred: broader redesign via per-directory locks |  | D1 |
| D2 | Deferred: broader redesign via explicit share tokens as only escape |  | D2 |
| D3 | Deferred: rewriting every fixture solely to pass paths when gate classification delivers the promise |  | D3 |
| D4 | Deferred: admitting or excluding other pathless callers that are not runner fixtures over substitute directories |  | D4 |
