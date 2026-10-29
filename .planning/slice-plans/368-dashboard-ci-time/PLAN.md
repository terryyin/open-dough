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
Scheduling slice accepted at `7eda0986bafe78cbf6088df514bb6b088edf9333` on that
execution target; its real hosted run is 40793949962. Retained CI observer:
coordinator `dashboard-ci-time-164`, directory `/tmp/dough-ci-501/watch-OS1NT8`,
yielded cell80, session96084, PID2391, installed runtime in this worktree;
workflow `ci.yml` (CI), target `codex/dashboard-ci-time`. Reuse it for all
implementation publications; do not start another observer.

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

## Performance checkpoint

The combined24-case local comparison passed in92.09s (reporter91.685s),
versus original97.35s and scheduling-only88.97s. The assumption that fewer
browser round trips necessarily reduce local wall time is not established.
Retain semantic proof, but do not mark slice2 complete or claim an additional
helper gain yet. Publish a validated progress candidate solely to obtain the
required real hosted comparison; if that remains neutral, reassess the cost
hypothesis and reject unsupported complexity rather than declare speedup from
call counts. No broader clock/fixture/tier changes are authorized.

## Story obligations

### G1. Combined hosted performance and final coverage await the candidate
Reported: slice 2 — "The helper candidate passed all twelve dashboard shards, but the complete workflow found an unrelated owner-record observation race. Repair CI and repeated hosted performance remain pending."
Story clause: "Compare normal local execution and full hosted CI on named baseline and candidate revisions"
Disposition: return

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
Slice1 focused proof: node selection8/8; reporting/proof-record/quiet-reporter/run-processes34/34; two new guards passed three consecutive focused observations. Listing preserves all1,721 original cases and adds2guards. The same24-case ordinary local comparison passed in88.97s versus97.35s baseline; this single observation is not a full CI claim. Raw evidence and exact commands are retained in /private/tmp/dashboard-ci-time-164 and the implementation return. Coordinator refreshed the existing split lists from exact result durations plus beforeAll/afterAll events in hosted baselines40789926577 and40790934008, using scripts/test-shares.mjs refresh; refreshed selection tests8/8passed and preview covers571files,570recorded. Scheduling-only hosted run40793949962 passed all16jobs and1,723cases (all1,721 original cases preserved plus2guards). Max browser-suite elapsed211.35s versus252.96/217.71s baselines; max dashboard-job241s versus291/247s. Production updates began6.295s into its suite versus102.387/81.628s and its idle tail was13.46s versus64.837/52.922s. These observations support the mechanism; final combined repeated CI comparison and J02 remain owned by slice2.

Slice2 local semantic proof: four real-browser guards preserve late/revealed
controls, hidden overflow, modal taps, exact one-pixel native moves and samples
after RAF callback completion. The full34-case helper family passed three
consecutive times (38.12/37.76/37.94s); commands, loads, raw strict records and
91consumer dispositions are retained under /private/tmp/dashboard-ci-time-164
and the implementation return. Dashboard typecheck and whitespace check passed.

## Plan concern review

Refinement was not needed: the two slices own distinct measured costs and
preserve one suite and its existing proof. No remaining concern outside the
bounded scheduling probe above was identified.

## Candidate CI and bounded repair

Helper candidate `930974d6b285dc16c8f3350a0cbe84216ca0a861`, hosted run
40796911428, passed all twelve dashboard shards: max job 233s, max suite
199.296s, job-start spread 1s. It selected 1,727 cases in 573 files: all
1,721 original selections exactly once, six added guards, and the same four
platform skips (1,723 passed). There were no retries or unexpected verdicts.
The phone header step measured 21.401s versus scheduling-only 26.811s, but
additional helper attribution awaits repeated observation. Raw reports,
metrics and coverage equality are under /private/tmp/dashboard-ci-time-164.

The overall workflow failed test (2/3): unchanged
`github-request-owner-unresponsive.test.mjs` read `owner.1.json` after real
replacement removed it. Fresh repair agent reproduced the exact ENOENT
through actual `claimedRecord` replacement after observation's directory
snapshot. The fixture now tolerates only that missing-record read; malformed
JSON and other filesystem errors still fail. The new 0.1s regression and
unresponsive-owner scenario passed three consecutive focused runs, then all
15 owner/login/lifecycle/teardown consumer files passed. All 47 consumer
trace paths have dispositions. Independent refactor review found no edits;
files are 188/63 lines and whitespace passes. Allocation preview predicts
541.2s per Node share against a 750s ceiling. No installed managed copy changed.
Retained clean repair boundary:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-XAjufX/record.json`.
Publish the repair through the same branch/observer, restore this clean boundary,
and measure a successful complete workflow before completion.
