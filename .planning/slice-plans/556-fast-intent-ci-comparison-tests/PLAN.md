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

**Execution evidence:** [Accepted proof, experiment decisions and exact resume/observer context](execution-evidence.md).

**Gap proof:** [Cancelled and proofless endpoint evidence](gap-evidence.md).

## Ordered slices

### 1. Get a fast answer for published story endpoints

Type: Behavior
Status: done
Proof: Normal Done/Taken endpoint cases through the real comparison boundary
without browser/Git/provider subprocesses, and retained integrated acquisition.

Given minimal published endpoint/history facts, runs and usable proof, reading
the comparison quickly returns the existing baseline, branch, landed or
provisional result in either execution mode, with correct owning merge,
fast-forward, earlier-completion and skipped/equivalent provenance. Keep adapter
attempt/run identity and workflow/job timing tied to the selected build.

Reuse lookup and MakeMe owners; make only the necessary acquisition seam
coherent with production callers. Establish replacement failure-detecting proof
before retiring the corresponding expensive matrix. Retain representative real
Git history → provider/adapter → authenticated answer → rendered comparison
observations, with their unique assertions recorded. If immutable shared history
reduces their measured cost, prove independent clones and cleanup in this slice.
Preserve the actual merge/history semantics; arranging the selected endpoint
cannot prove the algorithm that derives it. Reprofile this whole affected group,
including retained integration, before retaining the experiment.

### 2. Explain cancelled and proofless endpoints quickly

Type: Behavior
Status: done
Proof: Minimal revision/run/proof cases at the comparison boundary, preserving
one real cancelled-landing acquisition path and its independent provenance.

Given a cancelled landing with later unbuilt/proofless/cancelled revisions,
reading chooses the nearest later usable completed build and names how many
trunk revisions it includes. Running/head stops stay refreshable; the fixed
30-revision bound, nearest unusable-proof explanation, stopped-running evidence
and no-later-result wording remain discriminated. Timed-out/unexplained remains
exact-only; baseline/branch skip unusable proof within their own bounds.

Use the same history/run/proof model as slice 1 rather than another resolver
or one recognizer per example. Cover attempt selection and unavailable adapter
proof where those distinctions drive this result. Replace heavy variants only
after their replacement assertions distinguish wrong selection, boundary or
proof behavior. Measure both the fast variants and retained real wiring.

### 3. Recover and remember comparisons without repeated infrastructure

Type: Behavior
Status: planned
Proof: Real server read/memory boundary with counted external operations;
mounted real Check again control/read-state rules; retained full-app retry
journey against held/failing/recovered responses.

Given unavailable whole answers, slots or endpoint proof, repeat selection or
Check again reads the correct evidence afresh and recovers in the same process.
The button disables while a read is held. Final Done answers and valid proof
reuse evidence without more provider requests; completed timing reasons are
final, while Taken/head changes, running and awaiting-later results stay fresh.
Comparison remains visible while locations/Changed tests reads are held or fail.

Test API reads and upstream requests as separate counters, preserving the old
request-accounting contract. Memory needs no elapsed-time wait; use a controlled
clock for actual deadlines/backoff only. Start/settle/abort observable operations
and clear/isolate cache state. Use the observed mounted-component route for
busy/callback rules and actual production read logic for request/finality rules.
Declare the full-app refresh, selection and held-read visibility journey as
integration before timing; it proves their connection and is not a substitute
for fast rule variants. Remove duplicate expensive retry setup only after both
proof boundaries hold. Measure the failure and return journey as well as rules.

### 4. Read the same comparison quickly at every scope

Type: Behavior
Status: planned
Proof: Sub-second mounted production comparison/Summary/Proof variants with
real providers and controls; retained built-app comparison → entry/folder
Summary → file Proof and return, plus real acquisition-to-scope proof.

Given prepared comparison/proof and changed-file evidence, real navigation
keeps active endpoints, fallback explanations and reading preferences consistent.
Preserve signed timing words, whole-second overall versus precise scope times,
zero Baseline behavior, count units, gaps/untimed/missing breakdown, source cues,
sorting/ties/outside row, relative scales and Show %. Count requests to prove
drilling reuses evidence and Summary does not read file text.

