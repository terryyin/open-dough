# Test Optimization Candidates

## Live candidates

### revision-check-page-time-steps

- **Affected test or fixture:** `dashboard/tests/autoRefreshJourney.ts`
  `passTimeUntilAsked` (via `passTimeUntilChecked`), reached by 10
  `dashboard/frontend-tests` specs (19 cases) and its other consumers across
  `dashboard/tests`, `dashboard/backend-tests` and `e2e`.
- **Observed cost and conditions:** the helper advances the paused page clock
  250 ms at a time and asks the page after each step: about 61 round-trip
  pairs per 15-second check. The 10 frontend specs summed 29.7–44.1 s at
  `--workers=1` (local, 2026-11-16, load 6–12; unchanged runs spread 11 s).
- **Unique protection:** the pace of revision checks (`expectSteadyPace`'s
  bound) and every journey's wait for the page's next periodic check.
- **Alternatives tried:** a 1 s step between the first and last fine 250 ms
  steps (about 20 round trips per check), 2026-11-16: round 1 was
  inconclusive (load rose 8.9 → 13.3); round 2 before 33.2, 44.1, 35.7 s,
  after 29.4, 33.5, 28.8 s, every pair lower but 33.5 above 33.2, so it
  missed the keep rule by 0.3 s and was undone. A planning probe with a
  uniform 1 s step (which loses the pace bound) measured 30.5, 29.8, 29.7 s
  unchanged against 28.6, 27.2, 26.1 s. Untried: each `page.clock.runFor` call also
  appends to Playwright's replayed clock log, which may cost more per step
  than the `askedAfter` evaluation.
- **Decision or evidence needed:** a quieter-machine or CI-sum comparison of
  the coarse step (or of fewer `runFor` calls, e.g. one `runFor` to just
  before the check is due), showing every after-run below every before-run.

### paused-supplier-starting-state

- **Affected test or fixture:** `Distribution/evaluation/cases/guidance-checks/supplier-fixture.sh`,
  the paused-supplier starting project built for each scripted session by the
  `Distribution/evaluation/tests/native-guidance-checks/` checks (through
  `support/native-comparison-pair-fixture.sh` and `case_materialize`).
- **Observed cost and conditions:** native-guidance-checks summed 446 job-s of
  Distribution Tests share 2 on CI run 44213987087 (2026-11-18). Locally each
  scripted session took about 5 s, about 54% of it in `supplier-fixture.sh`
  (75 Git calls), at load 4.7–7.7. Share 2 exhausted its 320 s run deadline on
  slow runners (run 44214090643; main 44201614131); after merging duplicate
  setup across the baseline and launch-command checks (local 266 s to 181 s),
  share 2 passed in 3 min 45 s on the next run.
- **Unique protection:** the native guidance checks' fresh-versus-reused
  baseline acquisition, session counts and each input kind's comparison
  observations, on the recorded paused-supplier case that paid native
  comparisons use.
- **Alternatives tried:** merging duplicate setup and captures (done); a
  bounded pass over `Distribution/evaluation/tests/git-publication` found no
  test-only redundancy above 30 job-s (about 15–18 CI job-s of small
  candidates left: the story-closure observer's second fresh fixture, the
  review and refinement `pushes` variants, admission-wrapper overhead).
- **Decision or evidence needed:** whether to build a lighter paused-supplier
  starting state, which changes the case basis so saved native baselines must
  be recaptured, or to change the share's run budget or shard split; CI share-2
  times on slow runners after the merges show how much margin remains.

### done-capture-family-timeout-margin

- **Affected test or fixture:** `dashboard/backend-tests/support/doneCaptureCase.ts`
  (`aCheckout`, `work`, `markDone`), shared by the Done capture family under
  `dashboard/backend-tests/review/`, including `ad-hoc-branch-result.spec.ts`,
  `ad-hoc-branch-entry-attribution.spec.ts:55`,
  `ad-hoc-manual-landing.spec.ts:57` and `ad-hoc-branch-cursor-recovery.spec.ts`.
- **Observed cost and conditions:** cases run 2 to 4 s against Vitest's 5 s
  default timeout at load 9 to 10. The slowest was entry attribution at
  3.3 s, and manual landing ran 3.9 s at load 5 to 9. At load 16 to 18 from
  other processes, several cases timed out at 5 s. Local, `--workers=2`,
  2026-11-20, plan 732 (SEED-413#ad-hoc-branch-result-handoff) at
  `c1e18bff8`. Hosted CI passed.
- **Unique protection:** Done capture of isolated and declared branches,
  manual landing and pin ownership, against real Git with kept records.
- **Alternatives tried:** none measured. Raising timeouts is ruled out by
  AGENTS.md. One case committed and reviewed its two sessions concurrently,
  which brought it from 5.0 s (timed out) to 2.2–3.8 s.
- **Decision or evidence needed:** a profile of where `aCheckout`, `work` and
  Done capture spend their time per case, to choose a shared setup saving
  that brings the family well under the limit at load 16+.
