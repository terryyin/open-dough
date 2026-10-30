# Test Optimization Candidates

## Latest pass

- **Command / scope:** `npm run test:dashboard`, the full local dashboard
  suite with eight default workers on the developer's 16-CPU / 48-GiB Mac,
  investigating the top 20% of suite cost by recorded duration contribution.
  Both runs unset `NO_COLOR` and `FORCE_COLOR` and write separate
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES` records.
- **Revision:** `bb8924b803309e101c8a8f5fb7117c0f72c442aa` before (green
  baseline after admit); `45cc3fba8446a3efae06f3d187bbf38f7b56fcd3` after
  (SEED-195, 2026-10-30).
- **Before / after:** recorded wall (`durationMs`) 670.0s / 665.8s (outer wall
  670.51s / 666.30s); summed attempt durations 4,882.2s / 4,898.9s; executed
  cases 1,746 / 1,746, with 0 skipped cases. Both strict runs passed. Focused
  `boundary/agent-launch-preparation-codex-retry.spec.ts` wall 14.6–16.5s →
  9.5–10.9s over three passes; full-suite file `.tsv` for that file 56.2s →
  39.0s (before from the contemporaneous Slice 1 ranking; after from the
  re-profile artifact).
- **Outcome:** measured gain — 4.1s (0.6%) shorter full-suite `durationMs`
  with strong focused-family evidence from collapsing repeated independent
  Story-B launches among Codex retained-retry damage cases (ten refusals
  retained; independent launch kept once on `workspace`). Rejected: collapsing
  `agent-launch-start-phases` Codex host journey (focused wall 9.20–9.77s /
  3 → 9.14–9.38s / 2; undone).
- **Limits:** one full-suite before/after pair on the local host (start load
  averages 5.86 / 5.38 / 8.73 before vs 6.87 / 11.42 / 14.47 after; end load
  averages 19.94 / 22.37 / 18.81 before vs 22.81 / 23.19 / 20.18 after), backed
  by three consecutive focused passes for the retained family. After run
  started under higher multi-minute load; suite-wall delta is modest and
  directional with the focused-family evidence. The baseline
  `OPEN_DOUGH_DASHBOARD_TIMES` file was later overwritten by focused runs that
  inherited that environment variable; wall and proof JSON remain
  authoritative, and the before file cost for the retained family was taken
  from the Slice 1 ranking written before that overwrite. No product behavior
  changed.
- **Evidence:** [SEED-195 measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-195-2026-10-30).
  Plan recoverable at the story-branch tip for SEED-195
  (`.planning/slice-plans/422-optimize-dashboard-test-feedback/PLAN.md`). Raw
  records under `/tmp/SEED-195-optimize-dashboard-test-feedback/` on the
  measurement host; their continued availability is not assumed.

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
