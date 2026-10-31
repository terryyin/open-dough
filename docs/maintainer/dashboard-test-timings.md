# Dashboard CI timing measurements

Measured on 2026-10-29 for early serial deployment scheduling, shared-hook
weights, and fewer browser observation round trips. Timings are observations
from a small sample of shared runners, not a guaranteed saving per run.

Current findings and their dispositions are maintained in
[Test Optimization Candidates](../../.planning/TEST-OPTIMIZATION-CANDIDATES.md).
This document retains measurement evidence.

## Comparable workload

The hosted workflow is `.github/workflows/ci.yml`, on `ubuntu-24.04`, with
12 dashboard shards and four observed workers per shard. No existing case,
assertion, fixture isolation, native touch move, one-pixel observation, strict
verdict or retry policy was removed. Baseline revision
`0bffc434d8ef9cb7db0f294fbf6c8bcf1aca7869` has the same application and test
code as the pre-investigation revision `5de6411d`.

The baseline contains 1,721 browser cases in 570 files. Scheduling adds two
regression cases; the helper candidate adds four more. Compare cases by spec
file, registration location and full describe/title path, ignoring project
names because serial chains now use a complementary native project. Original
cases must occur exactly once with the same verdict. Four existing platform
skips remain identical on Ubuntu; the other 1,717 original cases pass. No new
skips or retries were added. The helper candidate passes 1,723 cases and retains
those same four skips, for 1,727 selected cases.

Dashboard-job seconds include setup, the suite and artifact handling. Suite
seconds are the HTML reporter's elapsed duration. CI seconds run from workflow
creation to the last job's completion, including runner queue time. Job start
spread exposes queue skew; it is not code execution time. The maximum job and
maximum suite can belong to different shards.

## Hosted observations

