# Fast, trustworthy Intent CI comparison feedback

**Identity:** SEED-286#fast-intent-ci-comparison-tests

**Source:** [Make the Intent CI comparison tests sub-second](../../seeds/SEED-286-fast-intent-ci-comparison-tests.md#fast-intent-ci-comparison-tests)
**Source review:** [Source review](source-review.md)

## Goal and boundary

Give developers equivalent fault detection for each comparison rule in less
than 1,000 ms per rule-focused test. Include per-test setup, actions, assertions
and cleanup; measure common build/worker startup and retained integration
journeys separately. Reduce the ordinary local feedback path as well as the
individual case times. The source's timing target is not permission to weaken
coverage, hide setup in hooks, increase timeouts or introduce retries.

Cover the current CI comparison and Summary comparison family, including
Done/Taken, both execution modes, exceptional endpoint recovery, frontend
reading and request accounting. Also replace record-only launches in the two
review-choice Refresh cases named by the source. Product comparison semantics,
timing-history features, unrelated suite optimization and a general mocking
framework are outside scope. A retained integrated journey may exceed one
second; it must keep the default timeout and have unique wiring proof assigned
to it. The source keeps that measurement distinction explicit.

**Proof strategy:** [Solutions, proof ownership, measurement, gates and preparation evidence](proof-strategy.md). Read with the selected slice.

**Evidence:** [Execution and resume](execution-evidence.md) ·
[Gap proof](gap-evidence.md) · [Incoming integration](integration-evidence.md) ·
[Lifecycle](lifecycle-evidence.md) · [Presentation](presentation-evidence.md) ·
[Production rendering](render-evidence.md) ·
[Portable evaluation](portable-evidence.md).

## Ordered slices

### 1. Get a fast answer for published story endpoints

Type: Behavior
Status: done
Proof: Normal Done/Taken endpoint cases through the real comparison boundary
without browser/Git/provider subprocesses, and retained integrated acquisition.

Accepted: actual published-history algorithms over raw MakeMe external facts;
14 rules at 0–15 ms, zero acquisition subprocesses, six wrong-endpoint faults
caught. Real Git/provider/authenticated/rendered connections remain. Full
decision, commands and proof are in execution-evidence and source-review.

### 2. Explain cancelled and proofless endpoints quickly

Type: Behavior
Status: done
Proof: Minimal revision/run/proof cases at the comparison boundary, preserving
one real cancelled-landing acquisition path and its independent provenance.

Accepted: 19 real selection/gap rules at 0–13 ms, preserving cancelled/later,
running/head stops, exact-only timeout, attempts and the 30-revision bound.
Wrong-bound fault caught; real cancelled acquisition retained. See gap-evidence.

### 3. Recover and remember comparisons without repeated infrastructure

Type: Behavior
Status: done
Proof: Real server read/memory boundary with counted external operations;
mounted real Check again control/read-state rules; retained full-app retry
journey against held/failing/recovered responses.

Accepted: 25 actual reader/memory rules below 5 ms, separately counted API and
upstream acquisition, and seven real mounted lifecycle cases. Real retry and
held/failed Changed tests connections remain. See lifecycle-evidence. Mounted
client lifecycle cost is superseded only after slice 7's equivalent proof.

### 4. Read the same comparison quickly at every scope

Type: Behavior
Status: done
Proof: Sub-second mounted production comparison/Summary/Proof variants with
real providers and controls; retained built-app comparison → entry/folder
Summary → file Proof and return, plus real acquisition-to-scope proof.

Accepted: 87 real mounted presentation/lifecycle variants, original assertion
maps, 15 predecessor files retired and eight narrowed; 18 comparison wiring
owners. Ordinary 182-case pass and loaded 249-case pass preserved all original
literal/physical/interaction checks. See presentation-evidence. Later CI
disproved the portable timing premise; slices 6–7 replace only affected proof.

### 5. Refresh stored review choices without incidental launches

Type: Behavior
Status: done
Proof: Sub-second cases through the real record store/selection boundary,
including `reviewLandedRunsOf`, `preferredReviewRun`, `reviewRunKey` and retention;
the three UI Refresh journeys with direct MakeMe setup; existing real one-shot
launch/capture owners.

Given captured and legacy records, Refresh keeps the chosen run after a newer
capture and after native-session replacement. Deletion chooses the newest
remaining capture, expiration chooses the next, then legacy evidence explains
its gap. Arrange stored records and immutable comparison commits directly;
starting native hosts is not the behavior of these Refresh cases. Preserve
actual record persistence, replacement identity, ordering, expiration and view
assertions. A frontend response alone cannot prove the store/reader transitions.
Declare before measurement that record selection, replacement identity,
deletion and expiration are rule cases subject to the sub-second target;
the real store → Refresh transport → displayed choice is retained integration.
Do not reclassify a slow rule case as wiring after observing its timing.

Reuse launch/landing builders and production encoding. Inspect and run
`tests/review/story-review-one-shot.spec.ts` and
`tests/review/recently-done-one-shot-review.spec.ts` when the shared
launch/capture contracts they observe change, or cite sufficient matching
retained proof when those contracts remain unchanged. Reading their assertions
alone is not executed preservation proof. Remove incidental launches only after
the replacement rule proof and these integration obligations are established.

Accepted: three real-store rules at 14/270/15 ms, three direct-record Refresh
journeys, and three current native launch/capture preservation journeys. Exact
identity, replacement, deletion, retention and legacy-gap evidence is in
refresh-evidence. Published progress and the whole-family local observation are
in portable-evidence; they do not satisfy the still-open portable UI goal.

### 6. Read comparison presentation rules without client startup

Type: Behavior
Status: planned
Proof: Actual production React rendering and CSS in a fresh browser page;
independent literal/semantic/geometry expectations; actual control connections.

Given canonical comparison/proof/overlay facts, render the real entry, Summary,
tree and file Proof content with unchanged endpoints, reasons, labels, counts,
units, cue attributes, relative scale membership and sort state. Reuse existing
pure rules and Vite SSR compilation. Extract only necessary pure content from
async shells and the frame preference binding, used by production itself.
Keep actual aggregate scale/projection algorithms inside that content; never
supply expected rows, ideal scale, private contexts or settled effect outcomes.

The three-case capability consumed actual TSX/CSS and passed complete adjusted
envelopes 195/191/287 ms; cold compilation/build and 5.85 s wall are separate.
It permits this early family pilot, not retirement: first prove a complete
Summary ancestor/layout, File Proof content and percent-on outlier at this
boundary, with fault controls and original independent assertions. Preserve
the actual 200% Verdana viewport, no sideways scrolling and unbroken words.
CSS/role/title/cardinality are observed by the real browser, not a DOM model.
Measure common immutable compilation separately and all per-case arrangement,
projection, rendering, setContent, observations and page/context cleanup.

Map all 80 presentation predecessors before retirement. Reuse fast domain
sort/math/cue owners where fault-equivalent, including exact old time values;
include those owners in ordinary feedback. Preserve real callbacks/Enter/Space,
each column key, Show %, mixed-unit tree→Summary→Proof and preference continuity
through uniquely mapped existing or narrowly added prepared-service connections
declared before measurement. No measured predecessor is relabeled as wiring.
Static variants and actual bindings must jointly detect every old fault before
its old case retires. Keep seven lifecycle and three acquisition-counter
predecessors for slice 7; G4 names the one/zero proof-read assertions.

Pilot decision: retain only an observed useful total-cost route with credible
margin against G3; otherwise restore this attempt and reassess before extension.
Then measure all presentation replacements and publish their CI experiment.

### 7. Recover selected readings quickly and verify the complete family

Type: Behavior
Status: planned
Proof: Actual production comparison/proof request-state owner in process,
held fetch/abort witnesses, retained React control and stale-paint connections;
whole-family local/load and exact published CI timing.

Given unavailable comparison/proof, held reads, a changed head or selection,
the actual client owner ignores stale answers, aborts old requests, retries the
same subject, disables Check again while busy and refreshes all three endpoint
proofs after a successful comparison retry. Failure does not advance that round;
same-head observation does not reread. Preserve numeric and adapter attempt
identity/query validation, Taken Trunk provisional/Branch N/A and no retry.

Modularize existing useIntentCiComparison/useSlotProof responsibility into a
small production-used disposable owner, with hooks as React lifetime bindings.
Use actual authenticated readers and external fetch Responses; retain server
finality/memory as their existing sole owner. Add no frontend TTL/cache or
universal request framework. Minimal MakeMe facts, exact query/counter deltas,
controlled held promises and AbortSignals prove the seven old lifecycle rules.
Keep real UI held-error/recovery, endpoint-proof recovery and both old-selection
comparison/proof abort connections. Establish both boundaries before retirement.

Run the ordinary local selection including every new/reused rule, all retained
comparison/Refresh connections and separately reported native preservation.
Compare against original 75/269.01 s and intermediate 188/87.35 s with load,
concurrency, shared startup, rule cleanup and wiring separately stated. Obtain
a representative loaded observation and exact published CI complete-case bounds.
Every rule must remain below 1,000 ms and total local feedback must improve;
an inconclusive CI bound remains open. Preserve defaults and fault detection.
Move lasting ownership/commands/results to maintained test docs before wrap-up.

## Current decisions and learnings

The `80ef2d48` checkpoint leaves 21 cleanup prefixes over one second (max
1,549 ms). Batching cannot close G3; loading/observer pilots were rejected and
reverted. Existing real SSR removes incidental client startup: the three-case
consuming probe passed at 195–287 ms with compilation separate. Select the
supported static-render + actual live-binding strategy in slices 6–7; preserve
supported old sort/file gains. Full context and decisive comparison are in
[the checkpoint](ui-pilot-evidence.md). G1/G3 stay open through slice 7.

- One production comparison model; acquisition substitutes replace true
  external boundaries, never the rules their tests claim to protect.
- Retain integration by unique observed connection, not a fixed test count.
  Separate its cost without hiding it from total feedback measurements.
- Reuse ADRs 0002/0008/0010: one comparison model, derived disposable reading
  state, and measured useful gain. PFE found existing pure rule owners, actual
  renderable components and the Vite SSR loader; no new framework/ADR is needed.
- Read the current delivered code at execution. Other active Intent stories
  may add consumers, but their feature outcomes are not prerequisites for this
  test optimization; preserve their ownership and align changed contracts.
- No numeric slice target/hard limit is configured. Each slice owns one
  feedback outcome, its migration, proof, measured experiment and cleanup.
  Reassess a failed integration assumption before expanding the slice.

## Story obligations

### G1. Retire browser rule variants after presentation proof
Reported: slice 1 — "frontend assertion migration and predecessor retirement in slice 4"
Story clause: "Developers and agents changing Intent's CI timing comparison get a trustworthy result for each comparison rule in under a second, in any environment."
Disposition: interim until slices 4, 6, 7

### G2. Actual-Git rule cases exceed the target under observed load
Reported: slice 1 — "loaded sub-second timing remains unproved/unsatisfied for those cases"
Story clause: "Target less than 1,000 ms for each rule-focused test, including per-test arrangement, actions, assertions and cleanup."
Disposition: proved by slice 1: raw-history-family-after.json has all 14 replacement rules at 0–15 ms; raw-history-no-acquisition-control-applied.json observes zero acquisition subprocesses; raw-fault-controls-summary.json catches all six endpoint faults. The old Git-per-rule cause is removed; final loaded/portable acceptance remains in slice 7, without claiming a new load-27 observation.

### G3. Published CI rule timings exceed the target
Reported: slice 5 — "Run 42627028218 attempt 1 matched all 164 rule owners; sixteen took 1,019–1,581 ms."
Story clause: "Developers and agents changing Intent's CI timing comparison get a trustworthy result for each comparison rule in under a second, in any environment."
Disposition: receiving slice 7

### G6. Preserve Project Intent without a story comparison preference
Reported: slice 6 — "my extracted ScopeProofContent/FileProofContent unconditionally called useCiComparisonPreference, whereas original hook lived only inside comparison Frame; ProjectIntent has no story preference and crashes on ordinary judged scope."
Story clause: "This story does not change Intent's comparison semantics"
Disposition: proved by slice 6: render-evidence.md records the actual Project Summary/File Proof crash, comparison-only hook binding repair, six repeated counterexample passes, twelve affected current-source passes and the direct judged Summary pass; the missing-context guard is retained.

### G5. Keep scope acquisition and queued-selection observations
Reported: slice 6 — "Additional exact scope gaps from9df: (1) mounted-gaps `a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint`: comparisons1/proofs2/expect.poll(statuses)2 after full exactlabels/framing/table; (2) mounted-fallback `Landed running preserves one Branch fallback through entry, folders and file Proof`: comparisons1/proofs2 after Branchheading+`Landed is not used: Build is still running.` atentry/folder/nested/file andfile+70ms; (3) mounted-gaps `selecting a queued story clears the previous Summary comparison and Baseline column`: actualMakeMequeuedSEED-B update clears priorfullentryoracle/frame/labels/Baseline/oldidentity, comparisons stays1/proofs3. No exact retainedcounted correspondence."
Story clause: "Preserve each distinct rule's behavioral proof and independently stated expectations"
Disposition: receiving slice 7

### G4. Preserve frontend proof acquisition counts during static migration
Reported: slice 6 — "80 mapping has two cross-boundary acquisition assertions static SSR cannot own: invalid+ambiguous adapter proofs===1 (only Baseline readable), and both all-endpoint discovery unavailable cases proofs===0."
Story clause: "Preserve each distinct rule's behavioral proof and independently stated expectations"
Disposition: receiving slice 7
