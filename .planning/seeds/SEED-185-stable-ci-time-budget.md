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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
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

**Scope:** The time budget in `tests/time-budget` and how CI judges it. The
budget still catches a real slowdown. Whether to normalize for runner speed,
rebalance splits, or change the check is for refinement.
