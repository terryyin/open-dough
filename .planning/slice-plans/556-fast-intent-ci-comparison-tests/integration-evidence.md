# Incoming main integration

Slice 2 published as `0edefa723f02a32c59539a75e7bdc5072536fb9a`, after
slice 1's `2d1c966890a2c8ebf0b552275200655b8d036b22`. Each publication was
accepted on the execution branch and registered with the existing
`seed286-codex` observer. Neither is a trunk landing.

Before slice 3, fetched main at `1c784a6d62d48bd845f50992775064fed6d8192f`
introduced schema 2 proof units, configured-project builders and pinned Done
story recovery. Both published histories are being combined through the
installed history-preserving publisher and product-backlog merge adapter.
The prepare phase stops before publication for compatibility proof.

The backlog matches incoming main: completed project-configuration and pinned
Done stories leave Taken; the new default-timeout story joins the queue's end;
other priorities and this execution's Taken identity remain. Incoming done
record additions and removals are preserved; the adapter rebuilds the catalog.

Compatible code joins retain the configured-project admission/fetch wrapper
and exact retained-completion owner. The extracted completion reader calls the
same `PublishedStoryHistory` acquisition factory as the existing algorithms.
One incoming `PublishedSourceBuilder` also serves configured-project data;
the redundant slice 1 owner is removed. `CiProofBuilder.summaryFor` now emits
schema 2 while retaining explicit evidence entries at the case's call site.

Typecheck and the maintained Node owners `repository-description`,
`dashboard-ci-comparison-entries` and `dashboard-ci-proof-units-read` passed.
Raw logs are `/tmp/seed286-execution-20261109/incoming-main-typecheck.log`
and `incoming-main-node-checks.log`. Independent refactor found no further
edits; its 33-consumer trace has every disposition recorded in
`incoming-refactor-consumer-trace.md` in the same directory.

The joined proof passed strictly 84/84 with the ordinary two workers and
default tracing: all comparison backend cases, real history acquisition,
completed/historical review, shared Git fetch and the seven mixed-unit UI
journeys. Literal command:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/incoming-main-behavior.json npm run test:dashboard -- backend-tests/intent/ci-comparison backend-tests/review/story-review-completed backend-tests/review/story-review-historical-choice.spec.ts backend-tests/review/git-target-fetch tests/intent/intent-ci-comparison-units.spec.ts
```

Runner time was 92,513 ms; shell wall time 93.14 s. The machine was awake on
AC, load 3.00/4.69/6.98 before and 7.71/5.92/7.11 after, free memory 55%
after, with no competing local test process at launch. This establishes joined
behavior, not an aggregate optimization gain. The selective formatter passed;
the exact publication receipt is retained outside Git in
`incoming-main-publish.log` beside the proof logs. The accepted merge is
`87433ea6f7f5f43e6486f4a5b6a525702165b092`; both its push receipt and
observer registration name that SHA. The local execution branch was then
fast-forwarded through the backlog adapter to the same SHA.

The current ordinary family has 87 cases in 29 files, versus the original
75 in 26. The additions are seven unit cases, one extracted drilldown case,
two source-pinning cases, one rename journey and the extra deletion/expiry
Refresh descendant. Added unit and Summary cases, plus the split deletion/expiry Refresh
descendants, remain obligations in slices 4 and 5. New timeout overrides in
the incoming cancellation UI cases do not satisfy this story's default-timeout
promise; replacement and retirement remain owned here. No original assertion
is silently dropped and no new timing claim is made by this integration.

## Landed-history integration after slice 3

Slice 3 published as `7d42e9768243fde3c0a2583fb5a8c37eb7e26f57`, accepted
and registered on the execution branch. The next fixed incoming main is
`e623ab1433514acf89b28cddff48a36d0b75c195`. The same installed
history-preserving publisher/backlog adapter prepares this merge and stops
before publication. This is still execution-branch publication, not landing.

Incoming shared readers now retain internal gap provenance and an identity
marker for unanswered proof. The collector uses one `ComparisonBuildSource`
per pass, preserving its once-per-revision listing cache and the existing
history/workflow/proof acquisition owner. Extracted exact-landing and nearest
ancestor operations consume that same source. `asComparisonSlot` discards
history-only provenance; `finalSlot` preserves the previous comparison finality
predicate. No comparison semantics or new history feature is authored here.
Artifact factories and the exact returned object's unanswered marker coexist.
MakeMe retains both histories' getters, shared fact copying, history and launch
landing additions. All 23 incoming assertions in adapted Node tests remain
byte-identical. No comparison/Summary/Refresh cases changed in this batch.

The backlog matches the incoming transitions: completed unit-proof and landed
wall-time stories leave Taken; two landed-evidence and two unit-gap follow-ups
head the queue in incoming order. This execution and other active stories
remain Taken; other priorities and compatible done-record changes are retained.

Typecheck, whitespace and these maintained Node owners passed:

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-ci-proof-read.test.mjs tests/support/dashboard-landed-exact-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-later-trunk-build.test.mjs
```

