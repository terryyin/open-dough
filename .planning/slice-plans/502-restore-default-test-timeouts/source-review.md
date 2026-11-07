# Source-only review

Reviewer: fresh general-purpose agent launched by the coordinator on 2026-11-07,
without conversation inheritance. Input: only the verbatim story text of
[SEED-260#restore-default-test-timeouts](../../seeds/SEED-260-restore-default-test-timeouts.md#restore-default-test-timeouts)
(Goal, Scope, Key examples, Deferred scope, Architecture; links stripped), with
instructions to read no other files, change nothing, and number each commitment.
The table below is its returned list; Slice and Observation columns are the
coordinator's allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Developers get fast, reliable local and CI feedback from automated tests | slice 10 | |
| G1.1 | Tests pass with their runner's default timeout | slice 10 | |
| G1.2 | Applies "wherever possible" (qualification) | slice 10 | |
| G2 | A slow or stalled check surfaces promptly | slice 10 | |
| G2.1 | The behaviors that make a passing result trustworthy are kept (qualification) | slice 10 | |
| 1a | Restore Playwright's 30-second default timeout | slice 8 | observed: grep -rnE 'test\.slow\|(test\|testInfo\|info)\.setTimeout\(\|describe\.configure\(\{[^}]*timeout\|^\s*(timeout\|globalTimeout):' over dashboard/tests, frontend-tests, backend-tests and playwright.config.ts after slice 8: no slow markers, group or fixture timeouts or config timeout; only case-local allowances auto-refresh-rate-limit.spec.ts:68 and production-deployment.spec.ts:62 (45s, pending candidates) plus nested deadlines under test; slice 8 nested fixtures bounded at the default (mutation: forced nested timeout failed 'Timed out waiting') |
| 1a.1 | for the dashboard journeys | slice 8 | observed: grep -rnE 'test\.slow\|(test\|testInfo\|info)\.setTimeout\(\|describe\.configure\(\{[^}]*timeout\|^\s*(timeout\|globalTimeout):' over dashboard/tests, frontend-tests, backend-tests and playwright.config.ts after slice 8: no slow markers, group or fixture timeouts or config timeout; only case-local allowances auto-refresh-rate-limit.spec.ts:68 and production-deployment.spec.ts:62 (45s, pending candidates) plus nested deadlines under test; slice 8 nested fixtures bounded at the default (mutation: forced nested timeout failed 'Timed out waiting') |
| 1a.2 | for the frontend tests | slice 8 | observed: grep -rnE 'test\.slow\|(test\|testInfo\|info)\.setTimeout\(\|describe\.configure\(\{[^}]*timeout\|^\s*(timeout\|globalTimeout):' over dashboard/tests, frontend-tests, backend-tests and playwright.config.ts after slice 8: no slow markers, group or fixture timeouts or config timeout; only case-local allowances auto-refresh-rate-limit.spec.ts:68 and production-deployment.spec.ts:62 (45s, pending candidates) plus nested deadlines under test; slice 8 nested fixtures bounded at the default (mutation: forced nested timeout failed 'Timed out waiting') |
| 1a.3 | for the backend tests | slice 8 | observed: grep -rnE 'test\.slow\|(test\|testInfo\|info)\.setTimeout\(\|describe\.configure\(\{[^}]*timeout\|^\s*(timeout\|globalTimeout):' over dashboard/tests, frontend-tests, backend-tests and playwright.config.ts after slice 8: no slow markers, group or fixture timeouts or config timeout; only case-local allowances auto-refresh-rate-limit.spec.ts:68 and production-deployment.spec.ts:62 (45s, pending candidates) plus nested deadlines under test; slice 8 nested fixtures bounded at the default (mutation: forced nested timeout failed 'Timed out waiting') |
| 1a.4 | for their fixtures | slice 8 | observed: grep -rnE 'test\.slow\|(test\|testInfo\|info)\.setTimeout\(\|describe\.configure\(\{[^}]*timeout\|^\s*(timeout\|globalTimeout):' over dashboard/tests, frontend-tests, backend-tests and playwright.config.ts after slice 8: no slow markers, group or fixture timeouts or config timeout; only case-local allowances auto-refresh-rate-limit.spec.ts:68 and production-deployment.spec.ts:62 (45s, pending candidates) plus nested deadlines under test; slice 8 nested fixtures bounded at the default (mutation: forced nested timeout failed 'Timed out waiting') |
| 1b | "Then" audit and clean up the remaining automated checks (sequenced after 1a) | slice 10 | |
| 1b.1 | including the shell checks | slice 10 | |
| 1b.2 | including the Node checks | slice 9 | observed: slice 9 audit of the 419 Node jobs (scripts/test-jobs.sh) and 142 helpers: 12 case timeout options removed in 6 src/skills/dough-execute-plan/scripts/*.test.mjs; github-request-owner-start on t.mock.timers (30.7 → 0.4s); runner passes no --test-timeout; product deadlines and whole-run safeguards kept (tmp s9-*) |
| 1b.3 | including their fixtures | slice 10 | |
| 1c | Each runner supplies its own default (qualification) | slice 10 | |
| 1d | The repository's shell runner and `node --test` have no finite default case timeout (qualification) | slice 10 | |
| 2a | Remove `test.slow()` | slice 1 | observed: git grep '\.slow(' -- dashboard finds none; 44 markers removed in 16 files (slice 1 diff) |
| 2b | Remove inherited case-timeout overrides | slice 10 | |
| 2c | When an affected case approaches or exceeds its default, measure setup, execution and cleanup "as applicable" | slice 10 | |
| 2d | In that case, try a faster test strategy first | slice 10 | |
| 2e | Synchronize on observable events or on a controlled clock (either is allowed) | slice 10 | |
| 2f | Preserve the behaviors covered by the checks | slice 10 | |
| 2g | Preserve the failure signals covered by the checks | slice 10 | |
| 2h | Measure the affected cases or jobs under supported local and CI conditions | slice 10 | |
| 2h.1 | including normal suite load (qualification) | slice 10 | |
| 3a | The only permitted override is the smallest measured allowance | slice 10 | |
| 3a.1 | placed on an individual test (qualification) | slice 10 | |
| 3a.2 | only after a practical faster strategy has been tried (qualification) | slice 10 | |
| 3b | Record each remaining exception as a pending optimization candidate | slice 10 | |
| 3b.1 | with its observed cost | slice 10 | |
| 3b.2 | with the behavior it protects | slice 10 | |
| 3b.3 | with the approaches tried | slice 10 | |
| 3b.4 | with a follow-up | slice 10 | |
| 4a | `npm run test:dashboard` passes locally | slice 10 | |
| 4b | `npm run test:dashboard` passes in CI | target CI | |
| 4c | `npm test` passes locally | slice 10 | |
| 4d | `npm test` passes in CI | target CI | |
| 4e | Coverage is preserved in both full suites | slice 10 | |
| 4f | Run each full local run on an awake Mac on AC power under `caffeinate -s -i` (qualification) | slice 10 | |
| E1 | Real-Git completed-story review: it has ample headroom, so its slow marker is removed (example) | slice 1 | observed: slow markers removed from dashboard/backend-tests/review/story-review-completed.spec.ts and dashboard/tests/review/story-review-completed*.spec.ts |
| E1.1 | With the marker removed, the same HTTP checks still tell the selected story's published files apart from interleaved changes at the default timeout (example) | slice 1 | observed: backend-tests/review/story-review-completed.spec.ts 'completion isolates interleaved work…': files contain shared.txt, exclude other-story.txt and integration-other.txt; passed at default 7.1s/10.4s in strict run (tmp proof.json, 765 selected, strictStatus passed) |
| E2 | Candidate with an unsupported published policy or a failed build: when the watcher checks it, the last successful preview keeps serving (example) | slice 7 | observed: dashboard/tests/runtime/productionUpdatePolicies.ts:109 baseline kept through unsupported policy, old preview serves; dashboard/tests/runtime/productionUpdatePolicies.ts:158 'Keeping q at', Q preview running, title MAIN P after R's real build failure (s7 after run 37/37 and stress 74/74, tmp s7/) |
| E2.1 | A repair that qualifies only because the failed application's paths remain in the range can activate (example) | slice 7 | observed: dashboard/tests/runtime/productionUpdatePolicies.ts:137 policy repair Q activates only through the rejected application's retained paths (s7 after run 37/37 and stress 74/74, tmp s7/) |
| E2.2 | The next excluded range is compared from that successful activation (example) | slice 7 | observed: dashboard/tests/runtime/productionUpdatePolicies.ts:201 T skipped as 'every change since S' (latest successful activation); mutation 2 (base moved to failed R) failed at S step (s7 after run 37/37 and stress 74/74, tmp s7/) |
| E2.3 | The faster check still observes real activation (example) | slice 7 | observed: dashboard/tests/runtime/productionUpdatePolicies.ts:137 and dashboard/tests/runtime/productionUpdatePolicies.ts:185 real npm install, Vite build and preview activation via productionActivation/productionReplacement (s7 after run 37/37 and stress 74/74, tmp s7/) |
| E2.4 | The faster check still observes recovery (example) | slice 7 | observed: dashboard/tests/runtime/productionUpdatePolicies.ts:185 S activates after R's failure, R never activates, built list equals activations; mutation 1 failed at dashboard/tests/runtime/productionUpdatePolicies.ts:158 (s7 after run 37/37 and stress 74/74, tmp s7/) |
| E2.5 | The faster check still observes cleanup (example) | slice 7 | observed: dashboard/tests/runtime/productionUpdatePolicies.ts:185 via productionReplacement (support/productionWatcher.ts:100-103): same URL, superseded preview process ends, replacement runs; no leftover dough-published-main dirs after the s7 runs |
| E2.6 | If the measured case still needs more than the default, its own bounded allowance and pending candidate make the cost visible (alternative outcome, not a rejection rule) | slice 7 | observed: not needed: no allowance remains on the recovery or failures cases (dashboard/tests/runtime/productionUpdatePolicies.ts, production-watcher-failures.spec.ts) (s7 after run 37/37 and stress 74/74, tmp s7/) |
| E3 | A check that passes alone but times out under full suite load counts as a failing check (example) | slice 10 | |
| E3.1 | Identify the missed event, the fixture cost or the host condition (any of these causes) (example) | slice 10 | |
| E3.2 | Preserve the check's proof (example) | slice 10 | |
| E3.3 | Confirm the repair under the profile that exposed the failure (example) | slice 10 | |
| E4 | A shell watchdog check drives a stalled child through expiration (example) | slice 10 | |
| E4.1 | Observe termination through the watchdog's contract (example) | slice 10 | |
| E4.2 | Observe cleanup through the watchdog's contract (example) | slice 10 | |
| E4.3 | Observe retained evidence through the watchdog's contract (example) | slice 10 | |
| E4.4 | The expiration under test is part of the scenario, not a case-timeout override (qualification) | slice 10 | |
| E4.5 | The shell job runs with its normal runner settings (example) | slice 10 | |
| A1 | Reuse fixture-owned events and clocks to control inputs to the real boundaries the tests observe (architecture) | slice 10 | |
| A2 | Keep case timeouts visible in their own profile (architecture) | slice 10 | |
| A3 | Keep the cost of shared fixture setup and cleanup visible in its own profile (architecture) | slice 10 | |
| A4 | Keep whole-run safeguards visible in their own profile (architecture) | slice 10 | |
| A5 | Moving expensive work into shared setup can lower a case's reported duration while increasing the time to a trustworthy suite result (qualification) | slice 10 | |
| X1 | Exclusion: new timeout enforcement or reporting infrastructure | slice 10 | |
| X2 | Exclusion: runner replacement | slice 10 | |
| X3 | Exclusion: redesign of test tiers | slice 10 | |
| X4 | Exclusion (conditional): changes to the existing unique integrated watcher coverage need their own scope decision and replacement proof | slice 7 | observed: unique integrated watcher coverage kept: real install, build, preview, process ownership and cleanup unchanged; splits keep every assertion (dashboard/tests/runtime/productionUpdatePolicies.ts, production-watcher-failures.spec.ts) |
