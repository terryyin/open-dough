---
id: SEED-306
status: active
planted: 2026-11-11
planted_during: Terry reported unavailable CI timing in Doughnut's completed story comparison
trigger_when: Intent cannot match a GitHub Actions matrix instance to its workflow job
scope: story
---

# SEED-306 — CI timing for GitHub Actions matrix jobs

<a id="show-ci-time-without-runner-waits-for-matrix-jobs"></a>

### Show CI time without runner waits for matrix jobs

**Identity:** SEED-306#show-ci-time-without-runner-waits-for-matrix-jobs
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer comparing story builds in Project Intent can read **CI time
without runner waits** for GitHub Actions workflows with explicitly named
matrix jobs when the build's job timings and dependencies are available. The
Open Dough dashboard can calculate this for historical builds from their
existing workflow and attempt data.

#### Evidence

For Doughnut's **Publish large notebooks without losing history** story,
Intent showed wall time but reported a job-name mismatch for all three builds.
Baseline `55ae0d0` and Branch `dfc60de` showed `End-to-End tests with Database`
followed by a long matrix shard label ending in `...`. Landed `35366d2` showed
`Backend Unit tests (1)`. Each workflow declares the bare display name and a
matrix. Replaying the names from the screenshot against each build's workflow
reproduced the errors in Intent's exact matcher for literal job names.
[Doughnut workflow at landing](https://github.com/nerds-odd-e/doughnut/blob/35366d2509bd7568d8ac4813245f62f80687d142/.github/workflows/ci.yml) ·
[Intent job-name matcher](../../dashboard/server/ciWorkflowJobs.ts)

#### Key examples

- A build reports `Backend Unit tests (1)` for the `Backend Unit tests` matrix.
  Intent uses its duration on the workflow's dependency chain.
- An end-to-end matrix shard reports a long, truncated label that uniquely
  identifies its workflow job. Intent includes that shard when it determines
  the longest dependency chain. With parallel shards of 40 and 60 seconds
  followed by a 30-second proof job, the chain takes 90 seconds even if the
  jobs waited for runners.
- If a reported name matches zero or multiple workflow jobs, Intent explains
  why the estimate is unavailable and still shows the build's wall time.
