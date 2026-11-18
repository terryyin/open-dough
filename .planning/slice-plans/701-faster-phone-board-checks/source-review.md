# Source-only review

A fresh general-purpose reviewer (`/root/source_review`, no conversation inheritance) received only the unchanged source story's Goal, Scope and key examples verbatim, and the instruction to enumerate independent observable promises without reading files, changing files, or assigning proof. The numbered return below retains the reviewer's conditions and source locations.

The baseline is the current seven-case selection at **22.07 s elapsed with two workers, including startup**. Compare the new elapsed time under comparable conditions. Geometry gains use the former layout with two 44 px controls as the baseline. The remaining suite and its roughly one-minute target belong to the second story.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The ordinary Dashboard Frontend Test command returns the seven-case selection in less than 22.07 s elapsed. Goal and Scope. Comparable conditions include two workers and startup. | slice 7 | |
| P02 | All seven cases retain their original assertions and observations. Goal and Scope. Both phone-indicator cases and all five board-swipe cases. | slice 7 | |
| P03 | The seven cases use real mounted React. Scope. Both phone-indicator cases and all five board-swipe cases. | slice 7 | |
| P04 | The seven cases use production CSS. Scope. Both phone-indicator cases and all five board-swipe cases. | slice 7 | |
| P05 | Cases within a file reuse the browser. Scope. | slice 7 | |
| P06 | Every case receives fresh answers at the service boundary, including a later case using the reused browser. Scope and example 3. | slice 3 | observed: Git evidence slice3-held-smoke.mounted.spec.ts, the second mount observes the independently changed MakeMe title in the same Document; slice3-mounted-held.log recorded both passes. |
| P07 | React is unmounted after each case. Scope. | slice 3 | observed: Git evidence slice3-held-smoke.mounted.spec.ts checks both detached roots for empty children, the removed root and restored browser state, with a held HTTP reply released in teardown; slice3-mounted-held.log. |
| P08 | A later case starts with its own board preference. Scope’s state-isolation requirement and example 3. | slice 3 | observed: Git evidence slice3-held-smoke.mounted.spec.ts observes Recently done and position 2 in case one, then Backlog, native Enter, Taken and focused Recently done in the next case; slice3-mounted-held.log. |
| P09 | The journeys preserve native input. Scope and examples 1–3. Includes the indicator tap, keyboard activation, swipe cases, ordinary taps, and real vertical stroke. | slice 7 | |
| P10 | The viewport changes in the browser during the viewport-dependent journeys. Scope and examples 1–2. Includes the 390 × 844 setting and rotation to landscape and back. | slice 6 | |
| P11 | Geometry assertions use actual measured dimensions. Scope and example 1. Includes both indicators, the view, and the story card. | slice 4 | observed: board-indicators.mounted.spec.ts records rendered control widths, board, view and card through BoardView.columnReadingRoom. Slice4-final-pair.log records 12/12 and 390/366/366, while the 44 px control records 44/44 and 390/302/302. |
| P12 | The normal focused command selects each of the seven cases once. Scope and example 4. A developer runs the two phone specs together. | slice 7 | |
| P13 | The focused run displays each of the seven results once. Example 4. The developer runs the two phone specs together. | slice 7 | |
| P14 | The unfiltered frontend group selects each of the seven moved cases once. Scope. | slice 7 | |
| P15 | Frontend CI selects each of the seven moved cases once. Scope. | slice 7 | |
| P16 | Each moved case appears once as an identifiable case in the frontend CI summary in an ordinary run. Goal and example 4. | slice 7 | |
| P17 | Each retained case appears once in the frontend CI summary in an ordinary run. Example 4. | slice 7 | |
| P18 | Each moved case, including the failing case, appears once as an identifiable case in the frontend CI summary when a moved assertion fails. Goal and example 4. | slice 7 | |
| P19 | Each retained case appears once in the frontend CI summary when a moved assertion fails. Example 4. | slice 7 | |
| P20 | A completed swipe from a column with an available neighbor moves exactly one column. Examples 1–2. Includes the 390 × 844 Backlog-to-Taken swipe. | slice 5 | |
| P21 | One of the two indicators measures at most 16 px wide. Example 1. The 390 × 844 Backlog-to-Taken journey. | slice 4 | observed: The Backlog-to-Taken width case measured the first rendered control at 12 px and passed its 16 px limit in slice4-final-pair.log. |
| P22 | The other indicator measures at most 16 px wide. Example 1. The same journey. | slice 4 | observed: The same case measured the other rendered control at 12 px and checks each width against 16 px in board-indicators.mounted.spec.ts. |
| P23 | The view gains more than 44 px of width. Example 1. The same journey, measured against the former layout. | slice 4 | observed: The mounted case compares the 366 px rendered view to 390 - 2 × 44 = 302 px, a 64 px gain. Slice4-final-pair.log recorded the passing width case. |
| P24 | The story card gains more than 44 px of width. Example 1. The same journey, measured against the former layout. | slice 4 | observed: The mounted case compares the 366 px rendered story card to the former 302 px view, a 64 px gain. Slice4-final-pair.log recorded the passing assertion. |
| P25 | A native tap on an indicator reaches the column it names. Example 1. | slice 4 | observed: The first title in board-indicators.mounted.spec.ts verifies Recently done and Backlog after the two native taps, through the frame hit-target and named column checks. The isolated title and the paired run passed. |
| P26 | Keyboard activation transfers focus to the surviving indicator. Example 1. | slice 4 | observed: The second title in board-indicators.mounted.spec.ts checks Taken focus, then Recently done focus after Enter, then Taken focus on returning. Slice4-focus-title.log and slice4-final-pair.log passed. |
| P27 | A short swipe leaves the current column unchanged. Example 2. | slice 5 | |
| P28 | A cancelled swipe leaves the current column unchanged. Example 2. | slice 5 | |
| P29 | A completed outward swipe at the first column stops there. Example 2. | slice 5 | |
| P30 | A completed outward swipe at the last column stops there. Example 2. | slice 5 | |
| P31 | A swipe starting on a card leaves selection untouched. Example 2. | slice 6 | |
| P32 | A swipe starting on a card leaves inspection untouched. Example 2. | slice 6 | |
| P33 | A swipe starting on a card leaves launch untouched. Example 2. | slice 6 | |
| P34 | A swipe starting on a card’s launch action leaves selection untouched. Example 2. | slice 6 | |
| P35 | A swipe starting on a card’s launch action leaves inspection untouched. Example 2. | slice 6 | |
| P36 | A swipe starting on a card’s launch action leaves launch untouched. Example 2. | slice 6 | |
| P37 | Ordinary taps still inspect. Example 2. | slice 6 | |
| P38 | Ordinary taps still select. Example 2. | slice 6 | |
| P39 | The open detail survives rotation to landscape and back. Example 2. Reduced motion is enabled. | slice 6 | |
| P40 | The selection survives rotation to landscape and back. Example 2. Reduced motion is enabled. | slice 6 | |
| P41 | A real vertical stroke advances the scroll region. Example 3. Backlog is long. | slice 7 | |
| P42 | Backlog remains visible during the real vertical stroke. Example 3. Backlog is long. | slice 7 | |
