---
id: SEED-382
status: active
planted: 2026-11-16
planted_during: Story wrap-up of SEED-380, after a slow CI runner ended the frontend job at its deadline
trigger_when: selected from the product backlog
scope: story
---

# SEED-382 — Browser test job headroom on slow runners

<a id="type-check-reports-after-a-lint-failure"></a>

### Prove the type-check reports after a lint failure

**Identity:** SEED-382#type-check-reports-after-a-lint-failure
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/661-type-check-reports-after-a-lint-failure/PLAN.md"}
```

**Goal:** Contributors keep CI's promise that a lint failure does not hide
the dashboard type-check's own result: a change that makes the `lint` job's
type-check step depend on lint fails a maintained check.

**Scope:** The maintained workflow check of `ci.yml`'s `lint` job also
verifies the type-check step's condition. The workflow's behavior and every
other check stay as they are.

**Plan:** [Prove the type-check reports after a lint failure](../slice-plans/661-type-check-reports-after-a-lint-failure/PLAN.md)

<a id="run-the-integrated-group-as-one-ci-job"></a>

### Run the Dashboard Integrated group as one CI job

**Identity:** SEED-382#run-the-integrated-group-as-one-ci-job
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** CI keeps the smallest job count the job-count rule allows: the
Dashboard Integrated UI Test group runs as one job, since
`bash scripts/ci-job-times.sh` reports `could drop one` for it.

**Scope:** `dashboard-integrated` in `.github/workflows/ci.yml` declares one
shard and no spec pattern, its CI proof declaration follows, and
`dashboard/tests/shards.md` records the count and the decision. The other
groups, the deadline and the tests stay as they are.

**Expectations:** On 2026-11-18 the report read two jobs over 8 runs with the
slowest at 45 to 71 seconds and projected one job at 68 to 124 seconds
against the 450-second deadline. The following `main` runs are the check; a
deadline failure restores the count.
