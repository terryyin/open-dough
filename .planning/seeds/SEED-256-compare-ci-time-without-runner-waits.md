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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5ee52d78c96fa0d9b0c93e6b665236eebe046fdeb26fc8ff9057ea10dda75c63","plan":"463fe2c7da93362abb91bad5d8484ee8a6659b9299d7f90f4acd87cd365ce721"}}
```

**Beneficiary:** A developer reviewing a story's CI timing comparison in Intent.

**Goal:** The developer can see how long each Baseline, Branch, and Landed
build took to finish, and compare the builds by how long their jobs took to
run, unaffected by how long those jobs waited for a runner. A branch that
queued for eight minutes behind other work no longer reads as eight minutes
slower.

**Scope:**

- Keep each build's **CI wall time** as context, measured as today from the
  attempt's start through its completion (for a first attempt, the run's
  creation). It no longer carries a difference from Baseline.
- Add each build's **CI time without runner waits**: the longest chain of
  dependent jobs in that attempt, each job counted by its own observed
  start-to-finish duration. Required follow-on jobs stay in the chain; the
  wait for a runner before any job does not. The jobs of a re-run attempt
  include those GitHub carried over from earlier attempts, with their own
  durations.
- Branch, Provisional, and Landed show their signed whole-second difference
  from Baseline on this measure, in the existing signed format. Any faster or
  slower cue on the comparison, including one a later story adds, uses this
  measure rather than wall time. Differences stay framed as observations
  between single builds.
- Take job dependencies from the build's own workflow definition at its
  revision (each job's `needs`), matched to the attempt's reported jobs.
- When a build is still running, its job timings are missing, or its job
  dependencies cannot be read or matched unambiguously, show its available
  wall time and say why the time without runner waits is unavailable. A build
  without that time shows no difference; other builds keep theirs.

**Deferred:**

- Naming the jobs on the longest chain, or per-job waits.
- The time without runner waits on the judged run's **Proof** line outside the
  comparison.

**Examples:**

- The source-review story: the
  [baseline build](https://github.com/terryyin/open-dough/actions/runs/42341688832)
  took 4 min 59 s of wall time; its longest chain is the 4 min 42 s
  `dashboard (9/12)` shard then the 13 s `ci-proof` job, 4 min 55 s. The
  [branch build](https://github.com/terryyin/open-dough/actions/runs/42346356441)
  took 13 min 27 s because shards waited up to eight minutes for runners; its
  longest chain is `dashboard (3/12)` at 4 min 33 s then `ci-proof` at 14 s,
  4 min 47 s. Intent shows both pairs and the branch as `-8 s` on time without
  runner waits, with no wall-time difference.
- A re-run of failed jobs
  ([run 42196943419, attempt 2](https://github.com/terryyin/open-dough/actions/runs/42196943419/attempts/2))
  re-ran only `dashboard (12/12)`. Its wall time covers the re-run's 5 min
  19 s; its time without runner waits is that 4 min 55 s shard then the 17 s
  `ci-proof` job, 5 min 12 s; no carried-over job ran longer than that shard.
- The Landed build's workflow names a job that matches two reported jobs, or
  its workflow definition cannot be read. Landed shows its wall time, says why
  its time without runner waits is unavailable, and shows no difference;
  Baseline and Branch keep theirs.

**Architecture:**

- GitHub's job listing gives each job's created, started and completed times
  but not its dependencies, so dependencies come from the workflow file at the
  workflow's `path` and the build's revision, read from the project folder's
  local Git as the comparison already reads commit subjects. A matrix or
  templated job `name` matches its reported jobs by the template's literal
  text; zero or several matches make the dependency evidence unavailable
  rather than guessed. Inferring dependencies from job creation times was
  rejected: carried-over jobs in a re-run attempt are created after they
  started, and the jobs finished before a creation time are only a superset
  of its `needs`.
- Each shown completed attempt adds one GitHub job listing (per 100 jobs). A
  completed attempt's jobs do not change: remember them as the attempt's CI
  proof summary is remembered, and record the added cost in
  [GitHub requests](../../dashboard/GITHUB-REQUESTS.md).
- The estimate is derived from GitHub's observations and rebuilt on read, and
  missing evidence stays distinct from a measured time, as
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  requires. The existing comparison is described in
  [Intent development](../../docs/dashboard-development-intent.md).