Logs and the 22-consumer trace are `incoming-landed-typecheck.log`,
`incoming-landed-node.log` and `incoming-landed-consumer-trace.md` under
`/tmp/seed286-execution-20261109/`. They observe unanswered proof identity,
exact reruns/timeouts, cancelled provenance/bounds/finality and real shared
history acquisition. Collector behavior has a separate runtime gate because
its catch can turn an integration defect into a pending answer:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/incoming-landed-behavior.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/incoming-landed-artifacts.jsonl npm run test:dashboard -- backend-tests/intent/ci-comparison backend-tests/intent/ci-proof-memory tests/intent/intent-ci-comparison-mounted backend-tests/intent/landed-ci-history-gaps.spec.ts backend-tests/intent/landed-ci-history-pending-proof.spec.ts backend-tests/intent/landed-ci-history-pending-sources.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-ci-comparison-retry.spec.ts
```

Strict 77/77 passed, runner 24,351 ms, wall 24.83 s. All 65 fast rules took
at most 542 ms. Actual collector points and pending transitions, clean
comparison output, Project history UI and actual retry API/upstream accounting
settled correctly. The machine was awake on AC under `caffeinate -s -i`,
load 2.64/2.65/2.96, free memory 60%; an external one-worker history selection
was active. After load was 3.53/3.11/3.11, memory 60% free. Independent
refactoring found no further edit; its 32-consumer trace is
`incoming-landed-independent-refactor-consumer-trace.md` beside the proof logs.
All thirteen reviewed files preview at most 247 formatted lines. Accepted
proof remains valid. Formatting and the adapter continuation passed; merge
`b7dce07a2cb7583a512913a0a18650a17056050b` was accepted on the execution
branch and registered with the existing observer. Its exact receipt is in
`incoming-landed-publish.log`; local branch refresh fast-forwarded through the
adapter to the same SHA.

## Shared proof integration after slice 4

Slice 4 published as `7f656baa928bf0ac9ed290b3e4c5013f395f6814` before
integrating fixed main `f73ae69b60375c090319709fc77db6647168f114`. Both
histories are retained through the installed history-preserving/backlog
adapters; preparation stops before publication for proof and review.

Main's shared `dough-test-optimization/scripts/ci-proof-read.mjs`, check and
archive owners remain authoritative. Dashboard factories retain local caches,
default singletons, wording and exact unanswered-proof objects; GitHub maps
existing external asks and adapter read adds one optional acquisition argument
defaulting to the real command. Generic Buffer JSDoc accepts actual archive
bytes without copying/conversion. The deleted dashboard ZIP owner remains
deleted; the shared archive tests retain bounded/underreported extraction proof.

Builder joins retain canonical evidence/summary owners and selected legacy
units. `CiProofBuilder` composes the summary builder while preserving its
example/project and opaque-adapter defaults. One outside fixture uses the
canonical unbroken-part method (six broken-down cases plus one unbroken part,
seven results and 20,110 ms); duplicate part summation is removed. A cohesive
`PublishedIntegrationBuilder` extraction keeps the facade's API and fresh
instances within the size cap. Main's only cancelled-gap change was a comment
assigning old allowances to this story; its mapped retirement remains.

The backlog retains incoming removal of completed evidence-first optimization
from Taken and its new leading attempt/wait follow-up. This execution and the
timing-Proof story remain Taken; other priorities and done records are retained.
No comparison/Summary/Refresh assertions changed in this batch.

Typecheck and ten maintained Node owners passed, wall 1.87 s: shared read,
adapter read, check, archive and adapter lead; dashboard proof/adapter/
breakdown/units; and the actual publication-builder consumer. Exact command,
setup and assertion anchors are in `shared-proof-integration-handoff.md` and
`shared-proof-integration-node.log` under `/tmp/seed286-execution-20261109/`.
The 31-reader and 47-builder consumer traces have no blank dispositions.

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/shared-proof-joined-behavior.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/shared-proof-joined-artifacts.jsonl npm run test:dashboard -- backend-tests/intent/ci-comparison backend-tests/intent/ci-proof-memory backend-tests/intent/ci-time-without-runner-waits.spec.ts tests/intent/intent-ci-comparison-mounted tests/intent/intent-summary-story-comparison-mounted tests/intent/intent-ci-comparison.spec.ts tests/intent/intent-ci-comparison-adapter.spec.ts tests/intent/intent-ci-comparison-retry.spec.ts backend-tests/intent/landed-ci-history-pending-proof.spec.ts
```

