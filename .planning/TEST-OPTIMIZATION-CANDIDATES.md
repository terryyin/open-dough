# Test Optimization Candidates

## Latest pass

- **Command / scope:** `npm run test:dashboard`, the full local dashboard
  suite with eight default workers on the developer's 16-CPU / 48-GiB Mac.
  Both runs unset `NO_COLOR` and write a separate
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD`.
- **Revision:** `3060f8f592f7ff17b944c1dfc034aa64b0442aae` before;
  `a047236bd230a5759b2d1c5d4917fa24770b5587` after
  (SEED-177, 2026-10-30).
- **Before / after:** recorded wall (`durationMs`) 751.0s / 741.4s;
  executed cases 1,754 / 1,754, with no skipped cases. Both strict runs passed.
- **Outcome:** measured gain — approximately 9.6s (1.3%) shorter full-suite
  wall time. The change-wait boundary case fell from 34.6s to 3.9s; focused
  family wall with one worker fell from 38.63s to 7.41–10.57s over three
  consecutive passes. The test observes a configured 500ms bound; the
  production default remains 30s.
- **Limits:** one full-suite before/after pair under comparable recorded load
  (start averages 5.18 / 4.98 / 6.77 before, 4.79 / 7.04 / 10.55 after).
  This is a modest local observation, not a guaranteed saving or a CI claim.
  Migration on 2026-10-30 carries forward this latest measured pass and the
  accepted SEED-178 triage decisions; it runs no new profile or experiment.
- **Evidence:** [SEED-177 measurements](../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-177-2026-10-30).
  The original plan and literal proof-record commands are recoverable at
  `feafb526:.planning/slice-plans/413-optimize-dashboard-test-feedback/PLAN.md`.
  Raw records were retained outside Git under
  `/tmp/SEED-177-optimize-dashboard-test-feedback/` on the measurement host;
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

### touch-viewport-matrices

- **Locations / scope:** the fourteen dashboard specs using
  `dashboard/tests/touchLaunchPage.ts`, including settings reading, OpenAI
  recovery, and terminal-theme matrices; 36 cases at refinement.
- **Observed cost:** hosted run 40796911428 at `930974d6` recorded 237 of
  7,460 summed test-seconds in the 24 matrix cases (3.2%), and 322s in the
  full family (4.3%). Two green local suite baselines under like load differed
  by 150s, more than the family's whole cost. Summed case durations are not
  wall time; no suite-wall saving is established.
- **Unique protection:** native touch input and terminal fitting at reduced
  height, touch scrollback, rotation preserving drafts/selections/reading
  position, coarse Done-row disclosure, the 430×932 answer-row band and held
  progress answer, tablet side-by-side review, and a live terminal through a
  settings round trip with viewport changes.
- **Alternatives attempted:** resolve-only triage created a replacement plan
  without profiling or implementing removals. Refinement classified actual
  layout branches and named surviving proof; a shared viewport helper alone
  does not establish redundancy.
- **Disposition / rationale:** transferred obligation —
  [SEED-180](seeds/SEED-180-optimize-dashboard-touch-viewport-tests.md#optimize-dashboard-touch-viewport-tests)
  and [plan 413](slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md)
  own implementation and verification. The story is Taken; this pointer does
  not claim its work is implemented. Its selected outcome is fewer redundant
  cases with preserved proof and comparable focused-family timing; the
  ordinary suite is a green check, with suite-wall claims outside scope.
- **Date:** 2026-10-30
- **Evidence / follow-up:** [plan 413's surviving-proof table and ordered work](slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md#family-and-surviving-proof);
  completed SEED-178 triage at `d6bf4531` / `03424649`, separated from the
  implementation story at `fd5303c0`. Keep this entry until the receiving work
  closes; remove completed obligations then and return any unfinished part
  to Pending candidates.
