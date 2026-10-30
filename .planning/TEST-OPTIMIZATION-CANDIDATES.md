# Test Optimization Candidates

## Latest pass

- **Command / scope:** `npm run test:dashboard`, the full local dashboard
  suite with eight default workers on the developer's 16-CPU / 48-GiB Mac.
  Both runs unset `NO_COLOR` and write separate
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES` records.
- **Revision:** `7225da81df32e6fc59debf9b2943f3166335c9f5` before;
  `b374ab6b45a38046e61138715ad8a42586572d8b` after
  (SEED-191, 2026-10-30).
- **Before / after:** recorded wall (`durationMs`) 950.8s / 554.3s (outer wall
  951.4s / 554.7s); summed attempt durations 6,508.3s / 4,080.8s; summed spec
  durations (including `beforeAll`/`afterAll` hooks) 7,283.5s / 4,283.3s;
  executed cases 1,751 / 1,747 (`1,751 → 1,745` on the baseline set from `-6`
  redundant voice provider-failure browser journeys replaced by boundary
  assertions, plus `+2` diff-context cases merged from `0154843a` SEED-189),
  with 0 skipped cases. Both strict runs passed.
- **Outcome:** measured gain — 396.5s (41.7%) shorter full-suite `durationMs`
  and 3,000.2s (41.2%) lower summed spec time across three retained family
  improvements: (1) worker-scoped caching of the read-only
  `publishStoryColumnsJourney()` origin in `dashboard/tests/launchJourney.ts`
  (focused 4 specs / 15 cases at `--workers=1`: 51.8s → 38.5–41.2s; full-suite
  44-spec shared hook time: 615.0s → 87.8s), (2) `doneRenameWaitMs: 100` for
  non-subject Claude `markDone` / `closeOpenSessions` cleanup while preserving
  `boundary/agent-launch-done-rename-wait.spec.ts` and the 5,000ms production
  default (focused 15 specs / 83 cases: 48.8s → 21.5–22.8s, summed spec time
  272.3s → 101.8–109.0s; full-suite 15 specs: 251.8s → 64.4s), and (3) moving
  6 upstream OpenAI status/payload variants (`401`, `429`, `500`, `200` empty,
  `200` malformed, socket error; all 8 variants + `bytes > 0` proved in
  `boundary/session-instruction-voice-boundary.spec.ts`) out of browser
  journeys while seeding non-settings voice specs via `seedVoiceKey` and
  preserving the refusal retry, `deadline`, and `saveVoiceKey(page)` UI
  settings journeys (focused 7 voice specs: 16.1s → 13.1–13.2s, summed spec
  time 65.9s → 45.0–45.6s, `provider-failures` 21.1s → 5.5–5.8s).
- **Limits:** one full-suite before/after pair on the local host (start load
  averages 9.93 / 11.35 / 10.54 before vs 4.62 / 4.81 / 6.19 after; end load
  averages 56.08 / 54.43 / 39.26 before vs 20.86 / 16.95 / 12.41 after), backed
  by three consecutive passes per focused family under comparable load. Higher
  baseline load partly reflected 36 redundant per-file Git fixture builds per
  suite run; exact full-suite wall savings vary with host load. No product
  behavior changed and no experiments were rejected.
- **Evidence:** [SEED-191 measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-191-2026-10-30).
  The original plan and source review are recoverable at
  `0bb810742a61e7ded6b51989b26a5eb9df8f8a43:.planning/slice-plans/419-optimize-dashboard-test-feedback/PLAN.md`.
  Raw records were retained outside Git under
  `/tmp/SEED-191-optimize-dashboard-test-feedback/` on the measurement host;
  their continued availability is not assumed.

## Pending candidates

None.

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