| Revision | Run | Max dashboard job | Max browser suite | Full CI | Job start spread |
| --- | --- | ---: | ---: | ---: | ---: |
| Baseline `0bffc434` | [40789926577](https://github.com/terryyin/open-dough/actions/runs/40789926577) | 291s | 252.96s | 295s | 1s |
| Baseline `0bffc434` | [40790934008](https://github.com/terryyin/open-dough/actions/runs/40790934008) | 247s | 217.71s | 333s | 104s |
| Scheduling `7eda0986` | [40793949962](https://github.com/terryyin/open-dough/actions/runs/40793949962) | 241s | 211.35s | 244s | 1s |
| Helpers `930974d6` | [40796911428](https://github.com/terryyin/open-dough/actions/runs/40796911428) | 233s | 199.30s | 235s* | 1s |
| Helpers and fixture repair `876b2645` | [40798322595](https://github.com/terryyin/open-dough/actions/runs/40798322595) | 226s | 202.91s | 229s | 0s |

Baseline runs were dispatched manually; the scheduling run was push-triggered.
They execute the same workflow and job commands. The baseline and scheduling
runs passed all 16 jobs. *The first helper run passed all 12 dashboard jobs and
lint but failed one Node job: an unchanged owner-replacement test read a record
after its removal (`owner.1.json`, `ENOENT`). Its 235s is time to a failed CI
result, not time to passing CI. A separate bounded fixture-race repair retains
that failure and the successful dashboard measurement. The repair run passed
all 16 jobs and repeats the same dashboard changes. Its code changes are the
test fixture repair and its regression test; this is not a second observation
of an identical complete revision. Runs were sequential, with unchanged shards and
workers. Both candidate dashboard reports preserve the original selection and
verdicts exactly, plus six passing regression cases.
Unmeasured runner headroom and cache variability limit causal attribution.

The production update chain began 102.39s and 81.63s into baseline suites,
versus 6.30s after scheduling. Its tail after all other work in that shard fell
from 64.84s and 52.92s to 13.46s. The other two production chains also started
within six seconds, and finished before their ordinary peers. This supports
the dispatch mechanism. The update chain itself took longer with concurrent
peers in that run, so the saving comes from overlap rather than faster
individual deployment transitions.

The phone header step took 26.28s and 23.12s in baseline runs, 26.81s after
scheduling, and 21.40s/20.86s with helpers. The large sidebar-resize case took
61.20s/42.24s, 61.64s and 38.29s/44.67s respectively. The short-window room step
varied: 27.75s/16.65s, 10.15s and 15.50s/9.91s. The phone step improved in both
candidate observations; layout timings do not isolate a separate gain from
runner variance. Reported Evaluate-step counts are not comparable after
browser handles move sampling into operations the HTML report does not list
individually; use elapsed timings and the native-input guards, not that count.

The production update chain began at 6.05s/6.02s with helpers; its residual
idle tail was 0s/7.97s. A small tail remains possible as runners vary. Longest
dashboard jobs averaged 269s in the two baselines and 229.5s in the two
candidate observations, a descriptive 39.5s (14.7%) reduction. Longest suites
averaged 235.33s and 201.10s respectively (14.5% lower). These small-sample
means are not confidence bounds. The latest passing complete CI took 229s;
compare the baseline 295s/333s with the queue-skew caveat above.

The retained change uses native Playwright project dispatch and existing
allocation/reporting seams; browser helpers avoid success-path diagnostic
reads and combine each frame wait with its live reading predicate. Scheduling
provides the clearest critical-path gain. The phone-step observation supports
retaining touch batching; no independent layout speedup is claimed.

## Ordinary local observations

Command, before and after, with unchanged default workers:

```sh
env -u NO_COLOR npm run test:dashboard -- production-watcher \
  cursor-sessions-sidebar-resize-lasting \
  recently-done-sessions-sidebar-room agent-terminal-touch
```

The host had 16 logical CPUs and 48 GiB RAM; the runner used eight default
workers. Commands ran sequentially, using the same checkout dependencies and
sanitized color environment. Each passed all 24 selected cases.

| Code | Wall time | Reporter elapsed |
| --- | ---: | ---: |
| Baseline | 97.35s | 96.98s |
| Scheduling | 88.97s | 88.57s |
| Scheduling and helpers | 92.09s | 91.69s |

The combined observation is 5.26s faster than the baseline, but 3.12s slower
than scheduling alone. It establishes no additional local helper gain. A
34-case helper family, including the four new real-browser guards, passed
three consecutive times in 38.12s, 37.76s and 37.94s. These repetitions check
changed asynchronous behavior; they are not repeated baseline comparisons.

An earlier complete local attempt failed strict verdicts because inherited
`NO_COLOR` conflicted with nested runs enabling `FORCE_COLOR`. It supplies
no valid speed baseline. Full-suite coverage is measured by hosted CI.

## Evidence and reproduction

GitHub run pages retain job timestamps and per-shard Playwright HTML reports
as workflow artifacts, subject to their retention policy. HTML reports retain
case selection, worker count, elapsed time, native-input steps and browser
observations. The committed hook-inclusive duration lists were refreshed with
`scripts/test-shares.mjs refresh` from the two baseline reports, including
exact `beforeAll`/`afterAll` hooks once per execution.

Raw downloads, strict local records, exact commands and analysis outputs for
this measurement were retained outside Git under
`/private/tmp/dashboard-ci-time-164` on the measurement host. They are temporary
local evidence; the named revisions and run links identify the reproducible
workload and hosted results.

## Isolated installed-start fixture preparation

Measured on 2026-10-29. Full hosted and local observations, including
isolation guards and preparation tradeoffs, are in
[installed-start fixture timings](dashboard-installed-start-fixture-timings.md).
Subsequent production-watcher policy reduction is in
[production policy test timings](production-policy-test-timings.md).

## Local `npm run test:dashboard` pass (2026-10-29 / 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's Mac host.

| Revision | Role | Wall (`durationMs`) | Cases | Load (1m/5m/15m at start) | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `838e533a` | Green baseline (board-scroll Column-fit fix) | 597.8s | 1753 | 5.30 / 4.58 / 3.98 | `strictStatus: passed` |
| `3149bf64` | After journey/boundary wait move | 970.8s | 1754 | 10.02 / 8.52 / 8.19 | Unlike load; no suite-wall claim |
| `3149bf64` | Second after run | 695.5s | 1754 | 6.46 / 26.67 / 29.19 | Contended (pygardon research); no suite-wall claim |

`agent-launch-second-server` case duration: **64.6s → 52.5s / 51.2s**. Focused
family wall (journey + boundary change-wait) measured **67.8s → 53.4s** with
three consecutive passes. Retained: move non-owner 30s change-wait into
`dashboard/tests/boundary/agent-launch-change-wait.spec.ts`; keep Column-fit
clear of Chromium overlay scrollbars via a 15px WebKit scrollbar track on
`.board-scroll`. Full-suite wall speedup was **not** demonstrated under
comparable load.

### Resolved (2026-10-30 resolve)

The accepted costs and transferred obligation now live in
[Test Optimization Candidates](../../.planning/TEST-OPTIMIZATION-CANDIDATES.md#accepted-necessary-costs).
This heading remains as a forwarding link for existing story and plan references.
Touch-family reduction retained 2026-10-30 under ADR 0010 (36→21 cases);
spent plan/story recover from before-cleanup
`025b24e71325b524898f9a3a6b645cf3f519a0be`.

## Local touch-family reduction (SEED-180, 2026-10-30)

Retained 2026-10-30 under ADR 0010: 36 cases / 14 files → 21 / 12; focused
walls 32.647 / 33.074 / 31.827 s versus baseline 37.551 / 35.696 / 36.279 s;
ordinary suite green once (`selectedCount=1742`). Focused command, loads,
surviving-proof table, and comparison limits:
[dashboard touch-family timings](dashboard-touch-family-timings.md).

## Local `npm run test:dashboard` pass (SEED-177, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's Mac host.

| Revision | Role | Wall (`durationMs`) | Cases | Load (1m/5m/15m at start) | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `3060f8f5` | Green baseline (admit) | 751.0s | 1754 | 5.18 / 4.98 / 6.77 | `strictStatus: passed` |
| `a047236b` | After `DOUGH_CHANGE_WAIT_MS` bound observation | 741.4s | 1754 | 4.79 / 7.04 / 10.55 | Modest suite-wall gain |

Boundary `agent-launch-change-wait` non-owner case: **34.6s → 3.9s**. Focused
family wall (`--workers=1`): **38.63s → 7.41–10.57s** (three consecutive
passes). Retained: `configuredLimit("DOUGH_CHANGE_WAIT_MS", 30_000)` with the
boundary test observing a 500 ms bound; production default remains 30 s.
Full-suite wall ≈ **9.6 s (1.3%)** shorter under comparable load.

SEED-177's bound observation does not reopen the decisions preserved in
[Test Optimization Candidates](../../.planning/TEST-OPTIMIZATION-CANDIDATES.md).
Detailed tables and focused-family measurements for SEED-191, SEED-193,
SEED-194, SEED-195, and SEED-196 are preserved in
[earlier local optimization passes (SEED-191 through SEED-196)](dashboard-local-test-timings.md).

## Local `npm run test:dashboard` pass (SEED-197, 2026-10-31)

Measured under ADR 0010 like-conditions rules on the developer's 16-CPU / 48-GiB
Mac (`npm run test:dashboard`, 8 default workers, `NO_COLOR` and `FORCE_COLOR`
unset; top-40% scope: `66` files / `40.3%` `.tsv`, `158` cases / `40.0%`
attempts). Case delta (`1,746 → 1,742` passed, `0` skipped,
`strictStatus: "passed"`): `−4` redundant cases across Slices 3–5, `0` rejected.

| Revision | Role | Wall (`durationMs`) | Cases | Summed attempts / specs | Load (1m/5m/15m start → end) |
| --- | --- | ---: | ---: | ---: | --- |
| `f351073d` (`a8ab552d`) | Green baseline after Slice 1 fixture repair | 1,060.4s (1,061.10s wall) | 1,746 | 7,835.3s / 8,203.6s | 6.39 / 10.61 / 11.81 → 34.12 / 44.10 / 36.70 |
| `125edc37` | After Slices 2–5 | 615.3s (615.90s wall) | 1,742 | 4,456.8s / 4,689.9s | 10.69 / 28.37 / 17.23 → 27.35 / 20.88 / 18.40 |

- **Prerequisite fixture repairs (Slice 1, `a8ab552d`):** Replaced hardcoded
  `doneAt: "2026-10-01T00:00:00Z"` in 7 specs with relative retention timestamps
  (`new Date(Date.now() - 60 * 60 * 1000).toISOString()`) and forced
  `developmentDashboard` (`dashboardCommand.ts`) onto Chokidar `NodeFsHandler`
  via `noFseventsPreload.cjs` (`30/30` passed across three 8-spec watcher runs).
- **Family 1 (`publishPreparingJourney` worker cache, Slice 2, `1ae53f6c`):**
  Cached the read-only 10-step CLI preparation origin per worker in
  `dashboard/tests/preparingJourney.ts` and precomputed `reuseRefiner`. Focused
  3-pass `--workers=1` `durationMs` **32.88–36.35s** (median **32.88s**) →
  **29.29–36.25s** (median **30.77s**); summed `.tsv` mean **30.07s → 25.83s**
  (**−4.23s**); `session-attribution.spec.ts` mean **15.23s → 6.90s** (**−8.33s**;
  post-refactor **5.59s**); full-suite pair `.tsv` **84.4s → 38.8s** (**−45.6s**).
- **Family 2 (`story-review-since-trunk` printing-driver empty-diff drop, Slice 3, `67126c6c`):**
  Retained printing-driver proof on integrated-changes and
  `boundary/story-review-completed-driver.spec.ts` (`3/3`), running the
  empty-diff journey once (`7 → 6` cases) and dropping unused `clean` in
  `support/storyReviewMergeDriver.ts`. Focused 3-pass `.tsv` mean **36.67s → 33.40s**
  (**−3.27s**); `--workers=1` `durationMs` **26.12s → 24.25s** mean (**−1.87s**;
  `.tsv` **21.5s → 19.63s** mean); full-suite `.tsv` **63.3s → 27.5s** (**−35.8s**).
- **Family 3 (`agent-launch-start-session-answer-touch` `430×932` drop, Slice 4, `e05b12b7`):**
  Retained `390×844` portrait and rotated `844×390` landscape journeys for
  `held`, `launched`, and `refused`, dropping duplicate `430×932` iterations
  (`5 → 3` cases). Focused 3-pass `.tsv` mean **45.63s → 19.47s** (**−26.17s**);
  `--workers=1` `durationMs` **34.94s → 22.84s** (**−12.10s**; `.tsv`
  **21.8s → 11.9s**); full-suite `.tsv` **29.9s → 8.6s** (**−21.3s**).
- **Family 4 (`story-review-trunk-worktree-ambiguity` passed-over worktrees, Slice 5, `125edc37`):**
  Planted `earlier`, `closed-b`, and `earlier-agent` passed-over worktrees in
  one journey before `expectStoryWorktreeReviewedAlone` (`3 → 2` cases),
  keeping the two-worktrees ambiguity refusal case. Focused 3-pass `.tsv` mean
  **26.00s → 21.70s** (**−4.30s**; passed-over case mean **18.14s → 12.13s**,
  **−6.01s**); `--workers=1` `durationMs` **41.29s → 31.80s** (**−9.49s**;
  `.tsv` **30.2s → 19.2s**); full-suite `.tsv` **29.9s → 13.5s** (**−16.4s**).
- **Comparison limits:** Baseline ran under pre-reboot contention (end load
  `34.12 / 44.10 / 36.70`) vs post-reboot after run (`27.35 / 20.88 / 18.40`),
  so causal attribution rests on the controlled focused/serial passes rather
  than the `−445.1s` suite-wall delta alone. Pre-reboot `/tmp` artifacts were
  cleared by reboot; `/tmp/SEED-197-optimize-dashboard-test-feedback/after-proof.json`
  and `after-times.tsv` remain. No product behavior changed.
