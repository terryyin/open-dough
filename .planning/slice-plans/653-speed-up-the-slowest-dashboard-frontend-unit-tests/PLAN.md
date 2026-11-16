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
Status: done
Proof: the family's specs by the measure; one scratch layout break still fails.

Family: `configuration/system-settings-look` (both cases, 209 evaluations),
`agent-terminal-touch-select-held`, `sessions/final-report-touch`,
`board-swipe` (50 bounding-box reads), and
`launches/agent-launch-start-session-answer-touch`. Where a case reads many
elements' geometry or style one call at a time, read them in one evaluation
through the existing page object and assert the same facts.

Result (2026-11-16): discovery only, no edit. The six family files (17 cases)
summed 62.7 s at `--workers=1`, load 5. Traces put per-element reads at about
276 calls / 430 ms and 92 calls / 150 ms in the two read-bound
`system-settings-look` cases (2.7 s together); the rest is touch, motion and
clicks under test (`reportGeometry` already reads in one evaluation). Removing
all read cost stays under the 3.1 s (5%) bar, so no demonstrated gain was
possible.

### 4. Check startup host words without reloading per host
Type: Structure
Status: done
Proof: `startup-host-words.spec.ts` by the measure; one scratch wording break
still fails.

The slowest case in its file reloads eight times (3.1 s) and evaluates 49
times (3.1 s). Arrange each host's startup through the service substitutes on
one loaded page where the wording does not depend on a fresh load; keep one
reload where reload behavior is the fact.

Result (2026-11-16): kept. The startup case opens the board once and makes
the page read each later host arrangement through the launch boundary's
`tellChanged()` instead of `reloadUntilRead`: reloads 8 → 0, evaluations
47 → 9, fulfilled requests 125 → 27. Three alternating pairs at
`--workers=1`, load 3–4: file sums before 2.87, 3.78, 3.69 s; after 2.05,
2.79, 1.73 s (−36%, every after below every before). A scratch "Codexx" in
`startPhaseWords` failed the case at `startup-host-words.spec.ts:59`.

### 5. Shorten Recently done paging and shared-room cases
Type: Structure
Status: done
Proof: `sessions/recently-done-sessions-sidebar-paging.spec.ts` and
`…-sidebar-room.spec.ts` by the measure; one scratch paging break still fails.

The two slowest session cases (9.5 s and 8.0 s) spend most time in retried
expectations and clicks while 45 sessions page in. Time them unmodified first;
then use the smallest data that still crosses the paging boundary and wait on
the page's read being answered rather than on retried expectations.

Result (2026-11-16): no demonstrated gain; undone. The 45 sessions are not a
cap: the product pages 20, 40, then a short last batch, and paging makes no
request. Traces bound the removable waits (the two `revealRecentlyDoneThrough`
polls) at about 0.35 s of the 9.4 s pair; the rest is real steps, the
first-on-worker start and `wheelToEnd`, whose growing pause lets Chromium stop
sending wheels to the previous scroller (shortening it failed
`runningCursorSessionsPage.ts:188`). A one-evaluation reveal measured before
30.38 s against after 29.94 s (−1.4%, load 2.7–3.9).

### 6. Keep one proof per rule among the group's twin cases
Type: Structure
Status: done
Proof: per removal, the surviving case named and one scratch break failing it;
family before/after by the measure.

Candidates: `intent-done-project-refresh-proof` and `-reading`;
`intent-source-target-recovery` held and failed; `final-report-touch-divider`
landscape and desktop; the two `agent-terminal-touch-application-scroll`
swipes. Merge only what proves the same rule twice; distinct outcomes stay.

Result (2026-11-16): `intent-done-project-refresh-proof` and `-reading` proved
the same return-after-refresh rule; they are merged into
`intent/intent-done-project-refresh.spec.ts`, keeping every assertion of
both once. A scratch `useState` selection failed both originals and the
survivor at the same `aria-pressed` assertion (survivor `:131`); a scratch
unkept Proof tab failed `-proof` and the survivor (`:157`). Three alternating
pairs, load 7–8: 7.4, 8.3, 7.6 s for the two cases against 5.4, 5.2, 5.5 s
for the survivor (−31%, two cases → one). Kept distinct: held versus failed
source-target recovery (different failure modes), landscape versus desktop
divider (the short-height rule), and the `?1000h` and `?1002h` swipes (one
`wheelTracking` entry each).

### 7. Report the gain and record what remains
Type: Structure
Status: done
Proof: second suite wall measurement; the delivered revision's CI case sums for
the group against the baseline; candidate record updated.

