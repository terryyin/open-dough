# Restore GitHub Actions CI feedback to under three minutes

**Source:** [Restore CI under three minutes](../../seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes)

**Identity:** SEED-136#restore-ci-under-three-minutes

## Goal and scope

Developers receive the complete required GitHub Actions verdict in less than
180 seconds on representative hosted runs, with fewer than twelve dashboard
jobs and lower whole-workflow runner consumption than comparable twelve-shard
runs. Count checkout, prerequisite acquisition, builds, type checking, lint,
both test tiers, teardown and reporting. Keep actual failures visible.

Terry confirmed on 2026-10-18 that the former campaign's 1,244-second hosted
suite-step total and 380-second local target do not apply. Local checks remain
correctness and diagnostic evidence. No paid/larger runner migration, new CI
service, benchmark dashboard, or unrelated product behavior is included.

Preserve required checks and meaningful coverage, zero test retries, existing
failure/deadline semantics, failure evidence, build freshness, isolated mutable
test state and no leaked processes. Reconcile the Taken sibling correction's
bounds and placement changes; its ordering creates no technical dependency.

This is preparation only. No product change is retained, execution has not
started, and no performance target is claimed achieved. The initial probe is
bounded, but the full implementation path needs its result before execution
planning is complete; see Current decisions.

## Evidence and premises

Preparation used the established owned checkout
`/Users/terryyin/git/open-dough/.worktrees/restore-github-actions-ci-feedback-to-under-thre`
on `codex/restore-github-actions-ci-feedback-to-under-thre`, based on
`3f69d38cd48af5c94a25247af2703b173c2ce6b6`. Execution must establish its own
checkout through the ordinary authorized start, then revalidate changed premises.

