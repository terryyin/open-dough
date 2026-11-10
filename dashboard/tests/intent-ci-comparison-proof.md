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
| Pending and final Landed evidence | `ci-comparison-finality-*.spec.ts`: actual comparison memory, shared slot judgment, receipt matcher and artifact reader over raw history, receipts, provider JSON/ZIP/errors and controlled observation time |
| Client reading lifetime | `ci-comparison-client-*.spec.ts` uses production disposable comparison/endpoint owners and real authenticated readers with external held HTTP Responses. React binding cases retain controls, selection/head updates and cancellation-to-paint connections. |
| Production presentation | Static rendering cases under `tests/intent/intent-ci-comparison-*` and `intent-summary-story-comparison-*` use actual production TSX/full CSS and fresh pages. Separate mounted bindings own real sort/Show %/navigation callbacks, providers and native keyboard actions. |
| Actual acquisition | `ci-comparison-history-integration.spec.ts`: real Git history through the production acquisition boundary; `intent-ci-comparison.spec.ts` and `intent-ci-comparison-adapter.spec.ts`: default GitHub/adapter acquisition to displayed Done comparison |
| Exceptional acquisition | `intent-ci-comparison-cancelled-landing.spec.ts`, `intent-ci-comparison-taken.spec.ts` and `intent-ci-comparison-adapter-taken.spec.ts`: cancelled later-build, pushed-head and adapter Taken connections |
| Navigation and preferences | `intent-ci-comparison-drilldown-relative.spec.ts`, `intent-ci-comparison-relative.spec.ts`, `intent-summary-story-comparison-file.spec.ts`, `-renamed.spec.ts`, `-sort.spec.ts` and `-source.spec.ts`: built-app scope navigation, keyboard/Purpose/Review, source pinning and cross-story preference continuity |
| Held reads and retry | `intent-ci-comparison-locations.spec.ts` and `intent-ci-comparison-retry.spec.ts`: comparison visibility during held/failing reads, actual API and upstream request accounting, same-process recovery and real shallow-history recovery |
| Landed recovery connections | Backend `intent-ci-comparison-pending-proof.spec.ts`, `intent-ci-comparison-receipt.spec.ts` and `landed-ci-history-comparison-run.spec.ts` retain malformed bytes/default parsers, public history/provenance, provider admission/PID and persisted receipt lifetime. Browser `intent-ci-comparison-missing-run.spec.ts`, `-pending-proof.spec.ts` and `-trunk-finality.spec.ts` retain actual controls, timing/source cues and Trunk NoBuild despite an available later build. |
| Retained review records | `backend-tests/review/story-review-stored-*.spec.ts`: actual store replacement, stable reporting identity, newest captured preference, deletion and retention; `tests/review/story-review-one-shot-choice-refresh.spec.ts` connects stored records to displayed Refresh choices |

Backend filenames above are under `dashboard/backend-tests/intent/`; browser
filenames are under `dashboard/tests/intent/`. The rendering and in-process
cases replace rule variants formerly repeated through whole-app setup. The
retained journeys own connections those boundaries cannot establish.

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

Receipt rules must derive age and pending state from raw namespaced launch
records, target, story, resolved landed revision and earliest matching receipt.
The real malformed-byte/parser connections remain necessary. An arranged
unreadable value does not prove production parsing or store isolation.
Keep the original artifact-reader object: cloning loses its private unanswered
brand. Reader retry and comparison finality are different rules; a terminal
comparison gap can freeze while an unanswered proof stays refreshable beyond
receipt age and the revision-walk bound.

The client comparison owner distinguishes an asked retry from an answered round.
Only an answered comparison refreshes endpoint proofs; HTTP failure leaves the
answered round unchanged. Each endpoint keeps its own full attempt/identity/
source key, and equal subjects in different slots remain separate requests.
Test abort signals and late responses through real readers. Native UI output,
parent status reads and provider lifetime need their own binding observations.
The development StrictMode connection uses actual hooks/React cleanup and setup
with a fresh test-owned Vite optimizer cache; the production build's React
intentionally has no development double-effect behavior.

Static presentation uses the existing Vite SSR loader and actual components,
then inspects their native HTML in fresh browser pages. Mounted bindings create
fresh roots and providers. They share only immutable bundles/compiler output
and full CSS; production Summary, File Proof, location tree and callbacks remain
real. Unarranged source/locations reads fail. This setup uses no APFS-only copy,
shared mutable server, persistent warm cache or elapsed wait.

## Measuring changes

Run through `npm run test:dashboard`, with ordinary worker, trace and timeout
settings. Save the strict per-case record outside disposable output using
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and shared preparation events using
`OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE`. Follow [local resource use](../../tests/local-test-resources.md),
including the maintained macOS sleep guard on AC power.

The replacement-inclusive ordinary selection is:

```sh
npm run test:dashboard -- \
  backend-tests/intent/ci-comparison \
  backend-tests/intent/ci-proof-memory \
  backend-tests/intent/ci-time-without-runner-waits.spec.ts \
  tests/intent/intent-ci-comparison \
  tests/intent/intent-summary-story-comparison \
  tests/review/story-review-one-shot-choice-refresh.spec.ts \
  backend-tests/review/story-review-stored- \
  backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts \
  backend-tests/intent/intent-ci-comparison-receipt.spec.ts \
  backend-tests/intent/landed-ci-history-comparison-run.spec.ts
```

