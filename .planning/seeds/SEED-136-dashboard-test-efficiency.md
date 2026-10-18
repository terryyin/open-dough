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
latest successful `main` run on 2026-10-16 took 4 min 28 s, and the first
story's section records the measured baseline.

Terry selected two stories in this order: first unify and improve the dashboard
E2E tests using Donut's testing principles, then restore overall CI feedback to
under three minutes. Reduce redundant work and resource consumption before
seeking more parallel capacity. This capture queues the work; it does not
implement the campaign or create an executable plan.

## Selected Stories

<a id="dashboard-test-bounds-and-placement"></a>

### Bound each dashboard test after its event and place page-less specs at the boundary

**Identity:** SEED-136#dashboard-test-bounds-and-placement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/313-dashboard-test-bounds-and-placement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"783b64d3249def9689178a2825832bd6b526e8736b9ba1c75d66ae24f03dbad1","plan":"d76d5ab0b77729511f61a0c9aea7ae74da7321deb388664fdd08b64585588602"}}
```

**Beneficiary:** Developers running the dashboard suite on a loaded machine
or in CI, who need a failure to mean a defect.

**Goal:** A bounded correction from the execution retrospective of
SEED-136#unify-and-streamline-dashboard-e2e (plan 310, recoverable at `0c96a546:.planning/slice-plans/310-unify-dashboard-e2e-strategy/PLAN.md`,
commits 789b7ca9..0bee7fd8): no dashboard test's bound precedes the event it
depends on, and every spec that opens no page lives in
`dashboard/tests/boundary/`, as [dashboard/tests/README.md](../../dashboard/tests/README.md)
"Two tiers" and "Synchronization" state. The findings are older weaknesses
the campaign's measurements surfaced plus one residue of the campaign. No
feature promise: every assertion, title and test count stays. Plan:
[313](../slice-plans/313-dashboard-test-bounds-and-placement/PLAN.md).

**Scope:**

Required:

- `boundary/project-add-boundary.spec.ts` "Add validation ends gh on deadline
  and leaves the saved list untouched": the spawned `gh` is observed before
  the product's deadline can expire; the polls stay event-driven; no sleep.
- `agent-launch-preparation-codex-retry.spec.ts`,
  `boundary/agent-launch-preparation-resume.spec.ts` and
  `boundary/agent-launch-start-resume.spec.ts` declare the bound their real
  git starts need, as [writing-journeys.md](../../dashboard/tests/writing-journeys.md)
  "Commands, servers and shared preconditions" prescribes for a test that
  builds its fixture; the guide states that rule for any test whose own work
  approaches the default bound.
- `serving-modes.spec.ts` and `production-watcher-refusals.spec.ts` move to
  `boundary/`, with their imports, the comments that cite them and the
  README's references updated; the README names
  `boundary/serving-modes.spec.ts` as the one boundary spec that starts the
  Vite servers on the run's build.

Preserved: every assertion and title; `retries: 0`; worker and shard counts;
the run's no-leaked-process sweep.

Excluded: `prebuilt: builtDashboardDir` consolidation and build placement
(SEED-136#restore-ci-under-three-minutes); the tablet iterations of
`launchTouchViewports`; file-size splits of the production files;
`longest-first`.

**Key examples:**

- *Deadline observed in order.* Pre: the deadline case starts its server
  with a 500 ms read deadline and then polls for the fake `gh`'s pid; under
  load the server answers 503 before `gh` is spawned, and the poll fails at
  its 5 s bound (plan 310: passes one run in two alone at load 28). Trigger:
  the correction. Result: the spawn is observed first, then the 503, then
  `gh`'s SIGTERM; the file passes three runs in a row with one burner per
  core.
- *Bound declared for real work.* Pre: the codex-retry journey's ten tests
  take up to 9.4 s each on a quiet machine, and the two start-resume tests
  17–24 s alone at load 40–57, all inside Playwright's default 30 s with no
  declared bound. Trigger: the correction. Result: each file declares the
  bound its work needs; a scratch regression still fails the test for its
  own reason, not a timeout.
- *Placement.* Pre: two specs that open no page sit in the journey
  directory, one of them cited at that path by the README. Trigger: the
  move. Result: a code-level scan of the top-level specs (comments and
  strings stripped) finds none without a page; discovery and sharding
  select both files once.

**Evaluation:** `bash scripts/dashboard-repeat.sh 3 --load` over the four
changed files exits 0; `npm test -- tests/support/dashboard-test-files.test.mjs`
is green; the scan finds nothing; a scratch regression per changed test
fails for the right reason; a whole run at four workers is green with
nothing of the run surviving.

**Safe stopping point:** Each slice leaves the suite green; the bounds alone
remove the load-sensitive failures if the move is deferred.

<a id="restore-ci-under-three-minutes"></a>

### Restore GitHub Actions CI feedback to under three minutes

**Identity:** SEED-136#restore-ci-under-three-minutes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/315-restore-ci-under-three-minutes/PLAN.md","assessment":"not-ready","reasons":["Slice 3 still lacks a measured, bounded fixture-cost remedy, and slice 4 lacks an observed fixture/scheduling combination that fits the complete verdict below 180 seconds with fewer jobs. Run 39092243540 yields a 164.125-second eleven-shard test-only bound, not the older impossibility claim; slice 1 must measure the shard-3 serial tail and removable setup operations, update the dependent mechanisms and proof, then reassess."],"basis":{"document":"4644cbfb9a73d950455de778fdf450d4751b7992d1073db3eb338a3775912a5c","plan":"77fd43eac32a03358bf03ce58d219aa6bde52a88c552b42643028a6867ae185a"}}
```

