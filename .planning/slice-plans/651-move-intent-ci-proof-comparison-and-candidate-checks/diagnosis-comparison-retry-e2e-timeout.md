# Diagnosis: comparison-retry-e2e-timeout

## Signature

`e2e/intent/intent-ci-comparison-retry.spec.ts:30` ("Check again recovers a
done Story Branch Baseline that failed once, then asks GitHub nothing") —
`Test timeout of 30000ms exceeded` while in `page.waitForResponse` at
`dashboard/tests/support/storyCiComparisonRetry.ts:25` (`checkComparisonAgain`,
spec line 52).

## Reproduction rate and conditions

- 2 of 2 local runs (job tmp `s6-e2e.log`: with `intent-ci-comparison.spec.ts`;
  `s6-e2e-retry.log`: retry spec alone), `--workers=1`, the worker's first
  test each time, load average ~32–35 on 16 cores from external Java/VM work,
  macOS on AC. The other two tests in those files passed (18.7–26.5 s).
- Branch CI (Linux) passed this spec on every published revision (latest run
  44075578994 on 4fb21c19a). Per-test CI duration not yet read (artifact
  download failed in the sandbox).

## Attribution

Pre-existing. The story's changes touch neither the spec nor its support.

## Evidence captured

Trace `e2e/test-results/2026-11-17T11-45-00.952Z-39991/.../trace.zip`
(unzipped to job tmp `trace-retry/`), seconds from Before Hooks:

- 0.24–11.52 worker fixture `dashboardServerInputsReady` (outside the test
  timeout: the timeout fires at 42.29 = 12.29 + 30).
- 11.53–16.22 `origin` (4.7 s), 16.22–18.86 `dashboard` (2.6 s), browser and
  page 18.89–19.99.
- 19.99–30.86 body `publishComparedStoryBranch` (real Git, 10.9 s, no browser
  action).
- 30.86–36.32 Navigate and select the done story (5.5 s).
- 36.32–41.16 first comparison read finishes (`.intent-ci-reading` count 0,
  4.8 s).
- 41.29 `waitForResponse` registered, then Check again click (done 41.60);
  42.29 timeout. The wait was registered before the click, so it is not a
  missed response; only 1.0 s of the budget remained for a read that took
  4.8 s the first time.
- Still to run after it: Check again recovery read, a remembered Check again,
  and reselecting the story.

## Hypotheses

1. (Leading) Budget exhaustion, not a racy wait: this test does the sibling
   tests' real-Git setup plus three comparison reads and a reselection, so at
   load ~30 its fixed work needs ~40 s against the 30 s test timeout.
   Experiment: retry spec alone, `--repeat-each=3 --workers=1 --trace=on`, to
   time each phase in a passing-or-failing run including the Check again
   reads. Stopping count: 3 repeats (6 tests), one batch.

   Result: batch stopped after the first test, which reproduced the
   signature (1/1, 31.0 s, load ~27–28). A failing trace stops at the bound, so
   it cannot time the remaining phases.
2. Instrument (diagnostic only, not a repair): the same spec at
   `--timeout=90000 --repeat-each=2 --workers=1 --trace=on` to time every
   phase of a completed run, separating real-Git setup, each comparison read,
   and the reselection. Stopping count: 2 repeats, one batch.

   Result: 2/2 passed at 32.9 s and 33.0 s (load ~29); the 30 s test
   timeout (test fixtures plus body) needs about 33 s. Repeat 1 phases (s):
   fixtures 4.8 (`origin` 1.1, `dashboard` 2.5; `origin` 5.4 when first in
   the worker), body real-Git `publishComparedStoryBranch` 9.5, open and
   select 4.7, first comparison read 5.2, Check again recovery read 3.2,
   remembered Check again 0.6, reselect after reload 3.0. No phase waits on a
   missed event; the bound is exceeded by fixed work.
3. Instrument: temporary `DIAG` laps in
   `dashboard/tests/support/storyCiComparisonDoneFixture.ts` (copy of the
   original at job tmp `doneFixture.orig.ts`; revert before return) to split
   the 9.5 s setup. Stopping count: 1 run of `:30`, `--timeout=90000`.

   Result (load ~27–28, passed at `--timeout=90000`): `precedeClaimWithPlanning`
   1.6 s, `completedPublishedStory` (real `publishTake` and CLI completion)
   5.6 s, history reads 0.1 s, `advanceCompletedTrunk` 0.5 s,
   `publishCommittedOrigin` 0.04 s. The setup is the shared real-CLI
   completion used by six specs; nothing in it repeats once-only work. The
   laps were reverted (file matches HEAD).

## Conclusion of round 1

- Root cause: not a racy or misanchored wait. The test bundles two retained
  journeys (Check again recovery; remembered answer on Check again and on
  reselection after reload) over the shared real-CLI setup. At load ~27–35 on
  16 cores it needs ~33 s of fixed work against the 30 s test timeout; Linux
  CI has headroom. The sibling `:81` and `intent-ci-comparison.spec.ts:40`
  do one or two reads and pass at 18.7–26.5 s.
- Splitting the test alone leaves each half at ~27–28 s under this load
  (setup 9.5 + fixtures 4.8 + open 4.7 + first read 3–5 + its own tail), so it
  would not remove the sensitivity. A durable repair needs one of: a cheaper
  shared done-story setup (5.6 s real CLI completion, used by six e2e specs),
  or moving the remembered-answer accounting to a cheaper level (backend
  `ci-comparison-memory-recovery.spec.ts:84` already proves a recovered
  answer is remembered; the proof map assigns browser API/upstream accounting
  to this E2E). Both change coverage ownership or shared setup beyond this
  diagnosis and go to the coordinator.
- Temporary diagnostic edits: none remaining.

## Round

Round 1 (clock `comparison-retry-e2e-timeout`).
