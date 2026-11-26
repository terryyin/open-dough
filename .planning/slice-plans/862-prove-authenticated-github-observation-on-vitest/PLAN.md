# Prove authenticated GitHub observation in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove authenticated GitHub observation in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest)

**Identity:** SEED-413#authenticated-github-observation-via-vitest

## Goal and scope

Give maintainers fast proof that the authenticated GitHub workload shares eligible requests, reports failures, and releases its callers and processes.

Use the surviving revision-check or pinned read for caller-specific proof. Reconcile plan 858’s trigger move. Keep real cross-process ownership and actual subprocess lifetime observations.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 23 Playwright paths at `43b6506e7`. Refinement must inspect each assertion, observe the premises through the consuming operations, confirm size and check which cases have a maintained owner after intervening product work.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

## Provisional ordered slices

### 1. Classify retry eligibility and resume eligible reads

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-backoff.spec.ts`
- `authenticated-read-resumption.spec.ts`
- `authenticated-read-transient-eligibility.spec.ts`

### 2. Hold work during cooldown and directed waits

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-cooldown-reach.spec.ts`
- `authenticated-read-cooldown.spec.ts`
- `authenticated-read-directed-wait.spec.ts`
- `authenticated-read-wait-in-turn.spec.ts`

### 3. Share turns and release only the departing waiter

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-shared-failures.spec.ts`
- `authenticated-read-shared-waiters.spec.ts`
- `authenticated-read-shared.spec.ts`
- `authenticated-read-turns-timing.spec.ts`
- `authenticated-read-turns.spec.ts`

### 4. Share one owner across Dashboards and CI

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `shared-request-owner.spec.ts`

### 5. Record bounded diagnostics in surviving readers

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-diagnostics-bounds.spec.ts`
- `authenticated-read-diagnostics.spec.ts`

### 6. Keep incident evidence through failure, recovery and restart

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-incident-record-bounds.spec.ts`
- `authenticated-read-incident-record-lifecycle.spec.ts`
- `authenticated-read-incident-record-restart.spec.ts`
- `authenticated-read-incident-record-stalls.spec.ts`
- `authenticated-read-incident-record.spec.ts`

### 7. Bound subprocess output and scope lifecycle hooks

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-output-bound.spec.ts`
- `authenticated-read-plugin-hooks.spec.ts`
- `authenticated-read-subprocess-lifecycle.spec.ts`

## Proof and local gate

Measure comparable one-worker selections and account for each previous case. Follow the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
