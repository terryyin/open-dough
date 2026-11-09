# Slice behavior and proof detail

[Executable plan and current status](PLAN.md).

These are the original detailed slice designs. Status fields below describe the
planning checkpoint; only PLAN.md tracks current execution status. The route
research is read-only preparation and grants no execution authority.

## Ordered slices

### 1. Read collected entry timing through a Done story's landing

Type: Behavior
Status: planned
Proof: An integrated Done-story entry-history journey through the real
collector/store, authenticated read and rendered Summary, plus focused
identity/read contract checks.

Behavior: Given complete exact-build proof for three recorded landings and a
Done story at the middle one, background collection with Intent closed retains
each validated attempt summary. Opening the story's entry Summary shows the
retained readings through that landing, the selected marker, actual count/span
and linked build evidence, beside the existing comparison. An entry-only
summary can supply its entry total. Zero remains measured. Missing or invalid
proof is already an explained gap; no misleading interim number is delivered.
Opening/revisiting the history adds no provider call. A local read failure and
retry preserve the comparison and story and affect only the history.

Anchor to the published Done endpoint and exact matching retained landing,
including when several receipts share a story identity. If the endpoint was
not collected, mark that gap beside available preceding history. Reused
equivalent builds share a point; a cancelled selected landing may end at its
labelled later measured build/date while omitting subsequent unrelated landing
points. Include the common validated CI adapter reader and failed/expired/
outside-retention/empty boundaries in this same acquisition-to-projection loop.
All apply the supplier's existing resolution, not a new history resolver.

The selected source pins the scope path; each retained summary supplies its
owning proof entry and observed unit. Show compatible contiguous entry/path/unit
segments with their units named, breaking at unsupported changes. Missing
terminal proof remains a gap beside earlier supported entry observations; it
does not require discarding them or choosing an identity from current trunk.
Own this common rule here before slice 2 applies it to folders and files.

Extend the existing collection/store and authenticated history owner with
attempt proof, then derive entry readings from retained observations. Its
current `intent=ci-history` response carries project wall-time entries only;
extend that owner for the selected endpoint and scoped local reading rather
than assuming it already carries retained proof. Acquire missing proof for
already-final retained build attempts as well as newly resolved ones. Do not
reopen or overwrite a final landing resolution to attach proof. Keep retention
bounded by the newest 20 measured builds, including shared-build references
and intervening/trailing gaps. Do not change the live proof reader's freshness
contract. Include the readable evidence list and keyboard/narrow presentation
in this same vertical slice.

### 2. Follow that history into a folder and file's Proof

Type: Behavior
Status: planned
Proof: An artifact-to-folder-to-file browser journey, a partial/no-breakdown
variation, and focused evidenced-scope matching checks.

Behavior: Given the retained attempt summaries from slice 1, opening a folder
Summary or file Proof shows that scope's cumulative execution times without
another CI read. A folder includes every published descendant's contribution,
including files the visible tree omits. A complete zero appears as 0 ms. Missing
parts, untimed results, no breakdown, no matching path and changed entry/unit
show distinct gaps with no plotted partial lower bound. Unsupported former
paths stay gaps; a folder's changing membership is an observed scope at each
build. The developer can move between Summary, file Proof and Purpose and back
without replacing the selected story, source context or existing comparison.

Use the same timing projection rather than adding independent folder/file
series. Existing baseline rename mapping remains limited to that comparison;
the history gains no inferred rename chain. Retain proof's independent
unavailability feedback and existing live CI recovery.

The selected source pins the scope path. Each summary supplies its owning proof
entry and observed unit; contiguous supported entry/path/unit segments can be shown with
that unit named. When selected proof has no usable unit, preserve those earlier
segments and the terminal gap without choosing a unit from current trunk.
Break the line at unsupported ownership/unit changes rather than silently
joining different scope signatures. Existing evidence for the terminal point
does not become a prerequisite for reading earlier valid observations.

### 3. Resume collected scope proof after interruption or restart

Type: Behavior
Status: planned
Proof: Isolated collector/server restart, pending-resume, backfill and
duplicate-report journeys read the persisted proof back through the public
history boundary and shown scope.

Behavior: Given retained landings while CI/proof is pending or temporarily
unavailable, collection can resume after restart and duplicate Done delivery
without duplicating the measured attempt. Previously recorded landings,
including final wall-time observations created before proof retention existed,
acquire available proof through background rebuilding; interrupted proof
acquisition resumes or records its actual unavailable reason. After restart,
the history reads the retained proof, not only its wall time, without acquiring
it during browsing.
Available observations remain readable beside gaps. Compare operation counts
only after separately establishing/accounting for unchanged live comparison
reads so their legitimate recovery cannot mask or violate this boundary.

