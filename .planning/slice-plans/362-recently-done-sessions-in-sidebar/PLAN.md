# Recently done sessions in the sidebar

**Identity:** SEED-156#recently-done-sessions-in-sidebar

**Source:** [Refined story](../../seeds/SEED-156-recently-done-sessions-in-sidebar.md#recently-done-sessions-in-sidebar).

## Goal and scope

A developer finds and opens retained Done sessions across configured projects
from a collapsed-by-default Recently done sessions section in the Sessions
sidebar. Completion time orders the sessions and supplies their displayed age.
The first expansion shows up to 20; scrolling reaches older entries without
losing usable entries already shown. The open-session list and Running Cursor
sessions remain usable alongside it.

Use the existing shared machine-session read. The initial 20 limit applies to
rendered entries, not metadata transport. Preserve the existing 30-day retention,
host operations, Done/reopen meanings and Board Recently done behavior. Server
pagination, permanent archives, search, filters and new host operations are
deferred. This plan prepares execution and grants none.

## Current decisions and existing solutions

- Reuse `agentLaunches.ts`'s configured machine records, `LaunchRecord.doneAt`,
  and host-qualified `sessionKey`. Derive one completion-ordered list; never
  derive Done from native activity, report unreadness or story membership.
  Equal timestamps use a deterministic session-identity tie-breaker.
- Reuse `SessionsSidebarSessionEntry`'s opening, current-session mark and
  accessible/touch details, extending its time meaning explicitly for Done
  entries. Open entries retain launch age; Done entries show completion age
  and identify it in their details/accessibility text. Reuse `elapsedWords`
  and the ticking clock; do not fork the entry implementation.
- Reuse `PageFrame.goToSession`, `pageSidePanel.ts`, `sessionAccess.ts` and
  `useSessionNavigation`. A sidebar selection may reveal a Board entry beyond
  its own range; the sidebar range and Board range are distinct presentation
  state. Successful native attach can reopen the record and remove its Done
  row; existing keyboard return must still find a useful destination.
- Change the sidebar's existing room owner (`sessionsSidebarHeights.ts`,
  `sharedRoom.ts`, `SessionsSidebar.tsx` and its CSS) to account for every
  expanded list and header. Reuse `ResizeDivider` and disposable preferred
  sizes. Do not run independent two-list allocators against the same space.
  Unpreferred areas share available room; active lists retain usable floors.
  If floors cannot fit, use the established outer-sidebar scroll fallback,
  without overwriting preferred sizes. This structure serves the next slice.
- Keep the sidebar's progressive range separate from `recentlyDoneRange.ts`:
  that module owns project-specific published stories, ten-entry explicit
  loading and asynchronous story detail reads. Those are different rules.
  Sidebar scrolling reveals another batch of up to 20; identity and completion
  order reconcile refreshes. Remember the reached boundary/identities so a new
  completion does not evict older entries already reached. Removed records
  disappear; a focused removed row returns focus to a nearby entry or header.
  Collapse/hide/project/view changes keep the range during the page; reload
  starts at 20. No new persistence beyond disposable size preference is needed.

