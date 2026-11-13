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
| Production presentation | **Dashboard Frontend Test** static rendering cases under `frontend-tests/intent/intent-ci-comparison-*` and `intent-summary-story-comparison-*` use actual production TSX/full CSS and fresh pages with controlled answers. Separate mounted bindings own real sort/Show %/navigation callbacks, providers and native keyboard actions. |
| Actual acquisition | `ci-comparison-history-integration.spec.ts`: real Git history through the production acquisition boundary; `intent-ci-comparison.spec.ts` and `intent-ci-comparison-adapter.spec.ts`: default GitHub/adapter acquisition to displayed Done comparison |
| Exceptional acquisition | `intent-ci-comparison-cancelled-landing.spec.ts`, `intent-ci-comparison-taken.spec.ts` and `intent-ci-comparison-adapter-taken.spec.ts`: cancelled later-build, pushed-head and adapter Taken connections |
| Navigation and preferences | `intent-ci-comparison-drilldown-relative.spec.ts`, `intent-ci-comparison-relative.spec.ts`, `intent-summary-story-comparison-file.spec.ts`, `-renamed.spec.ts`, `-sort.spec.ts` and `-source.spec.ts`: built-app scope navigation, keyboard/Purpose/Review, source pinning and cross-story preference continuity |
| Held reads and retry | `intent-ci-comparison-locations.spec.ts` and `intent-ci-comparison-retry.spec.ts`: comparison visibility during held/failing reads, actual API and upstream request accounting, same-process recovery and real shallow-history recovery |
| Landed recovery connections | Backend `intent-ci-comparison-pending-proof.spec.ts` keeps three real-server connections: an equivalent landing's malformed listing bytes through the default parsers to the public pending gap, the measured point and final reuse; and, for each provenance, a provider-directed wait under the request owner's controlled clock and one owner process. `intent-ci-comparison-receipt.spec.ts` and `landed-ci-history-comparison-run.spec.ts` retain the persisted receipt lifetime and public history. A later landing's proof wait past the revision walk has no real-server case; see the [later pending-proof coverage map](#later-pending-proof-coverage-map). Browser `intent-ci-comparison-missing-run.spec.ts`, `-pending-proof.spec.ts` and `-trunk-finality.spec.ts` retain actual controls, timing/source cues and Trunk NoBuild despite an available later build. |
| Retained review records | `backend-tests/review/story-review-stored-*.spec.ts`: actual store replacement, stable reporting identity, newest captured preference, deletion and retention; `tests/review/story-review-one-shot-choice-refresh.spec.ts` connects stored records to displayed Refresh choices |

Backend filenames above are under `dashboard/backend-tests/intent/`;
presentation filenames under `dashboard/frontend-tests/intent/`; other browser
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
  frontend-tests/intent/intent-ci-comparison \
  frontend-tests/intent/intent-summary-story-comparison \
  tests/review/story-review-one-shot-choice-refresh.spec.ts \
  backend-tests/review/story-review-stored- \
  backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts \
  backend-tests/intent/intent-ci-comparison-receipt.spec.ts \
  backend-tests/intent/landed-ci-history-comparison-run.spec.ts \
  backend-tests/intent/landed-ci-history-no-proof-recovery.spec.ts
