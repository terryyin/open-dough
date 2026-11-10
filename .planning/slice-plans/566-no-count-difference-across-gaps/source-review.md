# Source-only review

Launch: fresh agent `/root/source_review`, `fork_turns: none`. Its launch input
was only the selected story's Goal, Scope, Key examples, UI and architecture
text, with instructions to read no other project files and change nothing.
The launch and full return are retained in the execution conversation. The
reviewer confirmed it read and changed no project files. No plan, suspected
omission, implementation, or proof was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Show a count difference only with complete parts for that unit at both endpoints. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs missing/ambiguous endpoint loops: observations retained and signed differences absent; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs whole-unit aggregate suppression |
| C02 | Show a count-change cue only with complete parts for that unit at both endpoints. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs partial count cues are none; complete file-unit cues remain; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs partial unit never contributes an unsupported cue |
| C03 | Keep observed count totals visible despite incomplete evidence. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs entry/folder/file total and unit assertions; tests/support/intent-scope-comparison-unobserved-counts.test.mjs hidden/all-missing rows retain known total and explicit unobserved unit; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts rendered Counts |
| C04 | Keep the count unit visible. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs entry/folder/file total and unit assertions; tests/support/intent-scope-comparison-unobserved-counts.test.mjs hidden/all-missing rows retain known total and explicit unobserved unit; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts rendered Counts |
| C05 | Keep each affected endpoint’s missing-part evidence visible. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs both missing/ambiguous statuses at either endpoint; tests/support/intent-scope-comparison-unobserved-counts.test.mjs part explanations; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts overall, Summary, Proof and tree gap words |
| C06 | Keep each affected endpoint’s ambiguous-part evidence visible. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs both missing/ambiguous statuses at either endpoint; tests/support/intent-scope-comparison-unobserved-counts.test.mjs part explanations; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts overall, Summary, Proof and tree gap words |
| C07 | Withhold signed count differences when either compared endpoint has a gap for that unit. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs missing/ambiguous endpoint loops: observations retained and signed differences absent; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs whole-unit aggregate suppression |
| C08 | Withhold count-equality claims when either endpoint has such a gap. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs equal partial observations assert no no-change/(0); tests/support/intent-ci-comparison-overall-count-gaps.test.mjs equal partial totals establish neither equality nor cue |
| C09 | Withhold that unit’s count-change cues when either endpoint has such a gap. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs partial count cues are none; complete file-unit cues remain; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs partial unit never contributes an unsupported cue |
| C10 | Apply the completeness rule to entry rows. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts overall/entry journey: both entry-row texts and cue state independently asserted |
| C11 | Apply it to folder rows. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs all three scope paths; tests/support/intent-scope-comparison-unobserved-counts.test.mjs folder/file hidden-scope cases; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts folder Summary and file Proof journey |
| C12 | Apply it to file rows. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs all three scope paths; tests/support/intent-scope-comparison-unobserved-counts.test.mjs folder/file hidden-scope cases; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts folder Summary and file Proof journey |
| C13 | Apply it to outside rows. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs observed outside counts; tests/support/intent-scope-comparison-unobserved-counts.test.mjs unobserved outside unit in both directions with unit/gap and no added/removed/delta |
| C14 | Apply it to the tree’s count cues. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts full drill-down: file and location accessible names plus actual file/header cue targets |
| C15 | Apply it to overall Counts. | slice 1 | observed: tests/support/intent-ci-comparison-overall-count-gaps.test.mjs mixed contributors and complete file-unit cue; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts overall Counts text and cue |
| C16 | Represent an unobserved scope beneath an incomplete unit as an evidence gap. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs hidden/all-missing cases in both directions, unobserved/absent controls, explicit complete-evidence added/removed controls |
| C17 | Do not infer added tests from scope absence under a partial Baseline. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs hidden/all-missing cases in both directions, unobserved/absent controls, explicit complete-evidence added/removed controls |
| C18 | Do not infer removed tests from scope absence under a partial compared endpoint. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs hidden/all-missing cases in both directions, unobserved/absent controls, explicit complete-evidence added/removed controls |
| C19 | Determine Baseline → Branch comparability independently of Landed completeness. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs Branch/Landed independently eligible; tests/support/intent-scope-comparison-unobserved-counts.test.mjs unobserved Branch or Landed beside the other supported comparison |
| C20 | Determine Baseline → Landed comparability independently of Branch completeness. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs Branch/Landed independently eligible; tests/support/intent-scope-comparison-unobserved-counts.test.mjs unobserved Branch or Landed beside the other supported comparison |
| C21 | Preserve a complete pair’s count difference despite the third endpoint being partial. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs Branch/Landed independently eligible; tests/support/intent-scope-comparison-unobserved-counts.test.mjs unobserved Branch or Landed beside the other supported comparison |
| C22 | Preserve differences for other units whose compared evidence is complete. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs complete files preserve +1/cue beside partial cases; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs supported file comparison supplies agreed overall cue; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts overall cue more-strong while case row none |
| C23 | Let supported comparisons continue contributing to the existing agreed count cue. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs complete files preserve +1/cue beside partial cases; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs supported file comparison supplies agreed overall cue; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts overall cue more-strong while case row none |
| C24 | Withhold an overall unit difference when any contributing entry is incomplete for that unit. | slice 1 | observed: tests/support/intent-ci-comparison-overall-count-gaps.test.mjs mixed complete/partial entries and entirely unobserved contributor: whole observed totals kept with gaps and no complete-subtotal difference |
| C25 | Do not establish the overall unit difference by silently dropping incomplete contributing entries. | slice 1 | observed: tests/support/intent-ci-comparison-overall-count-gaps.test.mjs mixed complete/partial entries and entirely unobserved contributor: whole observed totals kept with gaps and no complete-subtotal difference |
| C26 | Keep complete count evidence comparable without recorded durations. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs resolving gap restores +90 and border beside No timings; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs complete untimed recovery |
| C27 | Preserve existing unit matching. | slice 1 | observed: tests/support/intent-scope-comparison-units.test.mjs and intent-scope-comparison-wording.test.mjs unit matching controls; endpoint/group reexports inspected |
| C28 | Preserve existing legacy-result handling. | slice 1 | observed: tests/support/intent-ci-comparison-overall-counts.test.mjs legacy separation; tests/support/story-ci-comparison-entry-summaries.test.mjs legacy label/measured-zero fidelity |
| C29 | Preserve the distinction between measured zero and unreported counts. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs real comparisonEntriesOf to sortedRows: measured zero, observed partial totals and unobserved last in both directions; existing unit/unreported controls |
| C30 | Preserve existing added behavior when supported by complete evidence. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs completeOther controls retain exact added and removed words; partial reverse controls withhold them |
| C31 | Preserve existing removed behavior when supported by complete evidence. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs completeOther controls retain exact added and removed words; partial reverse controls withhold them |
| C32 | Preserve existing build-selection semantics. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts and intent-ci-comparison-gaps.spec.ts build/Branch/Landed selection observations; production selection code unchanged |
| C33 | Preserve existing timing semantics. | slice 1 | observed: tests/support/intent-scope-comparison-timing.test.mjs plus both complete intent-ci-comparison-drilldown-relative.spec.ts journeys: signed timing words, scales, preferences and no CI reread |
| C34 | Provide an explanation at each affected endpoint connecting its evidence gap to the unsupported comparison. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs count difference unavailable with endpoint part phrases; tests/support/intent-scope-comparison-unobserved-counts.test.mjs no observed unit with gaps; dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts affected endpoint explanations |
| C35 | Restore ordinary comparison eligibility when the evidence gap is resolved. | slice 1 | observed: tests/support/intent-scope-comparison-count-gaps.test.mjs resolving gap restores +90 and border beside No timings; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs complete untimed recovery |
| C36 | Carry parts completeness through existing per-unit count interpretation. | slice 1 | observed: dashboard/src/ciScopeComparisonEndpointUnits.ts and ciScopeComparisonCounts.ts use shared countPartGapsOf independently of durations; consuming observed/unobserved row and untimed tests |
| C37 | Carry parts completeness through overall aggregation. | slice 1 | observed: dashboard/src/storyCiComparisonCountTotals.ts retains every contributor gap; tests/support/intent-ci-comparison-overall-count-gaps.test.mjs actual overall words/cues |
| C38 | Reuse the existing distinction between an observed value and a supported comparison for counts. | slice 1 | observed: dashboard/src/ciScopeComparisonEndpointUnits.ts and ciScopeComparisonCounts.ts use shared countPartGapsOf independently of durations; consuming observed/unobserved row and untimed tests |
| C39 | Apply one consistent completeness rule across the affected views. | slice 1 | observed: directed consumer trace /tmp/count-gaps-consumers-adopted-disposition.md; shared scope/overall interpretation and full Counts/Summary/Proof/tree journeys |
| C40 | Follow the established Intent workspace direction. The supplied text does not specify its contents further. | slice 1 | observed: .planning/NORTH-STAR.md one Intent workspace reading scopes/shared partial evidence; actual existing comparison to Summary/Proof/tree path in dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts |
| C41 | Preserve the distinction between missing evidence and a negative result. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs missing/ambiguous evidence remains unobserved, distinct from explicit absence and measured zero; complete negative controls preserved |
| C42 | Preserve the distinction between conflicting evidence and a negative result. | slice 1 | observed: tests/support/intent-scope-comparison-unobserved-counts.test.mjs missing/ambiguous evidence remains unobserved, distinct from explicit absence and measured zero; complete negative controls preserved |
| C43 | Introduce no new layout. | slice 1 | observed: whole owned diff inspection: no production layout, collection, persistence, refresh or interaction change; only count interpretation and wording; existing UI journeys use same controls |
| C44 | Introduce no evidence-collection workflow. | slice 1 | observed: whole owned diff inspection: no production layout, collection, persistence, refresh or interaction change; only count interpretation and wording; existing UI journeys use same controls |
| C45 | Introduce no refresh workflow. | slice 1 | observed: whole owned diff inspection: no production layout, collection, persistence, refresh or interaction change; only count interpretation and wording; existing UI journeys use same controls |
| C46 | Require no new interaction to obtain the specified behavior. | slice 1 | observed: whole owned diff inspection: no production layout, collection, persistence, refresh or interaction change; only count interpretation and wording; existing UI journeys use same controls |
| C47 | Do not reject naturally supported subset comparison merely because adding that capability is deferred. | slice 1 | observed: whole owned diff and complete-evidence unit controls: no new shard-population or attribution rejection; existing matching/framing unchanged |
| C48 | Do not reject naturally supported story attribution merely because adding that capability is deferred. | slice 1 | observed: whole owned diff and complete-evidence unit controls: no new shard-population or attribution rejection; existing matching/framing unchanged |