**Beneficiary:** Developers waiting for a complete CI verdict before continuing
or integrating work, and maintainers paying for runner resources.

**Goal:** Reduce the full GitHub Actions CI verdict to below 180 seconds on
representative hosted runs, with fewer dashboard jobs and lower aggregate
runner consumption than the current twelve-shard approach.

**Scope:**

Required:

- Measure and improve the complete workflow's critical path after the dashboard
  test campaign: checkout, prerequisite acquisition, builds, type checking,
  lint, both test tiers, teardown, and reporting. Include repeated work in
  aggregate runner consumption.
- Reduce test and fixture work as well as workflow overhead where measurements
  justify it. Choose job layout, caching, and parallelism from evidence. Fewer
  shards alone is not a sufficient solution, and reducing one phase while
  moving its cost to another phase does not satisfy the goal.
- Run the complete required checks on the candidate revision, with fewer than
  twelve dashboard jobs and lower aggregate runner seconds for the whole
  workflow than a comparable twelve-shard baseline. Count any new build or
  setup jobs in consumption; report runner capacity as well as job count.

Preserved constraints, from this story's original evaluation and the
[test contract](../../dashboard/tests/README.md): meaningful coverage,
`retries: 0`, truthful nonzero failures, retained failure diagnostics, build
freshness, test isolation, and the run's no-leaked-process sweep. Do not skip
checks, hide failures, or relax deadlines to obtain a faster result. The
[sibling correction](#dashboard-test-bounds-and-placement) owns its already
selected timeout and placement changes; reconcile with that work without
duplicating it or introducing a blocking story dependency.

Deferred promises: a new CI service, paid/larger runner migration, a general
benchmark dashboard, and changes to product behavior unrelated to the feedback
goal. The completed campaign's ≤1,244 s hosted dashboard suite-step total and
≤380 s local target are not acceptance requirements of this story, as Terry
confirmed on 2026-10-18. Local runs still prove correctness and inform diagnosis.

**Key examples:**

1. *Complete ordinary verdict.* Given a candidate containing the full required
   checks on the existing hosted runner class, a normal CI run completes every
   check and its reporting in less than 180 seconds from workflow start, with
   fewer than twelve dashboard jobs and reduced total runner seconds. A fast
   dashboard step with another required job still running does not qualify.
2. *Cache conditions are visible.* Given the same candidate with warm
   prerequisites, or an ordinary prerequisite cache miss, CI obtains the pinned
   dependencies and exercises the current revision. The evidence identifies
   hits/misses and setup time separately; it never substitutes stale app assets
   or labels only the fastest warm run representative. Acquisition failure
   retains the existing infrastructure diagnosis rather than a success verdict.
3. *Failure stays useful.* Given an assertion failure, failed production build,
   or exhausted existing suite deadline, the affected check fails, preserves
   applicable completed-test diagnostics, and performs its owned cleanup.
   Redistributing checks cannot convert a failure into a skip or success.
4. *Work distribution preserves selection.* Given the discovered browser and
   boundary specs, including a new unlisted spec and stale ordering entries,
   the selected job layout runs each required test once. Page-less checks that
   actually exercise Vite/build behavior still receive those resources; a
   directory name alone is not proof that a build is unnecessary.

**Investigation (2026-10-18, preparation checkout at `3f69d38c`):**

Observed facts:

| Successful hosted run | Revision | Start to last job completion | Initial job wait | Whole-workflow runner seconds | Dashboard job seconds / suite-step seconds |
| --- | --- | --- | --- | --- | --- |
| [39077260135](https://github.com/terryyin/open-dough/actions/runs/39077260135) | `32999702` | 278 s | 2 s | 3,147 | 2,631 / 2,372 |
| [39075338690](https://github.com/terryyin/open-dough/actions/runs/39075338690) | `83b3d27a` | 297 s | 2 s | 3,396 | 2,852 / 2,490 |
| [39068858234](https://github.com/terryyin/open-dough/actions/runs/39068858234) | `0bee7fd8` | 293 s | 3 s | 2,985 | 2,451 / 2,207 |

All three ran 16 jobs: lint, three shell/Node shares, twelve dashboard shares,
on `ubuntu-24.04`. Times come from
`gh api repos/terryyin/open-dough/actions/runs/<run>` and
`gh api 'repos/terryyin/open-dough/actions/runs/<run>/jobs?per_page=100'`:
elapsed is latest job `completed_at` minus run `run_started_at`; runner seconds
sum each job's `completed_at - started_at`. Initial wait is first job start
minus workflow start; it is disclosed, not subtracted from the target.
These different revisions are context, not a controlled before/after experiment.

Run 39077260135's logs (`gh run view 39077260135 --log`) show twelve Chromium
cache hits. Its dashboard suite steps range from 143 to 253 s, dashboard jobs
from 159 to 276 s, lint is 80 s, and the slowest shell/Node job is 157 s.
The preceding main run's logs show Chromium cache misses and 8–10 s browser
installation steps. Setup caching is already effective on the latest run;
it cannot alone recover the roughly 98 seconds needed there.

The twelve `dashboard-playwright-report-*` artifacts of run 39077260135,
downloaded with `gh run download`, contain 1,523 tests in 506 files, four actual
workers per shard, and 7,964.648 summed test seconds. At unchanged per-test
durations, an ideal eleven-shard/four-worker schedule already needs
7,964.648 / 44 = 181.015 s before setup, fixture gaps, teardown, or reporting.
For that run's durations, this conditional lower bound rules out merely rebalancing the unchanged work;
it is not a prediction of durations after an optimization. The longest shard
does not have the greatest summed test duration, so worker/fixture gaps also
need measurement. Actual `longest-first` currently has 45 stale entries and
351 unlisted files; discovery, not that stale list, remains authoritative.

A local scratch observation in this owned checkout made `buildDashboardTo`
throw `SEED136_BOUNDARY_REQUIRES_BUILD`, then ran
`npm run test:dashboard -- boundary/agent-launch-matching-rules.spec.ts --workers=1`.
The command failed with that sentinel before running the three pure boundary
tests, establishing that the current global setup builds even for this selection.
The scratch edit was reverted. With the restored source,
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<fresh-path> npm run test:dashboard -- boundary/agent-launch-matching-rules.spec.ts --workers=1`
exited 0 with all three tests passed and a completed strict proof record.
An intervening run failed only because the inherited color variables emitted a
Node warning, which the strict reporter correctly refused. No local timing
claim is made from this loaded shared machine. Setup used the selected Node
24.21.0, locked npm installation, and a successful Chromium prerequisite check.

Hypotheses and the observations that settle them:

- Avoiding unnecessary builds, consolidating preview build selection, and
  measuring fixture/worker gaps may reduce enough work. Inspect actual consumers,
  compare a bounded local scratch case, then measure an authorized hosted
  candidate; this investigation does not establish their achievable speedup.
- A smaller job layout can meet all three targets after that reduction. A
  hosted probe of the complete candidate on the same runner class, with its
  coverage manifest and timings, must settle this before claiming the target.
  Local elapsed time or a theoretical perfect schedule cannot settle it.
- The earlier campaign reported hosted variance around ±10% and 1,520 tests at
  `0bee7fd8`; current run counts and workload differ. Reacquire a matching baseline
  at execution if intervening work changes the tested workload. Do not claim
  savings from an unrelated revision or selectively report the best run.

**Preparation refresh (2026-10-18, checkout `d1fe046c`):**

The scope and key examples above remain the selected outcome. The successful
[run 39092243540](https://github.com/terryyin/open-dough/actions/runs/39092243540)
at `b235fb88` is the newer matching workload: this preparation's starting commit
adds only its assignment to that revision. Using the same API calculations,
it took 291 s including 2 s initial wait, with 16 jobs and 2,894 whole-workflow
runner seconds; dashboard jobs consumed 2,403 s and their suite steps 2,150 s.
All twelve Chromium caches hit. Dashboard jobs ranged from 138 to 289 s,
suite steps from 121 to 268 s; lint took 104 s and the slowest shell/Node job
140 s. The runner remains Ubuntu 24.04 with four actual workers per shard.

Its twelve reports contain 1,537 distinct passing tests in 511 files, no skips,
flaky results or retries, and 7,221.486 summed test seconds. The conditional
eleven-shard bound is now 164.125 s before setup and scheduling gaps, not the
older 181.015 s. Different workload and run conditions prevent attributing that
change to an optimization. The previous arithmetic is historical evidence,
not a current impossibility claim; neither bound proves achievable latency.

The slowest shard, 3/12, has only 709.949 summed test seconds, versus 821.009
on shard 2/12. Its serial `production-watcher-updates.spec.ts` starts 121.117 s
after report start and consumes 113.862 test seconds on one worker. It is
already near the front of `longest-first`; that list assigns files to shards,
not their actual start order. Plan 315 therefore makes worker scheduling and
serial-tail observation explicit in its bounded probe alongside fixture cost.
No schedule change or fixture remedy has yet demonstrated the required gain.

Read-only acquisition used `gh api repos/terryyin/open-dough/actions/runs/39092243540`,
its `/jobs?per_page=100` endpoint, `gh run view 39092243540 --log`, and
`gh run download 39092243540 --pattern 'dashboard-playwright-report-*' --dir <scratch>`.
The plan records fresh local proof-route checks. No product edits or hosted
experiments were retained or dispatched during this refresh.

**Architecture:** Keep responsibilities in the existing owners: workflow
orchestration in `.github/workflows/ci.yml`, selection in
`dashboard/tests/support/testFiles.mjs`, run lifecycle and cleanup in
`globalSetup.ts`, and preview/build choice in the existing server/build helpers.
The browser and boundary tiers remain defined by what they exercise. Moving or
sharing a production build must preserve revision freshness, explicit private
build use, concurrent-run isolation, and cleanup; a shared mutable build or
blanket build removal for `boundary/` is not justified. A new upstream build
job also adds dependency latency and artifact transfer, so compare its full
critical path before choosing it. These are feature-local design concerns,
not a new product-wide ADR or a second test runner.

Accepted [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
constrains the approach to whole-product reuse, one representation of each
responsibility, empirical improvement, and the least complexity needed.
Accepted [ADR 0005 — Cross-tool validation through native acceptance stories](../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps deterministic checks in CI and native acceptance separate; faster CI
does not replace required checks with static presence or claim native host proof.
Accepted [ADR 0000 — Use Architectural Decision Records](../../docs/adrs/0000-use-adrs-accepted.md)
keeps this feature design here. The index and in-file statuses agree: 0000–0006
are Accepted, 0007–0009 Proposed. No conflicting Accepted decision, supersession,
or metadata discrepancy was found. The current North Star adds no different CI
execution architecture; its publication/CI-evidence distinction remains intact.

**Evaluation:** Capture a comparable twelve-shard baseline before invalidating
it, then record the candidate commit, runner image/capacity, complete test
selection, job count, per-job/per-phase durations, aggregate job seconds,
individual test durations, queue delay, and cache outcomes. For the performance
claim use three consecutive ordinary successful hosted runs of the final
candidate (or identical relevant code), including a warm prerequisite run and
an ordinary cache-miss run; each complete verdict must be below 180 seconds.
Keep failed attempts visible and diagnose them instead of retrying tests into
a pass. Compare aggregate consumption under matching cache/workload conditions;
report unmatched conditions rather than calling them savings. Preserve the
existing deterministic selection/failure/deadline proof and add only the
focused discrimination needed for changed build/setup responsibilities.

**Scope decision (Terry, 2026-10-18):** Keep this story's full-verdict,
job-count, and whole-workflow consumption targets without adding the two older
campaign limits. No human-owned scope or architecture decision remains open.

**Safe stopping point:** The complete required CI verdict meets the target
without relying on excessive dashboard sharding.

## Ordering

The E2E strategy and suite improvement story is complete (landed 2026-10-18;
its section is recoverable at
`0c96a546:.planning/seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e`).
Its retrospective correction is queued first and the CI runtime story second,
as Terry requested; the CI story carries the campaign's measured inputs. This priority does not assert a technical blocking dependency or
authorize execution of either story. Preserve the existing near-future
direction.

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
