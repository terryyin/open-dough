# Correct the fast runtime cases' leftovers

**Identity:** SEED-413#fast-runtime-unit-case-cleanup
**Source:** [Correct the fast runtime cases' leftovers](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fast-runtime-unit-case-cleanup)

## Goal and scope

Correction of [plan 879](../879-prove-runtime-in-fast-unit-cases/PLAN.md)
(`SEED-413#fast-runtime-unit-cases`, commits `b7f5b8ff0`..`5b4c52038`),
from its execution retrospective's outcome review. Test and test-support
changes only; no product behavior changes. The runner cutover stays with
[its story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner).

Findings, rechecked at `5b4c52038`:
- `e2e/observation/transient-read-exclusions.spec.ts:116-134` races
  `expectMembership` against a Board expectation that cannot settle in the
  malformed-backlog state, so the journey waits out Playwright's 5 s bound
  to prove a test helper fails fast.
- `committed-origin-routing.spec.ts:97-115` spawns `git ls-remote`, and its
  route round trip reads through `git config --get-regexp`
  (`homeRoutes.ts:56-66`).
- Cases that only restate a constant or stub: `boundary-server.spec.ts:45-58`,
  `mounted-boundary-server.spec.ts:48-60`, `page-read-waits.spec.ts:116-129`,
  `test-preparation-boundary.spec.ts:21-23`.
- `verifyPublishedCommit` (`productionDeployment.mjs:55`) and
  `productionBuildEnvironment` (`productionWatcherFixture.ts:15`) are
  exported without outside callers.

## Direction and current decisions

- Plan 879's decisions hold: plain Vitest for unit tests, production and
  harness code take the typed state they read, one case per rule, MakeMe
  and page-object conventions, no `test.slow()`, default timeouts.
- Remove a case only after naming its surviving owner in the commit message.
- Failures follow the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.

## Ordered slices

### 1. Prove the membership check's fail-fast rule as a unit case
Type: Behavior
Status: planned
Estimate: 10–15 active minutes.
Proof: a `page-read-waits.spec.ts` case gives `expectMembership` a failed
published-work read and observes an immediate failure naming both titles,
in about 100 ms or less. `transient-read-exclusions.spec.ts` passes without
the appended block, and its run no longer includes the 5 s bound.

### 2. Remove Git and restated cases from the runtime folder
Type: Structure
Status: planned
Estimate: 10–15 active minutes.
Proof: `committed-origin-routing.spec.ts` round-trips a route list through
config text with no `git` process; the `ls-remote` refusal rests on the
journeys using `expectServedHomesReach`. The restating cases are removed or
merged into observable ones, and the two exports are module-private. The
whole runtime folder reruns with fewer cases, all under about 100 ms, and
the dashboard typecheck passes.
