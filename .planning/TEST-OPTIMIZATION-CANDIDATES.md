# Test Optimization Candidates

## Pending candidates

### auto-refresh-rate-limit-real-waits

- **Locations / scope:** `dashboard/tests/observation/auto-refresh-rate-limit.spec.ts`,
  the one case, with its case-local `test.setTimeout(45_000)`.
- **Observed cost:** 25.2s in hosted run 42372706379; 21.7s locally before
  SEED-260 slice 2 and 21.5s after it (2 workers, load about 4–6,
  2026-11-07). About 20s is real time passing: a 2s `Retry-After` wait, then
  a `X-RateLimit-Reset` wait of 16–18s.
- **Unique protection:** the page asks nothing, even when seen again, before
  GitHub's directed time; the check at that time reads B and clears the
  failure; a reset-time wait longer than the 15s pace proves the next check
  follows the directed time, not the pace; the steady pace then returns.
- **Alternatives attempted:** the page clock is already paused and stepped.
  The server cannot pass the waits sooner because the request owner
  (`src/skills/dough-execute-plan/scripts/github-request-admission.mjs`,
  a separate released-payload process) holds every read by its real clock.
  The reset wait cannot be shortened below the 15s pace without losing the
  directed-time-versus-pace distinction. The shared-observation clock seam
  added in the same slice (`dashboard/server/observationClock.ts`) does not
  reach the request owner.
- **Follow-up:** decide whether the request owner may take a test-controlled
  clock, as the dashboard server's reuse window now does; with it the case
  can drop the allowance and the real waits. The same seam would remove the
  6s directed-wait span left in
  `revision-stream-lost.spec.ts` (rate-limited stream case).
- **Date:** 2026-11-07

### production-deployment-pinned-build

- **Locations / scope:** `dashboard/tests/runtime/production-deployment.spec.ts`,
  the pinned install, build and serve case, with its case-local
  `test.setTimeout(45_000)`.
- **Observed cost:** 32.1s in hosted run 42372706379. Locally 10.4s before
  SEED-260 slice 6 and 7.3s after it (2 workers, load about 2–4); 15.5–28.5s
  in a six-worker repeated family run at load about 14 (2026-11-08).
- **Unique protection:** the pinned commit, not the later main, is fetched,
  installed with `npm ci`, built and served from its own checkout outside
  development, with local cartoons and supplied icons, the preview boundaries,
  and a clean preview stop recorded in its incident record.
- **Alternatives attempted:** the full-source fixture now adds its copy in one
  pack (`core.bigFileThreshold=1`), which removed most of its contended
  `git add` cost. The remaining cost is the real dependency install (about
  11,000 files) and Vite build the case proves; a substitute or shared build
  would lose that proof, and moving staging into a shared hook would only
  move the cost there.
- **Disposition / rationale:** pending — the case keeps the smallest
  allowance above its measured hosted cost until hosted timing after the
  fixture change shows whether it is still needed.
- **Follow-up:** hosted run 42406259249 measured 17.4s (32.1s before
  SEED-260 slice 6); hosted cases vary up to about 2x between runs. Remove the
  allowance once two or more hosted runs keep it at 15s or less, or reduce the
  real install and build cost further.
- **Date:** 2026-11-08
- **Evidence / follow-up:** read this case's hosted duration after slice 6. If
  it stays well inside 30s, drop the allowance; otherwise decide whether a
  cheaper dependency set may stand in for the full install.

## Accepted necessary costs

### story-review-completed-journey-landed-runs-tail

- **Locations / scope:** `dashboard/tests/review/story-review-completed.spec.ts` trailing
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
  `dashboard/tests/terminals/agent-launch-ad-hoc-terminal.spec.ts` and the remaining
  integrated journey in `dashboard/tests/launches/agent-launch-second-server.spec.ts`.
- **Observed cost:** the second-server case measured 64.6s before the
  SEED-176 change-wait boundary move and 52.5s / 51.2s after on the developer's
  Mac. Whole-suite runs had unlike or contended load, so these case timings
  establish no comparable suite-wall gain. No separate ad-hoc-terminal
  timing was retained in the legacy disposition. After SEED-221 removed the
  close/reopen races' poll waits, focused runs of the ad-hoc-terminal spec
  took 1.7–1.9s per race against a 16.4–17.0s baseline (local, load 4.7–5.4,
  2026-11-02). SEED-260 slice 4 passed the second-server page's reads with
  the paused page clock and gave the second server its own short slow-start
  threshold: 48.9s → 6.3s locally (load 4–6), from 55.6s in CI, at the
  default case timeout.
