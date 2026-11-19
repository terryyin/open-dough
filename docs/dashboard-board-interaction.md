# Board interaction

On a narrow touch screen, swipe across the Board reading area to show the
neighboring column: left toward Recently done, right toward Backlog. Each
completed deliberate horizontal gesture moves once and stops at the ends.
The same column position is used by the paging controls, keyboard reveal and
resizing; there is no separate swipe position.

Vertical finger movement continues to scroll the Board. Short, unfinished or
cancelled gestures do not page, and a swipe does not activate the story or
action under the finger. Ordinary taps remain available. Gestures in the
Side panel and terminals belong to those regions.

Paging respects the existing reduced-motion preference. Native Chromium touch
journeys cover reading and navigation; they make no claim about animation
smoothness or physical-device feel.

## Touch browsing and selection

Touch browsing keeps project choices, story details, and whole-column paging. Coarse-pointer controls have at least 44px targets:
frame and project controls, story Start/Inspect, and the terminal’s phone key toolbar, composer actions, and Hide keyboard.
Column indicators are the scoped exception: each reserves 12px, showing a directional chevron while keeping the full neighboring-column name and count available to assistive technology. They remain native tap and keyboard controls with visible focus; swiping is the primary route. Desktop mouse paging keeps its existing labels and width.
Without hover, cards show Start preparation/readiness notes and disabled reasons. Inspect reveals full identity, assessment, and pinned
source details; dependencies open in place. Titles and paths wrap without widening the page. Rotation keeps selection and open explanations.
Hide detail and Close return focus to their originating card or control. On a coarse pointer the Side panel terminal fits the visible area
when the soft keyboard or orientation changes, keeping controls and Close reachable; see [embedded terminals](../dashboard/AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions)
for the toolbar’s Paste key, composer Insert, and scroll-versus-navigate behavior. Chromium checks cover phone/tablet viewports, rotation, and desktop;
they do not establish physical-device keyboard or remote-connectivity behavior.

The selected story's card is highlighted with an inset accent ring and pale blue fill; inspecting a card opens its detail without it. Opening a story's terminal, final report, or review in the Side panel selects that story, and showing a session attached to no story clears it. Closing the Side panel, including through **Mark as done** or deleting the shown session's record, keeps the story selected at that moment, so Intent stays on it; with no story selected, Intent stays at project scope. A Session entry the Side panel shows keeps its own outline and "Shown in" mark, which identifies the session.

The pinned banner places a **Recent stories** icon button in its own group immediately after the Development/Intent Perspective choice and before the project control. That button shows whether a Selected story is set and opens the Recent stories list.

Use one navigable Board containing connected Columns. Initially,
show **Backlog → Taken**, with Story cards placed inside their recorded region.
The connector means “work can be taken from the backlog,” not a dependency
between stories, a required sequence of all lifecycle steps, or evidence that
a particular story moved during this observation. Label that relationship.
Taken includes claimed work, not a claim of live execution. These visual Columns
are separate from the two delivery stages in the requirements.

Use stable story identity to preserve orientation across refreshes. Preserve
source order within each region, with visible backlog priority; do not sort by
title, owner, or inferred activity. Do not add Refined, Planned, Running, or
Done Columns to fill out a pipeline before their meaning and evidence are
selected. Later refinement and planning facts may be independent annotations,
not exclusive destinations. A missing entry is not proof of completion.
Show **Preparing** and its assigned developer as such an annotation on a queued
card while a published preparation assignment names that story. The card keeps
its region, priority, and badges; Preparing is not a Column every story passes
through or evidence that an agent is running. The badge legend explains it.
