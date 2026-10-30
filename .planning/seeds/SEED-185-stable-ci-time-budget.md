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
