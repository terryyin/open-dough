# Source review

A fresh general-purpose reviewer, `source_review`, received only the selected
story section in SEED-413 and the text of its incorporated shared campaign
acceptance. The launch used no conversation inheritance and requested no file
reads or edits. The commitments below preserve the reviewer's three numbered
groups. P01–P06, P07–P13, P14–P24, P25–P34, and P35–P43 follow the five source
examples. S01–S13 follow the scope, and A01–A24 follow the shared acceptance.

The reviewer treated production logic, smallest production mounts in Chromium,
actual readers with typed collaborators for applicable retry, abort, caching
and stale answers, MakeMe, direct actions with observable waits, and applicable
colocated objects as proof methods. Counts and timing evaluate the goal of
faster feedback. Retain existing backend and E2E ownership. The final runner
retirement and whole-group timing target belong to the final campaign story.
Workflow internals, recovery and late styling, and the renamed-diff correction
have their own owners. Use relevant results from those owners and coordinate
with SEED-341.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | With the Side panel open and room for two columns, the Board pages from Backlog to Taken. | slice 6 | |
| P02 | With the Side panel open and room for two columns, the Board pages to Recently done. | slice 6 | |
| P03 | With the Side panel open and room for two columns, the Board shows whole columns. | slice 6 | |
| P04 | With the Side panel open and room for two columns, keyboard controls keep focus reachable. | slice 6 | |
| P05 | With the Side panel open, a wider frame restores the chosen Board position. | slice 6 | |
| P06 | With the Side panel open, a long hidden column adds no blank scroll tail. | slice 6 | |
| P07 | On a phone, a horizontal swipe pages the Board. | slice 2 | observed: board-swipe.spec.ts, native complete swipes visit the next whole column and stop at each end |
| P08 | On a phone, a horizontal swipe does not activate the touched story. | slice 2 | observed: board-swipe.spec.ts, native swipe from the card and compatibility click leave detail collapsed and selection clear |
| P09 | On a phone, a horizontal swipe does not activate the touched Start. | slice 2 | observed: board-swipe.spec.ts, native swipe from enabled Start and compatibility click leave no dialog or recorded launch |
| P10 | On a phone, a vertical drag reads the current column. | slice 2 | observed: board-swipe.spec.ts, native vertical drag increases the scroll offset and keeps Backlog shown |
| P11 | On a phone, tapping an indicator reaches the corresponding swipe destination. | slice 2 | observed: board-indicators.spec.ts, a swipe and hit-tested taps share Board column destinations |
| P12 | Phone rotation preserves the inspected story. | slice 2 | observed: board-swipe.spec.ts and accessible-board-touch.spec.ts, detail remains expanded through phone rotation and paging |
| P13 | Phone rotation preserves the separate selection. | slice 2 | observed: board-swipe.spec.ts, native title tap selects independently of Inspect and the selected state remains after rotation |
| P14 | The Board announces the result of a published-work refresh. | slice 3 | observed: accessible-board-announcements.spec.ts, typed refresh B updates the standing status to B revision and retrieval time |
| P15 | The Board announces a published-work read failure. | slice 3 | observed: accessible-board-announcements.spec.ts, typed 403 check and 404 work read produce distinct alerts |
| P16 | Retained work stays reachable during a published-work refresh. | slice 3 | observed: accessible-board-announcements.spec.ts, retained snapshot A card renders during held B and is replaced after release |
| P17 | Retained work stays reachable after a published-work read failure. | slice 3 | observed: accessible-board-announcements.spec.ts, after typed 404 the earlier card remains and its Inspect is reachable in the Board reading room |
| P18 | The problem stays reachable after a published-work read failure. | slice 3 | observed: accessible-board-announcements.spec.ts, narrow alert names the missing backlog and remains reachable above the retained Board |
| P19 | The reader retains focus during a published-work refresh. | slice 3 | observed: accessible-board-announcements.spec.ts, Settings holds focus both during the held refresh and after B appears |
| P20 | The reader retains focus through a published-work read failure. | slice 3 | observed: accessible-board-announcements.spec.ts, failed check and failed work read preserve Settings focus |
| P21 | Keyboard reading keeps links usable. | slice 3 | observed: accessible-board-keyboard.spec.ts, native Tabs reach the revealed canonical link; e2e/stories/published-work.spec.ts verifies the pinned popup destination after Enter |
| P22 | Keyboard reading keeps story controls usable. | slice 3 | observed: accessible-board-keyboard.spec.ts and accessible-board-scroll.spec.ts, native forward/reverse traversal, focused Inspect/Hide and enabled refinement |
| P23 | Zoom keeps links usable. | slice 3 | observed: accessible-board.spec.ts, long links fit their card and carry the expected hrefs at narrow and equivalent zoom widths |
| P24 | Zoom keeps story controls usable. | slice 3 | observed: accessible-board.spec.ts, at both widths paging and native Enter leave Inspect, the revealed plan link, and Hide detail usable |
| P25 | A developer can choose the Side panel width by dragging. | slice 5 | observed: side-panel-width.spec.ts, native drag changes rendered pane width, split and accessible announcement |
| P26 | A developer can choose the Side panel width by keyboard. | slice 5 | observed: side-panel-width.spec.ts, reverse Tab reaches divider and native Left/Right use equal bounds and steps |
| P27 | Opening the Sessions sidebar after a width choice can constrain or cover the Board as space requires. | slice 5 | observed: side-panel-width-review.spec.ts clamps beside Sessions; side-panel-width-covering.spec.ts covers remaining page when room runs out |
| P28 | Narrowing the window after a width choice can constrain or cover the Board as space requires. | slice 5 | observed: side-panel-width-covering.spec.ts and e2e/navigation/side-panel-terminal-width.spec.ts, Review and terminal cover at narrow viewport with no divider or Maximize |
| P29 | Restoring room after a sidebar layout change restores the chosen width. | slice 5 | observed: side-panel-width-review.spec.ts and e2e/navigation/side-panel-terminal-width.spec.ts, closing Sessions restores chosen Review and terminal split |
| P30 | Restoring room after a window layout change restores the chosen width. | slice 5 | observed: side-panel-width-covering.spec.ts, returning room restores usable divider and previously chosen split or Maximize |
| P31 | An open terminal retains its identity through the relevant sidebar and window layout changes. | slice 5 | observed: e2e/navigation/side-panel-terminal-width.spec.ts, the same live native attachment lasts through viewport and sidebar covers |
| P32 | An open terminal retains its read state through the relevant sidebar and window layout changes. | slice 5 | observed: e2e/navigation/side-panel-terminal-width.spec.ts, earlier output persists and later typed input and screen output reach that same attachment |
| P33 | An open Review retains its identity through the relevant sidebar and window layout changes. | slice 5 | observed: side-panel-width-review.spec.ts, same Review heading element and pressed file remain through Maximize, sidebar, cover and widening |
| P34 | An open Review retains its read state through the relevant sidebar and window layout changes. | slice 5 | observed: side-panel-width-review.spec.ts, selected diff remains readable and typed Review and file-read counts stay fixed through layout changes |
| P35 | A sidebar session reveal pages to the card when it is off the current Board page, including the hidden or tall case as applicable. | slice 6 | |
| P36 | A sidebar session reveal brings the hidden card top into view. | slice 6 | |
| P37 | A sidebar session reveal brings the tall card top into view. | slice 6 | |
| P38 | Perspective switching preserves the intended project on the relevant path. | slice 7 | |
| P39 | Perspective switching preserves the panel attachment on the relevant path. | slice 7 | |
| P40 | Perspective switching preserves the selected story on the relevant path. | slice 7 | |
| P41 | Browser history preserves the intended project on the relevant path. | slice 7 | |
| P42 | Browser history preserves the panel attachment on the relevant path. | slice 7 | |
| P43 | Browser history preserves the selected story on the relevant path. | slice 7 | |
| S01 | Apply shared campaign acceptance to legacy `accessible-board*` navigation specs. | slice 3 | observed: All seven migrated Board reading specs and the earlier phone Vitest cases ran in the 36-case selection; true popup/reload proof ran in E2E |
| S02 | Apply shared campaign acceptance to legacy `board-*` navigation specs. | slice 6 | |
| S03 | Apply shared campaign acceptance to legacy `story-card*` navigation specs. | slice 4 | observed: story-card-selection.spec.ts and story-card-dependency-selection.spec.ts exercise actual Board selection, Inspect and dependency disclosure in mounted Chromium; E2E retains supplier-link navigation |
| S04 | Apply shared campaign acceptance to legacy `side-panel-width*` navigation specs. | slice 5 | observed: Four same-path width specs run mounted Chromium; e2e/navigation/side-panel-kept-width.spec.ts and side-panel-terminal-width.spec.ts cover real storage and terminal attach |
| S05 | Apply shared campaign acceptance to legacy `development-intent-frame*` navigation specs. | slice 7 | |
| S06 | Apply shared campaign acceptance to legacy `frame-*` navigation specs. | slice 8 | |
| S07 | Narrow the existing `board-swipe` Vitest spec from its whole-dashboard mount. | slice 2 | observed: board-swipe.spec.ts mounts Board in production PageFrame over typed published work |
| S08 | Narrow the existing `board-indicators` Vitest spec from its whole-dashboard mount. | slice 2 | observed: board-indicators.spec.ts mounts Board in production PageFrame and observes native taps and keyboard focus |
| S09 | Narrow the existing `story-card-scan-emphasis` Vitest spec from its whole-dashboard mount. | slice 4 | observed: story-card-scan-emphasis.spec.ts, all four cases mount StoryCard over typed slice and current/Done session evidence and observe layout, paint and native Tab |
| S10 | Retain representative real page loads in E2E. | slice 2 | observed: e2e/navigation/phone-board.spec.ts, published work appears after the built dashboard loads and the Board accepts composed touch input |
| S11 | Retain representative reloads in E2E. | slice 1 | observed: e2e/navigation/board-kept-position.spec.ts, durable position through wide and narrow reloads and fallback after storage refusal |
| S12 | Retain representative URL destinations in E2E. | slice 6 | |
| S13 | Retain representative cross-destination history in E2E. | slice 7 | |
| A01 | Scoped frontend unit checks use plain Vitest. | slice 8 | |
| A02 | Retire `actSettled` as its test families move. | slice 8 | |
| A03 | Retire React `act` wrapping as its test families move. | slice 8 | |
| A04 | Retire `IS_REACT_ACT_ENVIRONMENT` as its test families move. | slice 8 | |
| A05 | Remove spent support after the last consumer moves. | slice 8 | |
| A06 | Keep the shared test-support surface shrinking. | slice 8 | |
| A07 | Retain distinct case names where the risk needs separate setup or diagnosis. | slice 8 | |
| A08 | Preserve exact wording wherever it is part of the proof. | slice 8 | |
| A09 | Preserve accessibility distinctions wherever they are part of the proof. | slice 8 | |
| A10 | Preserve viewport distinctions wherever they are part of the proof. | slice 8 | |
| A11 | Preserve input distinctions wherever they are part of the proof. | slice 8 | |
| A12 | Preserve race distinctions wherever they are part of the proof. | slice 8 | |
| A13 | Preserve error and retry distinctions wherever they are part of the proof. | slice 8 | |
| A14 | Avoid long unrelated assertion chains. | slice 8 | |
| A15 | Avoid hidden case registration. | slice 8 | |
| A16 | Map every distinct retired assertion to a new owner or named existing equivalent before deletion. | slice 8 | |
| A17 | Report the reason for each consolidation. | slice 8 | |
| A18 | Report the reason for keeping any repeated cases. | slice 8 | |
| A19 | Compare comparable before and after selections with two workers, recording elapsed time including preparation and pairing runs under comparable load when noisy. | slice 8 | |
| A20 | Record case counts by engine. | slice 8 | |
| A21 | Record case counts by destination. | slice 8 | |
| A22 | Record the slow cases remaining. | slice 8 | |
| A23 | Run each engine selection explicitly while the legacy runner exists. | slice 8 | |
| A24 | Include the runtime of promoted E2E proof. | slice 8 | |
