# Prove Dashboard machine observations in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove Dashboard machine observations in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#machine-observation-via-vitest)

**Identity:** SEED-413#machine-observation-via-vitest

## Goal and scope

Give Dashboard maintainers fast proof that local checkout invalidation and machine status reflect changes in their actual sources.

Use real Git transitions for checkout identity and the typed sampling operation with only the platform sampler controlled. Preserve method and origin refusal where the wire supplies the proof.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 2 Playwright paths at `43b6506e7`. Refinement must inspect each assertion, observe the premises through the consuming operations, confirm size and check which cases have a maintained owner after intervening product work.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

## Provisional ordered slices

### 1. Detect checkout identity changes through real Git operations

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `git-files-identity.spec.ts`

### 2. Share host sampling and disclose partial availability

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/observation/`

- `host-status.spec.ts`

## Proof and local gate

Measure comparable one-worker selections and account for each previous case. Follow the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
