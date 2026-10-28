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

Relevant Accepted decisions are [ADR 0008 — Project dashboard domain and
architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
The ADR index and these records agree on Accepted status; no successor or
conflict was found. The existing [session North Star](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
already owns the shared read and machine-local distinction. The
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#meaning-and-terminology)
owns existing navigation, accessibility and resize direction. No new
product-wide architectural decision or temporary topic is needed.

## Premises observed during preparation

Checkout: this worktree, revision `b01320a4d273aafaa09672d2fca374ad0fa480d2`,
2026-10-28 Singapore time. Isolated built-preview fixtures use synthetic hosts
and GitHub; they neither launch real agent work nor modify production records.
After `npm ci --ignore-scripts`, this exited 0:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/recently-done-progressive-navigation-cursor.spec.ts dashboard/tests/cursor-sessions-sidebar-resize-lasting.spec.ts --workers=1
```

- Cursor navigation: retained Done chosen from another project reveals Board
  entry 27 once published detail arrives; focus returns; held terminal blocks
  reopen proof.
- Resize journeys prove existing two-list size/floor/persistence, not three-list.
- Discrimination: `range.demand(going.to)` → `0` in `sessionNavigation.ts`
  fails the navigation spec at the older Board entry; restored byte-for-byte.
- Discrimination: `prefer(sizeWithin(...))` → `void height` in the room owner
  fails both lasting resize journeys; restored byte-for-byte.
- First setup needed local `node_modules`; color env vars also refuse the suite
  until the command above clears them.

Completion ordering, three-list room and sidebar paging remain implementation
obligations below. No paid or developer-only probe.

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
dashboard/tests/cursor-sessions-sidebar-resize --workers=1`. This selects the
resize family, including lasting, reload and former-height cases. Inspect and
retain their existing promises when adapting helpers; never revise expected
behavior merely to accommodate new structure. Reconcile any other consumers
the execution consumer trace reaches.

Accepted proof (implementation + reuse after refactor):
```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/cursor-sessions-sidebar-resize --workers=1 --reporter=list
```
Observations: `expectSplit`, divider `aria-valuemin`/`max`/`now`, floors at
bounds, disabled divider and outer-sidebar scroll when floors cannot fit,
independent list scroll, preferred split restored. Additional consumers run:
`cursor-sessions-sidebar-size-kept`, `cursor-sessions-sidebar-size-unkept`,
`side-panel-width.spec.ts` (all pass). Consumer-trace base
`e236cb72f891bf63ebbf764e606b0feef52dee8f`.

Learning for remaining slices: join a third preferred-capable list through the
same `sharesOfRoom` call and even header / odd list CSS tracks with
`sessions-sidebar-section-header`; do not add a second two-list allocator.
File/hook names still say Running Cursor until slice 2 widens the API.

### 2. Find and open the newest completed sessions
Type: Behavior
Status: done
Proof: A new `recently-done-sessions-sidebar.spec.ts` browser journey starts
with interleaved launch/completion times across three configured projects,
expands the new section from the third project, observes completion order and
ages, and opens a session in another project through its actual destination.

Behavior: With retained Done and open sessions, expanding the new section
shows only Done entries, up to the newest 20, across hosts and workflows.
Its loading/empty states remain distinct; fewer than 20 shows all. The clock
advances the completion ages. The new section shares the room owner with
Running Cursor and open sessions, supports independent scroll and bounded
resize, and keeps disclosure/range within the page and size across reload.
Reload starts collapsed. Both sections can remain open in narrow/short views;
keyboard and touch retain usable navigation and focus return.

Extend the representative journey for completion age versus launch age,
active-story Done sessions, unattached sessions, and the matching new section's
keyboard/touch details. Reuse existing synthetic host boundaries and add only
host-specific navigation deltas needed for terminal, final-report and
unavailable destinations. A successful reopen removes the Done row through
the existing state change; a failed reopen retains existing feedback and
membership. No native adapter is replaced or presumed newly verified.

One three-list interaction journey owns expand/collapse, drag/key resize,
independent scrolling, short-window fallback, and reload preference. Assert
the old open-list launch-age behavior remains unchanged. Update maintained
`dashboard/AGENT-LAUNCH-HISTORY.md` and the relevant UX/UI direction with this
behavior in the same slice.

Interim behavior: only the newest 20 can be reached in this section; slice 3
adds access to older sessions. Existing project history remains available.

Accepted proof (after G1–G3 closure and post-change refactor; 24 passed):
```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- \
  dashboard/tests/recently-done-sessions-sidebar.spec.ts \
  dashboard/tests/recently-done-sessions-sidebar-room.spec.ts \
  dashboard/tests/recently-done-sessions-sidebar-reopen.spec.ts \
  dashboard/tests/recently-done-sessions-sidebar-navigation.spec.ts \
  dashboard/tests/recently-done-sessions-sidebar-touch.spec.ts \
  dashboard/tests/cursor-sessions-sidebar-resize \
  dashboard/tests/cursor-sessions-sidebar-layout.spec.ts \
  dashboard/tests/cursor-sessions-sidebar-navigation.spec.ts \
  dashboard/tests/cursor-sessions-sidebar-size-kept.spec.ts \
  dashboard/tests/cursor-sessions-sidebar-size-unkept.spec.ts \
  dashboard/tests/sessions-sidebar.spec.ts \
  dashboard/tests/sessions-sidebar-row.spec.ts \
  --workers=1 --reporter=list
```
Learning: room owner renamed to `sessionsSidebarHeights.ts`; optional sections
extracted to `SessionsSidebarOptionalSections.tsx`. Paging remains slice 3
(G4–G5 interim).

### 3. Reach older sessions without losing the browsing position
Type: Behavior
Status: planned
Proof: A new `recently-done-sessions-sidebar-paging.spec.ts` journey observes
45 retained sessions as 20, then 40, then 45 after scrolling this section.
It opens an older cross-project session, refreshes with a new completion and
one removed record, and observes stable identity, usable focus and no skipped
or duplicate entries. Completion ties exercise stable ordering.

Behavior: Reaching the list end reveals up to 20 more older sessions while
earlier entries remain usable. End-of-history does nothing; collapse, sidebar
hiding or project changes do not reset the reached range. Only the new list's
scrolling extends its range; scrolling the other lists does not. A refresh
reconciles by identity and completion order, retaining older sessions already
reached while admitting new completions. Reopen/delete/retention removal does
not leave a dead focused control. Reload restores the initial range.

Exercise delayed first session reads and a failed refresh using the existing
read semantics: no invented empty result, no separate polling or pagination
service. Verify that scrolling this section does not eagerly read older
published Board done-story details. Update the maintained history contract.

## Promise ownership and verification

| Source promise | Owner and observing boundary |
| --- | --- |
| Collapsed default; same expansion, resize and scroll access; panels coexist | Slice 1 preserves existing sizing; slice 2 observes all three lists, short window, keyboard/touch and reload |
| All configured projects/hosts/workflows, saved Done only, completion order and age | Slice 2 page list and ticking time; slice 3 equal-time order and refresh |
| Initial 20, fewer, empty and reading | Slice 2 visible entry count and distinct read/empty states |
| Reach all 45, retain usable shown entries, no duplicates/skips, final scroll is inert | Slice 3 scroll/refresh journey, exact identities and focus |
| Existing cross-project session opening, older Board destination, narrow-screen focus, reopen effects | Slice 2 new entry through PageFrame and side panel; slice 3 older-entry selection; existing navigation discrimination above |
| Preserve Board history, session semantics, open-list behavior and retention | Same shared read/store and navigation; affected existing history, session and resize regressions, with no new retention logic |

Consumer trace: sidebar changes reach the enclosing sidebar list counts/text,
`SessionsButton` attention counts, row ages/details, divider dimensions and
keyboard order, PageFrame overlay/focus, and Board reveal. Inspect
`sessionsSidebarPage.ts`, `runningCursorSessionsPage.ts`,
`cursorSessionsSidebarResizePage.ts`, `sessionNavigationJourney.ts` and their
calling specs. Scope helpers to the intended list where a formerly sole list
becomes one of several; preserve whole-sidebar assertions that intentionally
observe all sessions. Execution runs its installed consumer-trace command for
the actual diff and supplies dispositions for all affected consumers.

Run new sidebar specs plus affected sidebar/resize/navigation consumers with
`env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- <paths> --workers=1`.
Start promised journeys red before implementing. Follow
[the test strategy](../../../dashboard/tests/README.md): one representative
integrated journey per cohesive behavior, focused variants, synthetic hosts,
no sleeps or leaked processes. Pre-commit requires staged lint and dashboard
typecheck for script changes; run independent post-change refactor before
accepting proof and committing each slice. Hosted CI keeps its existing role.

## Boundedness and readiness review

No numeric slice time limit was supplied. Slice 1 preserves layout; slice 2 adds
the entry point and coexistence; slice 3 extends reachable history. Sizing
includes implementation, affected proof and cleanup. If the three-list room
model proves unsuitable, revise this plan before extending it. Cumulatively:
one room owner, one session store, one navigation journey, one sidebar
history-range rule. Slice-plan refinement was not needed; every source promise
has an owning slice and observable proof. The initial-load interpretation above
is not a server-side performance claim. Readiness is recorded by the
product-backlog recorder, separately from execution authority.

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
Disposition: interim until slices 3

### G5. Refresh reconcile after a reached range beyond 20
Reported: slice 2 — "paging and post-reveal refresh reconcile remain with slice 3."
Story clause: "After revealing 40 sessions, a newly marked-done session arrives on refresh: it appears in completion order without duplicating identities or losing the older entries already reached."
Disposition: interim until slices 3
