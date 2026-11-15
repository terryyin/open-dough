---
id: SEED-355
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-355 — Reconsider further CI job reduction with a different approach

<a id="reconsider-further-ci-reduction"></a>

### Reconsider further CI job reduction with a different approach

**Identity:** SEED-355#reconsider-further-ci-reduction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/641-size-ci-jobs-from-recent-runs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9c743c1d7b015e1c657f3bbf05ffcfb644296f773d74bac47911af5332870291","plan":"4aadb6efd29cbd88f4d821add89736aaafe89bc5c556834c19cc46398e8a3a1d"}}
```

#### Goal

A developer changes the CI job count only on evidence. One command reads recent
`main` runs and says, for each test group, how close its slowest job runs to
the 320-second job deadline and whether one job fewer would still fit. The
layout stays at the 18 jobs that evidence supports, so runner demand is as low
as the deadline allows without another layout campaign.

#### Scope

- Developer decision, 2026-11-15: settle at the current 18-job layout (six E2E,
  four integrated, one frontend with lint and type-check, three backend, three
  Distribution shares, one proof) and justify later changes by rule. This story
  changes no job count, deadline, job timeout, worker count, test or CI proof
  declaration.
- A read-only report command beside `scripts/ci-test-times.sh`, with its
  conventions: it reads the last 10 successful `ci.yml` runs on `main` through
  `gh`, starts no run, and without readable runs says why and exits 1. For each
  group (`e2e`, `dashboard-integrated`, `dashboard-frontend`,
  `dashboard-backend`, Distribution Tests) it prints the job count, the slowest
  job's seconds from job start to the end of its test step (what the deadline
  bounds), lowest to highest across the runs read, the headroom to the deadline,
  the projected slowest job at one job fewer, and a verdict: `keep` or
  `could drop one`.
  - A group is judged over the runs that have its current job count, and its
    line says how many.
  - `could drop one` requires the projection to stay inside the deadline with a
    stated reserve for runner-speed variation: a job's slowest recent run took
    up to 1.6 times its median.
  - One further line gives the runs' runner wait (job creation to start) and
    verdict time, apart from the group lines, which a wait never changes.
- The sizing rule, recorded once beside the layout in
  [shards](../../dashboard/tests/shards.md) and linked from
  [test shares](../../Distribution/tests/test-shares.md) and the `ci.yml` layout comment:
  - Each group keeps the smallest job count whose slowest job stays inside the
    deadline in recent `main` runs.
  - Remove a job when the report says `could drop one`. The following `main`
    runs are the check; a deadline failure restores the count.
  - Add a job only after a job of that group is ended by the deadline on `main`
    and neither a refreshed duration list nor a faster spec restores its
    headroom. Verdict time is never a reason: it is the slowest job plus runner
    wait, the account runs 20 jobs at once, and more jobs lengthen the wait.
  - A sizing decision reads the report. It needs no matched-run comparison, new
    measurement run or copied CI data.
- Record the decision to stay at 18 and its short rationale beside the layout,
  naming the runs the report read when the story is executed. Raw CI data stays
  in CI. The rule replaces the layout note's pointer to this queued
  reconsideration.

This increment does not lengthen the deadline to run fewer, longer jobs, select
groups by changed path, pack several groups into one job, reduce test-seconds,
or add tests that assert workflow configuration. Runner demand below this
layout comes from fewer test-seconds, which
[retiring Dashboard Integrated UI Test](SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test)
and
[suite optimization](SEED-365-e2e-development-and-test-optimization.md#drive-development-with-e2e-and-optimize-the-suite)
own; the report then shows when a group's count can follow.

#### Key examples

- Given recent successful `main` runs of the present layout, run the report →
  five group lines and one wait line. On the runs read for refinement, by
  whole-job duration, `dashboard-backend` has 3 jobs, its slowest job took
  206–311 s, headroom is 9 s and two jobs project 298–453 s; every group says
  `keep`.
- Given E2E's six jobs with a slowest job of 215–259 s → five jobs project
  253–305 s, inside 320 s but not inside the reserve → `keep`. The report does
  not recommend the five-job allocation whose shard reached the cutoff in
  [run 43681477553](https://github.com/terryyin/open-dough/actions/runs/43681477553).
- Given a group whose jobs became much shorter, such as four integrated jobs
  with a slowest job of 120–150 s after checks moved out → three jobs project
  about 190 s, inside the deadline with the reserve → `could drop one`. The
  developer drops one job, and the next runs' report judges the new count.
- Given a run that waited for runners (run 43677361170: jobs waited up to
  656 s, verdict 882 s, slowest job 294 s) → the wait line shows the wait and
  the verdict time; no group's seconds, headroom or verdict changes.
- Given runs across a layout change (E2E five jobs in older runs, six in newer)
  → E2E is judged over the six-job runs only and its line says how many.
- Given `gh` fails or lists no successful run → the command names the reason
  and exits 1 with no verdict.
- Given a developer who wants a faster verdict and considers a seventh E2E job
  with no deadline failure on `main` → the rule gives no ground to add it.

#### Evidence and limits

SEED-350's six-run screen (16/17 jobs against 21/22) was inconclusive:
background load and a since-repaired HTML-report collision confounded it. The
later owned CI repair moved the layout from 17 to 18 jobs after two
integrated-browser deadline failures.

Refinement read the jobs API for 16 successful `main` runs, 43671922574 to
43709868512, the times artifacts of run 43704027840 and the run list of the
last 300 `ci.yml` runs:

- No group can drop a job at the 320-second deadline: one fewer projects
  278–434 s for Distribution, 298–453 s for backend, 268–332 s for integrated
  and 253–305 s for E2E; the frontend job, which also runs lint and the
  type-check, took up to 320 s.
- Jobs have no idle capacity: every job runs its tests four wide and finishes
  in about its test-seconds divided by 3.7.
- A run costs about 3,700 runner-seconds, about 86% of it test execution. Job
  count changes only about 22 s of setup per job.
- Runner wait, not job count, slows verdicts: an unqueued run finishes in about
  300–335 s, but 28% of successful runs took over 400 s, at about 5 runs an
  hour with bursts near 12.

These numbers describe those runs; the report replaces them at each decision.

#### Origin and priority

Explicit developer transfer from SEED-350's early closure; second queued story,
after configuration/data-only test cleanup. Ordering is not a technical dependency.
