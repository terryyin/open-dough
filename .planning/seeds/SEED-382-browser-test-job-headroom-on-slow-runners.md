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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/693-give-the-dashboard-frontend-group-headroom-on-slow-runners/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9f8519c6a1fec4466341463000376f7cee3d33f5c94cce10e6e39ee5bffe99ec","plan":"60dd692536e0c21f1e97221c3ea51558722da289f91b0a43c4c79df038da8998"}}
```

**Goal:** Contributors get a Dashboard Frontend result on an ordinary slow
GitHub runner instead of a suite-deadline stop that cuts off unrelated tests.

**Scope:** The `dashboard-frontend` browser test group runs as two CI shards,
so each shard finishes within the 450 s deadline with room for a runner at
least 1.3× slower than usual. The split declares spec patterns that share the
group's recent test-seconds about evenly, and the CI proof summary, the shard
record (`dashboard/tests/shards.md`) and the maintained workflow checks follow
the new count. The deadline, the group's tests and workers, and the other
groups' shards stay as they are. The check of the result is the following
`main` runs' job times (`bash scripts/ci-job-times.sh`).

Decision, 2026-11-18, under the
[job-count rule](../../dashboard/tests/shards.md#the-job-count): a second
shard, not faster specs. The 10 successful `main` runs 2026-11-17T13:54Z to
2026-11-18T00:51Z ran the one frontend job in 288–390 s; 1.3× the slowest is
507 s, and the headroom needs a usual job of at most 346 s. The test step is
nearly all of the job (275–367 s of it in six of those runs) and carries
1,089 test-seconds over 272 files with no file above 109 s, so
`node scripts/ci-shard-balance.mjs dashboard-frontend` names no slow file and
no pattern move exists for one shard; reaching 346 s through faster specs
would take about an eighth of the test-seconds off evenly spread files. Two
shards make 18 jobs, 17 of them at once before the proof job, inside the
account's 20.

**Key examples:**

- Run 44200560069 on `700b3e546b67b9edb6e04747dedb105b89a169e8` ran every
  frontend file at a median 1.31× its usual time and reached the 450 s
  deadline with 8 cases unfinished; the same code passed in 343 s, and trunk
  `8e3480bc9` passed in 335 s (74–78% of the deadline). With two shards, a
  runner that slow finishes each shard well inside the deadline and every
  case reports.
- An ordinary `main` run after the change → `dashboard-frontend / shard 1/2`
  and `shard 2/2` both pass, every frontend spec file runs in exactly one of
  them, and the CI proof summary counts the entry's two shards.
- A new frontend spec file matching no declared pattern → it runs in the last
  shard without registration.

**Plan:** [Give the Dashboard Frontend group headroom on slow runners](../slice-plans/693-give-the-dashboard-frontend-group-headroom-on-slow-runners/PLAN.md)
