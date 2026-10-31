# Reduce dashboard test feedback time with measured optimization (top 40%)

**Source:** [Selected story](../../seeds/SEED-197-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Source review:** [Independent source review](source-review.md)
**Identity:** SEED-197#optimize-dashboard-test-feedback

## Goal and scope

Shorten the wait for trustworthy local dashboard test results while preserving
behavioral coverage and confidence. Run measured optimization against the
ordinary local command `npm run test:dashboard`, covering browser journeys,
boundary tests, and shared setup. Profile before choosing experiments. Seed
investigation from the tests and files that make up the top 40% of suite cost
by recorded duration contribution; follow related families across files and
tiers when they share responsibility or setup with those contributors. Retain
only changes supported by comparable wall-time measurements under like runner
conditions. Follow dashboard test guidance when simplifying tests or moving
proof between tiers. Establish replacement proof before removing or narrowing
cases. Update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` with the latest-pass
summary and current candidate state. Preserve accepted necessary costs
(`agent-launch-poles`, `long-integrated-journeys`) unless new evidence supports
reopening them. Leave pending candidates unless a wall-improving approach
appears. A demonstrated absence of worthwhile improvement, with that
evidence recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged. Thinning accepted necessary-cost journeys
without new evidence. Re-trying pending collapses already rejected for lack of
focused wall gain without a new approach.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`
([proof record](../../../dashboard/tests/proof-record.md)). Reuse
[dashboard test guidance](../../../dashboard/tests/README.md) (journeys vs
boundary; one representative journey for page shape; boundary owns variants;
siblings share read-only preconditions and assert deltas). Do not add a
second measurement framework. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires evidenced worthwhile gain against a stated baseline within coverage
constraints.

Settled in this execution checkout
(`cursor/optimize-dashboard-test-feedback-seed-197` at claim
`f351073d060ba25620d0c0a861b5b4c5cc9710d6` on base
`494237ab4df1cb91d52cc97cb7b71114a26f3efa`):

- Ordinary local command is `npm run test:dashboard` (Playwright default local
  workers = half of 16 logical CPUs → 8).
- SEED-174 through SEED-196 already closed earlier passes; accepted necessary
  costs and pending candidates in `.planning/TEST-OPTIMIZATION-CANDIDATES.md`
  remain preserved.
- First baseline attempt on 2026-10-31 exposed a calendar-relative fixture
  retention defect in 7 specs (`doneAt: "2026-10-01T00:00:00Z"` exceeding the
  30-day `launchRetentionDays` window on 2026-10-31, causing 10 test failures
  including three 30s timeouts) and a macOS FSEvents storm on fresh temp
  checkouts in `developmentDashboard` (`dashboardCommand.ts`) that restarted the
  Vite dev server mid-HMR assertion in `production-watcher.spec.ts`. Repairing
  those test fixtures and recording the green baseline is Slice 1.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Calendar-expired `doneAt` test fixtures and `developmentDashboard` FSEvents storm are repaired, and green baseline wall time, executed case count, runner conditions, and top-40% cost family analysis are recorded before experiments | Slice 1 | Focused pass of all 7 repaired specs and 3 consecutive 8-spec watcher stress runs, then `/tmp/SEED-197-optimize-dashboard-test-feedback/baseline-proof.json` and `baseline-times.tsv` with `strictStatus: "passed"` and ranked top-40% contributors |
| Worker-cached `publishPreparingJourney()` removes duplicated 10-step Git preparation setup across `session-attribution.spec.ts` and `backlog-preparing.spec.ts` | Slice 2 | Focused before/after on `session-attribution.spec.ts` and `backlog-preparing.spec.ts` with three consecutive passes |
| `story-review-since-trunk.spec.ts` keeps printing-merge-driver proof on the integrated-changes journey without repeating the no-changes-beyond-trunk journey under a second printing merge driver | Slice 3 | Focused before/after on `story-review-since-trunk.spec.ts` (and `boundary/story-review-completed-driver.spec.ts` still green) with three consecutive passes |
| `agent-launch-start-session-answer-touch.spec.ts` keeps phone touch layout/rotation proof on 390×844 without repeating the full `launched` + `refused` rotation journeys on a second phone width (430×932) | Slice 4 | Focused before/after on `agent-launch-start-session-answer-touch.spec.ts` with three consecutive passes |
| `story-review-trunk-worktree-ambiguity.spec.ts` combines non-matching worktree exclusions (earlier worktree, other story's claim, and unpublished earlier agent's claim) into one pass-over journey instead of two separate `takenInTrunkMode` startups | Slice 5 | Focused before/after on `story-review-trunk-worktree-ambiguity.spec.ts` with three consecutive passes |
| Full local suite re-run under comparable conditions measures before/after wall time and updates candidate record and timings doc | Slice 6 | Full `npm run test:dashboard` with proof/times records, plus updated `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and `docs/maintainer/dashboard-test-timings.md` |

## Ordered slices

### 1. Repair calendar-expired doneAt fixtures and record green baseline and top-40% costs
Type: Behavior
Status: done
Proof: Focused pass of the 7 repaired `doneAt` specs (`slice1-repair-proof.json`,
24/24 passed) and 3 consecutive 8-spec watcher stress runs with
`noFseventsPreload.cjs` (`slice1-watcher-pass1.json`..`pass3.json`, 30/30
passed each), followed by the full green baseline run
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-197-optimize-dashboard-test-feedback/baseline-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-197-optimize-dashboard-test-feedback/baseline-times.tsv npm run test:dashboard`
under default local workers (8 of 16 logical CPUs). Start load
`6.39 / 10.61 / 11.81`; end load `34.12 / 44.10 / 36.70` (contended). Recorded
revision `f351073d060ba25620d0c0a861b5b4c5cc9710d6`, wall time (`1061.10s`
outer / `1060.4s` `durationMs`), executed case count (`1,746` passed, `0`
skipped), and `terminal.strictStatus: "passed"`. Summed attempt durations
`7,835.3s`; summed `.tsv` (including hooks) `8,203.6s` across 588 files. Top
40% by file cost: 66 files (`3,308.9s` / `40.3%` of summed `.tsv`). Top 40% by
case attempt cost: 158 cases (`3,137.4s` / `40.0%` of summed attempts).
Dominant removable-looking costs outside accepted necessary costs and
already-rejected pending collapses: (1) `session-attribution.spec.ts` (rank 15,
`57.5s`) and `backlog-preparing.spec.ts` (rank 73, `26.9s`) each running a full
10-step `publishPreparingJourney()` without worker caching; (2)
`story-review-since-trunk.spec.ts` (rank 11, `63.3s`) repeating the printing
merge driver on the empty-diff journey; (3)
`agent-launch-start-session-answer-touch.spec.ts` (rank 65, `29.9s`) repeating
`launched` and `refused` rotation journeys on a second phone width (430×932);
(4) `story-review-trunk-worktree-ambiguity.spec.ts` (rank 66, `29.9s`) running
two separate `takenInTrunkMode` + page review cycles for passed-over worktrees.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite on
2026-10-31, where hardcoded `"2026-10-01T00:00:00Z"` `doneAt` timestamps have
aged past the 30-day `launchRetentionDays` window and macOS FSEvents delivers
delayed creation events on fresh `publishedMainFixture(true)` checkouts.
Trigger — replace those hardcoded `doneAt` literals in the 7 test files with a
relative timestamp within retention (`new Date(Date.now() - 60 * 60 * 1000).toISOString()`),
force `developmentDashboard` in `dashboard/tests/support/dashboardCommand.ts`
onto Chokidar's `NodeFsHandler` via `noFseventsPreload.cjs`, and execute the
ordinary local command with proof record and spec times.
Postcondition — all 1,746 cases pass (`strictStatus: "passed"`), and baseline
facts plus top-40% family analysis are recorded for the experiment slices.

### 2. Cache read-only publishPreparingJourney per worker across preparing specs
Type: Structure
Status: done
Proof: Focused 3-pass `--workers=1` before/after on `session-attribution.spec.ts`
and `backlog-preparing.spec.ts` (`slice2-before-1..3.json` vs
`slice2-after-1..3.json`, 2/2 passed each, `strictStatus: "passed"`):
`durationMs` `32.88s / 36.35s / 32.72s` (mean `33.98s`, median `32.88s`) →
`30.77s / 36.25s / 29.29s` (mean `32.10s`, median `30.77s`); summed `.tsv`
`28.7s / 32.6s / 28.9s` (mean `30.07s`) → `26.0s / 27.0s / 24.5s` (mean
`25.83s`, `−4.23s`); `session-attribution.spec.ts` `13.8s / 18.2s / 13.7s`
(mean `15.23s`) → `7.6s / 6.6s / 6.5s` (mean `6.90s`, `−8.33s`); default-workers
pass `slice2-after-default.json` `19.05s` (2/2 passed); post-refactor pass
`slice2-refactor-proof.json` (2/2 passed, `session-attribution` `5.59s`). All
assertions in both specs remain intact.

Internal change: Cache the read-only bare origin and revisions in
`dashboard/tests/preparingJourney.ts` per worker (cleaning up working-tree
directories after build and removing the bare origin on `process.once("exit")`,
matching `publishStoryColumnsJourney` in `dashboard/tests/launchJourney.ts`),
and isolate `reuseRefiner()` onto a temporary clone or independent ref so
`session-attribution.spec.ts` and `backlog-preparing.spec.ts` share the
expensive 10-step CLI preparation without mutating `refs/heads/main` for
siblings.

Hypothesis: eliminating one full `publishPreparingJourney()` execution per
worker (and moving `session-attribution` off per-test CLI preparation) reduces
focused family wall by ~5–8s while preserving every attribution and preparing
assertion.

Experiment loop: hypothesize → focused baseline → smallest change → verify →
measure → retain or undo → reassess remaining gap before the next experiment.

### 3. Drop redundant printing-merge-driver no-changes journey in story-review-since-trunk
Type: Structure
Status: done
Proof: Focused default-worker 3-pass before/after on
`story-review-since-trunk.spec.ts` (`slice3-before-1..3.json` 7/7 passed vs
`slice3-after-1..3.json` 6/6 passed, `strictStatus: "passed"`) plus boundary
proof `boundary/story-review-completed-driver.spec.ts` (`slice3-driver-boundary.json`,
3/3 passed) and `--workers=1` serial before/after (`slice3-before-w1.json` 7/7
passed vs `slice3-after-w1.json`, `slice3-after-w1-2.json`,
`slice3-after-w1-3.json` 6/6 passed): default-worker `.tsv` spec-seconds
`40.2s / 34.5s / 35.3s` (mean `36.67s`, median `35.30s`; removed empty-diff
printing-driver case `5.35s / 4.95s / 5.06s`, mean `5.12s`) → `36.0s / 30.8s / 33.4s`
(mean `33.40s`, median `33.40s`, `−3.27s` mean / `−1.90s` median); `--workers=1`
serial `durationMs` `26.12s` (`.tsv` `21.5s`) → `25.76s / 22.43s / 24.56s`
(mean `24.25s`, median `24.56s`, `−1.87s` mean; `.tsv` `21.0s / 18.6s / 19.3s`,
mean `19.63s`, `−1.87s` mean / `−2.20s` median). `story-review-since-trunk.spec.ts`
still proves printing merge driver invocation and output stripping on the
integrated-changes journey plus no-changes-beyond-trunk on the standard merge
driver, and `support/storyReviewMergeDriver.ts` drops the unused `clean`
parameter.

Internal change: In `dashboard/tests/story-review-since-trunk.spec.ts`, run
`after trunk was integrated with nothing else, nothing changed since the review beyond what trunk holds`
once (without the `for (const printing of [false, true])` loop), keeping the
`for (const printing of [false, true])` loop on the first test (`after trunk was integrated, the changes since the review leave trunk's out and flag what cannot be separated`).

Hypothesis: the first test already proves that `reopenStoryReview` invokes the
printing merge driver and strips its stdout while restating the mark across
trunk integration; repeating the printing-driver variant on the empty-diff
case adds a full worktree + mark + merge + page journey (~9s) for no distinct
fault detection.

Experiment loop: same as Slice 2.

### 4. Drop redundant second phone width (430×932) in agent-launch-start-session-answer-touch
Type: Structure
Status: done
Proof: Focused default-worker 3-pass before/after on
`agent-launch-start-session-answer-touch.spec.ts` (`slice4-before-1..3.json` 5/5
passed vs `slice4-after-1..3.json` 3/3 passed, `strictStatus: "passed"`),
`--workers=1` serial before/after (`slice4-before-w1.json` 5/5 passed vs
`slice4-after-w1.json` 3/3 passed), and post-refactor verification
(`slice4-refactor-proof.json`, 3/3 passed): default-worker `.tsv` spec-seconds
`61.5s / 31.7s / 43.7s` (mean `45.63s`, median `43.70s`; removed `430×932` cases
`26.27s / 13.13s / 18.17s`, mean `19.19s`) → `20.2s / 24.5s / 13.7s` (mean
`19.47s`, median `20.20s`, `−26.17s` mean / `−23.50s` median); default-worker
`durationMs` `24.92s / 17.07s / 19.46s` (mean `20.48s`) →
`24.42s / 20.39s / 16.10s` (mean `20.30s`); `--workers=1` serial `durationMs`
`34.94s` (`.tsv` `21.8s`) → `22.84s` (`−12.10s`; `.tsv` `11.9s`, `−9.90s`).
390×844 portrait (`phone.portrait`) and rotated 844×390 landscape
(`phone.landscape`) still prove `held`, `launched`, and `refused` whole-word
layout and `Near-future direction` opening beneath the row.

Internal change: In `dashboard/tests/agent-launch-start-session-answer-touch.spec.ts`,
keep the `phone.portrait` (390×844, rotating to 844×390) journeys for `held`,
`launched`, and `refused` and remove the `largePhone` (430×932) loop iteration
that repeats `launched` and `refused` across the same CSS branches.

Hypothesis: per dashboard test guidance (“Touch journeys use one device unless
the other reaches an asserted CSS branch or arrangement the first does not”),
390×844 portrait + 844×390 landscape already crosses the mobile and wide
branches; removing the two 430×932 journeys saves ~10–14s of focused wall time.

Experiment loop: same as Slice 2.

### 5. Combine passed-over worktree exclusions in story-review-trunk-worktree-ambiguity
Type: Structure
Status: done
Proof: Focused default-worker 3-pass before/after on
`story-review-trunk-worktree-ambiguity.spec.ts` (`slice5-before-1..3.json` 3/3
passed vs `slice5-after-1..3.json` 2/2 passed, `strictStatus: "passed"`) and
`--workers=1` serial before/after (`slice5-before-w1.json` 3/3 passed vs
`slice5-after-w1.json` 2/2 passed): default-worker `.tsv` spec-seconds
`14.4s / 17.4s / 46.2s` (mean `26.00s`, median `17.40s`; passed-over pair
`10.16s / 12.26s / 32.00s`, mean `18.14s`) → `16.3s / 23.8s / 25.0s` (mean
`21.70s`, `−4.30s`; combined passed-over case `8.85s / 13.60s / 13.95s`, mean
`12.13s`, `−6.01s`); `--workers=1` serial `durationMs` `41.29s` (`.tsv` `30.2s`;
passed-over pair `18.87s`) → `31.80s` (`−9.49s` / `−23.0%`; `.tsv` `19.2s`,
`−11.0s` / `−36.4%`; combined passed-over case `12.87s`, `−6.01s`). The combined
test plants `earlier`, `closed-b`, and `earlier-agent` worktrees in one journey
before `expectStoryWorktreeReviewedAlone`, and the two-worktrees ambiguity
refusal case still passes.

Internal change: In `dashboard/tests/story-review-trunk-worktree-ambiguity.spec.ts`,
plant the earlier agent's unpublished claim worktree (`earlier-agent`) beside
the same agent's `earlier` and `closed-b` worktrees in one journey before
calling `expectStoryWorktreeReviewedAlone`, avoiding a second
`storyTakenWithOneSlice(origin)` (`takenInTrunkMode`) + page review cycle.

Hypothesis: combining the three non-matching worktree preconditions into one
journey eliminates one full `takenInTrunkMode` CLI start and page review
(~10s), cutting focused file wall while testing every passed-over worktree
kind.

Experiment loop: same as Slice 2. At each decisive checkpoint whose remaining
experiments cannot plausibly close a stated remaining-gap target, record the
decision in Current decisions before dispatching another dependent experiment.

### 6. Full local suite re-profile and candidate record update
Type: Behavior
Status: done
Proof: Full re-profile of `npm run test:dashboard` at `125edc37d04f8c2062c25b1dd7c9a4309a8917a4`
(`/tmp/SEED-197-optimize-dashboard-test-feedback/after-proof.json` and
`after-times.tsv`): `selectedCount=1,742` (`1,742` passed, `0` skipped,
`strictStatus: "passed"`, `−4` redundant cases vs baseline `1,746`),
`durationMs=615.3s` (outer wall `615.90s`) vs baseline `1,060.4s` (`1,061.10s`
outer wall at `f351073d` / `a8ab552d`), summed attempts `7,835.3s → 4,456.8s`,
summed `.tsv` `8,203.6s → 4,689.9s`, start → end load
`10.69 / 28.37 / 17.23 → 27.35 / 20.88 / 18.40` (vs baseline
`6.39 / 10.61 / 11.81 → 34.12 / 44.10 / 36.70`). Updated
`.planning/TEST-OPTIMIZATION-CANDIDATES.md` (`231` lines) with the SEED-197
Latest pass summary while preserving all 6 pending candidates and both accepted
necessary costs; updated `docs/maintainer/dashboard-test-timings.md` (`249`
lines) with the SEED-197 pass and extracted earlier local passes
(SEED-191..SEED-196) into `docs/maintainer/dashboard-local-test-timings.md`
(`178` lines).

Behavior: Pre-condition — retained experiments delivered (or none retained).
Trigger — full local re-profile and candidate-record write.
Postcondition — before/after wall and case counts reported with limits;
remaining candidates preserved for wrap-up.

## Current decisions

- Do not reopen accepted necessary costs (`agent-launch-poles`,
  `long-integrated-journeys`) or the six pending candidates in
  `.planning/TEST-OPTIMIZATION-CANDIDATES.md` without a new wall-improving
  approach.
- Prefer README-aligned shared read-only preconditions, one-device touch
  journeys, and sibling-delta / non-duplicated setup cuts.

## Learnings

- On 2026-10-31, hardcoded `doneAt: "2026-10-01T00:00:00Z"` timestamps in 7
  dashboard test specs crossed the 30-day `launchRetentionDays` cutoff in
  `dashboard/server/launchRecordDocument.ts`, causing `withinRetention` to drop
  seeded done records on read/write and failing 10 tests (including three 30s
  timeouts), and delayed macOS FSEvents creation notifications on fresh
  `publishedMainFixture(true)` checkouts restarted the Vite dev server mid-HMR
  assertion in `production-watcher.spec.ts`. Slice 1 repaired those test
  fixtures (`noFseventsPreload.cjs` + relative `doneAt`) before capturing the
  clean green baseline.
- Across Slices 2–5, all four targeted top-40% families (`publishPreparingJourney`
  worker caching, `story-review-since-trunk` empty-diff printing-driver drop,
  `agent-launch-start-session-answer-touch` `430×932` drop, and
  `story-review-trunk-worktree-ambiguity` passed-over worktree combination)
  produced consistent focused and `--workers=1` serial speedups and reduced
  full-suite file `.tsv` times (`84.4s → 38.8s`, `63.3s → 27.5s`,
  `29.9s → 8.6s`, and `29.9s → 13.5s`).
