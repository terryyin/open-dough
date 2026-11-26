# Prove published read admission in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove published read admission in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-read-admission-via-vitest)

**Identity:** SEED-413#published-read-admission-via-vitest

## Goal and scope

Give Board and Review maintainers fast proof that a configured project can read its published facts and receives the established refusal for unlisted paths, invalid source membership, or unavailable evidence.

Retain one wire proof for local-origin request admission wherever it supplies the behavior. Drive product cases through the typed published reader with configured sources, admitted pins, and real Git if reachability is in question. Reconcile cold ref reads with plans 856 and 858 and pinned reads with plan 823.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 12 Playwright paths for this story at `43b6506e7`. The selector establishes runner membership. Refinement must inspect the cases, observe the decisive premises through the consuming operations, and confirm slice size before recording readiness.

Trace publishedWorkRead and authenticatedRead to reachablePaths, recordsBesideBacklog, and branchReachability. Compare plan 858’s retargeted proofs and the Board Git switch before declaring a cold ref assertion redundant.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e). For published Git readers follow [one project refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads) and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

Follow [one project refresh for published Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads) and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) when choosing the surviving boundary.

## Provisional ordered slices

### 1. Admit only reachable published revisions and paths

Type: Behavior
Status: planned

Project, branch, revision and literal path admission with success and refusal.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-branch-read-boundary.spec.ts`
- `authenticated-read-boundary.spec.ts`
- `authenticated-read-containment.spec.ts`
- `authenticated-read-listed-records.spec.ts`
- `authenticated-read-refusal.spec.ts`

### 2. Report the committed and Done evidence that the project publishes

Type: Behavior
Status: planned

Committed source and exact Done catalog, including gaps and refusal.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-read-committed-last.spec.ts`
- `authenticated-read-done-catalog-gaps.spec.ts`
- `authenticated-read-done-catalog-refusal.spec.ts`
- `authenticated-read-done-catalog.spec.ts`

### 3. Keep authenticated profile additions and avatar reads scoped

Type: Behavior
Status: planned

Successful scoped profile or avatar read and refusal when the configured source cannot supply it.

Legacy selection in `dashboard/backend-tests/observation/`

- `authenticated-avatar.spec.ts`
- `authenticated-read-profile-addition-refusal.spec.ts`
- `authenticated-read-profile-addition.spec.ts`

## Proof and local gate

Measure the exact maintained one-worker selections before and after, mapping every prior case to its surviving observable owner. See the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