Strict 171/171 passed, runner 27,168 ms, wall 27.65 s; every one of the 164
rule owners matched the inventory, maximum 705 ms. The default GitHub/adapter,
real retry, raw acquisition and pending-proof connections settled. Awake AC
under `caffeinate -s -i`, launch load 2.54/3.04/3.62/free memory 70%, no
competing test/typecheck; after 3.08/3.06/3.52/free 70%. Match owning spec
files, not imported helper declaration locations, when counting cases.

Independent reader/builder refactoring found no further edit, contradiction or
uncovered consumer. Eight surviving owned files preview at most 246 formatted
lines. Formatting, publication and local adapter refresh passed. Accepted merge
`d77917ebcc3ad52279bd7346f9f2fb9cefedc4b5` and observer registration match;
the exact receipt is `shared-proof-integration-publish.log` beside the proof logs.

## CI assertion repair during slice 5

Run 42627028218 attempt 1 at slice-4 revision `7f656baa928bf0ac9ed290b3e4c5013f395f6814`
failed one dashboard case. The CLI diagnostic could not read its log (HTTP 403),
and artifact download returned HTTP 401. The connected GitHub app supplied the
complete job log and twelve retained HTML reports without changing credentials.
All 2,415 case outcomes show exactly one unexpected result, the Taken Story
Branch mounted title assertion; no other failure or flaky result was hidden.

The settled live status contains both its h3 title and the nested h4 Proof.
The broad heading selector could pass before the asynchronous status arrived.
Waiting for the real Proof heading reproduced the exact two-heading failure;
the repair retains that observation and scopes the original exact title to h3.
No production, harness, timeout or independent expected value changed.

Whole wording-owner proof passed 31/31, maximum 173 ms, normal two workers,
default tracing, awake AC under `caffeinate -s -i`, launch load 3.53/3.68/3.71
with no competing heavy test. The red/green literal commands, actual observing
assertions and 33 consumer dispositions are in `ci-repair-42627028218-return.md`
and its linked logs under `/tmp/seed286-execution-20261109/`.
The separate CI performance gap remains G3, owned by slice 5; this assertion
repair does not claim that the portable timing target is met.
