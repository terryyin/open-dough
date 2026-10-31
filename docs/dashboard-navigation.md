# Dashboard navigation

Part of the [Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md).
Its authority, scope, and revision policy apply to this guidance.

## Board and spatial navigation

A direct story destination uses `/?project=<encoded-project-id>&story=<encoded-story-identity>`
on the serving dashboard's HTTP origin. Encode the entire stable identity,
including `#`; a title, file path, Column or session ID cannot identify a story.
The URL selects the named project's stories, waits for its published membership,
then brings that card into view and puts the keyboard on it. The same rule
applies to Backlog and Taken, including hidden columns and reduced motion, and
keeps the card visible as detail loads until the developer moves. Reload and
browser Back/Forward preserve the destination. Ordinary project, roster or
session navigation leaves story targeting and takes over any pending reveal.
Navigation alone never launches, resumes or attaches an agent session.

An unknown project retains the requested URL and explains that the project is
not configured; it never redirects the target to an identically named story in
another project. After a successful read, an absent identity is reported as not
listed. A failed read stays a read failure, with an explicit retry that can
resolve the original target. These outcomes name the requested identity and
offer project choices and **Show project stories** without focusing unrelated
work. URLs without a story target retain ordinary project/view routing.

Story references and direct URLs share a configured project and story identity
as their target, and share card reveal. Active membership comes from that
project's published work; Done references use the existing catalog and range.
A reveal aligns the card's top with the top reading edge below the pinned banner
and Column heading, as far as the Board's scroll range allows, so reading begins
at the story's start even when the card is taller than the viewport. It follows
native scrolling until that beginning is readable, then lets later navigation
bring its next control into view. Layout changes can retain that reading place
until the developer moves.

