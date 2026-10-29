# Dashboard CI feedback time

**Source:** [Selected story](../../seeds/SEED-164-dashboard-ci-time.md#dashboard-ci-time)
**Source review:** [Independent source commitments](source-review.md)
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

Compare the affected 24-test family in ordinary local mode before edits and
after both changes, using the same default workers and cache conditions:
`env -u NO_COLOR npm run test:dashboard -- production-watcher cursor-sessions-sidebar-resize-lasting recently-done-sessions-sidebar-room agent-terminal-touch`.
The coordinator owns this comparison and the complete hosted suite comparisons. Focused proof owns
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
Status: done

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
selection and ordinary local comparison plus the complete hosted suite. Publish the candidate to hosted CI,
compare queue-adjusted shard and complete CI durations with the baseline, and
record actual savings and comparison limits before completion.

## Learnings and accepted proof

Prior investigation is retained in the conversation and temporary CI reports.
Preparation aeff46decceb5fef150962b5ce72db259d866382 was approved and published
to main. Local comparison baseline passed all 24 selected tests in 97.35s wall
(96.98s reporter time), on Node 24.21 and the default eight workers. A prior full
local baseline was interrupted after strict failures caused by inherited
NO_COLOR in nested runs that enable FORCE_COLOR; it is diagnostic only. Use
the sanitized environment consistently before/after. Full coverage remains
owned by hosted CI. Baseline runs 40789926577 and 40790934008 both passed all
16 jobs; longest dashboard jobs were 291s and 247s, showing material variance.
Slice1 focused proof: node selection8/8; reporting/proof-record/quiet-reporter/run-processes34/34; two new guards passed three consecutive focused observations. Listing preserves all1,721 original cases and adds2guards. The same24-case ordinary local comparison passed in88.97s versus97.35s baseline; this single observation is not a full CI claim. Raw evidence and exact commands are retained in /private/tmp/dashboard-ci-time-164 and the implementation return. Coordinator refreshed the existing split lists from exact result durations plus beforeAll/afterAll events in hosted baselines40789926577 and40790934008, using scripts/test-shares.mjs refresh; refreshed selection tests8/8passed and preview covers571files,570recorded. Real hosted tail and CI improvement remain owned by slice2 (J02).

## Plan concern review

Refinement was not needed: the two slices own distinct measured costs and
preserve one suite and its existing proof. No remaining concern outside the
bounded scheduling probe above was identified.
