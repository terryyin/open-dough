# Source-only review

Launched 2026-11-08 by the coordinator as a fresh general-purpose agent without
conversation inheritance. Input: the SEED-259#correct-scan-intent-ci-summaries
seed section (Goal, Scope) and the correction's findings, goal and scope,
preserved constraints and exclusions from this plan's "Current findings" and
"Goal and scope" sections, with no slicing, proof or product files. The
reviewer read only that input and changed nothing.

Exclusions returned: X1 new label kinds beyond the comparison Summary's
outside-row and no-breakdown labels; X2 per-endpoint no-breakdown labels in a
comparison; X3 the file-level `test.setTimeout` in the revision stream spec
(SEED-260#restore-default-test-timeouts); X4 anything adding to
SEED-259#scan-intent-ci-summaries.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The audience is a developer reviewing Intent CI evidence, including one using a screen reader. | slice 3 | observed: labels in comparison Summaries use slice 1's content-read EvidenceLabel; dashboard/tests/intent/intent-summary-story-comparison-outside.spec.ts aria snapshot 'listitem: No file breakdown , The Landed CI proof summary does not break tests down by file' |
| 2 | Evidence labels carry their meaning and full words in their content. | slice 1 | observed: dashboard/src/CiEvidenceLabels.tsx EvidenceLabels renders prefix, words and full as li content; aria snapshots in intent-ci-proof-ancestor, intent-summary-ci-proof, intent-summary-story-comparison, intent-summary-ci-proof-gaps |
| 2.1 | The developer hears what each evidence label means from the label's own content, for example "Revision" or "Branch", not only from `aria-label`. | slice 1 | observed: intent-ci-proof-ancestor.spec.ts aria snapshot: listitem text Revision + code d4e5f6a; ciEvidenceLabelsPage.ts expectLeadingEvidenceLabels reads .intent-evidence-label-heard and asserts no aria-label |
| 2.2 | The developer hears each label's full words from the label's own content, not only from `title`. | slice 1 | observed: intent-ci-proof-ancestor.spec.ts aria snapshot: listitem Completed ancestor , The completed ancestor of the running result; ciEvidenceLabelsPage.ts expectInFull reads .intent-evidence-label-full |
| 2.3 | Each label has an accessible name, and the full words stay available to assistive technology. | slice 1 | observed: aria snapshots show each listitem's content words and full words with no aria-label (expectLeadingEvidenceLabels); refresh failure announced via role=alert, intent-summary-ci-proof-kept.spec.ts |
| 2.4 | The visible short labels and hover stay as shipped, for example `abc1234` and `main` and the hover full words. | slice 1 | observed: labelWords() visible-word checks in intent-ci-status-wall-time/execution-time, intent-summary-ci-proof-kept/gaps; expectInFull asserts content title equals full words; zoom specs intent-ci-proof, intent-summary-ci-proof-table green (gate2.log 111 passed) |
| 3 | The developer keeps a chosen Summary sort through a story comparison's reading state. | slice 2 | observed: dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts step 'one run's Summary lacks Landed ... back in the comparison, the kept sort orders the rows by Landed descending again' (failed before the change: aria-sort '' at line 150) |
| 3.1 | When the story identity changes and the comparison is checking, children render with one-run unavailable cells lacking Baseline, Branch, Landed and Change; the chosen sort must not be erased before the comparison arrives. | slice 2 | observed: dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts same step passes through the checking state on return to Story A; CiProofTable.tsx no longer clears the sort in an effect |
| 4 | A sort column a table lacks falls back at render time without clearing the chosen sort. | slice 2 | observed: CiProofTable.tsx computes the shown sort at render time and writes no state; dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts Story B table shows no th[aria-sort] and storyBChildren order |
| 4.1 | This also applies when a single-run table legitimately lacks the column; the sort must not be erased. | slice 2 | observed: dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts Story B's single-run Summary lacks Landed, keeps tree order, and the sort applies again in Story A's comparison |
| 4.2 | The sort is kept while drilling down, and a column the next table lacks falls back to default order: a fallback, not a loss. | slice 2 | observed: dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts steps 'a child folder's comparison opens ... still sorted by Landed descending' and 'a Test execution time sort ... gives way to the tree's order in the comparison' |
| 5 | One builder for a part without a file breakdown. | slice 3 | observed: dashboard/src/ciProofTiming.ts noBreakdownGapsOf read by scopeTimingOf, ciProofWording.ts breakdownGaps and IntentScopeSummaryRows.tsx OutsideExplanation |
| 5.1 | The timing gap's "part 2 of 3 has no file breakdown" and the outside-row's own "Part 2 no breakdown" / "Part 2 of 3 published no file breakdown" no longer diverge. | slice 3 | observed: dashboard/tests/intent/intent-summary-ci-proof-gaps.spec.ts expectLabelInFull(outside, 'Part 2 no breakdown', 'part 2 of 3 has no file breakdown'); failed before the change with 'Part 2 of 3 published no file breakdown' |
| 6 | The developer reads the same no-breakdown and Not in the rows above explanations in comparison Summaries as in single-run ones. | slice 3 | observed: dashboard/tests/intent/intent-summary-story-comparison-outside.spec.ts 'a comparison Summary labels what Not in the rows above holds and an entry without a file breakdown' passes; gate 112 passed (slice3-gate.log) |
| 6.1 | Comparison Summaries label what the pinned Not in the rows above row holds. | slice 3 | observed: dashboard/tests/intent/intent-summary-story-comparison-outside.spec.ts outside strip reads ['1 file not in the tree','Part 2 no breakdown'] with full words; failed before the change (count 0) |
| 6.2 | Comparison Summaries label an entry without a file breakdown with a No file breakdown label. | slice 3 | observed: dashboard/tests/intent/intent-summary-story-comparison-outside.spec.ts tests Summary aria snapshot: No file breakdown , The Landed CI proof summary does not break tests down by file |
| 6.3 | The story's labelled facts apply to a summary, as the single-run Summary already shows both. | slice 3 | observed: IntentScopeSummaryRows.tsx OutsideExplanation and NoBreakdownLabel are shared by IntentScopeSingleProofTable.tsx and IntentScopeComparisonTable.tsx |
| 7 | The revision stream boundary spec returns within the 250-line limit. | slice 4 | |
| 8 | Duplicated row builders are carried only as the Structure slice 3 needs. | slice 3 | observed: IntentScopeSummaryRows.tsx childRowsOf and outsideRowOf replace the three childRow and two outside-row builders |
| 9 | Adds nothing to SEED-259#scan-intent-ci-summaries; its required behavior, restrictions and scope limits hold. | slice 4 | |
| 9.1 | No new figures. | slice 3 | observed: slice 3 diff adds labels only; outside cells still from outsideComparisonCellsOf, no new figure columns |
| 9.2 | No change to what CI evidence is read, judged or compared, or when. | slice 3 | observed: slice 3 diff changes no CI read, judgment or comparison code; primaryProofOf keeps its behavior via primaryEndpointOf |
| 9.3 | The sort choice is not put on the URL or in storage. | slice 2 | observed: sort held in memory by useKeptReading('summaryCiSort') (IntentScopeProof.tsx:47-52); slice 2 diff adds no URL or storage write |
| 9.4 | Optimization Candidates and file Purpose are unchanged. | slice 3 | observed: slice 3 diff touches no Optimization Candidates or file Purpose code; intent-file-purpose-proof passes in the gate |
| 9.5 | File Proof changes only through the shared evidence identity and timing labels. | slice 1 | observed: IntentFileProof.tsx unchanged; file Proof changes only via shared EvidenceLabels/IntentScopeEvidenceLabels; intent-file-purpose-proof.spec.ts passes |
| 10 | One term per fact holds across CI status, Summaries, file Proof and Intent's documentation. | slice 3 | observed: docs/dashboard-development-intent.md uses 'part 2 of 3 has no file breakdown' and 'No file breakdown'; matches noBreakdownGapsOf and NoBreakdownLabel |
