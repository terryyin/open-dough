# Prove retained landing capture in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove retained landing capture in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#landing-capture-evidence-via-vitest)

**Identity:** SEED-413#landing-capture-evidence-via-vitest

## Goal and scope

Give developers fast proof that a publication’s landing pair stays bound to the launch that published it.

Use installed capture, real Git pins and persisted launch records. Retain the CLI or Git process where its boundary supplies the proof. Follow the landing context into the installed publisher, capture and recovery.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 12 Playwright paths at `43b6506e7`. Refinement must inspect each assertion, observe the premises through the consuming operations, confirm size and check which cases have a maintained owner after intervening product work.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

## Provisional ordered slices

### 1. Capture the accepted one-shot pair from the installed publisher

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `one-shot-landing-capture-cli.spec.ts`
- `one-shot-landing-capture.spec.ts`

### 2. Bind capture to the authorized launch and comparison

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `one-shot-landing-capture-admission.spec.ts`
- `one-shot-landing-capture-binding.spec.ts`

### 3. Recover interrupted capture within its retention lifetime

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `one-shot-landing-recovery-binding.spec.ts`
- `one-shot-landing-recovery-deletion.spec.ts`
- `one-shot-landing-recovery-retention.spec.ts`

### 4. Capture the authorized story-branch landing

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-branch-landing-capture.spec.ts`
- `story-branch-landing-conflict.spec.ts`
- `story-branch-landing-context.spec.ts`

### 5. Keep the captured pair across later publications

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-branch-landing-later-publication.spec.ts`
- `story-branch-retained-landing.spec.ts`

## Proof and local gate

Measure comparable one-worker selections and account for each previous case. Follow the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