## Reviewer qualifications

Q01: Restriction is per unit and endpoint pair. Q02: missing and ambiguous
parts trigger the same rule. Q03: completeness is necessary, not sufficient;
matching and retained rules still apply. Q04: incomplete totals remain valid
observations. Q05: complete contributors alone cannot establish overall
completeness. Q06: missing durations do not prevent count comparability.
Q07: retain existing agreed-cue combination. Q08: resolving gaps restores
ordinary eligibility. Q09: references do not imply requirements beyond the
supplied missing/conflicting versus negative-result distinction.

## Reviewer journey examples and exclusions

J01: 1,000 partial Baseline → 1,090 complete Landed; comparison, Summary and
file Proof keep totals, unit and gap without +90 or more cue, for missing or
ambiguous parts. J02: equal 1,000 partial observations show no equality claim.
J03: complete 1,000 Baseline / 1,120 Landed remains +120 beside partial 1,090
Branch, and reverse Branch/Landed roles work independently. J04: folder/file
absence in a partial endpoint cannot establish removed or reverse added.
J05: partial and complete case entries keep observed overall cases and gaps,
with supported complete files alone contributing to the cue. J06: complete
untimed 1,000 → 1,090 retains +90 and cue. J07: existing comparison → Summary
→ Proof explains the gap and restores eligibility when resolved.

X01–X04: no new layout, collection, refresh or interaction. X05–X06: adding
matching-shard subset comparison or story attribution is deferred, without
prohibiting naturally supported existing behavior. Example numbers and strings
do not create separate implementation ownership or acceptance machinery.

## Acceptance evidence

The unchanged source is compared with actual product/setup/assertions in
[verification.md](verification.md), including the trigger/expected/observed
mapping, literal commands, terminal results, preserved failures and proof reuse.
The developer explicitly approved adopting the retained sibling patch in this
checkout; its original files remain untouched. All count promises have current focused and integrated observations;
verification.md retains the full-run failure and passing bounded repair replay.