Use the actual assertions in the 7 Summary files and the entry/relative/sort/
drilldown consumers to assign distinct fault-detection purposes. Minimal
frontend cases each own a coherent observation; do not join unrelated rules
into one long branching journey. Use the observed production-component Vite
entry and existing static server rather than whole-app selection in every
rule case. Mount real scope owners with the actual reading/preference providers,
production projections and controls, then unmount/reset after each test.
Keep case data in MakeMe outside the browser bundle and pass canonical values
into the mounted boundary. Extend no framework for hypothetical consumers.
Retain full-app navigation/preference continuity and acquisition-to-rendered-scope
proof for connections a mounted surface cannot establish. Declare these
integration owners before measurement. Profile all replacement cases, per-test
browser setup, shared bundle build and retained integration.

### 5. Refresh captured review choices from stored records

Type: Behavior
Status: planned
Proof: Sub-second cases through the real record store/selection boundary,
including `reviewLandedRunsOf`, `preferredReviewRun`, `reviewRunKey` and retention;
the two UI Refresh journeys with direct MakeMe setup; existing real one-shot
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

Run the final ordinary local family selection including every replacement,
retained comparison integration and both review Refresh cases, comparing against
the original baseline. Verify portable correctness/timing in published CI and
record observed environments and remaining unknowns; no finite profile proves
an absolute bound on arbitrarily starved machines. Do not claim the target met
while any rule-focused test remains over it or the local feedback path has no
demonstrated improvement. Keep still-needed results in maintained test docs
before wrap-up removes this plan.

## Current decisions and learnings

Slice 1 uses the existing public history operations for fast owning/foreign,
fast-forward and completion rules, with actual Git and shared immutable prefix
preparation. Its ordinary new rules passed in 0–498 ms; preserve the separate
full-reader composition and UI observations until G1 is settled. No history
cache is selected. See the linked execution evidence for measurements and
rejected experiments.

The load-27 refactor check then measured the actual-Git rule cases at
1,811–2,305 ms while the ten in-process cases stayed at 1–10 ms. G2 returns
this performance gap to slice 1 before delivery. Assess a concrete raw-history
acquisition boundary in the existing published evidence/landing/completion
owners, retaining their actual algorithms and one explicitly mapped real
acquisition connection. Do not relabel the three measured slow rules as wiring.

PFE selected one `PublishedStoryHistory` acquisition contract using the existing
Git calls: authored parents, batched profile text, profile path history,
ordered/merge revisions, ancestry and live author configuration. Existing claim,
owning-side, landing and completion algorithms consume it. MakeMe's canonical
graph supplies equivalent external facts for fast rules. This bounded correction
is authorized within slice 1; first establish fault-equivalent fast proof and
the declared real acquisition connection, then retire the three slow rule cases.
The shared concept is published story history used by both comparison and
Review. Necessary callers include published endpoints/commits, completed claim
and merge evidence, and Taken endpoints. Adapt those callers coherently to the
same acquisition owner; preserve their domain rules, errors and public results.

- One production comparison model; acquisition substitutes replace true
  external boundaries, never the rules their tests claim to protect.
- Retain integration by unique observed connection, not a fixed test count.
  Separate its cost without hiding it from total feedback measurements.
- The 1,491 ms full-app probe invalidated using that route for every frontend
  rule. The 593 ms mounted production-component probe supports a different
  strategy within the same scope: mounted fast variants plus explicitly owned
  whole-app navigation/transport integration. Preserve these boundaries before
  measuring; the target stays unchanged. Broader cases and loaded/CI timings
  remain execution acceptance work.
- Reuse ordinary portable snapshot/materialization if profitable; APFS clone
  and worker-scoped server reuse remain optional experiments, not premises.
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
Disposition: interim until slices 4, 5

### G2. Actual-Git rule cases exceed the target under observed load
Reported: slice 1 — "loaded sub-second timing remains unproved/unsatisfied for those cases"
Story clause: "Target less than 1,000 ms for each rule-focused test, including per-test arrangement, actions, assertions and cleanup."
Disposition: proved by slice 1: raw-history-family-after.json has all 14 replacement rules at 0–15 ms; raw-history-no-acquisition-control-applied.json observes zero acquisition subprocesses; raw-fault-controls-summary.json catches all six endpoint faults. The old Git-per-rule cause is removed; final loaded/portable acceptance remains in slice 5, without claiming a new load-27 observation.
