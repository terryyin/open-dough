# Prove published Review comparisons in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove published Review comparisons in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-review-comparisons-via-vitest)

**Identity:** SEED-413#published-review-comparisons-via-vitest

## Goal and scope

Give developers inspecting Review fast proof that comparison and file evidence belong to the selected story and its published or landed pair.

Use the typed Review builder and admission operations with real Git histories and retained records. Reconcile plans 823 and 856 for shared fetch and pins. Retain actual Git process and browser interaction wherever they supply the proof.

## Inherited proof and premises

The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage) classified 21 Playwright paths at `43b6506e7`. Refinement must inspect each assertion, observe the premises through the consuming operations, confirm size and check which cases have a maintained owner after intervening product work.

Use [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support) and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

Follow [one project refresh for published Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads) and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) when choosing the surviving boundary.

## Provisional ordered slices

### 1. Read the completed comparison and offline fallback

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-review-completed-agent-recovery.spec.ts`
- `story-review-completed-capture-fallback.spec.ts`
- `story-review-completed-offline.spec.ts`
- `story-review-completed.spec.ts`

### 2. Attribute the completed contribution and disclose missing evidence

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-review-completed-attribution.spec.ts`
- `story-review-completed-driver.spec.ts`
- `story-review-completed-gaps.spec.ts`
- `story-review-completed-own-conflict-gap.spec.ts`

### 3. Account for conflicts and the resulting Git tree

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-review-completed-conflicts.spec.ts`
- `story-review-completed-merge-tree.spec.ts`
- `story-review-landed-result-tree.spec.ts`
- `story-review-result-tree.spec.ts`

### 4. Admit the selected Review file and its text

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-review-completed-file-admission.spec.ts`
- `story-review-file-text-admission.spec.ts`
- `story-review-refusal.spec.ts`
- `story-review-state-admission.spec.ts`

### 5. Read kept runs through retention and expiry

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-review-stored-retention.spec.ts`
- `story-review-stored-runs.spec.ts`

### 6. Share a bounded refresh of the completed comparison

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `story-review-completed-shared-fetch.spec.ts`

### 7. Keep Git fetch and worktree operations isolated

Type: Behavior
Status: planned

Legacy selection in `dashboard/backend-tests/review/`

- `git-target-fetch-process.spec.ts`
- `git-target-fetch-worktrees.spec.ts`

## Proof and local gate

Measure comparable one-worker selections and account for each previous case. Follow the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage). Use awake macOS on AC under `caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md). Keep default timeouts and apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
