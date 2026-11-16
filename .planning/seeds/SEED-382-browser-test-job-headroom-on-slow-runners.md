---
id: SEED-382
status: active
planted: 2026-11-16
planted_during: Story wrap-up of SEED-380, after a slow CI runner ended the frontend job at its deadline
trigger_when: selected from the product backlog
scope: story
---

# SEED-382 — Browser test job headroom on slow runners

<a id="browser-test-job-headroom-on-slow-runners"></a>

### Keep browser test jobs inside their deadline on slow runners

**Identity:** SEED-382#browser-test-job-headroom-on-slow-runners
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/657-browser-test-job-headroom-on-slow-runners/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b5b34399c7e4bec0555d5b15aab4317d34ddd59375ea506c6199b98aa0248126","plan":"3388b93b51952b38867b7e10390be74405ad2e7af1f8ab1093b8508248874a61"}}
```

#### Goal

Contributors get the same browser test verdict on a slow CI runner as on a
typical one, without a passing revision failing because its job or one of its
tests ran out of time. The deadlines stay reviewed ceilings: the verdict
arrives no later than it does today.

#### Scope

- Lint and the dashboard type-check run in a CI job of their own, with their
  own outcome and setup deadlines. The `dashboard-frontend` job runs only its
  browser suite, so its whole 450-second browser-run deadline serves the
  suite.
- The browser-run deadline (450 seconds) and the job bound (8 minutes) keep
  their values. No runner-speed measurement or scaled deadline is added.
- `e2e/launches/responsive-session-recovery-restart.spec.ts:47` keeps the
  default 30-second test timeout
  ([test automation](../../AGENTS.md#test-automation)) and every current
  assertion. Its stall is diagnosed and its cause fixed: in the failed run
  the journey reached "Continue execution" on the second page 10.3 s in, and
  the continued start then did not settle in the remaining 19.7 s.
- [Shards](../../dashboard/tests/shards.md) describes the resulting layout:
  the job table and count, where lint and the type-check run, and the
  deadline the workflow declares (its deadline section still says 320 seconds
  and 6 minutes).

Scope limits:

- Other groups' exposure to slow runners stays with the existing
  [job-count rule](../../dashboard/tests/shards.md#the-job-count): `e2e`
  (slowest job 271–311 s) and `dashboard-backend` (206–315 s) are not resized
  here.
- Finding other tests close to their timeout is deferred; SEED-381's
  rebalancing skill already promises to flag notably slow tests.
- Making lint itself faster is deferred.

#### Key examples

- A `dashboard-frontend` runner as slow as the one in run 43797393195 (lint
  122 s against a typical 79 s, the type-check 28 s against 18 s, the suite
  ended at 289 s against a typical 177 s with 193 of 195 spec files already
  run) → the job starts its suite about 12 s after its deadlines start
  instead of 162 s → the suite finishes with over 100 s to spare and the job
  reports the tests' own result.
- A typical runner → the `dashboard-frontend` job reaches the end of its
  suite about 100 s sooner than today's 234–443 s (10 successful `main`
  runs, 2026-11-15 to 2026-11-16), where it was the group closest to its
  deadline at 7 s of headroom.
- A lint or type-check failure → its own job fails naming it, and the
  `dashboard-frontend` job still reports its suite's result; a suite failure
  leaves the lint job's result unchanged.
- The restart-recovery test at line 47, whose file of two tests takes 17–28 s
  on `main`, on a runner about 1.2 times slower than typical (`e2e` shard 5/6
  of run 43797393195) → the continued start settles and the test passes,
  where it waited 19.7 s for that settlement and timed out at 30 s.

#### Architecture

The shared browser-group workflow loses its `lint` input and every lint step,
so it runs one group's browser tests and nothing else; `ci.yml` owns the lint
and type-check job. CI then has 19 jobs, 18 running at once against the
account's 20. The added job is justified by the measured verdict time: the
frontend job was the slowest job in recent runs. The job-time report already
says `dashboard-integrated` could drop one job, which would return the count
to 18 under the existing rule. No Accepted ADR governs the CI layout.

This reverses the cohosting of lint on the frontend runner from 2026-11-14
(`97b0f808f`), made before the frontend group grew with the Integrated UI
dissolution. The developer confirms the reversal, or picks another option
below, before the story is Taken.

#### Considered and not chosen

- Raising the deadline and job bound: the smallest change, but it lengthens
  the worst verdict and returns as the suite grows.
- Scaling the deadline by a measured runner speed, as handicap racing
  corrects elapsed time by a rating: lint's 1.54 slowdown did match the
  suite's, but the job bound cannot scale and SEED-381 is removing the same
  kind of runner-factor machinery.
- Hosting lint on a `dashboard-integrated` shard, or giving the frontend
  group a second shard taken from integrated: both keep 18 jobs but tie lint
  to a group SEED-381 is about to redeclare, and again spend a test job's
  budget on lint.

#### Starting evidence

- The deadlines are declared in
  [browser-test-group.yml](../../.github/workflows/browser-test-group.yml),
  and the job-count rule is in
  [shards](../../dashboard/tests/shards.md). SEED-381's
  [browser shard story](SEED-381-fixed-ci-test-shards.md#fixed-shards-for-browser-tests-and-on-demand-rebalancing)
  rewrites the same files. Neither story needs the other's outcome; the one
  that lands second reconciles the text.
- `bash scripts/ci-job-times.sh` prints each group's slowest job against its
  deadline from the last 10 successful `main` runs.

<a id="type-check-reports-after-a-lint-failure"></a>

### Prove the type-check reports after a lint failure

**Identity:** SEED-382#type-check-reports-after-a-lint-failure

**Goal:** Contributors keep CI's promise that a lint failure does not hide
the dashboard type-check's own result: a change that makes the `lint` job's
type-check step depend on lint fails a maintained check.

**Scope:** The maintained workflow check of `ci.yml`'s `lint` job also
verifies the type-check step's condition. The workflow's behavior and every
other check stay as they are.

**Plan:** [Prove the type-check reports after a lint failure](../slice-plans/661-type-check-reports-after-a-lint-failure/PLAN.md)