Exercise the supplier's existing store locking and lifecycle with
the added proof payload rather than creating special resolution paths. Confirm
one summary per measured attempt, independent scope completeness, and bounded
retention of proof and represented landing references together. Exercise the
21st distinct measured build evicting the oldest proof and its unshared
landing, while several landings on one retained attempt keep one summary.
Show an older selected Done story as outside retained history, with no fetch
to extend its span. Reuse already
sufficient supplier proof for unchanged resolution behavior; add observations
for the proof payload and scoped-history effect.


## Folder and file proof route research

Read-only slice-2 route preparation (/root/folder_file_proof_map, no execution):
folder Summary already shares IntentScopeTimingHistory; add file history in
IntentFileProof across unavailable/normal/comparison returns. Reuse the real
collected journey and publishSummaryComparisonStory's folder/a.spec.ts and
folder/nested/c.spec.ts, placing a published-but-not-in-tree ghost *inside*
folder and making entry total different from folder sum. Use collectedSummary
raw by-file reports; entryProofs drops breakdown and cannot prove success.
Producer.byFile=false, a declared missing part and empty duration arrays supply
no-breakdown/partial/untimed cases. New focused nested-scope observations still
owe hidden/changing membership, zero, owner/unit isolation, absent/former path
and earlier segments with terminal missing proof/unit. Existing rename mapping
should survive while historical current-path proof stays unsupported. Affected
consumer candidates include file comparison, file-purpose-proof, comparison-
outside, proof gaps and comparison-renamed suites. Implement only after slice-1
delivery against the reconciled supplier contract.

## Resumption proof route research

Read-only slice-3 route preparation (/root/resumption_proof_map; no execution):
reuse the current main journey and both provenance cases' collection-off reader
restart observations for persisted successful summary/scoped values and local
browsing. They do not prove collector-on resumption. Extend the delivered
landed-ci-history-lifecycle case (recorded-before-start, stop while running,
expired launch list, two collecting processes) with actual summary archives,
persisted payload/breakdown, independent scoped timing and one attempt/point.
G5's minimal seam is stored unavailable proof versus successful summary in the
existing collector: readers memoize successes only; keepLandedCiProof can replace
non-summary results. Prove fixed-attempt missing/unreadable becoming available
through background acquisition. Backfill also needs an old final retained
build without proof and without a live launch record.

For duplicate Done, supplier reportAgain replays postLanding and proves capture
replay only. With collection enabled and a successful summary retained, submit
and retry actual quiet completion at /__agent-launch/completion using
makeMe.aCompletionSubmission.reportingFor({host,reference}).retrying(delivery)
or the installed reportingChild helper; assert its receipt, same summary/
attempt/point and no further artifact acquisition. Completion itself does not
nudge the current collector: startup/periodic/capture replay prove resumption,
completion replay proves idempotency. Keep that causal attribution explicit.
Extend the final supplier window/pruner fixture with evicted proof/build keys,
retained breakdown, references/order without orphans and local-only evicted
scope explanation; add no separate retention policy.

## Current folder/file fixture route

Read-only PFE by `/root/folder_fixture_route` after main8a9 integration:
`IntentFileProof` has unavailable/comparison/no-owner/single-proof returns.
Mirror `IntentScopeProof` content+outer wrapper so history appears once across
all branches. Reuse the common projection; add no backend scope model.
`serveCollectedScopeRuns` hardcodes root.spec; extend its existing real CLI V2
producer seam with explicit by-file inputs, preserving one Actions router.
Do not use `entryProofs`, which drops breakdown, for history acquisition proof.

Independent main-journey facts under dashboard/tests:

| Attempt | Case files a / nested-c / ghost / root | File-unit files | Expected entry / folder / file-a |
| --- | --- | --- | --- |
| P | 100 / 200 / absent / 400 | 10 / 20 / absent / 40 | case700/300/100; file70/30/10 |
| E selected | 0 / 400 / 500 / 600 | 0 / 40 / 50 / 60 | case1500/900/0; file150/90/0 |
| R later | deliberately large | distinct large | excluded |

Ghost is published proof under folder but absent from source/tree. Expect two
common build rows at every scope, preserving selectedE, comparison and all
Actions counts after collection-off restart. Traverse entry/folder/nested/file,
Proof/Purpose/Proof with existing navigation helpers. File-unit times wire is
seconds: convert explicit milliseconds /1000, preserving independent facts.
Variation: entry-onlyP, partial-case/complete-file older-trunkT, Ecase0/fileunit
absent. Distinguish breakdown/partial/absentunit and earlier supportedsegments;
never record branchSide as trunk merely because comparison uses its proof.
