# Prove published refresh lifecycle in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove published refresh lifecycle in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-refresh-lifecycle-via-vitest)

**Identity:** SEED-413#published-refresh-lifecycle-via-vitest

## Goal and scope

Give developers observing published progress quick proof that a confirmed refresh can advance the Board and that failures retain the previous readable view and its status.

Reconcile the revision-list, cache and SSE observations with plans 856, 853 and 823. Keep the real origin for ref movement and the actual stream or representative browser journey where delivery, departure, or the rendered recovery cue is the observation.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 15 Playwright paths for this story at `43b6506e7`. The selector establishes runner membership. Refinement must inspect the cases, observe the decisive premises through the consuming operations, and confirm slice size before recording readiness.

Trace the active source revision read and stream to SharedObservation and the shared verified-origin refresh. Before refinement, record exactly which legacy ref and cache behavior the local Git work replaced and which callers still use it.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e). For published Git readers follow [one project refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads) and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

Follow [one project refresh for published Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads) and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) when choosing the surviving boundary.

## Provisional ordered slices

### 1. Keep the last readable answer and its pin

Type: Behavior
Status: planned

Retained answers and lifetime through failure and ref movement.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-retained-answers-bounded.spec.ts`
- `authenticated-read-retained-answers-moved.spec.ts`
- `authenticated-read-retained-answers.spec.ts`

### 2. Distinguish unchanged, moved and failed revision checks

Type: Behavior
Status: planned

Confirmed revision and backlog answers with observable refusal and recovery.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-revision-backlog.spec.ts`
- `authenticated-read-revision-check-failures.spec.ts`
- `authenticated-read-revision-check.spec.ts`

### 3. Reuse immutable evidence without reusing a failed or unrelated read

Type: Behavior
Status: planned

Pinned replay, exact comparison scope, history, eviction, and failure isolation.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-revision-reuse-bounds.spec.ts`
- `authenticated-read-revision-reuse-compared.spec.ts`
- `authenticated-read-revision-reuse-failures.spec.ts`
- `authenticated-read-revision-reuse-history.spec.ts`
- `authenticated-read-revision-reuse.spec.ts`

### 4. Share listing and deliver subscriber changes

Type: Behavior
Status: planned

One eligible listing, shared failure and per-subscriber stream cleanup.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-revision-stream-setup-departure.spec.ts`
- `authenticated-read-revision-stream.spec.ts`
- `authenticated-read-shared-listing-failures.spec.ts`
- `authenticated-read-shared-listing.spec.ts`

## Proof and local gate

Measure the exact maintained one-worker selections before and after, mapping every prior case to its surviving observable owner. See the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
