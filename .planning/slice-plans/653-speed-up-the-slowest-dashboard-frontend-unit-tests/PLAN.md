# Speed up the slowest dashboard frontend unit tests

**Identity:** SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests
**Source:** [Speed up the slowest dashboard frontend unit tests](../../seeds/SEED-380-speed-up-the-slowest-dashboard-frontend-unit-tests.md#speed-up-the-slowest-dashboard-frontend-unit-tests)
**Source review:** [source review](source-review.md)

## Goal and scope

Dashboard contributors get faster local feedback from
`npm run test:dashboard:frontend` with the same behavioral protection. The work
is the 46 slowest cases of the baseline below (the slowest 10% of 456), taken
by cost family. A shared cause is changed once for all its consumers. Each
change is kept only on a measured gain; the plan follows
[dough-test-optimization](../../../.agents/skills/dough-test-optimization/SKILL.md)
and its [tactics](../../../.agents/skills/dough-test-optimization/references/optimization-tactics.md).

Exclusions: CI job layout and worker counts; cases outside the group, except
through a shared cause; product behavior.

## Evidence read

- **Attempt:** CI run 43773156778 attempt 1 (green) at `09e70e926`,
  `dashboard-frontend` job report: 456 cases, 975 s summed, no gaps. The 46
  slowest are each 3.9 s or longer and sum to 240 s. Run 43755447775 timed the
  same 46 at 247 s (3% variation); 43 of them were in its own slowest 46.
- **Selection:** the unfiltered frontend group, one shard, as `ci.yml` runs it.
- **Where the group's 240 s goes (CI step sums):** page evaluations 58 s over
  1,913 calls, clicks 32 s, page loads and reloads 35 s, waits for a revision
  check's answer 10 s, first-on-worker app server start 9 s, bounding-box reads
  9 s. No case sleeps; the long cases are long chains of short steps.
- **Local scale:** the group's 42 files (78 cases) ran in 1.4 min at two
  workers on 2026-11-16, load 3–5; the group's cases summed 117 s and 119 s in
  two unchanged runs (2% variation).

**Saving worth keeping:** for one experiment, the family's summed case time
drops by at least 5% with every after-run below every before-run. For the
story, 24 s of the group's 240 s CI sum (10%, three times its variation). The
readable removable cost is modest: the leads below add up to roughly 30–45 s
of CI case time. At two local workers that is under 15 s of a wait of about
four minutes, so a whole-suite claim needs its own measurement.

## Settled premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Focused timing reads per-case durations locally | every slice's before/after | `PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --workers=1 --reporter=list <files>` in this workspace at `163eafdf3`, 2026-11-16 | passes; each case line ends with its duration. `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` wrote no file on a filtered run |
| Reduced motion shortens the group | slice 1 | scratch `contextOptions: { reducedMotion: "reduce" }` in `frontend.playwright.config.ts`, group files, alternated with unchanged runs | all 78 pass; group sum 120 s against 117 s and 119 s unchanged: no gain. A later pair under load 10–15 is not comparable. Product CSS has three timed transitions. Remainder: an injected stylesheet that zeroes transition and animation durations is unobserved |
| The steps that pass page time to the next revision check cost round trips | slice 2 | scratch `pageTimeStepMs` 250 → 1000 in `dashboard/tests/autoRefreshJourney.ts`, the 10 frontend specs (19 cases) that reach `passTimeUntilChecked`, `--workers=1`, three alternating pairs | all pass; unchanged 30.5, 29.8, 29.7 s; changed 28.6, 27.2, 26.1 s: every changed run lower, mean −2.7 s (9%) |
| The four cases that start a worker carry about 2 s of app server start | slice 7 | CI report step `Fixture "frontendApp"` | 2.1–2.2 s in exactly four cases (four CI workers), under 0.1 s elsewhere: a ranking artifact, not a case cost |

Slices 3–6 rest on the CI step sums above; each begins by timing its family
unmodified, which is discovery, and stops with its finding when the cost is
the behavior under test.

## Outside-in proof and local gates

- **Measure:** `--workers=1`, the family's spec files, three alternating
  before/after pairs with the one-minute load beside each; compare the summed
  durations of the family's cases. Under swinging load, report inconclusive
  and repeat rather than keep.
- **Preserved protection:** the changed specs pass three consecutive focused
  runs. A change that moves or merges an assertion shows one scratch break of
  the observed behavior still failing the surviving case, then reverts it.
- **Shared helpers:** run every spec that reaches the changed helper, across
  `dashboard/frontend-tests`, `dashboard/backend-tests`, `dashboard/tests` and
  `e2e`, found with the
  [consumer-trace script](../../../.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs).
- **Suite wall time:** before slice 1's first edit and again in slice 7, two
  unfiltered `caffeinate -s -i npm run --silent test:dashboard:frontend` runs
  on AC power from a fully awake machine
  ([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)),
  recording revision, workers, load, wall time and executed cases.
- Failures and flakes follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  No `test.slow()`, and no timeout override outside an individual test.

| Story promise | Owner |
| --- | --- |
| Rank the slowest 10% from a complete comparable baseline | Evidence read; slice 1 re-ranks if cases changed |
| Try disabling animations; keep real motion where tested | 1 |
| Remove waits, loads and repeated arrangement with the same result | 2, 3, 4, 5 |
| Merge duplicate proof only with a surviving case that catches the failure | 6 |
| No-gain changes are undone and reported | every slice's keep rule |
| Report affected-case gains; suite claim only from suite wall time | 7 |

## Ordered slices

### 1. Baseline and animation-free harness
Type: Structure
Status: done
Proof: suite wall baseline recorded; group files before/after by the measure;
the three motion specs unchanged and green.

Record the suite wall baseline. If the latest green `main` run's case list
differs from the baseline's, re-rank and note changed group members. Inject a
stylesheet that zeroes transition and animation durations through the shared
page fixtures (`dashboard/tests/support/pageTest.ts`), leaving
`board-swipe.spec.ts`, `launches/responsive-session-access*.spec.ts` and
`dashboard-connection-logo.spec.ts` on real motion. Keep on a measured gain;
otherwise undo and record no demonstrated gain. Weakness removed: assertions
delayed by presentation motion. Enables slice 2's cleaner timings.

Result (2026-11-16):
- Re-rank: the newest green `main` run is still 43773156778; its
  `dashboard-frontend-playwright-report-1` re-derives 456 cases, the 46 slowest
  each ≥3.923 s summing 240.0 s over 42 files. No re-rank.
- Suite wall baseline at `d9c35d51f`, two workers, AC, `caffeinate -s -i`:
  543.3 s (load 29.6 → 20.0) and 337.6 s (load 18.2 → 12.9; 456 executed,
  455 passed, 637.6 s summed). The two are not comparable with each other;
  slice 7 measures before and after itself under matched load.
- Animation-free stylesheet (verified applied in the page): before sums 193.5,
  160.3, 167.0 s; after 209.9, 181.0, 143.8 s (load 5–10). No demonstrated
  gain; undone. Four further group cases need real motion and failed under it:
  `intent-done-landed-review-mode`, `intent-done-review-modes`,
  `recently-done-sessions-review-cue-races`, `recently-done-sessions-select`.
- Failure-policy repair: `intent/intent-purpose-case.spec.ts:43` flaked (6 of
  10 failed) because a programmatic `scrollTo` does not stop
  `useKeptReadingScroll`; it now scrolls with the wheel through
  `scrollIntentReadingToStart` (10 of 10, then three 5 of 5 runs).

### 2. Reach the next revision check in fewer page-time steps
Type: Structure
Status: done
Proof: the 10 frontend specs by the measure; every consumer of the changed
helper green across roots; `expectSteadyPace` keeps its bound.

`passTimeUntilAsked` advances the paused clock 250 ms at a time and asks the
page after each step, about 60 round-trip pairs per 15-second check. Pass the
time a journey does not observe in one or few steps, keeping the fine step
where a case asserts the pace. Weakness removed: per-step round trips that
prove nothing in cases that only need the next check.

Result (2026-11-16): `passTimeUntilAsked` stepped 1 s between its first and
last fine 250 ms steps (about 20 round trips per check instead of 61;
`expectSteadyPace` kept its bound). The 10 specs (19 cases), `--workers=1`:
round 1 inconclusive (load rose 8.9 → 13.3 in one after-run); round 2 before
33.2, 44.1, 35.7 s, after 29.4, 33.5, 28.8 s (load 6–12): every pair dropped
but one after-run exceeded one before-run, and unchanged runs spread 11 s. No
demonstrated gain; undone. Untried lead: each `page.clock.runFor` call also
appends to Playwright's replayed clock log, which may cost more than the
`askedAfter` evaluation.

### 3. Read layout facts in one page evaluation
Type: Structure
Status: planned
Proof: the family's specs by the measure; one scratch layout break still fails.

Family: `configuration/system-settings-look` (both cases, 209 evaluations),
`agent-terminal-touch-select-held`, `sessions/final-report-touch`,
`board-swipe` (50 bounding-box reads), and
`launches/agent-launch-start-session-answer-touch`. Where a case reads many
elements' geometry or style one call at a time, read them in one evaluation
through the existing page object and assert the same facts.

### 4. Check startup host words without reloading per host
Type: Structure
Status: planned
Proof: `startup-host-words.spec.ts` by the measure; one scratch wording break
still fails.

The slowest case in its file reloads eight times (3.1 s) and evaluates 49
times (3.1 s). Arrange each host's startup through the service substitutes on
one loaded page where the wording does not depend on a fresh load; keep one
reload where reload behavior is the fact.

### 5. Shorten Recently done paging and shared-room cases
Type: Structure
Status: planned
Proof: `sessions/recently-done-sessions-sidebar-paging.spec.ts` and
`…-sidebar-room.spec.ts` by the measure; one scratch paging break still fails.

The two slowest session cases (9.5 s and 8.0 s) spend most time in retried
expectations and clicks while 45 sessions page in. Time them unmodified first;
then use the smallest data that still crosses the paging boundary and wait on
the page's read being answered rather than on retried expectations.

### 6. Keep one proof per rule among the group's twin cases
Type: Structure
Status: planned
Proof: per removal, the surviving case named and one scratch break failing it;
family before/after by the measure.

Candidates: `intent-done-project-refresh-proof` and `-reading`;
`intent-source-target-recovery` held and failed; `final-report-touch-divider`
landscape and desktop; the two `agent-terminal-touch-application-scroll`
swipes. Merge only what proves the same rule twice; distinct outcomes stay.

### 7. Report the gain and record what remains
Type: Structure
Status: planned
Proof: second suite wall measurement; the delivered revision's CI case sums for
the group against the baseline; candidate record updated.

Report each kept change's affected-case time before and after, changes undone,
and the suite wall comparison; claim a shorter suite wait only when the two
after-runs are both below both before-runs. Write remaining live candidates to
`.planning/TEST-OPTIMIZATION-CANDIDATES.md`, put accepted costs beside their
tests, and note the first-on-worker start as accepted. Refresh
`dashboard/frontend.longest-first` as [shards](../../../dashboard/tests/shards.md)
describes when kept changes moved file durations.

## Current decisions

- Slices 2–6 are independent experiments; one that shows no gain is undone and
  does not block the next.
- Decisive checkpoint after slice 2: when slices 1–2 kept under 8 s of group
  CI-equivalent time, record that the 24 s story saving is out of reach by
  speed alone and continue slices 3–6 for their own kept gains and for fewer
  duplicated cases.
- Checkpoint reached after slice 2: slices 1–2 kept nothing, so the 24 s story
  saving is out of reach by speed alone. Slices 3–6 continue for their own kept
  gains and for fewer duplicated cases.
- Distribution Tests on this branch fail only the suite's total `OVER BUDGET`
  ceiling, as on `main` since `09e70e926`. SEED-381 (Taken, removing that
  budget) owns the repair; this story's landing waits for it.

## Readiness and sizing

Refinement not needed: seven slices, each one family and one proof loop, sized
from scratch probes that took a single edit each. Remaining slice-specific
concerns: none identified. Slices 3–6 carry measured hypotheses, bounded by
their own undo rule.

## Story obligations

### G1. Animation-free harness gave no gain (slice 1)
Reported: slice 1 — "Decision: undo, no demonstrated gain."
Story clause: "Given a tried change whose before and after times differ by no more than the unchanged cases' own variation, the change is undone and reported as no demonstrated gain."
Disposition: no user cost "Dashboard contributors get faster local frontend test feedback while keeping the same behavioral protection.": the measured change did not speed the group, so undoing it keeps protection and loses no feedback speed

### G2. Fewer page-time steps gave no gain (slice 2)
Reported: slice 2 — "no demonstrated gain, edit undone (it missed the criterion by 0.3 s)"
Story clause: "Given a tried change whose before and after times differ by no more than the unchanged cases' own variation, the change is undone and reported as no demonstrated gain."
Disposition: no user cost "Dashboard contributors get faster local frontend test feedback while keeping the same behavioral protection.": the measured change did not speed the affected cases beyond their own variation, so undoing it keeps protection and loses no feedback speed
