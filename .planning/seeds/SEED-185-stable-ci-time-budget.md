---
id: SEED-185
status: active
planted: 2026-10-30
planted_during: SEED-183 delivery, whose branch CI failed only the split time budget
trigger_when: A CI split fails the time budget with no assertion failure
scope: the CI time budget's reliability under runner speed variance
---

# SEED-185: CI Time Budget Holds Under Runner Variance

## Why This Matters

The CI time budget fails a split when its jobs together exceed a fixed number
of job-seconds. Runner speed alone now decides that: a change that adds no
test time can fail, and the rerun passes. The ceiling has already been raised
once for this reason (710 to 750 on 2026-10-28), so another raise only delays
the next failure.

## Selected Stories

<a id="stable-ci-time-budget"></a>

### CI time budget holds under runner variance

**Identity:** SEED-185#stable-ci-time-budget
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/415-stable-ci-time-budget/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3c97307c70ef2eab76454def478efee13aed112d2ac574af660fa8ec40bc168e","plan":"0c831963e11b9a0425d344641f3441e676b070ef78678c45e0aed46b0c807449"}}
```

**Goal:** A CI split fails the time budget only when the suite got slower, not
because its runner did.

**Evidence:** Run 41000649845 attempt 1 (branch
`claude/claude-done-rename-titled-composer`, revision 2824f452) failed
`test (1/3)` with `OVER BUDGET: all jobs took 750.5 job-seconds; the total
ceiling is 750` and no assertion failure. Its change touched only dashboard
Playwright files, which that split does not run. The same 153 jobs took 534.8
job-seconds on main's run 41000017218 at the same base, and each job was about
1.41× slower (p10 1.31, p90 1.57). `bash scripts/ci-test-times.sh` on
2026-10-30 reported share 1 at 450.5–713.6 job-seconds over the last ten main
runs: a spread of 263.1 against 36.4 headroom.

**Scope:**

- Required behavior:
  - On CI, each split job measures its runner's speed from its own run: the
    median, over its jobs recorded in `tests/longest-first` with a measurable
    recorded time, of observed seconds over recorded seconds. Both ceilings
    judge times divided by that factor, so they are in the recorded list's
    runner-speed unit. A change that adds no test time passes on a slow runner.
  - A breach line names the observed time, the runner factor, and the time at
    recorded speed, so a reader can tell runner speed from a real slowdown.
  - Both ceilings in `tests/time-budget` are recalibrated in that unit from
    recent trunk CI with headroom; raising either stays a reviewed edit.
  - Refreshing `tests/longest-first` keeps its speed unit: seconds from a run
    on a faster or slower runner are scaled to the existing list's speed and
    the factor is recorded in the source line, so a refresh neither tightens
    nor loosens the budget.
  - `bash scripts/ci-test-times.sh` reports share totals and job times at
    recorded speed with the runner factors it saw, so a slice's thin/wide
    verdict judges the same quantity the check does; the share preview's
    recorded-seconds predictions are directly comparable with the ceiling.
  - A share with no measurable recorded job to estimate a factor is judged at
    factor 1, as today, and its breach line says the factor was unavailable.
- Scope limits:
  - A slowdown spread evenly over most of a share's recorded jobs (a slower
    shared helper or toolchain) reads as runner speed. Today's fixed ceiling
    misses such a slowdown below about 1.3× on fast runners too; the reported
    factor range in `ci-test-times.sh` is where a drifting factor shows.
  - No change to the split count, the deal, the job's 6-minute timeout, the
    dashboard shards' deadline, or local runs, which stay unjudged.

**Key examples:**

- Slow runner, no added time: run 41000649845 attempt 1, share 1, took 750.5
  job-seconds with runner factor 1.34; at recorded speed that is 561.6, within
  the recalibrated ceiling, so the split passes instead of failing.
- Variance absorbed: the twelve successful `main` runs from 2026-10-29T07:17Z
  to 2026-10-30T04:42Z (40834521203 … 41004369454) had raw share totals
  438.0–713.6 job-seconds (spread 275.6) and, at recorded speed,
  535.9–577.5 (spread 41.6). Their largest single job, 59.2 s raw, is 49.0 s
  at recorded speed. Their runner factors ranged 0.80–1.29.
- Concentrated slowdown caught: a change makes one recorded 30 s job take
  90 s at recorded speed. The share's median factor barely moves, the job's
  own time and the share total each rise by about 60 s at recorded speed, and
  the per-job ceiling or the total ceiling fails it on any runner, naming
  the job, the factor and both times.
- New test time: a new, unrecorded test file adds its time divided by the
  share's factor to the total, so an added slow file is judged without first
  refreshing the list.
- Refresh on a slow runner: refreshing from a run 1.3× slower than the list
  leaves each share's recorded prediction near its previous value and the
  next CI totals at recorded speed unchanged, not 1.3× higher.
- Slice baseline: `bash scripts/ci-test-times.sh` prints share 1 at recorded
  speed with its factor range, and its headroom is the margin the check will
  apply on the pushed revision.

<a id="align-refresh-guidance"></a>

### Align duration-list refresh guidance with recorded-speed scaling

**Identity:** SEED-185#align-refresh-guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/417-align-refresh-guidance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"175a5298312fc75032f5b4da5d93925845c5a7654f3c161495c2752f6e6c88fc","plan":"605686bec3a58f6f28e0b64d7a882f6a221505cc8cf94b5bb4c2f5a92147ab01"}}
```
**Plan:** [417-align-refresh-guidance](../slice-plans/417-align-refresh-guidance/PLAN.md)

**Goal:** A contributor refreshing a duration list from CI artifacts reads
guidance that matches the delivered scaling behavior, so they do not expect
raw runner seconds to be written into the list.

**Scope:**

- Required behavior:
  - `tests/test-shares.md` and `dashboard/tests/shards.md` state that refresh
    scales observed times to the existing list's runner speed and records the
    factor on the `# Source:` line (or that the factor was unavailable).
  - They no longer claim refresh "keeps the seconds" as written observation.
- Scope limits:
  - No change to refresh, deal, budget judgment, or ceilings.
  - No change to existing list headers already on disk beyond what guidance
    describes; code behavior stays as delivered by SEED-185#stable-ci-time-budget.

**Key examples:**

- After a slow-runner refresh, a reader of either guide expects list-speed
  seconds and a source line naming the runner factor, matching
  `tests/support/duration-list.test.mjs`'s 1.3× case.
