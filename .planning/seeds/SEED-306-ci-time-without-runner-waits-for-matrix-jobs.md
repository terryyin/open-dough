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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/583-show-ci-time-without-runner-waits-for-matrix-jobs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8e1f86e80eab919019dc539581089f15f3ad28c79a5b173cb1043416822b515a","plan":"565a22f82aa6d6864b66bddc791ea9c1c5f412efe694da3b855a17d6c1cbc31c"}}
```

#### Goal

A developer comparing story builds in Project Intent can read **CI time
without runner waits** for GitHub Actions workflows whose jobs use an
explicit static display name and a matrix, when the build's job timings and
dependencies are available. The Open Dough dashboard calculates that estimate
for historical builds from their existing workflow definition and attempt job
rows.

#### Scope

**Required behavior**

- Match each reported attempt job name that GitHub derives from an explicitly
  named matrix workflow job — including a static display name with a
  parenthesized matrix suffix, and a long truncated label that still uniquely
  identifies that workflow job — to that job's definition.
- Use those matched durations on the existing longest-dependency-chain
  calculation so parallel matrix shards contribute only their longest
  instance through that definition.
- When a reported name matches zero or multiple workflow jobs, keep explaining
  why the estimate is unavailable and still show the build's wall time.
- Serve the estimate from the workflow YAML and attempt jobs already retained
  for the compared builds; no new CI fetch is required for this matching fix.

**Required restrictions**

- A reported name must continue to resolve to exactly one workflow job
  definition before its duration enters the chain. Ambiguous or empty matches
  stay unavailable estimates, not guessed timings.

**Scope limits**

- Does not change how wall time is measured or shown.
- Does not change the longest-chain timing rule beyond correcting which
  reported matrix instances bind to which workflow jobs.
- Does not cover custom CI adapters (SEED-266) or comparison UI redesign;
  adapters already supply their own job graph.
- Does not promise a match when truncation or naming leaves the reported label
  unable to identify exactly one workflow job.
- Does not require rewriting client workflows to embed matrix values in `name:`
  expressions; Intent must accept GitHub's default matrix naming for a static
  display name.

**Evidence**

For Doughnut's **Publish large notebooks without losing history** story,
Intent showed wall time but reported a job-name mismatch for all three builds.
Baseline `55ae0d0` and Branch `dfc60de` showed `End-to-End tests with Database`
followed by a long matrix shard label ending in `...`. Landed `35366d2` showed
`Backend Unit tests (1)`. Each workflow declares the bare display name and a
matrix. Replaying the names from the screenshot against each build's workflow
reproduced the errors in Intent's exact matcher for literal job names.
[Doughnut workflow at landing](https://github.com/nerds-odd-e/doughnut/blob/35366d2509bd7568d8ac4813245f62f80687d142/.github/workflows/ci.yml) ·
[Intent job-name matcher](../../dashboard/server/ciWorkflowJobs.ts)

**Assumptions**

- For a static `name:` on a matrix job, GitHub reports instances as that name
  plus a parenthesized matrix context (and may truncate very long labels with
  `...`).
- Jobs whose `name:` already includes matrix expressions keep the existing
  expression-aware matcher; this story closes the static-name matrix gap.

#### Key examples

- Pre-condition: the workflow defines `Backend Unit tests` with a matrix, and
  the attempt reports `Backend Unit tests (1)` with valid start and completion
  times. Trigger: Intent computes CI time without runner waits for that build.
  Result: the instance matches that workflow job and its duration enters the
  dependency chain.
- Pre-condition: an end-to-end matrix shard reports a long truncated label that
  still uniquely identifies the `End-to-End tests with Database` job, with
  parallel shards of 40 s and 60 s followed by a 30 s proof job that needs
  them. Trigger: the same estimate. Result: that shard is included; the chain
  is 90 s even when the jobs waited for runners.
- Pre-condition: a reported name matches zero workflow jobs, or more than one.
  Trigger: the same estimate. Result: Intent explains why the estimate is
  unavailable and still shows the build's wall time.
