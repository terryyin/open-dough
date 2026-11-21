# Independent source review

Fresh Codex agent `/root/source_review`, launched 21 November 2026 without
conversation inheritance. The launch supplied only the selected seed's goal,
scope, key examples, baseline and acceptance plus the reviewer instruction.
It supplied no plan or implementation and requested no reads or edits. The
agent returned P01–P31 in this execution conversation.

Source context includes Terry's choice of in-page activation and the paired
ratio, the approximately 100 ms aspiration, the optional frame-paced wait
changes and the exclusion of product changes, dashboard test support and
launch flags. The source's scratch timings and same-task observation are
premises. The selected seed retains their full conditions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Held then released: Every existing assertion stays. | slice 4 | observed: Slice 4 unchanged held recovery spec, three paired passes and equivalent viewport assertion via scratch clip proof |
| P02 | Failed then retried: Every existing assertion stays. | slice 3 | observed: Slice 3 unchanged source recovery spec and paired and consumer results |
| P03 | Styling arrives after the diff: Every existing assertion stays with in-page preceding-lines and line-menu activation. | slice 2 | observed: Slice 2 unchanged arrival spec and paired and consumer proof |
| P04 | Held then released: its median of three attempts is under 500 ms. On a loaded machine, its median can instead qualify at or below 0.5× the original case’s median from the same paired runs. | slice 4 | observed: Slice 4 paired median 408.4 ms, s4-pair-{1,2,3}.json |
| P05 | Failed then retried: its median of three attempts is under 500 ms. On a loaded machine, its median can instead qualify at or below 0.5× the original case’s median from the same paired runs. |  | G1 |
| P06 | Styling arrives after the diff: its median of three attempts is under 500 ms. On a loaded machine, its median can instead qualify at or below 0.5× the original case’s median from the same paired runs. | slice 2 | observed: Slice 2 paired timing table and s2-pair-{1,2,3}.json |
| P07 | Held then released: its result is recorded. | slice 4 | observed: Slice 4 final paired timings held then released |
| P08 | Failed then retried: its result is recorded. | slice 4 | observed: Slice 4 final paired timings failed then retried |
| P09 | Styling arrives after the diff: its result is recorded. | slice 2 | observed: Slice 2 paired timing table |
| P10 | Open a candidate’s source: Waits until visible. This applies to other specs using the same method. | slice 3 | observed: intentCandidates.openSource and activateButton visible button assertion |
| P11 | Open a candidate’s source: Yields one task after visibility and before clicking. This applies to other specs using the same method. | slice 3 | observed: intentCandidates.openSource and activateButton task yield |
| P12 | Open a candidate’s source: Clicks the control as an element in the page. This applies to other specs using the same method. | slice 3 | observed: intentCandidates.openSource and activateButton DOM click, observed in candidates open, case, unresolved and live specs |
| P13 | Show latest: Waits until visible. This applies to other specs using the same method. | slice 3 | observed: intentRevisionNotice.showLatest and activateButton visible button assertion |
| P14 | Show latest: Yields one task after visibility and before clicking. This applies to other specs using the same method. | slice 3 | observed: intentRevisionNotice.showLatest and activateButton task yield |
| P15 | Show latest: Clicks the control as an element in the page. This applies to other specs using the same method. | slice 3 | observed: intentRevisionNotice.showLatest and activateButton DOM click, observed by intent-revision-apply |
| P16 | Retry: Waits until visible. This applies to other specs using the same method. | slice 3 | observed: intentRevisionNotice.retry and intentBrowser.retryRead use activateButton visible scoped Retry |
| P17 | Retry: Yields one task after visibility and before clicking. This applies to other specs using the same method. | slice 3 | observed: intentRevisionNotice.retry and intentBrowser.retryRead use activateButton task yield |
| P18 | Retry: Clicks the control as an element in the page. This applies to other specs using the same method. | slice 3 | observed: intentRevisionNotice.retry and intentBrowser.retryRead use activateButton DOM click, observed by update failures and source recovery |
| P19 | Show preceding lines: Waits until visible. This applies to other specs using the same method. | slice 2 | observed: reviewDiffPage.showPrecedingLines and activateButton visible button assertion |
| P20 | Show preceding lines: Yields one task after visibility and before clicking. This applies to other specs using the same method. | slice 2 | observed: reviewDiffPage.showPrecedingLines and activateButton task yield |
| P21 | Show preceding lines: Clicks the control as an element in the page. This applies to other specs using the same method. | slice 2 | observed: reviewDiffPage.showPrecedingLines and activateButton DOM click |
| P22 | Open a line menu: Waits until visible. This applies to other specs using the same method. | slice 2 | observed: reviewDiffPage.openLineMenu and activateButton visible button assertion |
| P23 | Open a line menu: Yields one task after visibility and before clicking. This applies to other specs using the same method. | slice 2 | observed: reviewDiffPage.openLineMenu and activateButton task yield |
| P24 | Open a line menu: Clicks the control as an element in the page. This applies to other specs using the same method. | slice 2 | observed: reviewDiffPage.openLineMenu and activateButton DOM click |
| P25 | With the old source open and a newer revision offered, after in-page Show latest once the notice is visible and until release: The old source remains open. | slice 4 | observed: intent-source-target-recovery.spec.ts held case readsLine44 shows old text and original revision before release |
| P26 | With the old source open and a newer revision offered, after in-page Show latest once the notice is visible and until release: Line 44 remains targeted. | slice 4 | observed: intent-source-target-recovery.spec.ts held case readsLine44 targets visible line 44 with aria-current before release |
| P27 | With the old source open and a newer revision offered, after in-page Show latest once the notice is visible and until release: The old source retains its focus. | slice 4 | observed: intent-source-target-recovery.spec.ts held case readsLine44 checks chosen file control focus before release |
| P28 | With the old source open and a newer revision offered, after in-page Show latest once the notice is visible and until release: The old source retains its scroll position. | slice 4 | observed: intent-source-target-recovery.spec.ts held case readsLine44 compares captured pane offset before release |
| P29 | When styling arrives after the diff, after showing preceding lines and opening the menu in the page: The reading position is retained. | slice 2 | observed: story-review-diff-late-styling.spec.ts arrival case reading.place assertion after rerender |
| P30 | When styling arrives after the diff, after showing preceding lines and opening the menu in the page: The revealed context is retained. | slice 2 | observed: story-review-diff-late-styling.spec.ts arrival case 20 lines, tokens and identical context line numbers after rerender |
| P31 | When styling arrives after the diff, after showing preceding lines and opening the menu in the page: The line menu stays open. | slice 2 | observed: story-review-diff-late-styling.spec.ts arrival case visible menu and item labels after rerender |
