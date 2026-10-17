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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/313-dashboard-test-bounds-and-placement/PLAN.md"}
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
[311](../slice-plans/313-dashboard-test-bounds-and-placement/PLAN.md).

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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers waiting for a complete CI verdict before continuing
or integrating work, and maintainers paying for runner resources.

**Goal:** Reduce the full GitHub Actions CI verdict to below 180 seconds on
representative hosted runs, with fewer dashboard jobs and lower aggregate
runner consumption than the current twelve-shard approach.

**Scope:** Measure and improve the workflow's critical path after the test
campaign. Account for checkout, dependency and browser setup, builds, type
checking, lint, tests, and reporting, including work repeated across jobs.
Choose the job layout, caching, and parallelism from evidence rather than
adding shards to compensate for redundant tests.

**Inputs from the dashboard strategy campaign (measured 2026-10-18, at
0bee7fd8):** the suite is 1,520 tests (801 browser journeys, 719 boundary
tests on the Node boundary server); hosted browser-suite step sums move about
±10 % with runner speed on identical code (main alone ran 2,375–2,645 s in one
day), so compare per-test seconds and their floor over the runners' four
workers (7,158–8,178 s per run, floor 1,790–2,045 s) rather than step sums;
the strategy story's ≤ 1,244 s hosted and ≤ 380 s local targets were not met
because that floor sits above them, and Terry decides whether they carry
over. Levers in evidence: every shard runs the production build in global
setup even for boundary-only selections; `dashboard/tests/longest-first` is a
2026-10-10 record with 45 stale entries and 349 unlisted files, so sorted
order governs most of the split; `prebuilt: builtDashboardDir` is spelled at
44 preview starts and should default in `startDashboardServer` before the
build moves; a worker-scoped fixture declared outside the shared base split
the worker population (fixed at 0bee7fd8, whose hosted run summed 2,207 s
against the 2,474 s baseline); `agent-launch-publication-receipt-failure` and
`agent-launch-preparation-phases` take 13–15 s hosted against 5 s locally
with unchanged specs and deserve one `--trace on` shard.

**Evaluation:** Record a comparable before/after baseline with commit, runner,
job count, per-job timings, and aggregate runner time. Measure from workflow
start until all required checks finish; report queue delay and cache conditions
separately, so the claim cannot describe only the browser test step. Demonstrate
the below-three-minute verdict on representative successful hosted runs, with
fewer than twelve dashboard jobs and reduced runner consumption. Preserve
required checks, meaningful coverage, failure diagnostics, and truthful failure
results; do not omit checks or relax deadlines to obtain the target.

**Questions for refinement:** What dominates the remaining critical path after
the suite improvement, and what hosted-run sample and cache conditions make
the performance claim representative?

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
