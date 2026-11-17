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

<a id="give-the-frontend-group-headroom-on-slow-runners"></a>

### Give the Dashboard Frontend group headroom on slow runners

**Identity:** SEED-382#give-the-frontend-group-headroom-on-slow-runners

**Goal:** Contributors get a Dashboard Frontend result on an ordinary slow
GitHub runner instead of a suite-deadline stop that cuts off unrelated tests.

**Scope:** The `dashboard-frontend` browser test group finishes within its
deadline with room for a runner about 1.3× slower than usual: a measured second
shard (through the shard rebalance workflow, within the 20-job limit), faster
slowest specs, or both, chosen from recent CI timings at decision time. The
group's deadline and its other groups stay as they are.

**Key example:** run 44200560069 on `700b3e546b67b9edb6e04747dedb105b89a169e8`
ran every frontend file at a median 1.31× its usual time and reached the 450 s
deadline with 8 cases unfinished; the same code passed in 343 s, and trunk
`8e3480bc9` passed in 335 s (74–78% of the deadline).
