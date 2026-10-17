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

<a id="unify-and-streamline-dashboard-e2e"></a>

### Unify and streamline the dashboard E2E test strategy

**Identity:** SEED-136#unify-and-streamline-dashboard-e2e
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/310-unify-dashboard-e2e-strategy/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3488bb280625c347691b32c9b52006db072193ceb90e523f39efadb47eb24623","plan":"5f067b58bae96c51aa7fc40afe626317914c30ba628e8dc2758e9c47b5cf0ca1"}}
```

**Beneficiary:** Developers maintaining dashboard behavior and waiting for
reliable local and hosted test feedback.

**Goal:** The dashboard suite follows one documented test strategy, applied to
every existing dashboard test, so that the same behavior is proved by fewer
browser journeys, less repeated setup, and a measured shorter runtime at
today's worker and shard capacity. The observable outcome is the published
strategy plus the smaller, faster suite with its proof map; the overall CI
verdict time is the next story's ambition.

**Baseline (observed 2026-10-17 at 88f6d3f8, before any change):**

- `dashboard/tests` holds 506 spec files and 1,176 test declarations, which
  mode and viewport repetition expand to 1,631 selected tests, all run by
  Playwright; the dashboard has no other automated test tier.
- 158 of those files (447 declarations, 676 selected tests) never open a
  page: they drive the dashboard server over HTTP, yet each starts its own
  Vite server, and 23 files repeat the same tests in dev and preview serving
  modes.
- Every page journey starts its own fake GitHub and Vite preview server;
  41 files also publish a Git origin with production backlog commands before
  their tests. 213 files hold one test, 110 hold two.
- Hosted CI run 38838738715 (`main`, 2026-10-16): twelve dashboard shards,
  whose browser-suite steps took 162–240 s each (about 20 s of setup per
  job besides), 2,488 s of suite time in total; the whole workflow took
  4 min 28 s wall time.
- Local full run on a 16-core Mac at Playwright's default 8 workers, load
  average 3.5 at start: 759 s wall, all 1,631 passed, 5,165 s of summed test
  time, median test 1.7 s. The browserless specs take 1,252 s of that sum;
  the seven `production-watcher-*` tests take 516 s (74 s each); the
  `agent-launch-*` family's 552 tests take 1,483 s.

**Scope:** A campaign across the existing dashboard tests, not just new-test
guidance. Adapt Donut's E2E and small-test principles to Playwright and this
suite; retain Playwright. Cypress/Cucumber syntax and Donut-specific
infrastructure are not part of the transfer.

Required:

- **One published strategy** in the suite's maintained contract,
  [dashboard/tests/README.md](../../dashboard/tests/README.md), stating two
  tiers and nothing in between: *browser journeys*, representative integrated
  user journeys with an observable precondition, user trigger, and state
  change; and *boundary tests*, detailed variants, failure cases, and
  contract details proved at a stable public boundary (the dashboard server's
  HTTP surface, the shared backlog reader, a page component) without a full
  browser journey, exercising real collaborators and replacing only external
  boundaries (GitHub, agent hosts, the avatar host).
- **Relocation**: the browserless specs leave the browser suite and keep their
  behavior at the boundary tier, without a browser or a Vite boot per test.
  The dev-versus-preview repetition shrinks to the one proof that both
  serving modes mount the same boundary.
- **Consolidation of browser journeys**: common shape and shared
  preconditions proved once per file or worker, each sibling asserting only
  its difference; duplicate scenarios and setup merged; a presentation-only
  check joins the journey whose state change produces it or moves down a
  tier. Parameterizing the same executions does not count as a reduction.
- **Focused page helpers and explicit user actions**, with repeated UI setup
  and full reloads avoided when navigation is only a precondition, and real
  navigation exercised when it is the behavior under test.
- **Synchronization** on observable success, request completion, or loading
  completion, owned by the action that starts asynchronous work; no
  fixed-duration sleeps or arbitrary waiting; intentional time behavior
  tested with controlled clocks.
- **Every retained test still runs** locally and in hosted CI through the
  existing commands and jobs; the boundary tier joins `npm test` or the
  dashboard job in the simplest way that keeps the verdict truthful. Choosing
  the CI job layout, caching, and parallelism belongs to the next story.
- **No leaked processes** (added 2026-10-17 at Terry's request, as an
  acceptance criterion): every process a dashboard test run starts, directly
  or through the product it drives (servers, synthetic hosts, detached Cursor
  runners, Codex and request-owner children, the production watcher's
  deployments), ends with the run, including when Playwright force-kills a
  worker after a timed-out teardown; a run leaves nothing behind on a
  developer machine or in CI.
- **Measured target**: at the same twelve shards and runner class, the summed
  hosted browser-suite step time falls to at most half of the baseline
  (≤ 1,244 s), and a local full run at 8 workers takes at most half its
  baseline wall time (≤ 380 s); the browser tier runs fewer than 900 selected
  tests (from 1,631). Set by this refinement from the baseline above; Terry
  may revise the numbers.

Rejection constraints (independent requirements, from Terry's request):

- No speedup through skipped unique coverage, weaker assertions, retries
  (the suite keeps `retries: 0`), or more workers or shards.
- A browser request to GitHub itself still fails the test that made it.

Deferred promises: CI job layout, caching, and parallelism (next story); the
shell suite and native host checks; coverage for new features; a component
test harness unless a relocated check needs one.

Alternatives considered: infrastructure-only sharing (one server per worker,
no dev duplicates) is faster but leaves 1,631 browser tests and duplicate
proofs; consolidating inside Playwright alone still boots Vite for every
browserless file; rebalancing or adding shards is excluded by the constraint
above. The chosen direction is the two tiers plus consolidation.

**Key examples:**

- *Relocated boundary variants.* Pre: `agent-launch-boundary.spec.ts` proves
  the launch endpoint's refusals twice, under dev and preview servers inside
  Playwright. Trigger: the strategy is applied. Result: each refusal is one
  boundary test against the dashboard server's HTTP surface without a browser;
  one proof establishes that dev and preview mount the same launch boundary;
  the hosted verdict still runs them; a changed refusal message still fails
  exactly those tests.
- *Consolidated siblings.* Pre: the three `agent-launch-card-*` files that
  publish their own origin each open the Taken backlog before their tests.
  Trigger: consolidation. Result: one shared origin and preview server per
  file or worker, the card's common shape asserted once, siblings asserting
  only their delta; a regression in one card behavior fails one named test.
- *Presentation-only check.* Pre: `dashboard-header.spec.ts` checks that the
  banner is one row at each of several widths and fonts, with no state
  change. Trigger: review under the strategy. Result: the checks join the
  journey whose state change shows that banner, or move to the cheapest
  boundary that proves the layout rule once; none is deleted while nothing
  else proves it.
- *Synchronization and real time.* Pre: journeys wait through `expect.poll`,
  controlled clocks, and the fake GitHub's call log, with no fixed sleeps,
  yet the seven `production-watcher-*` tests spend 74 s each. Trigger: the
  strategy is applied. Result: time the product intentionally waits is
  stepped with a controlled clock or proved at the watcher's boundary; a
  consolidated journey owns its wait in the action that starts the
  asynchronous work; the rule is recorded in the strategy.
- *Leaked runner.* Pre: a production-watcher journey times out, Playwright
  kills its worker, and the watcher's detached Cursor runner idles under a
  deleted temp HOME for hours (five such orphans and sixteen idle runners
  were found on 2026-10-17). Trigger: the run ends. Result: the run's own
  teardown has ended it; a check over the run's temp root finds no process;
  the same holds for a page or boundary journey killed mid-test.
- *Measured result.* Pre: the baseline above. Trigger: the campaign ends.
  Result: a hosted run at twelve shards and a local run at the same worker
  count meet the target; the proof map lists every removed or relocated case
  with the test that now proves it; no test gained retries or lost an
  assertion.

**Architecture:** This story adds a second dashboard test tier, which decides
where boundary tests live, how they reach the server, and how `npm test` and
the dashboard job run them. Facts: the server is Vite plugin middleware
(`dashboard/vite.config.mts`), so a boundary test needs that middleware
mounted in-process or a shared server per worker rather than one Vite boot
per test; `npm test` already schedules `node --test` files, so a boundary
runner may need no new dependency. Direction: boundary tests exercise the
real handlers through the server's public surface with the existing fakes,
adding no second wiring of the server (ADR 0002, one representation and PFE).
Whether the middleware mounts on a plain in-process server, or the tier keeps
Playwright as its runner with one shared server per worker, is a decisive
premise for planning to settle by a probe before relocation starts. Applicable
Accepted decisions: [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(fast feedback, one representation, whole-product cohesion); no conflict.
ADR 0005 covers native acceptance of skills, not the dashboard. ADRs 0008 and
0009 are Proposed and bind nothing. No new ADR is warranted: the strategy is
feature-local documentation in the suite's README.

**Evaluation:** Record the current case count, relevant setup costs, and local
and hosted browser runtimes under stated conditions. Map retained behaviors to
their proof and explain removed or relocated cases. The resulting suite has
fewer E2E cases, less repeated setup, and a measured runtime improvement at
comparable worker/shard capacity, with the meaningful journeys and failure
cases still protected. Publish the unified strategy and apply it to the
existing suite. Do not manufacture a speedup through skipped unique coverage,
weaker assertions, extra retries, or increased parallelism.

**Safe stopping point:** A smaller, faster, consistently authored dashboard
suite delivers value even before CI orchestration changes; each relocated or
consolidated family leaves the suite green and the proof map current.

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

Queue the E2E strategy and suite improvement first, and the CI runtime story
second, as Terry explicitly requested. Apply learning from the first to the
second. This priority does not assert a technical blocking dependency or
authorize execution of either story. Preserve the existing near-future
direction.

## Breadcrumbs

- Terry's request and revised priority order, 2026-10-17; authorized capture on
  `main` and synchronization with `origin`.
- [Current dashboard test contract](../../dashboard/tests/README.md),
  [Playwright configuration](../../dashboard/playwright.config.ts), and
  [GitHub Actions workflow](../../.github/workflows/ci.yml).
- Baseline measurements of 2026-10-17 in the first story's section: hosted
  run 38838738715 and one local full run at 88f6d3f8 with Playwright's proof
  record.
- Donut is the repository named `doughnut`. Its reviewed guidance at revision
  `7178e92d045e56aa37214de82d85a197d456a19c` supplies the principles to adapt:
  [E2E authoring](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/e2e-authoring/SKILL.md#L109-L206)
  and [small tests](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/unit-testing/SKILL.md#L7-L26).