Keep one Board with an always-visible banner above its own scroll region.
The Board scrollbar sits at the Board's edge, left of the Panel divider when
side by side. Scrolling the Board leaves the banner, Sessions sidebar, and
Side panel in place. Where no usable split fits, the Side panel covers the
page column (the whole viewport on a narrow window), with the banner and Board
hidden behind it until Close. Column headings and
hidden-column paging controls stay within the Board's scrolling viewport.
The agent roster scrolls in its own region when it replaces the Board.
Side panel content uses its terminal, final report, or story review scrollbars;
each Sessions sidebar list has its own scrollbar. The panel header keeps the
story title on one truncated line with a touch-reachable disclosure for the
full title, and a second line that names the workflow (for example
"Refinement session") without the session UUID; session identifiers stay on
Sessions sidebar entries and other existing session details.
Start the banner with a **Sessions** button that opens and closes the Sessions
sidebar, which lists the open agent sessions of every project beside the page
([Agent launch](../dashboard/AGENT-LAUNCH.md)). Command+B toggles it
page-wide, while browsing stories or the agent roster and from inside the
terminal, where Ctrl+B still goes to the session; the page takes Command+B from
the browser, except inside an open modal dialog, which keeps its own keyboard,
as it does for the project arrows below. Toggling leaves the keyboard where it
is, except that closing the sidebar while the keyboard is inside it returns
the keyboard to the Sessions button. The sidebar stays open or closed as left
across project switches, views, the terminal, and reloads; it is disposable
per-browser state and starts closed when none is kept. A coarse-input browser
offers **Session details** on each entry, separately from opening the session.
It reveals the full title, story identity, project/workflow, state and note,
requested model, launch time and unread-report label without hover. These are
the same local session facts as the desktop tooltip; the disclosure and list
scroll for reading, and orientation changes keep the disclosure open. Desktop
retains its compact title/elapsed row and keyboard Open control.
Below the session list,
the sidebar's **Running Cursor sessions** section starts collapsed on each page
load, its header alone below the list, which fills the rest of the sidebar.
Expanding it with the mouse or keyboard gives the session list and the
section's content an equal share of the room the heading and headers leave,
each scrolling on its own; collapsing returns that room to the session list
and leaves the keyboard on the header. The divider between the two lists is a
focusable, horizontal separator named **Running Cursor sessions divider** that
says the section's content height in pixels and its bounds: dragging it, or
Up (taller) and Down (shorter) by 2rem while it holds the keyboard, changes
one preferred height, and a drag ends when released, wherever the pointer is,
or when the browser cancels it. Each list keeps at least 8rem, room to read
and choose an entry and the runner's status, so the maximum is the room less
the session list's 8rem. Expansion and the preferred height last across
collapsing, project switches, views, and closing the sidebar within the page.
The preferred height alone is also local to this browser and disposable: after
a reload the section starts collapsed, and expanding it recovers that height.
Where the browser keeps none, refuses storage, or keeps an unusable value, the
two lists start at an equal share and still resize for the page's lifetime.
Where the window is too short or zoomed for
both lists to keep 8rem, the divider offers no range, and the sidebar itself
scrolls, keeping both lists and the header in reach; a height the room
imposes never replaces the preferred one, so more room recovers it. Expanding,
collapsing, or resizing it is page state only.
Opening a Sessions sidebar Session entry
shows its project's stories through the same project selection and URL
history as a project choice, as one history entry, opens its session in the
terminal with the keyboard there, or opens the read-only final report when a
Codex saved workspace is missing or cannot be established, and brings its story's card into view once
that project's stories are read. The page's one Side panel shows one
item at a time: a session's terminal, a read-only final report, or a story review opened by **Review changes** on its card; opening one replaces the
other, and the Board beside it stays usable. The **Panel divider** is a
focusable separator that says the panel's width in pixels: dragging it,
or Left (wider) and Right (narrower) while it holds the keyboard, changes one
preferred width shared by every panel content, kept across closing, the
Sessions sidebar and Maximize/Restore, and starting at half the room. That
preference is local to this browser and disposable: a reload recovers it for
either content, and where the browser keeps none, refuses storage, or keeps an
unusable value, the panel starts at half the room and still resizes for the
page's lifetime. A width the room or Maximize imposes never replaces it.
Neither the Side panel nor the Board becomes narrower than 20rem, measured in
the room beside the open sidebar; where that room cannot
hold both, or the window is 800px wide or narrower, the panel covers the page
column through the maximized layout and offers no Panel divider or
Maximize/Restore (Close returns to the Board); the developer's Maximize choice
and preferred width are unchanged, so more room recovers them. Command+Shift+Escape closes
the panel as its Close control does, page-wide and from inside the terminal,
maximized or not, where plain Escape still goes to the session; the page takes
it from the browser, except inside an open modal dialog or System settings,
and with no panel it does nothing. Closing returns the keyboard to the control
that opened the panel, or to its story's card when that control is gone. Command+Escape is not used: Chrome and Safari on macOS never
deliver it to the page.
The Open Dough mark is the banner's **Sessions** toggle. The project selector
names the selected project. Beside it, a **Perspective** radio group offers
**Development** and **Intent** of the selected project. The banner keeps one row
while Sessions, the perspective and the project choices fit (a page column wider
than 900 CSS pixels); below that Sessions and the perspective stay on the first
row and the project choices take a second row. Show the configured projects as
tab-shaped radio controls, with the selected project highlighted. Where those
tabs no longer fit the banner (the page column at or under 400 CSS pixels), one
dropdown-styled compact project control shows the current project name on the
same one-line row as Sessions, perspective, and System settings; the separate
tab list is not shown, and the compact control may truncate so the page does not
scroll sideways. Opening that control — by touch or keyboard — offers the
configured projects with the current one indicated; choosing one uses the same
project selection, URL history, and published-data read as a tab choice and
updates the control. Dismissing without a choice (Escape, or canceling the
platform picker) leaves the project unchanged and keeps focus on the compact
control. Resizing across that breakpoint keeps the selected project and shows
the matching tab radios or the compact control, as the column width allows.
Unmodified Left and Right arrow keys cycle the configured projects page-wide in
displayed catalog order (Open Dough, Doughnut, Pygardon, …), wrapping at both
ends, while browsing stories or the agent roster; each step uses the same
project selection, URL history, and published-data read as a pointer choice.
When a project radio holds focus, native arrow-key switching consumes that step
once and keeps useful focus on the selected control. While the compact title
listbox is open, its arrows move through its choices rather than the page-wide
cycle. Elsewhere, the page-wide shortcut selects the adjacent project; controls
that survive the switch keep focus, and when focused project content disappears,
focus moves to whichever project control the banner is showing. Editable fields, other arrow-operated controls, already-handled key
events, modified shortcuts, and an open modal help dialog keep their own
keyboard behavior and do not change the project; the perspective radios are
such a control, so their arrows change only the perspective. End the banner with the
**System settings** gear at the far right. Every icon-only control in the banner
shows its name, and its shortcut where it has one, in a tooltip when hovered or
focused. Keep readable loading and source problems near the selected project's
work. Make the header wrap without covering focused content or consuming the
usable reading area at narrow widths or browser zoom.