Relevant Accepted decisions are [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(Accepted; no successor/conflict). Session North Star owns the shared read;
UX/UI North Star owns navigation, accessibility and resize. No new product-wide
architectural decision or temporary topic is needed.

## Premises observed during preparation

Checkout: this worktree, revision `b01320a4d273aafaa09672d2fca374ad0fa480d2`,
2026-10-28 Singapore time. Isolated built-preview fixtures use synthetic hosts
and GitHub. After `npm ci --ignore-scripts`, this exited 0:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/recently-done-progressive-navigation-cursor.spec.ts dashboard/tests/cursor-sessions-sidebar-resize-lasting.spec.ts --workers=1
```

Cursor navigation reveals Board entry 27 across projects; resize proves
two-list size/floor/persistence. Discrimination restored byte-for-byte for
`range.demand(going.to)` → `0` and `prefer(sizeWithin(...))` → `void height`.
First setup needed local `node_modules`; color env vars refuse the suite until
cleared. Completion ordering, three-list room and sidebar paging remain below.
No paid or developer-only probe.

## Ordered slices

### 1. One owner for the sidebar's available room
Type: Structure
Status: done
Proof: Existing Running Cursor resize, persistence and short-window journeys
remain green through the real rendered page.

Change the current two-list room calculation into one calculation for the
sidebar's visible lists, headers, usable floors and preferred sizes. Preserve
the existing two-list result, browser preference and keyboard/pointer divider
behavior. This immediately enables slice 2's additional list; introduce no
general docking framework or unrelated Side panel changes.

Focused verification: `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard --
dashboard/tests/cursor-sessions-sidebar-resize --workers=1`.

Accepted proof:
```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/cursor-sessions-sidebar-resize --workers=1 --reporter=list
```
Observations: `expectSplit`, divider aria values, floors, outer-sidebar scroll
fallback, independent list scroll, preferred split. Also
`cursor-sessions-sidebar-size-kept`/`unkept`, `side-panel-width.spec.ts`.
Consumer-trace base `e236cb72f891bf63ebbf764e606b0feef52dee8f`. Learning: join
a third preferred list through `sharesOfRoom` and header/list CSS tracks; no
second two-list allocator.

### 2. Find and open the newest completed sessions
Type: Behavior
Status: done
Proof: A new `recently-done-sessions-sidebar.spec.ts` browser journey starts
with interleaved launch/completion times across three configured projects,
expands the new section from the third project, observes completion order and
ages, and opens a session in another project through its actual destination.

Behavior: expanding shows only Done entries up to the newest 20; loading/empty
stay distinct; clock advances completion ages; room shared with Running Cursor
and open sessions; disclosure/range page-lasting, size across reload; reload
starts collapsed. Extend for age, active-story Done, unattached, keyboard/touch,
host destination deltas, reopen success/failure. One three-list room journey
owns expand/resize/scroll/short-window/reload. Update
`dashboard/AGENT-LAUNCH-HISTORY.md`. Interim: only newest 20 until slice 3.

Accepted proof (G1–G3 closed; 24 passed): recently-done-sessions-sidebar*.spec.ts
plus cursor-sessions-sidebar-resize/layout/navigation/size-* and
sessions-sidebar*.spec.ts (`--workers=1 --reporter=list`). Learning: room owner
`sessionsSidebarHeights.ts`; optional sections extracted.

### 3. Reach older sessions without losing the browsing position
Type: Behavior
Status: done
Proof: `recently-done-sessions-sidebar-paging.spec.ts` observes 45 retained
sessions as 20→40→45, older cross-project open, refresh admit/remove with
stable identity and usable focus, and completion-tie order.
`recently-done-sessions-sidebar-paging-board.spec.ts` proves Board detail reads
stay isolated.

Accepted proof (G4–G5 closed; paging + board isolation; full recently-done suite
12 passed earlier):
```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- \
  dashboard/tests/recently-done-sessions-sidebar-paging.spec.ts \
  dashboard/tests/recently-done-sessions-sidebar-paging-board.spec.ts \
  --workers=1 --reporter=list
```
Learning: one batch per end-reach needs leave/re-enter arming so continuous
end-scroll still exposes the 20→40 step.

Behavior: end reveals up to 20 more while earlier entries stay usable;
end-of-history inert; collapse/hide/project keep range; only this list's
scrolling extends it; refresh reconciles by identity/completion retaining
reached older sessions; removed focus recovers nearby or to header; reload
restores initial range. Exercise delayed first read and failed refresh (no
invented empty). Update the maintained history contract.

## Promise ownership and verification

| Source promise | Owner and observing boundary |
| --- | --- |
| Collapsed default; expansion, resize, scroll; panels coexist | Slice 1 sizing; slice 2 three lists, short window, keyboard/touch, reload |
| All projects/hosts/workflows, saved Done, completion order and age | Slice 2 list/time; slice 3 equal-time order and refresh |
| Initial 20, fewer, empty and reading | Slice 2 entry count and read/empty states |
| Reach all 45, no duplicates/skips, inert final scroll | Slice 3 scroll/refresh journey |
| Cross-project open, older Board destination, narrow focus, reopen | Slice 2 PageFrame/side panel; slice 3 older selection; navigation discrimination |
| Preserve Board history, session semantics, open-list, retention | Shared read/store/navigation; existing history/session/resize regressions |

Consumer trace: sidebar list counts/text, `SessionsButton` attention, row
ages/details, divider dimensions, keyboard order, PageFrame overlay/focus,
Board reveal. Inspect `sessionsSidebarPage.ts`, `runningCursorSessionsPage.ts`,
`cursorSessionsSidebarResizePage.ts`, `sessionNavigationJourney.ts` and callers.
Execution runs installed consumer-trace for the actual diff. Focused checks:
`env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- <paths> --workers=1`.
Follow [the test strategy](../../../dashboard/tests/README.md). Pre-commit:
staged lint and dashboard typecheck; independent post-change refactor before
accepting proof and committing each slice.

## Boundedness and readiness review

No numeric slice time limit was supplied. Slice 1 preserves layout; slice 2 adds
the entry point and coexistence; slice 3 extends reachable history. Cumulatively:
one room owner, one session store, one navigation journey, one sidebar
history-range rule. Every source promise has an owning slice and observable
proof. Readiness is recorded by the product-backlog recorder, separately from
execution authority.

## Story obligations

### G1. Done entry touch/Session details omit observed completion identity
Reported: slice 2 — "Touch disclosure for Done rows not in the new journey (desktop tooltip asserted; coarse path still existing sessions-sidebar-touch)."
Story clause: "The completion age must be distinguishable from launch age, including its accessible description."
Disposition: proved by slice 2: dashboard/tests/recently-done-sessions-sidebar-touch.spec.ts "Session details identifies completion, not launch age"

### G2. Final-report destination from Recently done unobserved
Reported: slice 2 — "Final-report host delta not separately journeyed (Claude terminal + unavailable + Cursor reopen covered)."
Story clause: "Opening chooses the session's project and its available terminal, final report, or existing unavailable-session destination."
Disposition: proved by slice 2: dashboard/tests/recently-done-sessions-sidebar-navigation.spec.ts "opening a Done entry whose destination is a final report reaches Final report"

### G3. Older Board reveal and narrow focus-return from Recently done unobserved
Reported: slice 2 — "cross-project open and Cursor reopen are observed; choosing a Done session beyond the project's initially shown Board entries from this sidebar, and narrow-screen focus return after the side panel closes when reopen removed the Done row, lack current observations at this entry point."
Story clause: "An old Done session is beyond its project's initially shown Board entries. Choosing it from this sidebar switches projects and uses the existing reveal journey. On a narrow screen the sidebar closes; focus returns to a useful control when the session's side panel closes, including when reopening has removed the Done row."
Disposition: proved by slice 2: dashboard/tests/recently-done-sessions-sidebar-navigation.spec.ts "choosing a Done session beyond Board's first ten from Pygardon reveals its Board entry"; dashboard/tests/recently-done-sessions-sidebar-reopen.spec.ts "on a narrow window, closing the panel after a successful reopen returns focus to Sessions"

### G4. Scrolling beyond the newest 20 Done sessions
Reported: slice 2 — "Slice 3 still owns older-than-20 paging. Interim: only the newest 20 can be reached in this section."
Story clause: "With 45 done sessions, the first load contains the newest 20. Scrolling to the end loads older sessions in completion order, allowing the developer to reach all 45 without duplicate or skipped entries."
Disposition: proved by slice 3: dashboard/tests/recently-done-sessions-sidebar-paging.spec.ts "scrolling Recently done reaches all 45 retained sessions and refresh keeps the reached older range"

### G5. Refresh reconcile after a reached range beyond 20
Reported: slice 2 — "paging and post-reveal refresh reconcile remain with slice 3."
Story clause: "After revealing 40 sessions, a newly marked-done session arrives on refresh: it appears in completion order without duplicating identities or losing the older entries already reached."
Disposition: proved by slice 3: dashboard/tests/recently-done-sessions-sidebar-paging.spec.ts refresh step; dashboard/tests/recently-done-sessions-sidebar-paging-board.spec.ts Board isolation

## Execution complete

Product advice: no change
