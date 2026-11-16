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
