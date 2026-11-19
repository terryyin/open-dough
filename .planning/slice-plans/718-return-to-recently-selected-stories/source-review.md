# Source-only review

**Launch:** fresh general-purpose reviewer, no conversation inheritance; instructed
to use only the supplied Goal, Scope, key examples and exclusions; read no other
project files; change nothing.

**Input:** SEED-409#return-to-recently-selected-stories — Goal, Scope (required
behavior, retention, scope limits), Key examples 1–8, and UI. No plan or product
files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Banner has one **Recent stories** icon button in its own group, immediately beside the Development/Intent perspective choice. Source: Required behavior. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 1) |
| 2 | The button shows a filled bookmark when a story is selected and an outline bookmark when none is. Sources: Required behavior; UI; Ex. 1, 5. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 2) |
| 3 | The button’s accessible name says which state it is in (selected vs none). Sources: Required behavior; Ex. 1. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 3) |
| 4 | Clicking the button reveals the current story and leaves the popover closed when a story is selected and its start is not in view. Qualifications / “reveal” / “in view”: In Development: Columns shows the project’s stories (leaving Roster if shown) and brings the story card into view. In Intent: the selected story’s view is shown (leaving Project Intent if chosen) and its start is brought into view. In view = start of its card or Intent view is on screen (tall card with top visible counts). Sources: Required behavior (“reveal” / “in view”); Ex. 2, 7. | slice 6 | observed: observed: intent-recent-stories.spec.ts returnFromProjectIntentThenList + recent-stories.spec.ts Dev return (slice5/6) + slice6-intent-proof-final.json / slice6-recent-stories-proof.json |
| 5 | Otherwise, clicking the button opens the **Recent stories** popover anchored to the button (including when none selected, or selected and start already in view). Sources: Required behavior; UI; Ex. 1, 2 (second click), 3. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 5) |
| 6 | When a story is selected, the popover lists that current story first and checked. Sources: Required behavior; UI; Ex. 2, 4, 6. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 6) |
| 7 | Earlier selections follow most recent first; each project+story pair appears once. Sources: Required behavior; Ex. 4, 6. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 7) |
| 8 | Each row is labelled with its project and story identity. Sources: Required behavior; UI; Scope limits (rows show only project and story identity). | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 8) |
| 9 | An empty history is stated as empty in the popover. Sources: Required behavior; Ex. 1. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 9) |
| 10 | Choosing a row selects that story. Sources: Required behavior; Ex. 6. | slice 4 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts choose/reveal steps + slice4-frontend-proof.json (promise 10) |
| 11 | Choosing a row closes the popover. Sources: Required behavior; Ex. 6. | slice 4 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts choose/reveal steps + slice4-frontend-proof.json (promise 11) |
| 12 | If the chosen story belongs to another project, the Dashboard switches to that project. Sources: Required behavior; Ex. 6. | slice 4 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts choose/reveal steps + slice4-frontend-proof.json (promise 12) |
| 13 | After choosing a row, the current perspective stays. Sources: Required behavior; Ex. 6 (Development stays). | slice 6 | observed: observed: intent-recent-stories.spec.ts chooseStoryBWhileInIntent expectIntentPerspective + Dev choose (slice4) + slice6-intent-proof-final.json |
| 14 | After choosing a row, the story is revealed (same reveal / in-view meaning as **4**). Qualification: works like choosing a linked Recently done sessions row. Sources: Required behavior; Ex. 6. | slice 6 | observed: observed: intent-recent-stories.spec.ts chooseStoryBWhileInIntent expectStoryViewShown + Dev choose reveal (slice4) + slice6-intent-proof-final.json |
| 15 | Every way of setting the Selected story adds that story to the history, including Side panel openings and Recently done rows. Source: Required behavior. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 15) |
| 16 | Clearing the selection leaves the history as it is (e.g. cleared story still listed, unchecked; button returns to outline). Sources: Required behavior; Ex. 5. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 16) |
| 17 | Each browser keeps the 10 most recently selected distinct stories (including the current one) in disposable storage so the history survives a reload; after eleven distinct selections and a reload, the popover lists the last 10 newest first and the earliest is gone. Sources: Retention; Ex. 8. | slice 2 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts reload/storage steps + slice2-frontend-proof.json (promise 17) |
| 18 | When storage is unavailable, the history lasts only for the page. Source: Retention. | slice 2 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts reload/storage steps + slice2-frontend-proof.json (promise 18) |
| 19 | The selection itself is page state and is lost on reload (reload → no story selected). Sources: Retention; Ex. 8. | slice 2 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts reload/storage steps + slice2-frontend-proof.json (promise 19) |
| 20 | Pressing Escape or clicking outside closes the popover without changing anything. Source: UI. | slice 1 | observed: observed: dashboard/frontend-tests/navigation/recent-stories.spec.ts + slice1-frontend-proof-2.json (promise 20) |
| 21 | Choosing a history row whose story is no longer on the Board: in Development, follows the story the way a story reference does so the existing reference notice reports it unavailable; in Intent, the story is selected with nothing new added. Source: Scope limits (unavailable-row handling). | slice 4 | G1 |

## Unnumbered source context

- Goal framing: at-a-glance selected state; return after scroll/view/reload and to earlier selections (including other projects); keep place across sessions/reviews/Intent readings without searching the Board.
- Retention reasons (Terry, 2026-11-19): limit keeps the popover readable without scrolling and stops old stories accumulating forever.
- Scope limits / exclusions (not separate rejection rules beyond **8** / **21**): history not shared across browsers or devices; selection not added to the URL; rows do not read titles or status from other projects’ snapshots; pruning or marking unavailable rows deferred; no keyboard shortcut beyond the popover’s own keyboard use.
