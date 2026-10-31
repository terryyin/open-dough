# Test Optimization Candidates

## Latest pass

- **Command / scope:** `npm run test:dashboard`, the full local dashboard
  suite with eight default workers on the developer's 16-CPU / 48-GiB Mac,
  investigating the top 40% of suite cost by recorded duration contribution.
  Both runs unset `NO_COLOR` and `FORCE_COLOR` and write separate
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES` records.
- **Revision:** `f351073d060ba25620d0c0a861b5b4c5cc9710d6` claim /
  `a8ab552db260cfef8d7a9667826cedbb2736601f` green baseline after Slice 1
  `doneAt` and `noFseventsPreload.cjs` fixture repairs;
  `125edc37d04f8c2062c25b1dd7c9a4309a8917a4` after Slices 2–5 (SEED-197,
  2026-10-31).
- **Before / after:** recorded wall (`durationMs`) 1,060.4s / 615.3s (outer
  wall 1,061.10s / 615.90s); summed attempt durations 7,835.3s / 4,456.8s;
  summed `.tsv` 8,203.6s / 4,689.9s; executed cases 1,746 / 1,742 (−4
  redundant cases), with 0 skipped cases and `strictStatus: "passed"` on both
  strict runs. Retained 4 families (`0` rejected experiments): (1) Slice 2
  worker-cached `publishPreparingJourney` + precomputed `reuseRefiner`
  (`--workers=1` `durationMs` median 32.88s → 30.77s, summed `.tsv` mean
  30.07s → 25.83s, `session-attribution.spec.ts` mean 15.23s → 6.90s /
  post-refactor 5.59s; suite pair `.tsv` 84.4s → 38.8s); (2) Slice 3
  `story-review-since-trunk.spec.ts` empty-diff printing-driver drop (7 → 6
  cases; focused `.tsv` mean 36.67s → 33.40s, `--workers=1` `durationMs`
  26.12s → mean 24.25s; suite `.tsv` 63.3s → 27.5s); (3) Slice 4
  `agent-launch-start-session-answer-touch.spec.ts` duplicate 430×932 drop
  (5 → 3 cases; focused `.tsv` mean 45.63s → 19.47s, `--workers=1`
  `durationMs` 34.94s → 22.84s; suite `.tsv` 29.9s → 8.6s); (4) Slice 5
  `story-review-trunk-worktree-ambiguity.spec.ts` combined passed-over
  worktrees (3 → 2 cases; focused `.tsv` mean 26.00s → 21.70s, `--workers=1`
  `durationMs` 41.29s → 31.80s; suite `.tsv` 29.9s → 13.5s).
- **Outcome:** measured gain — the four retained families demonstrate clear
  focused and `--workers=1` serial wall reductions while the whole-suite wall
  delta (1,060.4s → 615.3s, −445.1s) is qualified by unlike host load
  (pre-reboot end load 34.12 / 44.10 / 36.70 vs post-reboot end load
  27.35 / 20.88 / 18.40), so causal attribution rests on the controlled
  focused/serial measurements rather than the raw suite-wall delta alone.
- **Limits:** one full-suite before/after pair across a machine reboot and
  unlike multi-minute load (34.12 / 44.10 / 36.70 at baseline end vs
  27.35 / 20.88 / 18.40 after); pre-reboot `/tmp` artifacts were cleared by
  the reboot while `/tmp/SEED-197-optimize-dashboard-test-feedback/after-proof.json`
  and `after-times.tsv` remain from the post-reboot re-profile. No product
  behavior changed.
- **Evidence:** [SEED-197 measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-197-2026-10-31).
  Plan recoverable at the before-cleanup commit
  `7b9777c78c127519d78fe1423080851bd2476b72:.planning/slice-plans/424-optimize-dashboard-test-feedback/PLAN.md`.
  Raw post-reboot records under `/tmp/SEED-197-optimize-dashboard-test-feedback/`
  on the measurement host; their continued availability is not assumed.

## Pending candidates

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
- **Disposition / rationale:** pending — design/placement still matches
  dashboard guidance (server-answer variants belong at boundary) but lacks a
  measured local-suite-wall claim; reopen only with a wall-improving approach
  or an explicitly authorized design-only change.
- **Date:** 2026-10-30
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
- **Disposition / rationale:** pending — page-path equivalence remains
  plausible but dropping one story workflow does not move focused wall while
  longer catalog/effort siblings dominate; reopen only with a wall-improving
  approach (for example shared setup across the family).
- **Date:** 2026-10-30
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
- **Disposition / rationale:** pending — host duplication remains plausible
  under dashboard guidance but dropping one host does not move focused wall
  while the remaining journey and store case dominate; reopen only with a
  wall-improving approach.
- **Date:** 2026-10-30
- **Evidence / follow-up:** SEED-195 slice 3 under
  `/tmp/SEED-195-optimize-dashboard-test-feedback/slice3-*`.

### story-review-completed-journey-landed-runs-tail

- **Locations / scope:** `story-review-completed.spec.ts` trailing
  `keepUnusableCompletedCapture` + Landed runs radio + gap copy; gaps boundary
  already owns the same server-answer variant.
- **Observed cost:** focused journey wall ≈9.69–10.00s (1 case) under default
  workers on the SEED-196 host (2026-10-30).
- **Unique protection:** page path for published completion after trunk
  advance and literal file diffs; Landed-runs gap UI is the overlapping tail.
- **Alternatives attempted:** end journey before unusable-capture / Landed
  runs; focused wall 11.07–11.51s — no wall gain; undone.
- **Disposition / rationale:** pending — journey-once / boundary-variants
  placement remains plausible; reopen only with a wall-improving approach.
- **Date:** 2026-10-30
- **Evidence / follow-up:** SEED-196 slice 2 under
  `/tmp/SEED-196-optimize-dashboard-test-feedback/slice2-*`.

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
- **Disposition / rationale:** pending — overlap remains plausible; reopen
  only with a wall-improving approach.
- **Date:** 2026-10-30
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
- **Disposition / rationale:** pending — sibling-delta structure remains
  plausible; reopen only with a wall-improving approach (for example shared
  launch setup), not dialog-only trimming.
- **Date:** 2026-10-30
- **Evidence / follow-up:** SEED-196 slice 5 checkpoint in plan 423.

## Accepted necessary costs

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
  multi-step journeys. Acceptance filters, skips, and excludes nothing;
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
  integrated protection, preserving the accepted coverage decision. Any
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

None.
