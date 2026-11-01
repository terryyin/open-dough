# Test Optimization Candidates

## Latest pass

- **Command / scope:** Source-only candidate resolution, 2026-11-01; all six
  pending families and the two accepted-cost groups. No profiling or test edits.
- **Revision:** `ae6479d3558b2e660e99d5b4839f0b6b064e7df5`.
- **Before / after:** unavailable for this review; no new wall/case measurement.
  Previous SEED-197 strict suite: 1,060.4s / 615.3s, 1,746 / 1,742 cases,
  zero skipped; unlike load across a reboot prevents attributing that wall delta.
- **Outcome:** incomplete measurement — value/cost decisions made; five original
  candidates and two narrower obligations transferred to one queued story.
  The completed-review selection round trip is accepted as necessary coverage.
- **Limits:** Numeric ROI and prospective savings are unknown. Source inspection
  establishes duplication or unique proof, not a measured speedup. User-directed
  coverage simplifications need not demonstrate wall gain; infrastructure does.
- **Evidence:** [value/cost assessment](../docs/maintainer/dashboard-test-value-review.md);
  [last measured pass](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-197-2026-10-31);
  [one replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).

## Pending candidates

None.

## Accepted necessary costs

### story-review-completed-journey-landed-runs-tail

- **Locations / scope:** `story-review-completed.spec.ts` trailing
  `keepUnusableCompletedCapture` + Landed runs radio + gap copy; gaps boundary
  already owns the same server-answer variant.
- **Observed cost:** focused journey wall ≈9.69–10.00s (1 case) under default
  workers on the SEED-196 host (2026-10-30).
- **Unique protection:** the real Published completion → Landed runs →
  Published completion radio round trip and restoration of the published file
  list after an unusable capture; server fallback proof cannot show this UI.
- **Alternatives attempted:** end journey before unusable-capture / Landed
  runs; focused wall 11.07–11.51s — no wall gain; undone.
- **Disposition / rationale:** accepted necessary cost — retain the one
  integrated selection path. Prior truncation gave no gain and removed unique
  control/restore proof. This accepts the marginal tail, not all fixture cost;
  reopen with concrete cheaper proof or fresh setup evidence. No skip/exclusion.
