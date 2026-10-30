# CI time budget holds under runner variance

**Source:** [Selected story](../../seeds/SEED-185-stable-ci-time-budget.md#stable-ci-time-budget)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-185#stable-ci-time-budget

## Goal and scope

A CI split judges both time-budget ceilings at the recorded list's runner
speed: it divides its observed times by its runner factor (the median, over
its jobs recorded in `tests/longest-first` with a measurable recorded time, of
observed over recorded seconds). Breach lines name observed time, factor and
time at recorded speed; the ceilings are recalibrated in that unit;
`scripts/ci-test-times.sh` reports in that unit; and refreshing a duration
list keeps its speed unit.

**Exclusions:** split count, the deal's rule, the 6-minute job timeout, the
dashboard shards' deadline, and local runs (still unjudged). A slowdown spread
evenly over most of a share's recorded jobs reads as runner speed (the seed's
scope limit); no independent runner benchmark is added.

**Assumptions:** "Measurable" means recorded seconds of at least 2; at that
threshold each share has 66–67 such jobs today. Local commands run with Bash 5
first on `PATH` (`/opt/homebrew/bin` on this machine).

## Outside-in proof

| Key example | Signal |
| --- | --- |
| Slow runner, no added time | `tests/test-runner-budget.sh`: a substitute directory with its own `longest-first`, every job at 2× its recorded seconds, passes under ceilings the raw times breach |
| Concentrated slowdown caught | the same check: one job at 3× while the rest stay at 1× breaches, naming job, factor 1.0 and both times |
| No measurable recorded job | the same check's existing no-list cases breach as today, with the factor stated unavailable |
| New test time | the same check: an unrecorded job's time counts in the total at the share's factor |
| Variance absorbed / slow attempt passes | the recalibrated `tests/time-budget` holds the twelve retained `main` runs and run 41000649845 attempt 1 within budget at recorded speed (recorded in slice 1); the pushed revision's CI is the hosted verdict |
| Slice baseline | `tests/ci-test-times.sh` with its `gh` stand-in prints share totals and jobs at recorded speed with the factor range |
| Refresh on a slow runner | `tests/support/test-shares.test.mjs`: refreshing from times at 1.3× an existing list writes seconds at the list's speed and records the factor in the `# Source:` line |

Focused command for every slice:

```text
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/test-runner-budget.sh tests/ci-test-times.sh tests/support/test-shares.test.mjs tests/support/share-deal.test.mjs
```

It exits 0 with no output on this branch's base (observed 2026-10-30, also
with `tests/support/share-deal-recorded-runs.test.mjs`, which joins it in
slice 3 because the refresh touches the list reader the deal uses).

## Ordered slices

### 1. A CI split judges its budget at recorded runner speed

Type: Behavior
Status: done
Proof: the four `tests/test-runner-budget.sh` cases above, a unit case for the
factor rule in `tests/support/share-deal.test.mjs` (median over measurable
recorded jobs; none measurable → unavailable; `formatRunnerFactorLine`), the
focused command, and the recalibration observation recorded below.
Accepted (uncommitted, pre-delivery): `PATH=/opt/homebrew/bin:$PATH bash
scripts/test.sh tests/test-runner-budget.sh tests/ci-test-times.sh
tests/support/test-shares.test.mjs tests/support/share-deal.test.mjs` exit 0;
ceilings `per-job-seconds=64` `total-job-seconds=694` from max recorded-speed
total 577.5 and max job 52.7 on retained artifacts.

Behavior: a CI run (`CI=true`) of a split share whose test directory holds a
`time-budget` and a `longest-first` → the runner finishes → each job's time and
the share total, divided by the share's runner factor, are compared with the
ceilings; within budget prints nothing; a breach prints observed time, factor
and time at recorded speed and fails the split. Without a measurable recorded
job the factor is 1 and the line says it was unavailable.

Recalibrate `tests/time-budget` from the twelve retained `main` runs plus run
41000649845 attempt 1 (artifact 12953780855) through the new factor rule: each
ceiling is 1.2× the highest value at recorded speed, rounded up, with its
derivation in the file's comment (observed 2026-10-30: total 577.5 → 694,
per-job 49.0 → 59; recompute at execution with the then-current artifacts).
Update `tests/time-budget.md` for the unit and the breach line.

Interim: until slice 2, `scripts/ci-test-times.sh` compares raw recent times
with ceilings now in recorded-speed units, so its headroom reads too small.
Slice 2 replaces it.

### 2. The trunk timing report speaks the check's unit

