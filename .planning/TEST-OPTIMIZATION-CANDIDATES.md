# Test Optimization Candidates

## Latest pass

- **Command / scope:** `npm run test:dashboard`, the full local dashboard
  suite with eight default workers on the developer's 16-CPU / 48-GiB Mac.
  Both runs unset `NO_COLOR` and `FORCE_COLOR` and write separate
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES` records.
- **Revision:** `02ddad60e3694cd7986ef443876cc9d8a6bcc3a3` before (green
  baseline after admit); `276ef912c2c49083acc8a85a766ab2a5d33ec677` after
  (SEED-194, 2026-10-30).
- **Before / after:** recorded wall (`durationMs`) 679.6s / 657.2s (outer wall
  680.10s / 657.90s); summed attempt durations 4,958.5s / 4,797.1s; summed
  spec durations (including hooks) 5,207.2s / 5,064.9s; executed cases
  1,750 / 1,746 (`−4` Claude launch-dialog model kind-matrix journeys),
  with 0 skipped cases. Both strict runs passed.
- **Outcome:** measured gain — 22.4s (3.3%) shorter full-suite `durationMs`
  and 161.4s lower summed attempt time from collapsing
  `agent-launch-model.spec.ts` kind matrix to one offers-Model layout journey
  plus one Default-without-`--model` journey (focused file 13.3–16.4s / 11
  cases → 10.0–11.7s / 7 cases over three passes). Rejected: collapsing Codex
  discovered-model story workflows (`execution`/`refinement`/`ad-hoc`) to two
  journeys (focused family wall 10.2–12.1s / 13 → 11.0–11.6s / 12; undone).
- **Limits:** one full-suite before/after pair on the local host (start load
  averages 6.53 / 5.26 / 5.15 before vs 8.70 / 14.82 / 17.30 after; end load
  averages 43.44 / 35.64 / 22.34 before vs 30.23 / 26.65 / 23.62 after), backed
  by three consecutive focused passes for the retained family. After run
  started under higher multi-minute load; treat suite-wall delta as directional
  with the focused-family evidence. No product behavior changed.
- **Evidence:** [SEED-194 measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-194-2026-10-30).
  Plan at `.planning/slice-plans/421-optimize-dashboard-test-feedback/PLAN.md`
  until wrap-up cleanup. Raw records under
  `/tmp/SEED-194-optimize-dashboard-test-feedback/` on the measurement host;
  their continued availability is not assumed.

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