```

Measure native launch/capture preservation separately with
`npm run test:dashboard -- tests/review/recently-done-one-shot-review.spec.ts tests/review/story-review-one-shot.spec.ts`.
The last four ordinary selectors retain eight backend connections omitted by
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

### Later pending-proof coverage map

No real-server case builds history past the 30-revision walk. A later
landing whose end is past the walk is arranged as supplied history and judged
in process; the real server keeps only what needs real bytes, a real request
owner or the public history. Each promise has one owning check and one fault
that makes it fail.

| Promise | Owning check | Fault that fails it |
| --- | --- | --- |
| Unanswered proof keeps a later landing pending past the walk and after the landing hour | `ci-comparison-finality-later-judgment.spec.ts`, with the six cases of `ci-comparison-finality-unanswered.spec.ts` | `stillAwaited` ignores `proofUnanswered`, or drops pending after the landing hour: both files fail. The walk reports its end as the head at its bound: only the judgment check fails |
| The pending gap waits for proof of the represented run | Later: the judgment check's `landedSlotResolution` answer. Public history: the "equivalent proof recovers after a malformed artifact listing" case and `landed-ci-history-pending-proof.spec.ts` | The same `stillAwaited` faults |
| Real malformed listing bytes reach pending through the default parsers | The "equivalent proof recovers after a malformed artifact listing" case. The parser takes no provenance | An unreadable listing answered without its unanswered mark: the case's pending-gap read fails, as do both "malformed listing" finality cases and the judgment check |
| The measured point carries `later` provenance once proof answers | The judgment check's recovered slot; `landed-ci-history-pending-sources.spec.ts` for the public later point | The later walk selects its build as `equivalent`: both fail. The history maps a `later` selection to `equivalent`: the pending-sources case fails |
| Final answers reuse proof without another `gh` call | The "equivalent proof recovers after a malformed artifact listing" case. Later memory: `ci-comparison-finality-unanswered.spec.ts` and `ci-comparison-memory-later.spec.ts` | The comparison reader ignores its kept answer: all three fail |
| A provider wait holds a later read, repeats ask nothing, and the read recovers under the same owner once the owner clock ends the wait | The "later proof held by a provider-directed wait" case | The request owner asks again during a standing wait: the first read is no longer `unavailable`. The wait outlasts the owner clock: the recovered read is not the build |

There is no real-server later malformed-listing case. Ended at the trunk
head, its history gap would wait for a later build with no run, it would pass
with the unanswered mark ignored, and the equivalent case and the in-process
later cases catch every fault it could catch. The public history shows a later
point after a later-build wait (`landed-ci-history-pending-sources.spec.ts`);
a later point after a proof wait is the judgment check's recovered slot plus
that projection, which reads only the slot's selection.

The pre-integration native-variant checkpoint has248 cases:201 rules and47
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
fresh pages. Exact c216/run42743624437/attempt1 passes all17 jobs and201 complete
rule bounds11–988ms. This is a pre-integration checkpoint; changed-source proof
remains required, and a green workflow alone is insufficient.

## Equivalent wall time and remembered answers

A confirmed skip may use only its nearest successful equivalent's positive
wall interval when missing proof is settled. Unanswered/malformed/expired/invalid
proof and failed/untimed equivalents keep their existing gaps; no proof rows or
farther build are invented. The actual artifact reader owns unanswered branding.

Production `ciComparisonAnswers` uses the existing bounded `rememberedByKey`
store. It revalidates inherited missing-proof gaps once; weak provenance of
newly derived final objects keeps an ineligible final gap reusable. The default
reader and isolated `ciComparisonReader` execute the same resolution path.
Clearing the default owner clears the real retained answers. The fast
`ci-comparison-finality-equivalent-recovery` cases seed the same actual store
that their bound reader reads, then assert exact stored-object and acquisition
reuse. A worker-local seed followed by child-server HTTP cannot prove recovery.

## Integrated family observation

The accepted equivalent-timing integration has257 cases:207 rules/50 uniquely
mapped connections, with83 static native rules and26 imported declarations.
Two role-preserving transfers and six same-process memory rules preserve the
old246 surviving identities; GHA/adapter/no-proof-persistence add three connections.
All257 pass ordinary219.59s and controlled-load207.65s. Actual complete207 rule
bounds are4–518ms and5–724ms, including per-case cleanup. All95 measured source
hashes survived history-helper formatting; later guide-only result assimilation
leaves all94 runtime/test hashes unchanged. Exact7601568/run42756890006/attempt1
passes all17jobs and207 complete bounds9–861ms (median191), independently audited.
Native3 separately pass31.66s;17 history receivers/default-phone pass41.30s.
Both profiles observe AC100%/open lid/caffeinate-s-i/no sleep. Ordinary load4.60→
18.44; loaded8.11→13.74, with two ready/stopped/reaped helpers at80.0/79.9%core.
Ambient conditions differ; these finite observations imply no isolated percentage.

History phone connections overlap only initial real page navigation with actual
collector readiness. They join both before first Intent/CI activation; original
raw/public/literal/native keyboard/layout assertions and default wrappers remain.
This removes incidental serial setup from the observed timeout path. No wait,
route, response or timeout change supplies the improvement.
