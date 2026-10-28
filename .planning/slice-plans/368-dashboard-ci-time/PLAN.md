# Dashboard CI feedback time

**Source:** [Selected story](../../seeds/SEED-164-dashboard-ci-time.md#dashboard-ci-time)
**Identity:** SEED-164#dashboard-ci-time

## Goal and scope

Implement the authorized scheduling and browser-round-trip improvements while
preserving every existing behavior check, isolated mutable state, native input,
per-pixel touch observation, and strict verdict. Keep 12 CI shards and four
workers on the observed hosted runners. No clock, fixture-sharing or tier moves.

## Execution identity

Story Branch Mode; created workspace `/Users/terryyin/git/open-dough/.worktrees/dashboard-ci-time`,
branch `codex/dashboard-ci-time`, starting revision `5de6411d4013a3474b31fcf3cb560263ce546f8b`.
Originating/default checkout `/Users/terryyin/git/open-dough`.
Claim `0bffc434d8ef9cb7db0f294fbf6c8bcf1aca7869` accepted on origin/main;
agent `ealden-chan`, publisher `codex-dashboard-ci-time`.
Implementation publication targets origin/refs/heads/codex/dashboard-ci-time.

## Baseline and outside-in proof

Existing hosted evidence: run 40785593037 executed 1,721 tests in 570 files,
four workers per shard. The slowest suite was 239.3s; its serial update chain
occupied 138.7s including 33.8s shared setup and left a 54.3s tail. Fresh unchanged
hosted baseline run 40789926577 uses claim revision 0bffc434, workflow_dispatch.
Compare execution and queue time separately; retain raw reports outside Git.

Run normal local `npm run test:dashboard` before edits and after both changes,
with proof records, same default worker count and cache conditions. The root
coordinator owns these full runs and hosted comparisons. Focused proof owns
selection equality, early serial dispatch, honest hook accounting, all-control
clipping rejection, and real touch/frame observations. Obtain three consecutive
focused passes for changed browser synchronization, then full-suite proof.

## Current decisions

- Reuse Playwright's own complementary projects and existing split allocator;
  changing testMatch order alone does not control dispatch. An early bounded
  probe must establish actual ordering and selection equivalence before keeping
  that approach. Preserve one global setup and unchanged serial state ownership.
- Extend the existing timing reporter with shared-hook cost, not per-test hook
  totals already in test durations. Keep recorded labels and shard artifacts.
- Reuse the current clipping and touch predicates. Batch observation only;
  retain native scroll/touch actions, per-pixel stop conditions and diagnostics.
- ADR 0002 requires one coherent existing solution; ADR 0008 keeps dashboard
  boundaries intact; ADR 0010 requires measured, worthwhile improvement.
- Local host has 16 logical CPUs, 48 GiB RAM, 48% memory headroom and load about
  5.7 at setup. Sequence owned heavy local proof; normal mode uses default
  workers. Remote runner headroom is unknown; retain its existing workload.
  Reconsider concurrency after contention/failure evidence, without dropping proof.
- Replanning is permitted within the selected outcome. No numeric slice budget
  is imposed; each slice has one independent optimization/proof loop.

## Ordered slices

### 1. Long deployment chains overlap ordinary dashboard checks
Type: Behavior
Status: planned

Behavior: The same selected CI tests dispatch their serial production chains
early while other workers run ordinary checks; the allocator includes shared
setup/teardown exactly once. Capture unchanged selection, actual start/finish
ordering, reporter accounting, normal local baseline and hosted baseline.
Proof: Existing discovery/strict-reporter tests plus focused new counterexamples
for project partition and shared-hook accounting; run affected production shards
and compare their retained reports. Measure rather than infer a speedup.

### 2. Exhaustive layout and touch proof uses fewer observation round trips
Type: Structure
Status: planned

Correction: Reduce repeated browser observation calls across reachability and
native touch consumers while keeping every existing scenario, assertion,
control, viewport, native event and animation-frame/per-pixel observation.
Proof: Relevant layout/sidebar/native touch journeys, including clipping and
narrow reading-window rejection, three consecutive focused passes, unchanged
selection and the full normal local suite. Publish the candidate to hosted CI,
compare queue-adjusted shard and complete CI durations with the baseline, and
record actual savings and comparison limits before completion.

## Learnings and accepted proof

Prior investigation is retained in the conversation and temporary CI reports.
No implementation proof is accepted yet.

## Plan concern review

Refinement was not needed: the two slices own distinct measured costs and
preserve one suite and its existing proof. No remaining concern outside the
bounded scheduling probe above was identified.