- **Date:** 2026-11-01
- **Evidence / follow-up:** [source comparison and ROI](../docs/maintainer/dashboard-test-value-review.md#4-completed-reviews-landed-runs-tail);
  SEED-196 slice 2 measurements remain in the recorded local timing evidence.

### agent-launch-poles

- **Locations / scope:**
  `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts` and the remaining
  integrated journey in `dashboard/tests/agent-launch-second-server.spec.ts`.
- **Observed cost:** the second-server case measured 64.6s before the
  SEED-176 change-wait boundary move and 52.5s / 51.2s after on the developer's
  Mac. Whole-suite runs had unlike or contended load, so these case timings
  establish no comparable suite-wall gain. No separate ad-hoc-terminal
  timing was retained in the legacy disposition.
- **Unique protection:** dual-preview page protection through reload and
  project switch, and immediate terminal attachment after an ad hoc launch.
- **Alternatives attempted:** cheaper server-only refusal and non-owner
  change-wait checks already moved to boundary tests in SEED-176; SEED-177
  subsequently shortened the boundary's configured bound. No further cheap
  replacement for the remaining integrated protection was established.
- **Disposition / rationale:** accepted necessary cost — preserve the unique
  multi-step journeys. The repeated terminal input matrix is separately
  transferred below; its duplication is not accepted. Acceptance excludes nothing;
  normal verification and CI continue running them. The project has no
  profile-exclusion mechanism. Reopen only with new evidence.
- **Date:** 2026-10-30
- **Evidence / follow-up:** [SEED-176 local measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-2026-10-29--2026-10-30);
  accepted triage at `03424649`, with its final ownership clarification at
  `fd5303c0`. These decisions survive SEED-176/SEED-177 cleanup.

### long-integrated-journeys

- **Locations / scope:** `dashboard/tests/agent-completion-attention.spec.ts`
  and the production-watcher chains in `dashboard/tests/production-watcher.spec.ts`,
  `dashboard/tests/production-watcher-updates.spec.ts`, and
  `dashboard/tests/production-watcher-failures.spec.ts`.
- **Observed cost:** the SEED-177 local baseline recorded an approximately
  39.6s attention case. Earlier hosted production-update chains, including
  shared hooks, varied from 116.84s to 194.81s on Ubuntu 24.04 with twelve
  shards and four workers per shard. These are case/chain timings, not
  additive local suite-wall savings; the chain showed no reliable elapsed
  improvement.
- **Unique protection:** attention reporting remains durable and readable
  through column changes, retirement, restart, Mark as read, and Mark as done;
  production-watcher journeys retain real activation, published-policy,
  failure/recovery, serving, and cleanup protection across steps.
- **Alternatives attempted:** earlier policy consolidation moved detailed
  qualification proof to a real-Git boundary case and removed two successful
  activations while retaining the watcher journey. SEED-177 closed without
  further narrowing these long journeys.
- **Disposition / rationale:** accepted necessary cost — retain unique
  integrated protection, preserving the accepted coverage decision. The raw
  attention admission matrix is separately transferred below. Any
  further variant removal or boundary move needs separately authorized scope
  and established replacement proof; acceptance grants no coverage reduction
  or profile exclusion. Normal verification and CI keep these tests.
- **Date:** 2026-10-30
- **Evidence / follow-up:** accepted triage at `03424649`; SEED-177 baseline
  analysis in the Git-recoverable plan named under Latest pass;
  [production-policy proof and measurements](../docs/maintainer/production-policy-test-timings.md).
  Plan 413 explicitly excludes thinning these necessary-cost journeys.

## Profile-only exclusions

None.

## Transferred obligations

### story-review-http-admission-boundary-placement

- **Locations / scope:** HTTP-only journey-tier specs
  `story-review-refusal.spec.ts`, `story-review-commit-admission.spec.ts`,
  `story-review-file-text-admission.spec.ts`,
  `story-review-one-shot-admission.spec.ts`, and the mark-request admission
  case in `story-review-mark.spec.ts`.
- **Observed cost:** focused family wall ≈12.6s (10 cases); summed `.tsv`
  ≈55s under default workers on the SEED-193 host (2026-10-30).
- **Unique protection:** server admission refusals and read-only workspace
  guarantees for review/mark/range/file-text/one-shot endpoints.
- **Alternatives attempted:** move to `serverMode: "boundary"` (and
  `boundary/` homes) with `request` fixture; focused wall 12.1–12.5s over
  three passes — no meaningful wall gain; undone.
- **Disposition / rationale:** transferred — slice 2 of the
  [one replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Retain valuable HTTP/read-only contracts with request-only boundary proof and minimal real Git preconditions; a boundary-mode-only repeat has weak ROI.
  Implementation pending; expected savings remain unmeasured.
- **Date:** 2026-11-01
- **Evidence / follow-up:** SEED-193 slice 2 focused proofs under
  `/tmp/SEED-193-optimize-dashboard-test-feedback/slice2-*`.

### codex-discovered-model-story-workflow-collapse

- **Locations / scope:** `agent-launch-codex-model.spec.ts` workflows
  `execution`, `refinement`, and `ad-hoc` (catalog/effort imported cases
  unchanged).
- **Observed cost:** focused family wall ≈10.2–12.1s (13 cases) under default
  workers on the SEED-194 host (2026-10-30); full-suite file `.tsv` ≈41.5s.
- **Unique protection:** discovered-model dialog → native creation for story
  and ad-hoc shapes; boundary already owns creation/refusal variants.
- **Alternatives attempted:** keep `execution` + `ad-hoc` only; focused wall
  11.0–11.6s / 12 cases over three passes — no wall gain; undone.
- **Disposition / rationale:** transferred — slice 3 of the
  [one replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Remove redundant refinement catalog UI after retaining its persistence assertions; use existing cheaper fixtures for catalog-only cases.
  Implementation pending; expected savings remain unmeasured.
- **Date:** 2026-11-01
- **Evidence / follow-up:** SEED-194 slice 3 under
  `/tmp/SEED-194-optimize-dashboard-test-feedback/slice3-*`.

### agent-launch-start-phases-host-collapse

- **Locations / scope:** `agent-launch-start-phases.spec.ts` Claude and Codex
  initiating/observing execution page journeys (store “kept, never running”
  case unchanged).
- **Observed cost:** focused file wall ≈9.20–9.77s (3 cases) under default
  workers on the SEED-195 host (2026-10-30); full-suite file `.tsv` ≈28.9s in
  the top-20% band.
- **Unique protection:** initiating/observing pages show the actual host
  throughout execution progress, including host-specific readiness wording on
  Claude argv / Codex `turn/start`.
- **Alternatives attempted:** keep Claude page journey only; focused wall
  9.14–9.38s / 2 cases over three passes — no wall gain; undone. Sibling
  Codex coverage in `agent-launch-start-codex.spec.ts` and
  `agent-launch-preparation-phases.spec.ts` remained green.
- **Disposition / rationale:** transferred — slice 4 of the
  [one replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Keep Claude execution and Codex refinement phase journeys; surviving Codex execution already checks the changed-readiness handoff. Remove the opposite repetitions.
  Implementation pending; expected savings remain unmeasured.
- **Date:** 2026-11-01
- **Evidence / follow-up:** SEED-195 slice 3 under
  `/tmp/SEED-195-optimize-dashboard-test-feedback/slice3-*`.

### story-review-completed-gaps-ambiguous-merge-collapse

- **Locations / scope:** `boundary/story-review-completed-gaps.spec.ts` loop
  case `ambiguous-merge`; driver/conflicts already assert related unavailable
  merge explanations.
- **Observed cost:** focused gaps file wall ≈10.34–11.18s under default
  workers on the SEED-196 host (2026-10-30).
- **Unique protection:** gaps-tier missing-agent recovery plus ambiguous-merge
  unavailable explanation beside other gap singles.
- **Alternatives attempted:** keep `missing-agent` only; focused wall
  9.48–11.51s — inconclusive; undone.
- **Disposition / rationale:** transferred — slice 5 of the
  [one replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Move the no-files assertion to the retained ambiguous printing-driver HTTP case, then remove the duplicate gaps iteration; keep missing-agent recovery.
  Implementation pending; expected savings remain unmeasured.
- **Date:** 2026-11-01
- **Evidence / follow-up:** SEED-196 slice 3 under
  `/tmp/SEED-196-optimize-dashboard-test-feedback/slice3-*`.

### agent-launch-recent-delete-dialog-delta

- **Locations / scope:** `agent-launch-recent-delete.spec.ts` Keep-focus /
  ask-first overlap with `agent-launch-story-card-delete.spec.ts`.
- **Observed cost:** full-suite file `.tsv` ≈26.8s on the SEED-196 baseline;
  launch-heavy placement steps dominate; only one Keep-focus overlap found.
- **Unique protection:** Recently done / sidebar / neighbouring-entry focus
  placement after delete.
- **Alternatives attempted:** none in SEED-196 — decisive checkpoint skipped
  the experiment as not plausible for suite wall.
- **Disposition / rationale:** transferred — slice 6 of the
  [one replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Keep distinct placement/focus/no-stop proof; remove generic dialog duplication and use real launch/mark HTTP operations for incidental setup.
  Implementation pending; expected savings remain unmeasured.
- **Date:** 2026-11-01
- **Evidence / follow-up:** SEED-196 slice 5 checkpoint in plan 423.

### ad-hoc-terminal-input-matrix

- **Locations / scope:** blank/text full-attachment loop in
  `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts`.
- **Observed cost:** no isolated timing retained; source review 2026-11-01.
- **Unique protection:** immediate terminal attachment, input, focus and detach;
  boundary already owns exact text and blank/whitespace native argv.
- **Alternatives attempted:** none; two equivalent full attachment journeys found.
- **Disposition / rationale:** transferred — reduce the repeated matrix in
  [plan slice 7](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Preserve blank UI submission proof and distinct close/reopen races. Not implemented.
- **Date:** 2026-11-01
- **Evidence / follow-up:** [value/cost review](../docs/maintainer/dashboard-test-value-review.md#7-previously-accepted-launch-poles).

### attention-report-http-admission-placement

- **Locations / scope:** eight refusal-body rows and cross-origin refusal in
  `dashboard/tests/agent-completion-attention.spec.ts`.
- **Observed cost:** whole attention case previously ≈39.6s; matrix not isolated.
- **Unique protection:** refused reports cannot replace the retained message;
  these raw HTTP requests do not exercise the attention page lifecycle.
- **Alternatives attempted:** none; existing completion-identity boundary setup
  is the proposed receiver, without another native launch fixture.
- **Disposition / rationale:** transferred — narrow the journey and retain
  real HTTP/store refusal proof in [plan slice 8](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).
  Expected runtime gain small; simpler proof ownership is independent value.
- **Date:** 2026-11-01
- **Evidence / follow-up:** [value/cost review](../docs/maintainer/dashboard-test-value-review.md#8-previously-accepted-attention-and-watcher-chains).
