# Intent CI comparison proof

Comparison rules use the cheapest boundary that still executes the rule. The
ordinary selection includes those rules and their retained connections; a fast
rule count alone does not measure the developer's feedback path.

## Proof owners

| Boundary | Owners and protection |
| --- | --- |
| Published history | `backend-tests/intent/ci-comparison-published-endpoints.spec.ts`, `ci-comparison-endpoints.spec.ts` and `ci-comparison-taken.spec.ts`: real claim, owning-side, merge/fast-forward, completion and pushed-head algorithms over canonical raw history |
| Run and endpoint choice | `ci-comparison-selection.spec.ts`, `ci-comparison-cancelled*.spec.ts`, `ci-comparison-exact-landing.spec.ts`, `ci-comparison-proof-gaps.spec.ts` and `ci-comparison-timing-gaps.spec.ts`: nearest usable build, attempts, exact-only results, bounds, pending answers and explanations |
| Memory and recovery | `ci-comparison-memory*.spec.ts`, `ci-proof-memory*.spec.ts` and `ci-time-without-runner-waits.spec.ts`: real comparison/proof readers, request counts, cache identity, freshness, validation and timing |
| Mounted production UI | `tests/intent/intent-ci-comparison-mounted*.spec.ts` and `intent-summary-story-comparison-mounted*.spec.ts`: real providers, projections and controls for entries, units, gaps, timing words, sorting, relative scales, retry, Summary and file Proof |
| Actual acquisition | `ci-comparison-history-integration.spec.ts`: real Git history through the production acquisition boundary; `intent-ci-comparison.spec.ts` and `intent-ci-comparison-adapter.spec.ts`: default GitHub/adapter acquisition to displayed Done comparison |
| Exceptional acquisition | `intent-ci-comparison-cancelled-landing.spec.ts`, `intent-ci-comparison-taken.spec.ts` and `intent-ci-comparison-adapter-taken.spec.ts`: cancelled later-build, pushed-head and adapter Taken connections |
| Navigation and preferences | `intent-ci-comparison-drilldown-relative.spec.ts`, `intent-ci-comparison-relative.spec.ts`, `intent-summary-story-comparison-file.spec.ts`, `-renamed.spec.ts`, `-sort.spec.ts` and `-source.spec.ts`: built-app scope navigation, keyboard/Purpose/Review, source pinning and cross-story preference continuity |
| Held reads and retry | `intent-ci-comparison-locations.spec.ts` and `intent-ci-comparison-retry.spec.ts`: comparison visibility during held/failing reads, actual API and upstream request accounting, same-process recovery and real shallow-history recovery |
| Retained review records | `backend-tests/review/story-review-stored-*.spec.ts`: actual store replacement, stable reporting identity, newest captured preference, deletion and retention; `tests/review/story-review-one-shot-choice-refresh.spec.ts` connects stored records to displayed Refresh choices |

Backend filenames above are under `dashboard/backend-tests/intent/`; browser
filenames are under `dashboard/tests/intent/`. The mounted cases replace rule
variants formerly repeated through whole-app setup. The retained journeys own
connections a mounted component or in-process reader cannot establish.

## Arrangement and isolation

Use the shared `makeMe` API for history, run, proof, location and launch facts.
Keep the facts that explain a rule at its call site, and keep independent
expected rows, words, counts and geometry outside the builders. Raw-history
fixtures supply external Git facts to the existing algorithms; they do not
arrange the selected endpoint that those algorithms must derive.

Production comparison and proof readers expose per-reader factories. Tests get
fresh readers and counted external acquisitions; production retains its default
singleton. GitHub and adapter readers share the CI proof SDK's validation and
archive owners. Preserve exact unanswered-proof identity as well as public
wording and values when changing these joins.

Mounted cases create fresh pages, roots, providers and static servers. They
share only the run's immutable component bundle. Production Summary, File Proof,
location tree, overlays and callbacks remain real. Unarranged source/locations
reads fail rather than silently providing additional facts. This setup uses no
APFS-only copy, shared mutable server, persistent warm cache or elapsed wait.

## Measuring changes

Run through `npm run test:dashboard`, with ordinary worker, trace and timeout
settings. Save the strict per-case record outside disposable output using
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and shared preparation events using
`OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE`. Follow [local resource use](../../tests/local-test-resources.md),
including the maintained macOS sleep guard on AC power.

Each rule must take less than 1,000 ms including its arrangement, actions,
assertions and cleanup. Report common runner/build/worker preparation separately.
Declare integration ownership before measuring, retain its timing in the whole
selection, and never relabel a slow rule after observing its result. Default
timeouts and zero retries remain part of the proof contract.

CI retains `dashboard-playwright-report-<shard>` artifacts for each shard.
The HTML report's embedded `report.json` gives per-case durations and outcomes.
Match the owning spec filename and test title, because imported case helpers
can have a different declaration location. File totals and a green workflow
alone do not establish the individual rule bound. Retain the exact revision,
run attempt, environment, selected cases, load and concurrency with a profile.

Playwright's reported duration omits some trace cleanup. Include that tail with
an observed test-end envelope, or conservatively bound completion by the next
test start in the same worker. Subtract only the interval union of inspected
shared suite hooks and worker fixtures; retain ordinary test cleanup. A bound
above one second is inconclusive when it includes scheduling or next-file work.
The last worker test needs its own end evidence. Never call a reported 997 ms
case complete sub-second proof when its observed cleanup reaches 1,033 ms.

## Recorded observations

The original selection had 75 cases and took 269.01 s wall time locally, with
two workers and default tracing. On the same macOS arm64/Node 24 host, the
slice-4 selection had 182 cases, including 164 rules and 18 declared integration
cases: 77.31 s wall time; all rules at most 742 ms. Shared preparation was
component 597 ms, app 931 ms, server 76 ms, story columns 627 ms and queued
origin 1,215 ms. That intermediate selection excluded review Refresh.

With independent Python work using approximately 103% and 62% CPU and load
8.74 decreasing to 6.44, 83 mounted cases repeated three times passed 249/249
at 108–823 ms, without retries. Following the shared proof SDK integration,
all 164 rules passed again at at most 705 ms. These are bounded observations;
finite profiles cannot establish a bound on an arbitrarily starved machine.

The complete ordinary replacement-inclusive selection later passed 188/188:
167 rules and 21 declared connections, 87.35 s wall / 86.853 s runner. All rule
receipt envelopes, including final trace cleanup and IPC, were at most 748 ms;
the integration envelopes were 1.001–12.640 s. This is a 67.5% observed wall
reduction against the original 269.01 s, with ordinary two workers/default
tracing. Pre-load 2.06/2.85/3.35, memory 72% free; post-load 5.80/4.30/3.83,
71% free, awake AC under `caffeinate -s -i`. A subsequent fixture-only
deduplication reran the three store rules at 14/270/15 ms and typechecked;
their literal facts, domain operations and expected results remain unchanged.

Separately measured shared preparation: runner-before-workers 574 ms;
global-setup owner 178 ms; initial worker dispatch/config 190 ms each, followed
by 94–95 ms spec preparation; shared browsers 84/94 ms. Artifact preparations
were history 624 ms, queued origin 1,195 ms, app 750 ms, server 79 ms and mount
473 ms. Their elapsed intervals overlap and are not additive exclusive overhead.
Current native launch/capture preservation passed three cases, runner 13.629 s,
with the default timeout. Portable CI timing acceptance remains pending.
