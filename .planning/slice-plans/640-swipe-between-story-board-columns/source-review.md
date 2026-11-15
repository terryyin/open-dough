# Source-only review

Launch: collaboration.spawn_agent, task `/root/source_review`, fresh context
(`fork_turns: none`), 2026-11-15. The tool call and actual return are retained in
this execution conversation. Inputs were only SEED-373's Goal, Scope, key
examples, UI, exclusions and explicit 2026-11-15 amendment. The reviewer was
instructed to read no project files and change nothing; no plan, implementation
or proof was supplied. The following text is the actual numbered return.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| SRC-01 | A developer using the dashboard on a phone can swipe horizontally across the story Board in Development to navigate its columns. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-02 | Swipe navigation reaches Backlog, Taken, and Recently done. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-03 | A deliberate horizontal finger swipe moves the view one column. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-04 | A left swipe moves toward Recently done; for example, Backlog → Taken → Recently done. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-05 | A right swipe moves toward Backlog; for example, Recently done → Taken → Backlog. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-06 | An outward swipe at the first or last column leaves that boundary column shown. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-07 | Column navigation does not wrap. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-08 | Column navigation does not expose empty space beyond a boundary. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-09 | On mobile, the left/right controls become much thinner, taking markedly less horizontal room than the current 44px per side. | slice 2 | |
| SRC-10 | The narrower controls leave more horizontal room for reading stories. | slice 2 | |
| SRC-11 | The controls’ main purpose is to indicate hidden columns. | slice 2 | |
| SRC-12 | Available sides have subtle, apparent direction cues for work beyond them. | slice 2 | |
| SRC-13 | A boundary has no cue suggesting work beyond that end. | slice 2 | |
| SRC-14 | The thin controls continue to work when tapped; for example, tapping the indicator toward Recently done shows that column. | slice 2 | |
| SRC-15 | The thin controls continue to work from the keyboard. | slice 2 | |
| SRC-16 | Neighboring destination names remain available to assistive technology. | slice 2 | |
| SRC-17 | Indicators describe the neighboring destinations of the currently shown column, including after navigation. | slice 2 | |
| SRC-18 | The named column heading confirms arrival. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-19 | Swiping across the reading area provides navigation without requiring a precise tap on the thin indicators. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: completed native swipes traverse one whole column and stop at both ends; at() observes full column, heading, rest and whole text |
| SRC-20 | Vertical Board reading is preserved; for example, a vertical finger movement in a long Backlog scrolls the Board without changing columns. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: native vertical reading scrolls without paging, scrollYOf increases |
| SRC-21 | Ordinary card taps retain their behavior. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-22 | Ordinary card actions retain their behavior; for example, tapping Inspect opens its ordinary detail. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-23 | Story selection is preserved. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-24 | Open story detail is preserved. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-25 | Navigation that reveals focused work is preserved. | slice 1 | observed: execution-evidence.md Slice 1: 23 maintained Board paging/kept/height/accessibility cases plus 9 traced navigation/selection cases strict passed |
| SRC-26 | A swipe does not accidentally activate the card under the finger. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-27 | A swipe does not accidentally activate an action under the finger. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-28 | A horizontal swipe starting on a card can change columns without selecting that card. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-29 | A horizontal swipe starting on a card does not open its detail. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-30 | A horizontal swipe starting on a card does not launch work. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: card/action native strokes retain no selection/detail/dialog and zero launch acceptances, followed by ordinary Inspect/card taps; selected detail preserved in rotation case |
| SRC-31 | An unfinished gesture does not move a column. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: short and cancelled gestures leave the view alone, and the next swipe works |
| SRC-32 | A cancelled gesture does not move a column. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: short and cancelled gestures leave the view alone, and the next swipe works |
| SRC-33 | Swiping and controls operate on the same current column; for example, tapping from Taken to Recently done and then swiping right returns to Taken. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: swipes share controls, retain selected story/open detail across rotation; zero slides under reduced motion |
| SRC-34 | Switching input method does not unexpectedly return to a different column. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: swipes share controls, retain selected story/open detail across rotation; zero slides under reduced motion |
| SRC-35 | Rotating the phone preserves the chosen column as with existing paging, including returning to portrait. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: swipes share controls, retain selected story/open detail across rotation; zero slides under reduced motion |
| SRC-36 | Rotating the phone preserves an open story detail as with existing paging, including returning to portrait. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: swipes share controls, retain selected story/open detail across rotation; zero slides under reduced motion |
| SRC-37 | Existing reduced-motion behavior is preserved; with reduced motion requested, a swipe changes columns without requiring a slide. | slice 1 | observed: dashboard/frontend-tests/board-swipe.spec.ts: swipes share controls, retain selected story/open detail across rotation; zero slides under reduced motion |
| SRC-38 | Existing desktop navigation is preserved. | slice 1 | observed: execution-evidence.md Slice 1: 23 maintained Board paging/kept/height/accessibility cases plus 9 traced navigation/selection cases strict passed |
| SRC-39 | A smooth slide between columns is optional. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-40 | Animation smoothness requires no automated test. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-41 | Continuously following the finger is outside the delivery promise. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-42 | This increment does not redesign the Board. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-43 | This increment does not reorder stories. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-44 | This increment does not change column membership. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-45 | This increment does not add drag-and-drop. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-46 | This increment does not change gestures in terminals. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-47 | This increment does not change gestures in the Side panel. | slice 1 | observed: execution-evidence.md Slice 1 product inspection: Board-local discrete gesture, existing pager, unchanged membership/order/terminal/Side panel; no optional animation gate imposed |
| SRC-48 | The explicit amendment replaces the Column paging control’s existing 44px touch-width expectation with the requested narrower functioning indicators. | slice 2 | |
| SRC-49 | Other controls retain their touch-size requirements. | slice 2 | |
| SRC-50 | No exact indicator width is prescribed. | slice 2 | |
| SRC-51 | No new visual arrangement is prescribed. | slice 2 | |
