# Source review: Keep the selected story when the Side panel closes

**Launch:** fresh general-purpose subagent (no conversation inheritance, no fork or resume), 2026-11-09, coordinator session for SEED-275#preserve-story-on-panel-close.

**Input:** only the story's Goal, Scope, and Key examples from
[the seed section](../../seeds/SEED-275-story-intent-tabs.md#preserve-story-on-panel-close)
at commit `26c51a258`, verbatim; told to read no files, change nothing, and
return numbered commitments, qualifications, examples, and exclusions. No plan,
product, proof, or slice scope was supplied.

**Returned qualifications:** the selection rule's content lives in ADR 0008;
"selected" means selected at dismissal (3); the fallback is the dashboard's
existing one (5); in 10 the currently selected story may differ from the
closed terminal's story; 13 is a promise, not a rejection rule — dismissal must
not invent a selection; examples do not limit commitment 2 to three surfaces.
No explicit exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | After a developer dismisses a review, terminal, or final report, they can keep working with the story they currently have selected. (Goal) | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts expectStoryReadingKept; dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing the panel keeps that selection'; dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts step 'closing the terminal clears both marks, keeps the story selected' |
| 1.1 | This applies when a review is dismissed. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts both steps: data-selected-story SEED-A#a after keyboard close; intent-story-changes.spec.ts close step |
| 1.2 | This applies when a terminal is dismissed. | slice 1 | observed: dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts step 'closing the terminal clears both marks, keeps the story selected': expectSelected(readyStory,true); development-intent-frame-sessions.spec.ts Close step data-selected-story |
| 1.3 | This applies when a final report is dismissed. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing the panel keeps that selection': final report Close keeps failing selected, Intent data-selected-story SEED-219#failing |
| 2 | Every Side panel dismissal follows the selection rule in ADR 0008 (dashboard UI concepts). | slice 1 | observed: dashboard/src/pageSidePanel.ts empty() no longer clears; every dismissal path observed in 1.1-1.3, 2a, 2b |
| 2a | This includes cases where marking a session done closes the panel. | slice 1 | observed: dashboard/tests/sessions/agent-terminal-done.spec.ts:126 expectSelected(card(readyStory), true) after Mark as done closes panel |
| 2b | This includes cases where deleting a session's record closes the panel. | slice 1 | observed: dashboard/tests/sessions/agent-terminal-delete.spec.ts:83 expectSelected(card(readyStory), true) after Delete record closes panel |
| 3 | The selection kept is the one in place when the panel is dismissed, not the one in place when the panel was opened. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing the panel keeps that selection': running story's report open, failing selected, close: failing selected, running not |
| 4 | Keyboard focus returns to the control that opened the panel, when that control is still available. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts outsideCount toBeFocused; dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts step 'closing the terminal clears both marks, keeps the story selected' entry toBeFocused; session-workspace-retirement*.spec.ts open toBeFocused |
| 5 | When the opening control is gone, focus goes to the dashboard's existing fallback. | slice 1 | observed: dashboard/tests/sessions/agent-terminal-delete.spec.ts:84 card(readyStory) toBeFocused after deleted entry disappears |
| 6 | The dashboard navigation guidance matches the delivered behavior. | slice 1 | observed: docs/dashboard-navigation.md:217 closing, Mark as done, delete keep the selected story; no-story stays project scope |
| 7 | The Intent guidance matches the delivered behavior. | slice 1 | observed: docs/dashboard-development-intent-story.md:56-59 closing Review changes keeps story, tab, file, reading place; keyboard returns to opener |
| 8 | Example: in Intent's **Changed tests** tab, a developer reads a file's Proof, opens **Review changes** from the story header with the keyboard, and closes it. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts setup: changeWithDeepSpec, Changed tests deep spec chosen, keyboard open/close from header count |
| 8.1 | The same story is still present. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts expectStoryReadingKept data-selected-story SEED-A#a, title Story A |
| 8.2 | The same tab (**Changed tests**) is still present. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts expectStoryTab(intent,'Changed tests') |
| 8.3 | The same file is still present. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts intentFile(deepSpec) aria-pressed true; Proof step fileReadingTab Proof aria-selected true |
| 8.4 | The same reading position is still present. | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts Purpose step: reading pane scrollTop polled equal to halfway offset after close |
| 8.5 | Focus returns to the header button (**Review changes**). | slice 1 | observed: dashboard/tests/intent/intent-story-review-return.spec.ts outsideCount (header Review changes control) toBeFocused |
| 9 | Example: with story A's final report open, a developer selects story B, then closes the report. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing the panel keeps that selection' setup: running story's final report open, card toggle selects failing, Close |
| 9.1 | Story B stays selected. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing the panel keeps that selection' expectSelected(failing,true) |
| 9.2 | Story B supplies the story evidence in Intent. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing the panel keeps that selection' Intent data-selected-story SEED-219#failing and CI panel expectNamed(failing.branch) |
| 10 | Example: a developer closes a story's terminal. | slice 1 | observed: dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts step 'closing the terminal clears both marks, keeps the story selected' |
| 10.1 | The **Shown in terminal** indicator is removed. | slice 1 | observed: dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts step 'closing the terminal clears both marks, keeps the story selected' shownMark count 0 and .in-side-panel count 0 |
| 10.2 | The currently selected story stays highlighted. | slice 1 | observed: dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts step 'closing the terminal clears both marks, keeps the story selected' expectSelected(readyStory,true) (ring, fill, aria-pressed), others false |
| 11 | Dismissing a session panel through **Mark as done** keeps the current selection. | slice 1 | observed: dashboard/tests/sessions/agent-terminal-done.spec.ts:126 |
| 12 | Dismissing a session panel through deletion keeps the current selection. | slice 1 | observed: dashboard/tests/sessions/agent-terminal-delete.spec.ts:83 |
| 13 | If no story is selected, the dashboard stays at project scope after dismissal. | slice 1 | observed: dashboard/tests/intent/intent-ci-status-side-panel.spec.ts step 'closing that session's terminal with no story selected leaves Intent at project scope' |
