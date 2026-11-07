---
id: SEED-256
status: active
planted: 2026-11-07
scope: story
---

# CI timing comparisons without runner waits

## Story

<a id="compare-ci-time-without-runner-waits"></a>

### Compare CI time without runner waits

**Identity:** SEED-256#compare-ci-time-without-runner-waits

A developer reviewing a story in Intent can see how long each CI build took
to finish and compare how long the jobs took to run independently of runner
availability.

#### Expected behavior

- Show both timings for the Baseline, Branch, and Landed builds when available.
  Show elapsed CI wall time from run creation through completion for context.
  Use the estimated CI time without runner waits for timing deltas and
  faster or slower cues.
- Estimate the time without runner waits from the longest chain of dependent
  jobs, using each job's observed start-to-finish duration. This preserves
  the time spent running required follow-on jobs and excludes the wait for a
  runner at any point in the workflow.
- When job timing or dependency evidence is missing, keep any available
  elapsed wall time visible and explain why the timing comparison is unavailable.

#### Example

In the source-review story, the baseline finished in 4:59 and the branch
finished in 13:27. Their estimated times without runner waits were 4:55 and
4:47. Show both pairs and display the branch as 8 seconds faster on the
comparison measure.
[Baseline build](https://github.com/terryyin/open-dough/actions/runs/42341688832)
and [branch build](https://github.com/terryyin/open-dough/actions/runs/42346356441).