- **Unique protection:** dual-preview page protection through reload and
  project switch, and immediate terminal attachment after an ad hoc launch.
- **Alternatives attempted:** cheaper server-only refusal and non-owner
  change-wait checks already moved to boundary tests in SEED-176; SEED-177
  subsequently shortened the boundary's configured bound. No further cheap
  replacement for the remaining integrated protection was established.
- **Disposition / rationale:** accepted necessary cost — preserve the unique
  multi-step journeys. SEED-208 slice 7 reduced the terminal input matrix to
  one text journey; the races now pass their launch-records read with the
  paused page clock instead of a poll wait. Acceptance excludes nothing;
  normal verification and CI continue running them. The project has no
  profile-exclusion mechanism. Reopen only with new evidence.
- **Date:** 2026-10-30
- **Evidence / follow-up:** [SEED-176 local measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-2026-10-29--2026-10-30);
  accepted triage at `03424649`, with its final ownership clarification at
  `fd5303c0`. These decisions survive SEED-176/SEED-177 cleanup.

### long-integrated-journeys

- **Locations / scope:** `dashboard/tests/sessions/agent-completion-attention.spec.ts`
  and the production-watcher chains in `dashboard/tests/runtime/production-watcher.spec.ts`,
  `dashboard/tests/runtime/production-watcher-updates.spec.ts`, and
  `dashboard/tests/runtime/production-watcher-failures.spec.ts`.
- **Observed cost:** the SEED-177 local baseline recorded an approximately
  39.6s attention case. Earlier hosted production-update chains, including
  shared hooks, varied from 116.84s to 194.81s on Ubuntu 24.04 with twelve
  shards and four workers per shard. These are case/chain timings, not
  additive local suite-wall savings; the chain showed no reliable elapsed
  improvement. After SEED-221 removed the attention journey's two poll waits,
  focused runs took 6.1–7.0s against a 36.1–36.2s baseline (local, load
  12.6–13.3, 2026-11-02). SEED-260 slice 6 added the full-source fixture in one
  pack and moved the first activation from the lifecycle and update hooks into
  the first test that asserts it. Their hooks went from 24.1s and 28.6s in CI
  (13.9s and 13.5s locally) to 4.5s and 5.4s locally, and the failure file's
  hook from 10.5s to 7.5s, all at the default timeout. The failure file's
  first activation then also moved from its hook into its first test, since
  hosted CI showed a single staging costs about 11–15s, so each failure-file
  test stages at most one deployment. The two-build held
  update and the policy case were split into serial steps. Slice 7 split the
  82.1s CI recovery case (27.0s locally) into five serial steps, each at most
  6.1s locally. Its documentation-only commit now reaches main while the
  failing commit's build is held, and that build consumes its one-shot cause
  as it fails, so the failed commit is not retried and the next commit does
  not fail first; the steps assert both. The failure file's two-build cases became
  serial steps with a separate restart step. Every case override in these
  files was removed.
- **Unique protection:** attention reporting remains durable and readable
  through column changes, retirement, restart, Mark as read, and Mark as done;
  production-watcher journeys retain real activation, published-policy,
  failure/recovery, serving, and cleanup protection across steps.
- **Alternatives attempted:** earlier policy consolidation moved detailed
  qualification proof to a real-Git boundary case and removed two successful
  activations while retaining the watcher journey. SEED-177 closed without
  further narrowing these long journeys.
- **Disposition / rationale:** accepted necessary cost — retain unique
  integrated protection, preserving the accepted coverage decision. SEED-208
  slice 8 moved the raw refusal rows to `boundary/agent-completion-identity`;
  the attention journey now passes its launch-records reads with the paused
  page clock instead of poll waits. Any further variant removal or boundary
  move needs separately authorized scope
  and established replacement proof; acceptance grants no coverage reduction
  or profile exclusion. Normal verification and CI keep these tests.
- **Date:** 2026-10-30
- **Evidence / follow-up:** accepted triage at `03424649`; SEED-177 baseline
  analysis in
  `7732299ae62a72d8a292f6dbfc854eb08e10037d:.planning/slice-plans/413-optimize-dashboard-test-feedback/PLAN.md`;
  [production-policy proof and measurements](../docs/maintainer/production-policy-test-timings.md).
  Plan 413 explicitly excludes thinning these necessary-cost journeys.

## Profile-only exclusions

None.

## Transferred obligations

None.
