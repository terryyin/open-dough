# Test Optimization Candidates

## Latest pass

- **Command / scope:** SEED-208 slice 9, 2026-11-01: normal
  `npm run test:dashboard` (local default two workers) for reference
  `e83dfeb3` in a temporary checkout, then the candidate, back to back on the
  developer's 16-core Mac; strict proof and `.tsv` records outside the repository.
- **Revision:** reference `e83dfeb3a5cd078fc84cfa9e1d74d79e5cf1f185`; candidate
  `c727fb2e` plus the slice 9 paging and Codex-model fixes (the later
  room-spec wait and Codex fixture defaults were proved by focused runs only).
- **Before / after:** reference 1,831 cases, 0 skipped, 1,701.9s wall,
  3,228.6 summed test seconds, 1-minute load 4.8–12.4 (mean 7.3), one
  untouched failure (`recently-done-sessions-sidebar-room.spec.ts:34`).
  Candidate: 1,827 cases, 0 skipped, strict pass,
  1,654.4s wall, 3,149.9s summed, load 4.2–10.3 (mean 6.0).
- **Outcome:** the seven transferred obligations are implemented (SEED-208
  slices 2–8) and no longer listed. Four fewer cases. Files the story changed
  went from 199.5 to 172.0 summed seconds; the files it did not change also
  fell by 51s (1.7%) under the lower load, so the 0.97 wall ratio is not
  claimed as a speedup.
- **Limits:** one pair only; the candidate ran under lower load. Retained
  changes are coverage simplifications; slice 4's phase family is the only
  focused `--workers=1` reduction measured (38s to 27s wall).
- **Evidence:** [value/cost assessment](../docs/maintainer/dashboard-test-value-review.md);
  [replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md)
  slice Results; records under `~/.claude/jobs/e8e9da13/tmp/final-*`.

## Pending candidates

### launch-records-poll-waits

- **Locations / scope:** `agent-completion-attention.spec.ts` (waits for the
  reported message and for "Unfinished work" on the card) and the two
  close/reopen races in `agent-launch-ad-hoc-terminal.spec.ts`.
- **Observed cost:** a timestamped diagnostic of the attention journey spent
  14.9s on each of its two waits, about 30s of its 35s; each race spends about
  15s after `release()`. All four wait for the page's next launch-records read,
  `checkIntervalMs` (15s) after the previous one (`src/agentLaunches.ts:176`,
  `src/revisionCheckSchedule.ts:31`). About 60 summed seconds in all.
- **Unique protection:** a delivered report reaches the open page without a
  reload; the races keep a closed or reopened terminal as the developer left it.
- **Alternatives attempted:** none. The existing page clock and one-read pace
  (`pausePageClockAt` in `dashboardTest.ts`, `watchRecordReads(page).passOnePace`
  in `sessionStatePace.ts`) drive the same real read without a 15s wait.
- **Disposition / rationale:** pending — a cheaper design that reuses existing
  test infrastructure is credible, so this is not accepted as a necessary cost.
  It was not tried because SEED-208 kept the attention lifecycle and both races
  unchanged. The races still rewrite launch responses
  (`withholdLaunchOutcomes`); a clock change must not extend that mechanism.
- **Date:** 2026-11-01
- **Evidence / follow-up:** SEED-208 slices 7 and 8 Results in the
  [replacement plan](slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).

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
  multi-step journeys. SEED-208 slice 7 reduced the terminal input matrix to
  one text journey; the races' poll waits are pending above. Acceptance excludes nothing;
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
  integrated protection, preserving the accepted coverage decision. SEED-208
  slice 8 moved the raw refusal rows to `boundary/agent-completion-identity`;
  the attention journey's poll waits are pending above. Any
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