Measure native launch/capture preservation separately with
`npm run test:dashboard -- tests/review/recently-done-one-shot-review.spec.ts tests/review/story-review-one-shot.spec.ts`.
The last three ordinary selectors retain eight backend connections omitted by
the broad `ci-comparison` prefix; include them when comparing whole feedback.

Each rule must take less than 1,000 ms including its arrangement, actions,
assertions and cleanup. Report common runner/build/worker preparation separately.
Declare integration ownership before measuring, retain its timing in the whole
selection, and never relabel a slow rule after observing its result. Default
timeouts and zero retries remain part of the proof contract.

An all-worker acquisition guard can encounter one exact own-checkout
`git rev-parse HEAD` probe from module-load incident metadata before tests, and
infrastructure `ps` during worker exit. Record their arguments, folder, stack
and timing separately. They do not permit rule-level Git/gh/Node acquisition,
and their guessed cost must never be subtracted from a rule profile.

CI retains `dashboard-playwright-report-<shard>` artifacts for each shard.
The HTML report's embedded `report.json` gives per-case durations and outcomes.
Match the owning spec filename and test title, because imported case helpers
can have a different declaration location. File totals and a green workflow
alone do not establish the individual rule bound. Retain the exact revision,
run attempt, environment, selected cases, load and concurrency with a profile.

Playwright's reported duration omits some trace cleanup. Its test-end receipt
follows trace cleanup but precedes output-directory removal. Bound completion
by the next actual test start in the same worker, or an explicit final-cleanup
event. Subtract only the interval union of source-confirmed immutable shared
setup; retain page/context/rendering and cleanup. A bound above one second can
be inconclusive when it includes scheduling or next-file work. The last worker
test needs separate completion evidence. Receipt duration alone is insufficient.

## Current proof boundaries and observations

Baseline duration and Counts cardinality each keep both sort directions.
The canonical default entry-rows case owns initial order and zero sorted
headers. Exact entry/folder Summary rows reuse their existing labels/cues
owners; unchanged nested and file projections remain distinct from merge-edited
inputs. Static SSR views are independent projections; live cases still own
cross-column keyboard/click and entry→folder→nested→file navigation continuity.

First rendering installs full actual CSS/document. Later renders reuse that
same Page's shell only when its actual CSS/root match, replacing the complete
production markup; another document resets it. Fresh Page/context/facts remain
per test. Native sort snapshots include unfiltered SVG metadata/cardinality and
actual Playwright-visible SVGs. Hidden/zero-area/detached/duplicate arrows and
wrong direction/cell controls retain fault detection. Live readiness remains.

The malformed-provider connection keeps all29 real later revisions and its
old-receipt pending-history→measured-point join. It makes one pending read then
actual recovery/final reuse; the fast branded-artifact owner retains two pending
reads and exact listing/archive counts. Removing duplicate traversal fixed the
observed30s failure without changing the default. The failed219.41s loaded run
and narrow29.493s focused repair pass remain qualified historical evidence.

The current replacement-inclusive selection is248 cases:201 rules and47
prospectively mapped connections, including review Refresh and incoming
finality. Ordinary passes93.59s wall/93.180s runner; all201 actual complete
next-worker rule bounds are3–298ms. Loaded passes127.31s wall/126.802s runner,
with bounds3–660ms. Defaults remain2workers/30s/retry0/tracing. The last2 worker
connections lack next-start bounds; their cleanup stays in whole wall.

Both profiles observe awake AC100%/open lid under maintained caffeinate-s-i,
with no captured sleep/wake. Ordinary load2.90→4.17; loaded3.34→7.18; memory
68–69% free. Two readiness-confirmed loaded CPU helpers sustain97.7% of one core
each and stop/reap afterward. These are finite ordinary/contention observations,
not arbitrary-starvation proof or an isolated causal percentage.

Original75/269.01s and intermediate188/87.35s remain scope/condition-qualified
comparisons; current248 includes every replacement and declared connection.
A matched earlier finality backend subset improved24/61.09s to22 fast rules+8
connections/19.62s, with no combined predecessor UI baseline. The latest native
launch/capture preservation is separately strict3/3 at11.91s wall/11.534s runner,
reused only while its actual code/consumer boundaries remain unchanged.

Separate ordinary setup records retain502ms before workers, global setup183ms
and returned teardown219ms. Initial worker dispatch/config197–198ms is followed
by first-spec131ms. Artifact spans are story-columns490/origin1102/server106/
app1049/mount576ms. These overlapping elapsed intervals are not additive CPU or
exclusive overhead; only actual immutable worker intervals are union-subtracted
from case bounds. Common preparation never establishes reduced total feedback.

The final three-file12→14-case focused comparison has effectively unchanged
wall13.028→13.017s. It preserves every original literal/native oracle while
removing repeated static projection work; partitioning alone demonstrates no
aggregate speedup. Full248 ordinary/load measurements above include all added
fresh pages. Exact new published CI remains required for the portable target;
a green workflow alone is insufficient.
