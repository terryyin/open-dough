# Browser page-object owners

For journey rules and shared conventions, see [Writing a browser journey](writing-journeys.md#page-objects).

## Review and Side panel owners

`storyCardControls.ts` owns Review changes. `support/reviewControls.ts` owns
the review region, comparison/run choices, uncommitted check and Refresh
controls without waiting for their answers. Reading operations in
`support/reviewRead.ts` and `support/storyReviewMark.ts` keep the waits they
need; a journey holding an answer can press the same control separately.
Tree, diff and context readers accept the scenario's independent expected facts.

`sidePanelFrame.ts` shares Close, Maximize/Restore and covering operations with
procedural and fluent callers. Preserve each caller's locator click,
shown-position mouse, touch or keyboard input. Its Close is action-only;
`pageLayout.closeSidePanelToBoard` additionally waits for the panel and preparation
reading to disappear before a Board continuation.

`sidePanelWidthPage.ts` owns drag/cancellation, explicit divider focus and
keyboard resizing. Supply the key/count and chosen geometry at the call site;
pressing divider keys never transfers focus implicitly. Keep a cancelled-drag
observation before mouse release when that order distinguishes the outcome.
`sessionEntryAccess.ts` supplies pure Terminal/report access getters through the
named `terminalScreenPage.ts` and `finalReportPages.ts` facades. They add no
focus, input or answer wait. Independent name, accessibility and geometry
contract observations retain their own expected values.

## Terminal screen and modality owners

Ordinary Terminal screen, identity, keyboard insert/typeLine and recovery live
in `terminalScreenPage.ts`. `typeLine` types then Enter; `insertTerminalText`
never submits. Fluent `terminalPages.ts` reuses that owner as a thin adapter.
Touch keys/fit/compose, paused selection, paste and voice keep their own
owners (`touchTerminalPage.ts`, `terminalSelectPage.ts`, `terminalPastePage.ts`,
`support/terminalVoicePage.ts`) and must not import voice into the screen
module. Prefer `.xterm-screen` via `terminalScreenParts` for the xterm surface;
`.terminal-screen` is the paused overlay host. Caller facts (exact bytes,
holds/releases, native attach, modality) stay at the call site.

## Session, sidebar and report owners

A Session entry's parts live in `dashboardParts.ts` (`sessionEntriesIn`,
`sessionEntryShowing`, `sessionStateOf`, unread and problem readers); its
disclosures, actions and Delete record question live in
`support/sessionEntryDisclosure.ts`, and Mark as done in `support/markDone.ts`.
Asking a question and answering it stay separate calls, so Keep, Escape and a
held answer remain visible in the scenario. Queued-card listing and blocked
Starts are in `storyCardSessionListing.ts`; callers supply the note a blocked
Start must show.

`sessionsSidebarPage.ts` owns the open list (open/closed state, current entry,
rows and titles); `recentlyDoneSessionsSidebarPage.ts` owns Recently done, where
`select(title)` and `open(title)` stay separate operations because selecting a
retained row never opens its Terminal or report. Final report text and parts
come from `finalReportPages.ts`. Running Cursor list controls are in the
browser-only `runningCursorList.ts`; divider drags, key steps and heights in
`cursorSessionsSidebarResizePage.ts`; host figures in `sessionsSidebarFigures.ts`.
Frontend specs import only these browser modules, never native or server setup.

The shown rows read their projects' catalogs and ad hoc association records when
they appear and again on a timer. Hold or route the next action's reads through
`nextActionReads.ts`, which requires page time paused before the page opens
(`pausePageClockAt`) and settles the page's own reads first. A journey that adds
launch records while its dashboard server runs uses
`keepMoreLaunchRecordsBesideServer` (`support/launchStore.ts`), which writes
under the server's lock so a concurrent reconciliation cannot drop them.