The source seed records run IDs, revisions, commands, timings and calculation
boundaries. Run [39077260135](https://github.com/terryyin/open-dough/actions/runs/39077260135)
at `32999702` is the latest measured main baseline: 278 seconds, 16 jobs,
3,147 aggregate runner seconds, 1,523 tests, 506 files, twelve dashboard shards
and four actual workers per shard, with warm Chromium caches. Its 7,964.648
summed test seconds alone imply 181.015 seconds at eleven perfectly balanced
four-worker shards. That is a conditional scheduling bound, not measured CPU
consumption or an invariant after changing concurrency or fixture work.

The reports' top-level Before Hooks total 3,115.9 seconds and After Hooks 390.4
seconds. Direct child steps named `Fixture "dashboard"` total 1,874.1 seconds;
`Fixture "origin"` totals 332.3 seconds. These are overlapping attribution views,
not additive savings. The twelve embedded HTML report ZIPs expose `report.json`
and each file's detail JSON; aggregate each result's top-level hooks and their
direct fixture children separately. The reports prove setup is a substantial
cost, not that a particular setup operation is removable.

| Decisive premise | Consuming observation in the preparation checkout | Result / limit |
| --- | --- | --- |
| Current pure boundary selections unnecessarily build | Temporarily throw `SEED136_BOUNDARY_REQUIRES_BUILD` in `buildDashboardTo`; run `npm run test:dashboard -- boundary/agent-launch-matching-rules.spec.ts --workers=1` | Exit 1 with that sentinel before the three tests. Revert; rerun with `env -u NO_COLOR -u FORCE_COLOR` and a fresh `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` |
| The restored strict proof route works | Same selected command after restoration, Node 24.21.0 and locked prerequisites | Exit 0, three tests, completed record with `strictStatus: passed`. The inherited color-warning failure was diagnosed separately, not accepted as a pass |
| Default preview currently rebuilds despite an available run build | A scratch spec starts `startDashboardServer({ mode: "preview" })`, expects `outDir === builtDashboardDir`, fetches its index and closes in `finally` | Exit 1 on different directories: current private build versus run build |
| Using the run build can preserve actual serving and explicit override | Scratch default `options.prebuilt ?? process.env["OPEN_DOUGH_DASHBOARD_BUILD"]`; same spec fetches exact current index, then serves a separate explicit index; run `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- preparation-build-probe.spec.ts serving-modes.spec.ts --workers=1` | Exit 0, including the five real dev/preview boundary-equivalence cases. Both helper change and scratch spec reverted. This does not prove every helper consumer or any hosted speedup |
| Existing discovery and deadline boundary is runnable | `node --test tests/support/dashboard-test-files.test.mjs` after scratch restoration | Six checks passed, including recursive discovery, unlisted files, invalid shares, exactly-once twelve-share union and deadline refusal. Selection proof is not execution coverage |
| A native Vite config loader is a proven speedup | Scratch `spawnVite` uses the selected Node with transform-types, warning suppression and `--configLoader native`; compare `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- serving-modes.spec.ts accessible-overview.spec.ts --workers=1` with current bundling | Both exit 0; 13.34 s bundled, 13.36 s native on the shared machine. No demonstrated benefit; scratch reverted and this mechanism is not selected |
| Enough removable fixture work exists for a smaller hosted layout | Actual hosted setup attribution, targeted trace/profile, controlled candidate and complete-workflow measurement | Unsettled. Reading helper code or local elapsed time cannot establish hosted savings. Slice 1 owns this probe; slice 3 has no selected remedy yet |

Raw downloaded reports and scratch logs stay outside Git. Re-fetch hosted
artifacts while retained, or acquire a fresh baseline before changing the code
that produced it. A different revision is context until its workload and setup
are shown comparable. Use a fresh proof-record destination per local run.

## Architecture and PFE

The common rule is to discover all tests, provision the resources their actual
behavior consumes, preserve each test's private mutable state, and distribute
that measured work. Reuse these existing owners:

- `dashboard/tests/support/testFiles.mjs` owns recursive discovery and whole-file
  partitioning; `tests/support/dashboard-test-files.test.mjs` observes its
  contract. Refresh the existing timing order or change this owner if measured
  weighting is needed. Do not add a second discovery list or runner.
- `globalSetup.ts`, `dashboardBuild.ts`, `dashboardServer.ts` and `serverAddress.ts`
  own one run's build, server selection and cleanup. Centralize default preview
  build choice there. An explicitly supplied build retains precedence; a caller
  outside a suite must still have a defined fresh-build path.
- `pageTest.ts` is the shared worker-fixture registration owner. `launchJourney`
  is immutable after publication and may be shared; `startOrigin` and each
  dashboard machine are mutated by real starts and must stay isolated. An
  immutable template may be copied only if measurement justifies it and the
  private copy retains the real workflow under test. Never share live mutable
  origins or substitute fixture state for an asserted product operation.
- `.github/workflows/ci.yml` and `scripts/setup-native.mjs` own job orchestration
  and bounded prerequisites. Keep report/trace collection and diagnostic exits
  in that path. Shell/Node checks already have independent split and timing
  owners in `scripts/test*.sh`; do not recast them as dashboard tests.

The caller trace includes shared `dashboardTest.ts`, `launchDashboard.ts`,
preview starts that explicitly pass `builtDashboardDir`, pure boundary tests,
`serving-modes.spec.ts` (moving to `boundary/` in the sibling), production watcher
journeys using `publishedMainFixture.ts` and `dashboardCommand.ts`, and nested
proof subprocesses in `proofRecordRun.ts`. Public command/watcher tests exercise
their own build lifecycle and must continue doing so. The directory `boundary/`
is not a resource contract: serving-modes exercises both real Vite servers.

Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires empirical improvement, whole-product reuse and one representation per
responsibility. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps deterministic checks in CI and native acceptance separate.
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps feature-local design
in this plan and maintained test documentation. No ADR conflict was found.
The [North Star](../../NORTH-STAR.md) supplies no different test architecture;
its published evidence and local checkout distinction remains in force. No new
North Star topic is warranted while the optimization mechanism is unselected.

## Outside-in proof ownership

| Final promise / source example | Owner | Observable proof |
| --- | --- | --- |
| Complete verdict below 180 s; fewer than 12 dashboard jobs; lower total runner time | Slice 4, with feasibility from 1 and workload reduction from 3 | Three consecutive ordinary successful full hosted runs, including warm and ordinary cache-miss conditions, each timed from run start through the last required job/report; matched twelve-shard comparisons for resource claims |
| Current production build, explicit build semantics, no unnecessary boundary build | Slice 2 | Real preview serves the current build; explicit private assets remain separate; a pure boundary selection runs with building unavailable; an actual build-consuming selection fails on a deliberately broken build |
| Same meaningful assertions with less repeated setup | Slice 3 | Selected family and all affected consumers pass, a scratch regression still fails for the asserted behavior, private state stays isolated and measured setup cost falls |
| Complete exactly-once selection, including new/unlisted files | Slice 4 | Existing discovery contract extended to the selected matrix; union of listed selections equals unsplit discovery; full run records all required cases passing, without unexpected skips |
| Failures, deadlines, cleanup and evidence remain truthful | Slices 2/3 at changed lifecycle boundaries; 4 for orchestration | Controlled assertion/build/deadline failures remain nonzero; existing quiet-reporter and run-processes behavior stays discriminating; hosted failed-step reporting retains applicable diagnostics |
| All lint, shell/Node, type checking and production build obligations remain | Slice 4 | Same check inventory in before/after job graphs; successful full hosted verdict and nonzero injected failures at changed orchestration boundaries |

## Ordered slices

### 1. Establish a viable hosted workload budget
Type: Behavior
Status: planned
Proof: A reproducible measurement record identifies one bounded removable cost
and the projected plus observed effect on the whole workflow, or explicitly
refutes the proposed optimization direction.

Behavior: Given the current required suite on the existing hosted runner class,
run a baseline and a bounded diagnostic probe → retain the exact coverage,
cache, phase and fixture evidence needed to choose the optimization.

- Refresh the seed's baseline only when relevant code/selection changed. Retain
  runner image, worker count, per-job start/end, summed job seconds, report
  selection and setup attribution. Reuse sufficient existing evidence.
- Inspect the actual dashboard fixture setup on a representative slow hosted
  shard; use one trace/profile of that shard, not tracing the whole suite.
  Identify a specific repeated operation and its consumers. Use at most two
  controlled candidate experiments before reassessing this plan; each compares
  the same assertions, workers, selection and prerequisite conditions.
- First examine per-test dashboard startup and immutable setup copying; their
  reports identify material costs. Do not adopt native config loading from its
  mere availability: the local comparison demonstrated no gain. Do not assume
  moving a build to an upstream job saves wall time; include transfer and job
  dependency latency in any candidate comparison.
- Publish/dispatch only under a subsequent explicit execution or scoped-probe
  instruction and its hosted-run authority. Preparation performed only read-only
  hosted queries and local disposable observations.
- Before dependent implementation, record one selected mechanism, exact affected
  family, expected saving with measured support, and surviving proof in slice 3.
  If no mechanism offers a credible route below the budget with fewer jobs,
  stop and replan; do not silently weaken the target, buy capacity or add shards.

Safe stop: the current workflow remains usable; a negative probe is useful
learning, not a completed performance story. This bounded probe is the next
investigation, not permission to implement the unbounded remainder.

### 2. Provision production builds only for their actual consumers
Type: Behavior
Status: planned
Proof: Real preview, boundary-only, explicit-build and failure cases observe the
right build lifecycle without losing isolation, diagnostics or cleanup.

Behavior: Given a selection with or without a production-build consumer,
start the run and its servers → every consumer uses fresh assets, ordinary
preview defaults reuse the run's build, and a selection that needs no build
performs none.

Centralize preview defaults before removing repeated explicit defaults.
Preserve explicit overrides and the fresh private-build behavior outside the
suite; never silently fall back to stale `dashboard/dist`. Derive build need
from actual selected consumers, including serving-modes wherever its sibling
moves it, not a blanket boundary-directory test. Keep the run identity,
ownerless-request guard and teardown active even when no build is made.
Do not change production watcher/public-command build ownership.

The scratch observation above supplies the initial regression shape. Make it
maintained proof at the helper's observable boundary, then exercise actual
selection with the build deliberately unavailable for the pure boundary case
and deliberately broken for a build consumer. Test two overlapping isolated
runs so build cleanup cannot remove another run's assets. Trace and run all
changed default consumers, including callers omitting the new default.
Use the existing serving-modes, quiet-reporter, proof-record and run-processes
suites where the lifecycle change reaches their purpose; add focused proof only
where those suites do not discriminate. Update maintained README/native-setup
wording with the final behavior. A whole dashboard run is warranted here because
global setup is consumed by every spec, not merely by the edited files.

Safe stop: the existing job matrix still runs and reports truthfully. This
change alone is not evidence of the three-minute goal.

### 3. Remove the measured repeated fixture cost without sharing mutable state
Type: Behavior
Status: planned
Proof: The chosen setup family preserves its observable assertions and isolation,
and comparable local/hosted measurements show its setup cost actually falls.

Behavior: Given the fixture family and repeated operation established by slice 1,
run its original scenarios → their real product transitions remain observed,
while the measured redundant setup operation is removed or performed once at
its valid lifetime.

**Unresolved implementation boundary:** The current reports attribute cost to
`dashboard` setup but do not identify a removable operation or prove a saving.
Before this slice is executable, slice 1 must replace this paragraph with the
specific mechanism, consumers, isolation/reset contract, regression proof and
bounded before/after command. This is the current planning concern; do not turn
it into an open-ended optimization pass or assume an arbitrary saving.

Keep shared worker registration in `pageTest.ts`; use immutable fixture sharing
only for immutable inputs, and separate writable origins, HOME, fake-host state,
request owners, traces and processes. An asserted start or publication remains
a real operation. Any redundant-case removal must identify surviving behavioral
proof before removal; a lower test count alone is not evidence of preserved
coverage. Compare family wall time and hook/fixture attribution under matching
conditions, then validate all consumers of any changed shared helper. Reject an
experiment that saves time by weakening a promise, contaminating state, or
moving its cost outside the measured window.

Safe stop: revert an unsuccessful candidate, preserve its observation, and
replan the remaining work. The source goal stays unchanged.

### 4. Deliver the complete verdict with fewer balanced dashboard jobs
Type: Behavior
Status: planned
Proof: The complete hosted workflow meets the seed's three-run evaluation and
keeps required selection, checks and failure reporting intact.

Behavior: Given the preserved suite with measured resource costs after the
accepted improvements, a CI event runs the chosen smaller layout → all required
checks and reporting finish below 180 seconds, with fewer than twelve dashboard
jobs and lower aggregate runner consumption under comparable conditions.

Choose the smallest supported layout from measured file durations and workload
capacity, not an assumed eight- or eleven-job answer. Refresh the existing
longest-first data; use a weighted split only if measurements require it and
keep that responsibility in the existing partitioner. Do not split serial
files in ways that break their lifecycle. Match browser/setup requirements to
the selected tests and keep the serving-modes exception with its resources.
Any common build job must beat its artifact-transfer/dependency cost and verify
candidate freshness. Include it in runner consumption and the critical path.

Extend the existing six discovery/deadline checks for the selected layout and
new/unlisted files. Compare the complete `--list` manifest across all shares
against unsplit discovery, then the executed full hosted results; list success
alone proves no assertions. Preserve type checking, lint, shell/Node checks,
setup diagnoses, zero retries, existing deadlines and kept failure reports.
Exercise deliberate assertion, build and deadline failures through whichever
workflow boundary changed, rather than asserting only YAML text.

Use the source's final-run protocol and publish all attempt results, queue/cache
conditions and matched consumption comparisons. Report job seconds separately
from summed test time and from any billable-minute rounding. A fast warm-only
run, skipped check, or changed workload is insufficient. If shell/Node or lint
becomes critical, inspect that measured owner before changing it; record the
bounded required follow-up in this same plan rather than weakening its check.

Safe stop: leave the last fully green layout in place and report the unmet
promise if the complete target is not observed. Do not complete the story on
projections or a single fast run.

## Current decisions and preparation review

- Required local setup is [native verification setup](../../../tests/native-setup.md).
  Focused checks follow changed consumers; the broad run in slice 2 is justified
  by shared global lifecycle impact. Hosted configuration alone creates no extra
  local all-suite gate. During execution, apply the ordinary independent
  post-change refactor, focused proof, agent commit and asynchronous CI ownership
  from the execution workflow; preparation authorizes none of that execution.
- No numeric slice time limit was supplied. Slices 1, 2 and 4 have concrete
  observation boundaries; slice 3 still lacks a bounded implementation choice.
  Replacing it from evidence is required before assessing the whole plan ready.
- Slice-plan refinement is not needed to rename or repartition these boundaries:
  the unresolved concern is an unobserved removable cost and missing remedy,
  not fragmentation of a known implementation. No separate refinement pass ran.
- Record **not-ready**: slice 3 has no evidence-backed bounded fixture reduction,
  while the measured unchanged workload already exceeds the available time at
  fewer shards. Slice 1 is the specific observation that can settle it. A positive
  result must update slice 3 and the workload estimate, then trigger ordinary
  plan refinement/readiness reassessment; a negative result must revise the
  approach within the agreed scope or expose a real scope conflict.
- There is no remaining human-owned scope decision, ADR exception or proposed
  story split. The complete preparation, including this assessment, can land;
  it does not Take or complete the story.

## Learnings

The native-loader hypothesis produced no measured local benefit and is not
selected. Default preview rebuilds are observable and centralizable, but the
existing explicit run-build callers already reuse that build. Consequently
centralizing that default cannot be counted as a saving across every test.
Most remaining elapsed work is inside tests and fixtures, not prerequisite
acquisition. The investigation must identify an actual removable cost rather
than treating repeated setup attribution as guaranteed savings.