Report each kept change's affected-case time before and after, changes undone,
and the suite wall comparison; claim a shorter suite wait only when the two
after-runs are both below both before-runs. Write remaining live candidates to
`.planning/TEST-OPTIMIZATION-CANDIDATES.md`, put accepted costs beside their
tests, and note the first-on-worker start as accepted. Refresh
`dashboard/frontend.longest-first` as [shards](../../../dashboard/tests/shards.md)
describes when kept changes moved file durations.

Result (2026-11-16):
- Kept: slice 4 (`startup-host-words` startup case) and slice 6 (the merged
  `intent-done-project-refresh` case). In CI, run 43773156778 at `09e70e926`
  against run 43789763452 at `644e1ae93` (455 of 455 passed), the affected
  cases summed 8.63 + 11.59 = 20.22 s before and 2.39 + 5.40 = 7.79 s after.
  The 43 unchanged group cases ran 19% faster on the later runner (219.8 →
  177.1 s); scaled by that, the kept changes save about 8.5 s of CI case time.
  The group fell 240.0 → 184.9 s and the suite 975.3 → 782.4 s mostly
  because of the runner.
- Suite wall, alternating two workers, AC, `caffeinate -s -i`: `d9c35d51f`
  261.8 s and 294.9 s, `644e1ae93` 311.7 s and 231.4 s, load swinging 5–14.
  One after-run exceeds both before-runs: no shorter-suite claim. The first
  base run failed `intent-purpose-case.spec.ts:43`, the flake slice 1 repaired
  on this branch; it passed in both after-runs.
- Undone with no demonstrated gain: slices 1, 2, 3 and 5. No shared-cause
  change was kept. `.github` and the Playwright configs are unchanged against
  `d9c35d51f`.
- `.planning/TEST-OPTIMIZATION-CANDIDATES.md` keeps the page-time step as the
  one live candidate. Accepted costs are commented at `frontendApp`,
  `wheelToEnd` and `fortyFiveDoneSessions`. `dashboard/frontend.longest-first`
  is refreshed from run 43789763452, the delivered revision, because only it
  times the merged and changed files; it had 138 of 195 files unrecorded.

## Execution complete

Product advice: no new story. The kept changes save about 8.5 s of the
group's CI case time against the 24 s aim; the rest of the slowest group is
behavior under test or the shared first-on-worker start. The one live lead,
the revision-check page-time step, stays in
`.planning/TEST-OPTIMIZATION-CANDIDATES.md` for a quieter-machine or CI-sum
comparison. Refresh `dashboard/frontend.longest-first` from a `main` run once
this lands, as `dashboard/tests/shards.md` asks; it was refreshed from this
branch's run 43789763452. Distribution Tests stay red on the `OVER BUDGET`
ceiling until SEED-381 removes that budget.

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

### G3. Batched layout reads could not reach the keep bar (slice 3)
Reported: slice 3 — "The cost that one-evaluation reads could remove is at most about 1 s, or about 1.5%."
Story clause: "Given a tried change whose before and after times differ by no more than the unchanged cases' own variation, the change is undone and reported as no demonstrated gain."
Disposition: no user cost "Dashboard contributors get faster local frontend test feedback while keeping the same behavioral protection.": the removable cost is under a second of feedback time and the tests stay unchanged with their protection

### G4. Startup words read on a fresh load for one host arrangement only (slice 4)
Reported: slice 4 — "Fresh-load wording is now proven for one combination only: claude, execution, not establishing."
Story clause: "Check the same observable result and keep real motion or timing in cases that test it."
Disposition: no user cost "Dashboard contributors get faster local frontend test feedback while keeping the same behavioral protection.": `StartupStatus` renders `startPhaseWords` from the current machine answer on every render with no state set only at page start, so a fresh load and a re-read reach the same words; each step's words differ from the previous step's, so every case still waits for its own answer

### G5. Recently done paging waits could not reach the keep bar (slice 5)
Reported: slice 5 — "Decision: undo, no demonstrated gain."
Story clause: "Given a tried change whose before and after times differ by no more than the unchanged cases' own variation, the change is undone and reported as no demonstrated gain."
Disposition: no user cost "Dashboard contributors get faster local frontend test feedback while keeping the same behavioral protection.": the removable wait is about 0.35 s and the cases stay unchanged with their protection

### G6. The merged case checks the return only after cycling the Done tabs (slice 6)
Reported: slice 6 — "The survivor now checks the restore after cycling the tabs, and no longer checks it without that cycle."
Story clause: "Given two cases in the group that prove the same rule, one is removed or merged only after the surviving case is shown to catch the same failure."
Disposition: no user cost "Dashboard contributors get faster local frontend test feedback while keeping the same behavioral protection.": the cycle ends on the same Changed tests tab without reselecting the file, so the return reads the same kept selection and tab as without it, and both scratch breaks of that rule still fail the survivor
