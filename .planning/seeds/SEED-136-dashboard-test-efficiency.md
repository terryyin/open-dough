---
id: SEED-136
status: active
planted: 2026-10-17
planted_during: Terry's request for a dashboard test improvement campaign and faster CI
trigger_when: Dashboard test redundancy and CI resource use delay feedback
scope: unknown
---

# SEED-136: Efficient dashboard testing and CI feedback

## Why This Matters

Developers and maintainers need quick, trustworthy feedback as the dashboard
grows. Terry reports GitHub Actions CI approaching five minutes despite the
product's modest feature set, and considers the dashboard's twelve parallel
jobs excessive. The current workflow confirms twelve dashboard shards; the
latest successful `main` run on 2026-10-16 took 4 min 28 s; the prior strategy
baseline remains recoverable through the Breadcrumbs below.

Terry selected two stories in this order: first unify and improve the dashboard
E2E tests using Donut's testing principles, then restore overall CI feedback to
under three minutes. A hosted probe showed that target out of reach without
redesigning test isolation or buying capacity, so the second story now
delivers the measured saving. Reduce redundant work and resource consumption before
seeking more parallel capacity. This capture queues the work; it does not
implement the campaign or create an executable plan.

## Selected Stories

<a id="restore-ci-under-three-minutes"></a>

### Cut dashboard CI time with once-per-run server bundles