The global **System settings** gear opens a dedicated machine configuration
view, including when no projects are configured. Its **Projects** section lists
configured names, GitHub repositories and local paths, with **Add project** and a
**Remove project** action for each row. Project management belongs here; the
banner retains selection and observation controls. Removing an unselected row
preserves selection; removing the selected row selects its next neighbor or the
first remaining project. Settings remains available after the last removal.
**Back to dashboard** and browser Back/Forward restore the preceding valid
project, perspective and story/roster view with useful focus. Opening settings preserves the
mounted Sessions sidebar and terminal context. Project arrows leave settings
controls and forms alone. Facts and actions wrap in reading order at narrow
widths and browser zoom.

With touch input, **Back to dashboard** stays at the top while the settings
groups scroll beneath it. Scroll ordinary facts, fields, samples and error
messages to read them; project dialogs keep Add/Remove and Cancel below their
scrolling body. Editing at reduced visible height or rotating preserves the
current form draft and causes no write. A failed project or OpenAI save keeps
the entered draft and the saved predecessor for an explicit retry; a failed
theme choice returns to the saved theme and offers Retry. OpenAI's unsaved
input clears when leaving settings, following its existing credential rules.
Local paths and saved settings belong to the dashboard host machine, including
when this view is opened from a phone or tablet.

Below the banner, show **Near-future direction** as an initially collapsed
disclosure. Activation reveals its full published text or the existing
no-direction explanation across the full width of the direction's line,
beneath its title and the controls opposite it, which stay in place;
activation again collapses it. Preserve the choice
across same-project reads and start collapsed on project changes. Replace
the expanded **Preparation badges** legend with a compact question-mark help
control on the same line, opposite the direction disclosure, named Preparation
badge legend. Open the existing legend in a titled modal above the banner; provide a visible Close
control and Escape, contain focus inside, and return focus to the launcher.
Keep the actual story badges and their textual meanings visible on cards.
Direction and help are transient UI state and cause no source read. Keep
direction, evidence, and view controls outside any zooming surface.

Touch browsing uses the same project choices, story details and whole-column
paging. With a coarse pointer, frame controls, project choices, story Start
and Inspect actions, and Column paging controls provide at least 44px targets. When
hover is unavailable, a Start's preparation/readiness note and its disabled
reason are readable on the card. Inspect story reveals the full identity,
assessment and pinned source details; dependency explanations open in place.
Titles and source paths wrap instead of widening the page. Rotation preserves
the selected story and open explanations, and Hide detail and Close return
focus to their originating card or control. Local Chromium touch viewport
checks cover phone/tablet sizes and rotation alongside desktop checks; they
do not establish physical-device keyboard or remote-connectivity behavior.

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

Following a supplier story reference in a dependency explanation stays in the
dashboard, opens the referenced active story's existing inspection, and brings
its card into view with the keyboard there. Following it again keeps inspection
open and reveals the same card again. A reference to a published story in
Recently done reveals its existing card, extending the shown range exactly
through it when needed, without requiring or opening a session. The same list
keeps its ordering, retained longer range, and ordinary detail reads; an
identified card with unreadable detail keeps its read-gap explanation and
existing retry. Navigation uses the recorded story
identity, so sibling stories in one seed remain distinct. It starts no agent
work and opens no terminal. A pending reference says which project and story it
is reading; a failed read stays distinct from an unavailable block. A later
choice or move cancels a pending jump, including returning Recently done to its
latest ten. A reference whose block is unavailable, expired or unlisted says so
in the dashboard, with ordinary navigation and retry still available; it
neither creates a historical card nor reads Git history. Source links
in a story's inspection, associated plans, and dependency revision evidence
keep ordinary source navigation; repository files retain their pinned revisions.

See [spatial-reading direction](dashboard-spatial-reading.md) for the layout
hypothesis, whole-Board reading and later zoom/pan guidance.

## Development and Intent

Development is the first-visit default perspective: the stories or agent
roster, near-future direction, Start session and published-state
qualifications. Intent replaces that content with a forthcoming-content
statement for the selected project. It says that this dashboard does not read
the project's tests yet, so it shows no count, result or claim that tests or
Proof are absent, whatever the published read did; the read status keeps its
own meaning. Structure, source browsing and Purpose/Proof readers are not
offered yet. The perspective is disposable presentation state on the URL
(`perspective=intent`), independent of Development's stories/roster view, which
Intent keeps to return to. Choosing a perspective adds one history entry and
never selects another project; changing projects keeps the perspective, and
Back/Forward, reload and System settings restore it. Story URLs, story
references and choosing a Sessions sidebar entry open Development's stories,
including from the same project's Intent. Changing perspective neither starts,
stops, completes nor reattaches a session: the mounted Board, Sessions sidebar
and Side panel (terminal, final report or story review) stay as they were, and
a covering panel stays open. When the change hides the content holding the
keyboard, the keyboard moves to the selected perspective's choice.
