# Fast, trustworthy Intent CI comparison feedback

**Identity:** SEED-286#fast-intent-ci-comparison-tests

**Source:** [Make the Intent CI comparison tests sub-second](../../seeds/SEED-286-fast-intent-ci-comparison-tests.md#fast-intent-ci-comparison-tests)
**Source review:** [Source review](source-review.md)

## Goal and boundary

Give developers equivalent fault detection below1,000ms per rule, including
setup/actions/assertions/cleanup. Measure common immutable runner/build/worker
startup and retained journeys separately. Improve ordinary local feedback;
no weakened coverage, hidden case work in hooks, increased timeouts or retries.

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
[Rendering](render-evidence.md) · [HTTP teardown](server-close-evidence.md) ·
[Static sort](static-sort-evidence.md) · [Finality](finality-evidence.md) · [Client owner](client-owner-evidence.md) · [Portable evaluation](portable-evidence.md) · [Final portable](portable-final-evidence.md) · [Variants](variant-proof-evidence.md) · [Incoming equivalent integration](incoming-equivalent-integration.md) · [Integrated family](integrated-family-evidence.md).

## Ordered slices

### 1. Get a fast answer for published story endpoints

Type: Behavior
Status: done
Proof: Normal Done/Taken endpoint cases through the real comparison boundary
without browser/Git/provider subprocesses, and retained integrated acquisition.

Accepted: 14 actual published-history rules 0–15 ms over raw MakeMe facts, zero
acquisition subprocesses, six wrong-endpoint faults caught. Real Git/provider/authenticated/
rendered connections remain; full proof in execution-evidence/source-review.

### 2. Explain cancelled and proofless endpoints quickly

Type: Behavior
Status: done
Proof: Minimal revision/run/proof cases at the comparison boundary, preserving
one real cancelled-landing acquisition path and its independent provenance.

Accepted: 19 real selection/gap rules 0–13 ms retain cancelled/later, running/head,
exact-only timeout, attempts/30-revision bound. Wrong-bound fault caught; real
cancelled acquisition retained. See gap-evidence.

### 3. Recover and remember comparisons without repeated infrastructure

Type: Behavior
Status: done
Proof: Real server read/memory boundary with counted external operations;
mounted real Check again control/read-state rules; retained full-app retry
journey against held/failing/recovered responses.

Accepted: 25 actual reader/memory rules below 5 ms, separately counted API and
upstream acquisition, and seven real mounted lifecycle cases. Real retry and
held/failed Changed tests connections remain. See lifecycle-evidence. Mounted
client lifecycle cost is superseded only after slice 8's equivalent proof.

### 4. Read the same comparison quickly at every scope

Type: Behavior
Status: done
Proof: Sub-second mounted production comparison/Summary/Proof variants with
real providers and controls; retained built-app comparison → entry/folder
Summary → file Proof and return, plus real acquisition-to-scope proof.

Accepted: 87 mounted variants, original assertion maps,15 files retired/eight
narrowed and 18 wiring owners. Ordinary 182/loaded 249 passes preserve original
literal/physical/interaction proof (presentation-evidence). Later CI disproved
portable timing; slices 6/8 replace only affected proof.

### 5. Refresh stored review choices without incidental launches

Type: Behavior
Status: done
Proof: Sub-second cases through the real record store/selection boundary,
including `reviewLandedRunsOf`, `preferredReviewRun`, `reviewRunKey` and retention;
the three UI Refresh journeys with direct MakeMe setup; existing real one-shot
launch/capture owners.

Accepted: three real-store rules 14/270/15 ms, three direct-record Refresh journeys
and three native launch/capture preservation journeys. Identity/replacement/
deletion/retention/legacy gaps are in refresh-evidence; whole-family progress is
in portable-evidence. These do not satisfy the still-open portable UI goal.

### 6. Read comparison presentation rules without client startup

Type: Behavior
Status: done
Proof: Actual production SSR/CSS in fresh browser pages, original independent
semantic/physical/literal assertions, uniquely mapped live control connections.

The [original execution scope](presentation-scope-record.md) is retained with
all 80 predecessor maps,77 static rules, six counter/seven lifecycle rules and
three predeclared live connections. All77 static complete CI bounds at742f80b
are below 1000 ms, maximum 927 ms; ordinary Landed sort is 722 ms. No case relabeled.
[Static evidence](static-sort-evidence.md) records preserved native/cardinality
proof, rejected concurrency and exact hosted results. The same observer now
confirms exact742f80b/run42686088566/attempt1 success. Six counter
and seven lifecycle rules remain with 8; G6/G7 causal repairs stay retained.

### 7. Keep current Done finality rules fast after integration

Type: Behavior
Status: done
Proof: Actual shared pending/final judgment and comparison memory over canonical
raw published/history/artifact/receipt facts; mapped real persistence/transport.

Reconcile accepted-main 9f88 semantics with the existing ComparisonBuildSource
history seam and one actual landedSlotResolution. Preserve private Done
answer/landedPending memory gating and the unchanged public API. Reuse raw
project launch/history documents, actual receipt matching and observation clock;
never supply a selected receipt age or pending boolean. Existing artifact-reader
factory must preserve private unanswered-proof branding from real raw inputs.

[Selected PFE and pilot](incoming-finality-scope.md) owns the precise contract.
Before migrating 24 new backend rules, inventory all 27 incoming cases and map
actual assertions/roles. Profile meaningful existing cases in ordinary mode.
First prove unknown age, matching-receipt hour−1ms/exact-hour, and unanswered
proof recovery through actual owners with zero acquisition subprocesses and
complete costs below 1000 ms. A failed pilot stops extension for reassessment.

Then preserve every distinct rule, actual namespace/target/revision/minimum-time
match, direct-wait/owner admission/PID, collection/persistence/retention and new
UI source/time/query/counter oracle. Keep only uniquely mapped real connections;
no measured slow rule becomes wiring. Repair the old final-gap fixture with
truly final canonical facts. Retire predecessors only after equivalent proof;
include all new/reused owners in local/load/CI measurement and shard discovery.
Do not restore the two inherited 60 s allowances or add a new cache/framework.

### 8. Recover selected readings and prove the current family

Type: Behavior
Status: done
Proof: Production-used plain comparison/proof owners, real React lifetime/control
bindings, preserved native oracles and current-family local/load/exact CI.

Accepted checkpoint:16 client rules preserve all13 predecessor facets; G4's
three native cases and G5's exact status/navigation/selection bindings remain.
Variant248 (201rules/47connections, native3 separate) passes ordinary93.59s and
loaded127.31s; complete rule bounds3–298/3–660ms. Exactc216/run42743624437/attempt1
passes all17jobs and all201 complete bounds11–988ms. Native/header/visibility/
geometry/fault proof stays. [Checkpoint and integration](incoming-equivalent-integration.md)
keep qualifications; accepted-main reconciliation and final integrated proof move9.

### 9. Reconcile accepted equivalent timing and verify the integrated family

Type: Behavior
Status: done
Proof: Actual comparison/memory/artifact and collection/history owners, mapped
GHA/adapter/native connections, current integrated local/load and published CI.

Given accepted SEED-288 on main2751, integrate its timed settled-none PASS
eligibility, retained-answer recovery and final collector composition through
our existing acquisition factories, private unanswered brand and shared model.
Preserve negative gaps, first-proof retention, exact-attempt collection and all
incoming/current distinct oracles. No parallel cache, TTL or test-only seed API.
First execute the two bounded same-process confidence probes in the
[integration contract](incoming-equivalent-integration.md); a failed seam premise
stops dependent migration for reassessment, not a weaker proof substitute.
Then map actual owners before retirement, renew affected consumers/typecheck,
ordinary full-family/load/native and exact published all-job/complete-rule CI.
All rules stay<1000ms including case cleanup; defaults/failure policy remain.
Carry unrelated accepted trunk changes with final all-job acceptance; no new
selected rules are inferred from them. C067 stays final target-CI-only.

## Execution complete

Product advice: no change.

## Current decisions and learnings

c216 proves the pre-integration201-rule checkpoint; preserve its actual proof.
Main2751 SEED-288 materially changes equivalent/retained collector semantics;
9 owns current-source reconciliation and final integrated-family proof. Accepted
post2751 Cursor error explanation/default-preserving fixtures join all-job CI.
Reuse Accepted0002/0008/0010, one derived model, existing factories/real stores.
Nine Behavior slices need no sizing exception or resplit; no human choice is open.
Local proof uses maintained macOS sleep guard: AC `caffeinate -s -i`; battery
`caffeinate -i`, lid open and inspected sleep log. Full [failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies.

## Story obligations

### G1. Retire browser rule variants after presentation proof
Reported: slice 1 — "frontend assertion migration and predecessor retirement in slice 4"
Story clause: "Developers and agents changing Intent's CI timing comparison get a trustworthy result for each comparison rule in under a second, in any environment."
Disposition: proved by slice 8: client-owner/variant-proof evidence and exact c216 checkpoint preserve all distinct browser/native/client facets through201 actual rules and47 mapped connections; complete CI11–988ms and local248/load proof pass. Accepted-main changed-source renewal is owned byG11/slice9.
### G2. Actual-Git rule cases exceed the target under observed load
Reported: slice 1 — "loaded sub-second timing remains unproved/unsatisfied for those cases"
Story clause: "Target less than 1,000 ms for each rule-focused test, including per-test arrangement, actions, assertions and cleanup."
Disposition: proved by slice 1: raw-history-family-after.json has all 14 replacement rules at 0–15 ms; raw-history-no-acquisition-control-applied.json observes zero acquisition subprocesses; raw-fault-controls-summary.json catches all six endpoint faults. The old Git-per-rule cause is removed; final loaded/portable acceptance remains in slice 8, without claiming a new load-27 observation.

### G3. Published CI rule timings exceed the target
Reported: slice 5 — "Run 42627028218 attempt 1 matched all 164 rule owners; sixteen took 1,019–1,581 ms."
Story clause: "Developers and agents changing Intent's CI timing comparison get a trustworthy result for each comparison rule in under a second, in any environment."
Disposition: proved by slice 8: exact c216dc242286c62beca047da249c9f4157118021/run42743624437/attempt1 has all17jobs success and201 unique expected/passed/retry0 rules, actual complete bounds11–988ms; slice8-c216-ci-independent-audit verifies all12 digests/raw bounds. Integrated final-family renewal belongs toG11/slice9.
### G6. Preserve Project Intent without a story comparison preference
Reported: slice 6 — "my extracted ScopeProofContent/FileProofContent unconditionally called useCiComparisonPreference, whereas original hook lived only inside comparison Frame; ProjectIntent has no story preference and crashes on ordinary judged scope."
Story clause: "This story does not change Intent's comparison semantics"
Disposition: proved by slice 6: render-evidence.md records the actual Project Summary/File Proof crash, comparison-only hook binding repair, six repeated counterexample passes, twelve affected current-source passes and the direct judged Summary pass; the missing-context guard is retained.

### G7. Shared HTTP fixture can stall teardown with an accepted TCP socket
Reported: slice 6 — "Tearing down \"comparisonServer\" exceeded the test timeout of 30000ms."
Story clause: "No test in the family relies on a raised timeout."
Disposition: proved by slice 6: server-close-evidence.md links the full failed trace, current actual-helper TCP counterexample, causal connection shutdown, final default-bound RED/three GREEN regression passes and three live-consumer passes; callback errors/default timeout are preserved.

### G8. Four static rendering rules still exceed the CI complete-case target
Reported: slice 6 — "Run 42668027365 attempt 1 matches all 170 rules; four of 77 static rendering rules have observed cleanup prefixes 1,014–1,098 ms and complete conservative upper bounds 1,038–1,123 ms."
Story clause: "Target less than 1,000 ms for each rule-focused test, including per-test arrangement, actions, assertions and cleanup."
Disposition: proved by slice 6: static-sort-evidence.md and slice6-742f80b-ci-audit confirm all77 complete static upper bounds below1000ms (max927), every old oracle/cardinality/native connection retained, exact742f80b/run42686088566/attempt1 observer success. Final family/load/target-CI remain owned by8 and lifecycle C067.

### G5. Keep scope acquisition and queued-selection observations
Reported: slice 6 — "Additional exact scope gaps from9df: (1) mounted-gaps `a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint`: comparisons1/proofs2/expect.poll(statuses)2 after full exactlabels/framing/table; (2) mounted-fallback `Landed running preserves one Branch fallback through entry, folders and file Proof`: comparisons1/proofs2 after Branchheading+`Landed is not used: Build is still running.` atentry/folder/nested/file andfile+70ms; (3) mounted-gaps `selecting a queued story clears the previous Summary comparison and Baseline column`: actualMakeMequeuedSEED-B update clears priorfullentryoracle/frame/labels/Baseline/oldidentity, comparisons stays1/proofs3. No exact retainedcounted correspondence."
Story clause: "Preserve each distinct rule's behavioral proof and independently stated expectations"
Disposition: proved by slice 8: exact13-map and actual retained running/queued/Taken bindings preserve navigation1/2, queued full clearing1/3, and separate kept/fresh statuses2 with comparison1/proof2, all literal/native/title/count conjunctions. Fast scopes prove rule facets; current248/c216 checkpoint pass.
### G4. Preserve frontend proof acquisition counts during static migration
Reported: slice 6 — "80 mapping has two cross-boundary acquisition assertions static SSR cannot own: invalid+ambiguous adapter proofs===1 (only Baseline readable), and both all-endpoint discovery unavailable cases proofs===0."
Story clause: "Preserve each distinct rule's behavioral proof and independently stated expectations"
Disposition: proved by slice 8: exact13-map preserves two discovery native arrays and invalid/ambiguous native reasons at production SSR; actual client eligibility readers prove proof0/0/1 with full subject validation. Current248 and c216201-rule checkpoint pass; no initial-mount wire is invented.
### G9. Incoming finality rules repeat Git and server acquisition
Reported: slice 6 — "main 9f88 adds 24 actual Git/CLI/server backend cases and 3 UI journeys, outside the current 170-owner manifest; preserve its accepted pending/final semantics and all distinct oracles through current fast owners."
Story clause: "Give each distinct comparison rule fast, deterministic proof at the cheapest boundary that still exercises the real behavior."
Disposition: proved by slice 7: finality-evidence.md and slice7-27-final-map preserve all27 incoming identities/oracles,22 actual fast rule owners4–20ms and12 mapped real connections; actual matcher/artifact/brand/memory controls, default/parser/history/UI/PID/persistence receivers and independent refactor pass. Full family/load/exactCI remain8.

### G10. Loaded pending-proof connection exceeds its default timeout
Reported: slice 8 — "The later malformed-artifact connection times out at30000ms in loaded246; recovery is interrupted after a duplicate pending traversal consumes6.806s."
Story clause: "No test in the family relies on a raised timeout."
Disposition: proved by slice 8: portable-final-evidence.md#accepted-repaired-local-family; exact one-file correspondence,3 loaded10-case passes and renewed full246 ordinary/loaded strictpass/default30s prove real history/recovery and final reuse without the duplicate pending traversal. Original failed219.41s remains retained.


### G11. Accepted-main equivalent timing and retained history need reconciliation
Reported: slice 8 — "Accepted main2751 SEED-288 changes timed settled-none equivalent and retained collector/answer semantics; c216201-rule success is pre-integration evidence, not proof of the changed source."
Story clause: "Give each distinct comparison rule fast, deterministic proof at the cheapest boundary that still exercises the real behavior."
Disposition: proved by slice 9: integrated-family-evidence.md and exact7601568/run42756890006/attempt1 independent audit preserve all257 owners/207rules/50connections, complete CI9–861ms, local4–518/5–724ms and all17jobs. G12 repaired17/defaults pass; supplier attribution remains explicit. C067 stays final target-CI-owned.
### G12. Two incoming history UI receivers exceed the default timeout
Reported: slice 9 — "The16-case history receiver run has14backend passes and2UI default30000ms timeouts (adapter/provenance); AC100/openlid/sleepguard with no sleep, load20.15→25.05. Actual traces are retained; no base attribution exemption or unchanged rerun."
Story clause: "No test in the family relies on a raised timeout."
Disposition: proved by slice 9: integrated-family-evidence.md; causal navigation/collection overlap preserves every raw/public/native oracle and default wrappers. Independent AST/raw-trace review and renewed17 strictpassed/default30s/retry0 (41.30s wall) prove repaired2 plus default-phone witness; original failed16 and differing-load qualifications remain.