**Identity:** SEED-136#restore-ci-under-three-minutes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/315-restore-ci-under-three-minutes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bbb6a094c1c786c4be85a39f105e27afe37e886184441118ba4cb998d8f0b88f","plan":"6e324712ce0c2c1ca1226d3ab0ec52438f0ce4ffa114b47e6c0a1cc237a32f3c"}}
```

**Beneficiary:** Developers waiting for a complete CI verdict before continuing
or integrating work, and maintainers paying for runner resources.

**Goal:** Lower the dashboard suite's hosted CI cost and the complete CI
verdict by starting each test's dashboard server from code bundled once per
run, with unchanged coverage, isolation and job layout.

**Scope:**

Required:

- Bundle the dashboard's Vite configuration and boundary server entry once in
  each suite run's global setup, from that run's checkout, into a run-owned
  directory that teardown removes. Preserve each bundled module's own
  `import.meta` location, so path-relative reads behave as from source.
  Include the Cursor runner child entry in that bundle: profiling during
  Terry's continued execution found its source transformation still repeated
  at every fresh server HOME. Keep its ownership and source fallback.
- Start every preview server and boundary-mode server from that bundle: the
  `dashboard` fixture, direct `startDashboardServer` callers, and the boundary
  command spec. Development servers keep serving source.
- Keep the twelve-shard workflow, its checks and deadlines. Prove the effect on
  matched hosted runs and update the measurements this story records.

Preserved constraints, from the
[test contract](../../dashboard/tests/README.md): meaningful coverage,
`retries: 0`, truthful nonzero failures, retained failure diagnostics, build
freshness, per-test server isolation, concurrent-run isolation and the run's
no-leaked-process sweep. A shared mutable server or bundle reused across runs
is out of scope.

Rejected, with the hosted probe below as evidence: starting serial chains
first (the runner is CPU-saturated, so the chain only slows), avoiding private
preview builds (no suite test builds privately), and the native or runner Vite
config loaders (no gain, or slower).

Deferred promises: a below-180-second verdict, fewer dashboard jobs, a new CI
service, larger or paid runners, and a per-worker shared-server isolation
redesign. Terry chose on 2026-10-18 to relax the original targets to what this
measured saving delivers, rather than redesign test isolation or buy capacity.

**Key examples:**

1. *Matched hosted saving.* Given the candidate revision and its unchanged
   original unbundled control (`f4466c10`, retained by Terry's continuation on
   2026-10-19) run concurrently on `ubuntu-24.04` with twelve dashboard shards, the
   candidate's summed dashboard suite-step seconds are lower in each of two
   matched pairs, by at least 8% on average, with every required check
   passing. A pair that shows no saving is reported, not retried away.
2. *Same behavior from the bundle.* Given a preview journey, a boundary spec
   and the real dev/preview serving-mode equivalence cases, each passes against
   the bundled entries. The boundary command spec names the bundled entry, and
   a module reading a file relative to its own source still finds it.
3. *Freshness and cleanup.* Given an edit to a server module, the next run
   serves the edited behavior without a manual step. Given a passing,
   failing or interrupted run, its bundle directory is gone afterwards, and two
   concurrent runs from one checkout never share or remove each other's bundle.
4. *Bundle failure is truthful.* Given a server module that cannot be bundled,
   the run fails in global setup naming the bundling error, before any test
   reports success.

The original matched-run example began: "Given the candidate revision and its
unchanged parent run concurrently on `ubuntu-24.04` with twelve dashboard
shards". Terry's continuation retains that original unbundled parent as the
control for further optimization, with the same 8% criterion.

**Hosted delivered evidence (2026-10-19):** The delivered candidate
`0133c0bfb0197e7681579520d3a4d79924297d44` was compared twice with its
unchanged parent `f4466c10ffcfe3697a51a0f829a7ed063d06f2ba`, which includes
the deterministic reporter-fixture repair. Each candidate run used a `push`
event and each parent run a `workflow_dispatch` event, on `ubuntu-24.04`.

| Pair | Parent run | Candidate run | Summed suite-step seconds, parent → candidate | Reduction | Summed test seconds, parent → candidate |
| --- | --- | --- | --- | --- | --- |
| 1 | [39179538825](https://github.com/terryyin/open-dough/actions/runs/39179538825) | [39179487955](https://github.com/terryyin/open-dough/actions/runs/39179487955) | 2,191 → 2,131 | 2.738% | 7,444.239 → 7,119.728 |
| 2 | [39180257177](https://github.com/terryyin/open-dough/actions/runs/39180257177) | [39180260655](https://github.com/terryyin/open-dough/actions/runs/39180260655) | 2,456 → 2,256 | 8.143% | 8,320.714 → 7,523.376 |

Both pairs saved suite-step time, but their arithmetic mean reduction was
5.441%, below the required 8%; the hosted-saving criterion remains unmet.
Every run passed all
16 jobs: twelve dashboard shards, three shell shares and one lint job. Each
run's twelve HTML reports record all 1,537 tests passing, with no skipped,
unexpected or flaky tests. Suite-step seconds come from the Jobs API's
`Run the dashboard browser suite` timestamps; test seconds are the sum of
`files[].tests[].duration` in the HTML reports' embedded `report.json` files.

The runner image was `ubuntu-24.04` version `20261012.334.1` (Ubuntu 24.04.5),
with Node 24.21.0 already in the tool cache in every job. Cache restore
outcomes from the setup-node and Chromium-cache step logs were:

| Run | npm cache, all 16 jobs | Chromium cache, twelve dashboard jobs |
| --- | --- | --- |
| Pair 1 parent | 16 hit | 12 hit |
| Pair 1 candidate | 16 miss | 12 miss |
| Pair 2 parent | 16 hit | 12 hit |
| Pair 2 candidate | 10 hit, 6 miss | 5 hit, 7 miss |

These are two hosted observations, subject to runner variance, unequal cache
warmth and queue delays. Pair 1's candidate was created at 00:09:21 UTC and
parent at 00:10:01 (40 seconds later); pair 2's parent was created at 00:19:24
and candidate at 00:19:27 (three seconds later). Queuing initially affected
parent jobs in pair 1 and candidate jobs in pair 2, so complete-run wall-clock
times do not isolate the bundling effect. The first pair is retained as measured.

The first attempt to launch pair 2 created the candidate alias branch at the
candidate SHA but emitted only a branch `CreateEvent`, with no candidate CI
run. Its unpaired parent [39180107803](https://github.com/terryyin/open-dough/actions/runs/39180107803)
was cancelled. One launch repair created the owned alias at the parent, then
fast-forward-pushed the same candidate while dispatching a new parent run;
that produced pair 2 above. No measured result was retried or replaced.
The prior probe evidence is recoverable at
`f4466c10:.planning/seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes`;
the superseded under-three-minute investigation is recoverable at the same
path in `7d08bc72`.

**Architecture:** Keep run lifecycle in `dashboard/tests/support/globalSetup.ts`
and server launch in `dashboard/tests/support/serverAddress.ts`. One new
test-support module owns bundling. It uses `rolldown`, which Vite already
locks at 1.2.9, declared as a direct development dependency rather than
imported transitively. The bundle lives in a run-unique directory under the
repository's `node_modules`, so bare imports resolve as they do from source.
The existing Cursor launcher prefers an adjacent compiled runner when emitted
with the server bundle, otherwise retaining its current source entry.
Production serving is unchanged. Accepted ADR 0002 (empirical improvement,
least complexity) applies; no ADR or North Star change is needed.

**Safe stopping point:** Every dashboard server a suite run starts in preview
or boundary mode loads that run's bundle, with the matched hosted saving
recorded.

## Ordering

The E2E strategy and suite improvement story is complete (landed 2026-10-18;
its section is recoverable at
`0c96a546:.planning/seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e`).
The CI runtime story is the remaining selected work, narrowed on 2026-10-18 to
the measured server-bundle saving. Queue priority does not authorize execution or create a
technical blocking dependency. Preserve the existing near-future direction.

## Breadcrumbs

- Terry's request and revised priority order, 2026-10-17; authorized capture on
  `main` and synchronization with `origin`.
- [Current dashboard test contract](../../dashboard/tests/README.md),
  [Playwright configuration](../../dashboard/playwright.config.ts), and
  [GitHub Actions workflow](../../.github/workflows/ci.yml).
- Baseline measurements of 2026-10-17 (hosted run 38838738715 and one local
  full run at 88f6d3f8 with Playwright's proof record) in the completed
  strategy story's section, recoverable at
  `0c96a546:.planning/seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e`.
- Donut is the repository named `doughnut`. Its reviewed guidance at revision
  `7178e92d045e56aa37214de82d85a197d456a19c` supplies the principles to adapt:
  [E2E authoring](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/e2e-authoring/SKILL.md#L109-L206)
  and [small tests](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/unit-testing/SKILL.md#L7-L26).
