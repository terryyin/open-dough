# Source review: SEED-224#unify-story-selection

Launch: fresh general-purpose reviewer, no conversation inheritance, during slice 1 acceptance (2026-11-03). Input: only the selected story's Goal, Scope, Key examples and Deferred promises, verbatim from `.planning/seeds/SEED-224-unify-story-selection.md`; instructed to read no project files and change nothing. Returned commitments below, as returned.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer can tell which story the dashboard is showing and read its Intent, without reconciling a card's inspection border with a separate Side panel outline. | slice 2 | observed: dashboard/tests/side-panel-content-switching.spec.ts and dashboard/tests/intent-ci-status-side-panel.spec.ts; the highlight is the card's only selection mark (StoryCard.tsx has no in-side-panel), Intent reads the selected story |
| G2 | The page keeps one selected story. | slice 2 | observed: dashboard/src/pageStorySelection.tsx usePageStorySelection, one page state shared by Columns, RecentlyDone and Intent |
| G3 | Its card is highlighted. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts steps 1–2, card highlighted with Select story pressed while Intent's data-selected-story names it |
| G4 | Intent reads the same story. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts steps 1–2 and dashboard/tests/side-panel-content-switching.spec.ts expectIntentReads |
| G5 | Inspect only opens a card's inline detail. | slice 1 | observed: dashboard/tests/story-card-inspection.spec.ts steps "with no selected story…" and "with Story C selected…" |
| G6 | This applies ADR 0008's rule of one name and one responsibility per concept to dashboard selection. | slice 2 | observed: docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md Dashboard UI concepts rows Selected story, Highlight, Inspect |
| 1 | The page has one selected story at a time, or none. | slice 2 | observed: dashboard/src/pageStorySelection.tsx SelectedStory \| undefined; project-selection.spec.ts one selection across projects |
| 1.1 | Two things set it: (a) opening one of the story's terminals, final reports, or reviews in the Side panel; | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts (final report), dashboard/tests/side-panel-content-switching.spec.ts (terminal and review) |
| 1.2 | (b) toggling its card's Select story control. | slice 1 | observed: dashboard/tests/story-card-selection.spec.ts step "Enter and Space on Select story toggle a Backlog card without detail" and "Recently done Select story toggles once by pointer and keyboard" |
| 2.1 | Every card in Backlog has Select story in its action group. | slice 1 | observed: story-card-selection.spec.ts Backlog card selectStory(active); dashboard/src/StoryCard.tsx inspection group |
| 2.2 | Every card in Taken has Select story in its action group. | slice 1 | observed: dashboard/src/StoryCard.tsx (shared by Backlog and Taken columns in Columns.tsx); responsive-session-access.spec.ts Select story on the card after it moves to Taken |
| 2.3 | Every card in Recently done has Select story in its action group. | slice 1 | observed: story-card-selection.spec.ts step "Recently done Select story toggles once by pointer and keyboard" |
| 2.4 | The Select story control shows whether it is pressed. | slice 1 | observed: dashboard/tests/storyCardSelection.ts expectSelected asserts aria-pressed |
| 2.5 | The control works by pointer. | slice 1 | observed: story-card-selection.spec.ts step "Recently done Select story toggles once by pointer and keyboard" |
| 2.6 | The control works by keyboard. | slice 1 | observed: story-card-selection.spec.ts step "Enter and Space on Select story toggle a Backlog card without detail" |
| 2.7 | Clicking an empty area of a card is the pointer shortcut for the same toggle. | slice 1 | observed: story-card-selection.spec.ts step "empty-area click selects and clears an active card without opening detail" |
| 2.8 | Toggling the selected story's card clears the selection. | slice 1 | observed: story-card-selection.spec.ts steps "empty-area click…" (second heading click) and "Enter and Space…" (Space clears) |
| 3.1 | Opening other content in the Side panel replaces any earlier selection, including one made on a card. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step "another story's final report moves the selection…"; dashboard/tests/side-panel-content-switching.spec.ts review replacing the terminal moves selection to B |
| 3.2 | Opening content of the already selected story keeps it selected. | slice 2 | observed: dashboard/tests/side-panel-content-switching.spec.ts step "inspecting another card, or opening the shown review again, leaves its story selected" |
| 3.3 | Selecting a card leaves the Side panel as it is. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step "a card's toggle selects without changing the panel…"; dashboard/tests/side-panel-content-switching.spec.ts step "an empty-area click selects another card…" |
| 4.1 | Closing the Side panel clears the selection. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step 3 and sessions-sidebar-navigation.spec.ts close step (expectSelected false) |
| 4.2 | Showing a session that is attached to no story clears the selection. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step "showing a session attached to no story clears the selection…"; story-card-selection.spec.ts step "showing a session attached to no story clears the selection" |
| 4.3 | This includes a panel that closes because its session is marked done. | slice 2 | observed: dashboard/tests/agent-terminal-done.spec.ts expectSelected(card(readyStory), false) after the closing mark |
| 4.4 | This includes a panel that closes because its record is deleted. | slice 2 | observed: dashboard/tests/agent-terminal-delete.spec.ts expectSelected(card(readyStory), false) after delete |
| 5.1 | The selected story's card is highlighted wherever it is visible. | slice 1 | observed: storyCardSelection.ts expectSelected (class, inset ring, pale fill) on active and Recently done cards in story-card-selection.spec.ts |
| 5.2 | The highlight replaces the inspection border on cards. | slice 1 | observed: story-card-inspection.spec.ts inspected cards A and B assert expectSelected(false) while open |
| 5.3 | The highlight replaces the Side panel outline on cards. | slice 2 | observed: dashboard/src/StoryCard.tsx and agent-launch.css carry no story-card in-side-panel; sessions-sidebar-navigation.spec.ts asserts expectSelected on cards |
| 6.1 | Inspection belongs to each card on its own. | slice 1 | observed: dashboard/src/pageStoryInspection.tsx; story-card-inspection.spec.ts A, B, C inspected independently |
| 6.2 | Inspect story opens and closes that card's inline detail. | slice 1 | observed: story-card-selection.spec.ts step "Inspect story opens and closes only detail…" |
| 6.3 | The Inspect story control shows whether the detail is open. | slice 1 | observed: story-card-inspection.spec.ts aria-expanded true/false on Story B's toggle; storyCardSelection.ts expectInspected |
| 6.4 | Several cards can have their detail open at once. | slice 1 | observed: story-card-inspection.spec.ts final step, expectInspected(true) for A, B, C |
| 6.5 | Inspecting never changes the selected story. | slice 1 | observed: story-card-inspection.spec.ts step "with Story C selected, Story B's detail opens and closes and C stays selected" |
| 6.6 | Selecting never opens or closes detail. | slice 1 | observed: story-card-selection.spec.ts step "Inspect story opens and closes only detail; selection toggles without closing it" |
| 6.7 | Following a dependency's story reference reveals the target card and opens its detail without selecting it. | slice 1 | observed: story-card-inspection.spec.ts step "Story A's reference to Story B opens B's detail…" |
| 7.1 | Intent reads the page's selected story for its story lens. | slice 2 | observed: intent-story-completed.spec.ts last step of first test, lens names Story A after Review changes |
| 7.2 | Intent reads the page's selected story for its CI status. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts steps 1–2, CI status of the selected story's branch |
| 7.3 | With no selected story, Intent shows no lens. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts steps 3–4, no data-selected-story; intent-story-changes.spec.ts last step lens removed |
| 7.4 | With no selected story, CI status judges the trunk. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts steps 3–4, CI status judges main |
| 8.1 | Terminology: "selected story" names the shared state. | slice 2 | observed: ADR 0008 concepts table row Selected story; dashboard/STORY-CARDS.md |
| 8.2 | "highlight" names its visual indication on a card. | slice 2 | observed: ADR 0008 concepts table row Highlight; dashboard/STORY-CARDS.md |
| 8.3 | "inspect" names the opening of a card's inline detail. | slice 2 | observed: ADR 0008 concepts table row Inspect; dashboard/STORY-CARDS.md |
| 8.4 | ADR 0008's Dashboard UI concepts use these meanings. | slice 2 | observed: ADR 0008 Dashboard UI concepts rows Selected story, Highlight, Inspect |
| 8.5 | The maintained Development documentation uses these meanings. | slice 2 | observed: dashboard/README.md and dashboard/STORY-CARDS.md |
| 8.6 | The maintained navigation documentation uses these meanings. | slice 2 | observed: docs/dashboard-navigation.md highlight and Side panel set/clear paragraph |
| 8.7 | The maintained Side panel documentation uses these meanings. | slice 2 | observed: dashboard/AGENT-LAUNCH-TERMINALS.md Side panel description; dashboard/AGENT-LAUNCH-REVIEW.md |
| 8.8 | The maintained Intent documentation uses these meanings. | slice 2 | observed: docs/dashboard-development-intent.md CI status reads the selected story |
| 8.9 | The wording that tied selection to inspection is replaced. | slice 2 | observed: dashboard/STORY-CARDS.md and docs/dashboard-navigation.md describe inspection separately from selection |
| 8.10 | The wording that described a separate card mark for Side panel content is replaced. | slice 2 | observed: docs/dashboard-navigation.md and dashboard/AGENT-LAUNCH-TERMINALS.md give the outline only to the shown session entry |
| 9.1 | The selection is page state that the URL does not record, as today. | slice 2 | observed: dashboard/src/pageStorySelection.tsx React state only, no URL write |
| 9.2 | It does not survive a reload. | slice 2 | observed: dashboard/src/pageStorySelection.tsx useState in PageFrame, initial undefined on load |
| 10.1 | No new Side panel content. | slice 2 | observed: diff adds no Side panel content kind (pageSidePanel.ts kinds unchanged) |
| 10.2 | A story becomes selectable through content that already exists, or through its card's toggle. | slice 2 | observed: pageSidePanel.ts existing openTerminal/openFinalReport/openStoryReview and card toggle are the only setters |
| 11.1 | Plan 448 (SEED-192#align-intent-story-lens, currently Taken) keeps its own outcomes. | slice 2 | observed: plan 448 not on main; its outcomes below are kept |
| 11.2 | Disclosure content inside a card is not an empty area (kept). | slice 2 | observed: pageStorySelection.tsx isStoryCardControl keeps disclosure and story-detail exclusions; story-card-inspection.spec.ts dependency summary click selects nothing |
| 11.3 | Intent's Review changes opens Intent's comparison (kept). | slice 2 | observed: intent-story-completed.spec.ts and intent-story-changes.spec.ts openReviewFromIntent opens the comparison |
| 11.4 | This story keeps both and changes only what the click toggles. | slice 2 | observed: only the toggle target changed (pageStorySelection.tsx toggleOnEmptyArea) |
| 12.1 | One Side panel serves every project on the page. | slice 2 | observed: PageFrame.tsx one usePageSidePanel for every project |
| 12.2 | Selection is one page-wide project and story. | slice 2 | observed: pageStorySelection.tsx SelectedStory {project, identity} |
| 12.3 | While the page shows a project that does not own the selected story, that project has no selected story. | slice 2 | observed: dashboard/tests/project-selection.spec.ts Doughnut's shared-identity card not selected while Open Dough owns the selection |
| 12.4 | Toggling one of that project's cards selects that card. | slice 2 | observed: dashboard/tests/project-selection.spec.ts toggling Doughnut's card selects it; Open Dough's card then not selected |
| 13.1 | Session entries keep their own "shown" mark for the session the Side panel shows. | slice 2 | observed: sessions-sidebar-navigation.spec.ts one shown entry; sessions-sidebar-navigation-cases.spec.ts entry outline |
| 13.2 | That mark identifies a session, not a story selection. | slice 2 | observed: SessionEntry.tsx keeps in-side-panel and Shown in terminal; story cards use the highlight |
| E1.1 | No story selected; developer opens Story A's terminal from its card -> Story A is selected and highlighted. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step "reading a story's final report selects and highlights it…"; dashboard/tests/side-panel-content-switching.spec.ts A's terminal selects A |
| E1.2 | -> Story A's Select story shows pressed. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step 1 expectSelected asserts Select story aria-pressed |
| E1.3 | -> Intent names Story A and shows its branch's CI status. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step 1, data-selected-story and CI status of codex/example-story |
| E1.4 | Opening Story B's final report then -> both selection and highlight move to Story B. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step "another story's final report moves the selection and Intent's branch there" |
| E2.1 | Side panel shows Story A's review; developer opens then closes Story B's detail with Inspect story -> Story A stays selected and highlighted. | slice 2 | observed: dashboard/tests/side-panel-content-switching.spec.ts step "inspecting another card, or opening the shown review again, leaves its story selected" |
| E2.2 | -> Story B's control shows open and then closed. | slice 1 | observed: story-card-inspection.spec.ts aria-expanded true then false on Story B's toggle |
| E2.3 | With the Side panel closed, opening Story B's detail -> leaves no story selected. | slice 1 | observed: story-card-inspection.spec.ts step "with no selected story, opening and closing detail selects none" |
| E3.1 | Side panel shows Story B's terminal; developer clicks an empty area of Story A's card -> Story A is selected and highlighted. | slice 2 | observed: dashboard/tests/side-panel-content-switching.spec.ts step "an empty-area click selects another card and clears it, leaving the terminal and every detail as they are" |
| E3.2 | -> Intent reads Story A. | slice 2 | observed: same step, expectIntentReads |
| E3.3 | -> Story B's terminal stays in the Side panel. | slice 2 | observed: same step, terminal still shown |
| E3.4 | Clicking Story A's empty area again -> clears the selection. | slice 2 | observed: same step, second click clears |
| E3.5 | Neither click opens or closes any detail. | slice 2 | observed: same step, detail region count stays 0 |
| E4.1 | Keyboard user tabs to a Backlog card's Select story and presses Enter -> that story is selected and highlighted, control shows pressed. | slice 1 | observed: story-card-selection.spec.ts step "Enter and Space on Select story toggle a Backlog card without detail"; accessible-board-keyboard.spec.ts tab order includes Select story |
| E4.2 | Pressing Space -> clears the selection again. | slice 1 | observed: story-card-selection.spec.ts step "Enter and Space on Select story toggle a Backlog card without detail" |
| E4.3 | Neither key opens or closes the card's detail. | slice 1 | observed: same step, expectInspected(active, false) after each key |
| E5.1 | A Taken story held on another machine (no local session, no Review changes); developer selects its card -> Intent's CI status judges that story's published story branch, as it does today through inspection. | slice 1 | observed: dashboard/tests/intent-ci-status-story.spec.ts (unchanged; toggleOnDevelopment empty-area click on published Taken stories) green in slice 1 affected-set run |
| E6.1 | Developer opens a Recently done story's Review changes -> that done card is highlighted. | slice 2 | observed: dashboard/tests/intent-story-completed.spec.ts step "the done card's Review changes selects and highlights it…" |
| E6.2 | -> Intent's lens shows the completed story. | slice 2 | observed: same step, lens names "Story Story A SEED-A#a" |
| E6.3 | Clicking the card's empty area -> clears the selection and leaves the review open. | slice 2 | G3 |
| E7.1 | Story A selected through its terminal; developer closes the Side panel -> highlight disappears, Intent shows no story lens and judges the trunk. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step 3 (close panel: highlight gone, no data-selected-story, CI main) |
| E7.2 | Alternatively, developer opens a session attached to no story -> same result: highlight disappears, Intent shows no story lens and judges the trunk. | slice 2 | observed: dashboard/tests/intent-ci-status-side-panel.spec.ts step 4 (ad-hoc session: cleared, CI main) |
| E8.1 | Stories A and C both have detail open; developer follows a dependency reference to Story D -> Story D's card is revealed with its detail open. | slice 1 | observed: story-card-inspection.spec.ts final step (reference target SEED-B#b revealed, focused, expectInspected true) |
| E8.2 | -> A and C stay open. | slice 1 | observed: story-card-inspection.spec.ts final step, expectInspected(true) for A and C |
| E8.3 | -> The selection does not change. | slice 1 | observed: story-card-inspection.spec.ts final step, C stays selected, A and B not selected |
| D1 | A way to select a story from Intent itself. | slice 2 | observed: deferred by the story; no selection from Intent added |
| D2 | Keeping the selection across a reload or in the URL. | slice 2 | observed: deferred by the story; no persistence added |
