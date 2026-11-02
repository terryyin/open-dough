# Test Optimization Candidates

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
  multi-step journeys. SEED-208 slice 7 reduced the terminal input matrix to
  one text journey; the races' poll waits are transferred below. Acceptance excludes nothing;
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
  the attention journey's poll waits are transferred below. Any
  further variant removal or boundary move needs separately authorized scope
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
- **Disposition / rationale:** transferred — the four waits share one
  cost (the page's next scheduled launch-records read), and the existing paused
  page clock with one-read pace drives the same real read, so cheaper proof
  preserves the protection; this is not a necessary cost and no product or
  confidence trade-off needs a decision. The replacement keeps
  `withholdLaunchOutcomes` unchanged and adds no clock mechanism. Planned, not
  implemented.
- **Date:** 2026-11-02 (recorded 2026-11-01)
- **Evidence / follow-up:** replacement plan
  [448](slice-plans/448-launch-records-poll-waits/PLAN.md) for
  [SEED-221#launch-records-poll-waits](seeds/SEED-221-launch-records-poll-waits.md#launch-records-poll-waits);
  its focused baseline is a planned prerequisite. Origin: SEED-208 slices 7
  and 8 Results in
  `40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md`.