Type: Behavior
Status: done
Proof: `tests/ci-test-times.sh` (its `gh` stand-in serves times plus a
substitute `longest-first`) and the focused command.
Accepted (uncommitted, pre-delivery): focused command exit 0; fixture
totals 190.0–206.7 at recorded speed with factors 0.9–1.3; G1 proved.

Behavior: retained trunk `test-times-<i>` artifacts → `bash
scripts/ci-test-times.sh [job…]` → each job line and each share-total line
gives lowest–highest at recorded speed against the ceilings, with the runner
factor range seen for that share, and the wide/thin verdict judges those
values. `tests/time-budget.md`'s slice guidance (paired A/B ratio projection)
is restated for values at recorded speed.

### 3. Refreshing a duration list keeps its speed unit

Type: Behavior
Status: done
Proof: a refresh case in `tests/support/duration-list.test.mjs`, the deal's
recorded-runs test unchanged, and the focused command plus
`tests/support/share-deal-recorded-runs.test.mjs`.
Accepted (uncommitted, pre-delivery): focused command + duration-list tests
exit 0; 1.3× refresh writes list-speed seconds with `(runner factor 1.3)`.

Behavior: an existing duration list and times files from a run 1.3× slower →
`node scripts/test-shares.mjs refresh --list … --source …` → every written
seconds value is the observed one divided by the run's factor against the
existing list, and the `# Source:` line records that factor. A list that does
not yet exist, or no measurable common job, is written as observed with the
factor stated unavailable. The same rule applies to the dashboard's
named-part lists, whose deal is unchanged by a uniform scale.

## Current decisions

- One factor rule lives in JavaScript beside the deal (`scripts/share-deal.mjs`
  reads the duration list, including named parts), exposed through a
  `scripts/test-shares.mjs` subcommand that `scripts/test-budget.sh` and
  `scripts/ci-test-times.sh` call. No second copy in awk.
- The per-job ceiling uses the share's factor, not the job's own ratio.
- Ceilings are 1.2× the highest recent value at recorded speed: about twice
  the observed spread at recorded speed (41.6 on the total), replacing the
  former 1.5× raw margin that runner variance consumed.
- Recalibration recompute (slice 1): max job at recorded speed was 52.7 (not
  the plan sketch's 49.0) → per-job ceiling 64; total ceiling 694 unchanged
  from the sketch. `formatRunnerFactorLine` owns the factor/label tab line.

## Decisive premises

- **Normalization stabilizes share totals.** Consuming operation: the total
  ceiling's comparison. Observation (2026-10-30, this workspace): downloaded
  `test-times-*` of the twelve successful `main` `ci.yml` runs
  40834521203 … 41004369454 and attempt 1 of 41000649845 (artifact
  12953780855), divided each share's total by the median observed/recorded
  ratio over its jobs recorded at ≥ 2 s in this checkout's
  `tests/longest-first`. Raw 438.0–713.6 became 535.9–577.5; attempt 1's
  750.5 (factor 1.34) became 561.6. Largest single job 59.2 s raw, 49.0 s at
  recorded speed. Settled.
- **Existing budget proof has no list.** Consuming operation: the runner's
  budget call for `tests/test-runner-budget.sh`'s substitute directory, which
  holds only `slow.sh`, `fast.sh` and `time-budget`, so its current cases take
  the factor-unavailable path. Observed by reading the check; its exact breach
  regexes change in slice 1.
- **Focused route runs here.** The focused command's three existing files
  exited 0 with no output in this workspace on 2026-10-30. Settled.

## Concern evidence

Slice-plan refinement was not needed: each slice has one proof loop and the
only interim (slice 1's report headroom) is named with its replacing slice.
This review identified no remaining slice-specific concern.

## Story obligations

### G1. Trunk timing report still speaks raw times (interim after slice 1)
Reported: slice 1 — "`scripts/ci-test-times.sh` still compares raw recent times with ceilings now in recorded-speed units, so its headroom reads too small."
Story clause: "`bash scripts/ci-test-times.sh` reports share totals and job times at recorded speed with the runner factors it saw"
Disposition: proved by slice 2: `tests/ci-test-times.sh` expect_report job/share lines at recorded speed with factors; focused command exit 0


CI repair (after execution-complete): `dashboard/tests/agent-launch-story-card-sessions.spec.ts` per-test `setTimeout(120_000)` so the multi-reload journey is not cut at Playwright's default 30s (sibling open-session pattern).
## Execution complete

Product advice: Keep the planned correction SEED-185#align-refresh-guidance
(plan 417) available for wrap-up disposition so contributor docs match refresh
scaling; otherwise no new feature backlog item from this delivery.
