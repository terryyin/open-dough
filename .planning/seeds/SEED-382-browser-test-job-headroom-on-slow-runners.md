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

#### Goal

Contributors get the same browser test verdict on a slow CI runner as on a
typical one, without a passing revision failing because its job ran out of
time.

#### Key examples

- The `dashboard-frontend` job runs lint and the dashboard type-check on its
  own runner, and the 450-second browser-run deadline in
  `.github/workflows/browser-test-group.yml` counts from the job's start. On
  a runner about 1.5 times slower than typical, lint took 122 s, the
  type-check 28 s and the suite was ended at 289 s, so a records-only
  revision failed (run 43797393195 at `ff6f191`). The same code passed in
  319 s on a typical runner (run 43792139474). Given such a runner, the job
  still finishes its suite and reports the tests' own result.
- Recent `dashboard-frontend` jobs took 315–442 s against that 450 s
  deadline (runs on 2026-11-16), so ordinary variation already reaches it.
- In the same slow run, `e2e/launches/responsive-session-recovery-restart.spec.ts:47`
  exceeded its 30-second test timeout. Given a slow runner, it either passes
  or its slowness is diagnosed and fixed.

#### Starting evidence

- The deadlines are declared in
  [browser-test-group.yml](../../.github/workflows/browser-test-group.yml),
  and the job-count rule is in
  [shards](../../dashboard/tests/shards.md). SEED-381's
  [browser shard story](SEED-381-fixed-ci-test-shards.md#fixed-shards-for-browser-tests-and-on-demand-rebalancing)
  rewrites the same job configuration, so this story follows it.
