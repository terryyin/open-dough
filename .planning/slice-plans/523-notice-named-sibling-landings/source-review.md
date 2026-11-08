# Source review

Fresh agent `/root/source_review` received only the selected story's Goal,
Scope and Key examples, with no conversation inheritance. Its brief instructed
it to read no project files, make no edits, and derive numbered source
commitments, qualifications, examples, and exclusions without assigning proof
or acceptance. The returned wording is retained below. Rows 5.1–5.5 are
exclusions. For 4a.2 and 4b, slice evidence establishes the finding's
follow-through record. Release identification and qualifying-use evidence are
conditional future observations in the finding.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Developers coordinating planned work in Story Branch Mode can account for a named sibling’s accepted product change while the affected slice is still under review. | slice 1 | observed: ODF-429 Response walkthrough, both historical candidates with their slices still planned |
| G2 | Seeing the new product shape before delivery is intended to reduce late reconciliation and rework. ODF-429 records two cases in which ordinary source freshness surfaced a link amendment and the product overlap remained. | slice 1 | observed: ODF-429 retained occurrences give the late-reconciliation baseline and Ordinary-use criterion defines its future comparison |
| S1 | The commitment applies to coordination already named in planned Story Branch work. | slice 1 | observed: delivery step 5 and Check named siblings scope the check to coordination in the selected story or plan in planned Story Branch Mode |
| 1a | Check the explicitly named sibling against the fetched authorized trunk. The check precedes each applicable milestone. | slice 1 | observed: delivery step 5 uses the fetched freshness result before guarded delivery and checks the explicitly named sibling |
| 1a.1 | Marking the affected slice done. | slice 1 | observed: ODF-429 Recoverable hold compares slice 3 status before and after the product review |
| 1a.2 | Committing the affected slice’s delivery. | slice 1 | observed: ODF-429 Recoverable hold compares local HEAD before and after the product review |
| 1a.3 | Publishing the affected slice’s delivery. | slice 1 | observed: ODF-429 Recoverable hold compares the published scratch story ref before and after the product review |
| 1b | Assess the product overlap that the current slice relies on. | slice 1 | observed: Check named siblings compares attributed behavior with the slice and its proof |
| 1b.1 | Assess shared product paths. | slice 1 | observed: ODF-429 Reading state and Timing identify the two pairs of shared product paths |
| 1b.2 | Assess shared product behavior. | slice 1 | observed: ODF-429 Reading state and Timing compare selection ownership and CI timing semantics |
| 1b.3 | Include code delivered by earlier slices in that assessment. | slice 1 | observed: ODF-429 Timing traces the current edit in IntentLocationGroup.tsx back to the earlier-slice comparison paths |
| 2a | The response is triggered when both conditions hold. | slice 1 | observed: Check named siblings requires both attribution to the sibling and a remaining reliance on the earlier behavior |
| 2a.1 | Accepted evidence shows that the named sibling changed the shared product shape. | slice 1 | observed: ODF-429 Reading state and Timing inspect the accepted integrations on pinned trunk |
| 2a.2 | The current slice still relies on the earlier form of that shape. | slice 1 | observed: ODF-429 Reading state and Timing inspect the affected slice against the earlier behavior still in its checkout |
| 2b | Surface each of the following. | slice 1 | observed: Check named siblings specifies the hold report and ODF-429 exercises it in both examples |
| 2b.1 | The sibling’s identity. | slice 1 | observed: ODF-429 Reading state names SEED-241 and Timing names SEED-256 |
| 2b.2 | The trunk revision. | slice 1 | observed: ODF-429 Reading state names fetched trunk 632e107e8 and the distinct integration c9a142ac3; Timing names 550875ae5 for both |
| 2b.3 | The affected slice. | slice 1 | observed: ODF-429 Reading state and Timing identify slice 3 of the two affected executions |
| 2b.4 | The shared paths or behavior. | slice 1 | observed: ODF-429 Reading state names the shared Intent paths and ownership change; Timing names the two comparison paths and timing change |
| 2c | Keep the increment recoverable during the applicable response. | slice 1 | observed: ODF-429 Recoverable hold compares the working patch digest, local HEAD, and scratch remote ref without delivering |
| 2c.1 | In the reconciliation path, the coordinator reconciles the affected work. | slice 1 | observed: Check named siblings holds delivery pending scoped reconciliation; ODF-429 Proceed controls exercises reconciled timing |
| 2c.2 | In that same path, the coordinator reviews the affected work’s proof. | slice 1 | observed: Check named siblings requires rechecking affected proof; ODF-429 Reading state and Timing identify proof that each historical overlap affects |
| 2c.3 | When a developer decision is needed, the coordinator seeks it under the existing escalation rule. | slice 1 | observed: Check named siblings links execution reassessment and the existing human-judgment rule for a remaining consequential choice |
| 3a | A source-link amendment leaves the product question open. | slice 1 | observed: ODF-429 Timing and Recoverable hold show unchanged source after absorption while the comparison still uses wall time for the overall change |
| 3b | Each of the following adds no hold. | slice 1 | observed: ODF-429 Proceed controls exercise the disjoint, unrelated, already-accounted and unnamed cases |
| 3b.1 | A named landing outside the slice’s affected behavior. | slice 1 | observed: ODF-429 Proceed controls attribute SEED-253 to merge-review changes, disjoint from the timing paths |
| 3b.2 | An unrelated landing. | slice 1 | observed: ODF-429 Proceed controls attribute the same-path timing changes to the separate SEED-256 landing |
| 3b.3 | A change the slice already accounts for. | slice 1 | observed: ODF-429 Proceed controls inspect the reconciled timing behavior using timeWithoutRunnerWaitsChangeWords |
| 3c | Existing checks continue to apply. | slice 1 | observed: delivery step 5 retains freshness and obligations and proceeds to ordinary guarded delivery |
| 3c.1 | Existing source review. | slice 1 | observed: source-freshness-guidance.test.mjs asserts freshness before obligations and preserves the source-result routes |
| 3c.2 | Existing delivery checks. | slice 1 | observed: story-obligations-guidance.test.mjs and refactor-disposition-guidance.test.mjs assert the existing guarded delivery preconditions |
| 4a | Record the following at ODF-429. | slice 1 | observed: ODF-429 Follow-up, Release follow-through and Ordinary-use criterion own the response and its evidence status |
| 4a.1 | The delivered response. | slice 1 | observed: ODF-429 Follow-up links the delivered guidance; the completion record will add the accepted response SHA |
| 4a.2 | The release containing it. | slice 1 | observed: ODF-429 Release follow-through records the containing release as pending until independently verified |
| 4a.3 | The ordinary-use criterion. | slice 1 | observed: ODF-429 Ordinary-use criterion defines the next qualifying execution, comparison and observations |
| 4b | In the next observed qualifying execution, check each outcome. | slice 1 | observed: ODF-429 Ordinary-use criterion preserves the observations for the next qualifying execution; outcome pending |
| 4b.1 | Whether the coordinator addressed the overlap before delivery. | slice 1 | observed: ODF-429 Ordinary-use criterion calls for recording recognition, reconciliation and affected proof relative to delivery |
| 4b.2 | How much late reconciliation remained. | slice 1 | observed: ODF-429 Ordinary-use criterion calls for recording remaining work at integration against both retained late cases |
| 4b.3 | Whether disjoint work was interrupted. | slice 1 | observed: ODF-429 Ordinary-use criterion calls for recording any interruption of disjoint work |
| 5.1 | Automatic discovery. | slice 1 | observed: Check named siblings limits lookup to explicit coordination and proceeds when no sibling is named |
| 5.2 | New dependency rules. | slice 1 | observed: delivery step 5 checks a landed change locally in this slice, with no dependency operation introduced |
| 5.3 | New Take rules. | slice 1 | observed: delivery step 5 begins after Take and delegates no change to the Take procedure |
| 5.4 | Automatic merging. | slice 1 | observed: Check named siblings preserves the candidate for a coordinator decision and introduces no merge operation |
| 5.5 | Additional Trunk Mode delivery checks. | slice 1 | observed: delivery step 5 and Check named siblings scope the decision to planned Story Branch Mode |
| E1 | SEED-243 reaches slice 3 after its named sibling SEED-241 lands page-held reading state on trunk. Slice 3 still uses the old shape. Before delivery, the coordinator sees the landing and affected Intent code and can reconcile the slice while its increment is recoverable. | slice 1 | observed: ODF-429 Reading state and Recoverable hold, pinned 632e107e8 and first-parent integration c9a142ac3 |
| E2 | SEED-255 reaches slice 3 after its named sibling SEED-256 lands comparison timing without runner waits. Updated links clear the source amendment. The comparison component and wording still diverge even though the current increment need not edit them directly. The coordinator sees and addresses that overlap before delivery. | slice 1 | observed: ODF-429 Timing and Recoverable hold, pinned 550875ae5 before and after link absorption, with a reconciled control from 09a5caac8 |
| E3.1 | A named sibling lands a disjoint change while a different landing touches a shared path. The coordinator finds no relevant product change attributable to the named sibling and proceeds through ordinary checks. | slice 1 | observed: ODF-429 Proceed controls compare SEED-253 integration e019a88a2 with the separate SEED-256 timing integration |
| E3.2 | A branch that already incorporated the sibling’s affected behavior also proceeds through ordinary checks. | slice 1 | observed: ODF-429 Proceed controls exercise the reconciled shape using the 09a5caac8 timing paths |
