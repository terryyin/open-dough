# Prove published Intent evidence in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove published Intent evidence in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-intent-evidence-via-vitest)

**Identity:** SEED-413#published-intent-evidence-via-vitest

## Goal and scope

Give developers reading Intent fast proof that evidence comes from the selected project and revision and that unavailable evidence has an explicit outcome.

Reconcile the source move in SEED-434 and CI Git input move in SEED-435. After plan 607 lands, account for any product-unit cases the repeat correction leaves on Playwright. Plan 607 keeps its repeat behavior, obligations and load proof.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 6 Playwright paths at `43b6506e7`. Refinement must inspect each assertion, observe the premises through the consuming operations, confirm size and check which cases have a maintained owner after intervening product work.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

Follow [one project refresh for published Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads) and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) when choosing the surviving boundary.

## Provisional ordered slices

### 1. Read the selected Intent scope and its source

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/intent/`

- `authenticated-read-intent-candidates.spec.ts`
- `authenticated-read-intent-java.spec.ts`
- `authenticated-read-intent-selection.spec.ts`

### 2. Explain unavailable Intent locations

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/intent/`

- `authenticated-read-intent-locations-problems.spec.ts`
- `authenticated-read-intent-locations.spec.ts`

### 3. Report the published CI status read result

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/intent/`

- `intent-ci-status-read-boundary.spec.ts`

### 4. Recount repeat unit cases once the correction lands

Type: Behavior
Status: planned

Compare the accepted correction’s selection and proof with plan 607. Bound any surviving unit proof loops at refinement.

## Proof and local gate

Measure comparable one-worker selections and account for each previous case. Follow the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
