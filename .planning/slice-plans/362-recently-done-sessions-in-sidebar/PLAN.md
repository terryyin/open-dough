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
- Change the sidebar's existing room owner (`runningCursorHeight.ts`,
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

Checkout: `/Users/terryyin/git/open-dough/.worktrees/browse-recently-done-sessions-across-projects-in`,
revision `b01320a4d273aafaa09672d2fca374ad0fa480d2`, 2026-10-28 Singapore time.

The isolated built-preview fixtures use synthetic native hosts and GitHub;
they neither launch real agent work nor modify production session records.
After installing this checkout's dependencies with `npm ci --ignore-scripts`,
the following command exited 0:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/recently-done-progressive-navigation-cursor.spec.ts dashboard/tests/cursor-sessions-sidebar-resize-lasting.spec.ts --workers=1
```

- The Cursor navigation setup writes a retained Done record, reads it through
  the real session boundary, chooses it from another project, and observes
  Board entry 27 revealed only once required published detail arrives. Closing
  returns focus to its entry. Its held terminal deliberately prevents native
  reopen, so this observation does not prove reopen behavior.
- The two resize journeys observe changed sizes, short/zoomed-window reachable
  controls, recovery of the preference, and persistence across collapse,
  project/view changes and sidebar hiding. They prove the existing two-list
  behavior, not the new three-list behavior.
- Discrimination: temporarily replacing `range.demand(going.to)` with `0` in
  `sessionNavigation.ts`, then running only the navigation spec with the same
  command prefix and `--workers=1`, exited 1 at line 137: the requested older
  Board entry never appeared. Source was restored byte-for-byte.
- Discrimination: temporarily replacing the `prefer(sizeWithin(...))` call in
  `runningCursorHeight.ts` with `void height`, then running only the resize
  lasting spec, exited 1 in both journeys: measured sizes stayed at the equal
  share instead of the selected height. Source was restored byte-for-byte.
- Initial setup lacked a local `node_modules` directory; another attempt was
  refused solely by the suite's strict output rule for conflicting color
  environment variables. The successful command above resolves both setup
  issues without changing product code or weakening the suite.

The new completion ordering, three-list room allocation and sidebar paging
are implementation obligations below; no current test is claimed to prove
them. No paid, credentialed or developer-only probe is required.

## Ordered slices

### 1. One owner for the sidebar's available room
Type: Structure
Status: planned
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

### 2. Find and open the newest completed sessions
Type: Behavior
Status: planned
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
Start new promised journeys red before implementing their behavior. Follow
[the test strategy](../../../dashboard/tests/README.md): one representative
integrated browser journey per cohesive behavior, focused boundary variants,
synthetic hosts, no sleeps and no leaked processes. The repository pre-commit
hook requires staged lint and dashboard typecheck for script changes; perform
the execution workflow's independent post-change refactor before accepting
proof and committing each slice. Hosted CI retains its existing role; its
configuration does not require unrelated full-suite local runs here.

## Boundedness and readiness review

No numeric slice time limit was supplied. Slice 1 is one preserved-layout
proof loop; slice 2 adds the requested entry point and its required coexistence;
slice 3 extends its reachable history with one range/refresh rule. Sizing
includes implementation, affected proof and cleanup. If the three-list room
model proves unsuitable, revise the same plan before extending it; do not add
per-panel exceptions. Cumulatively there is one room owner, one session store,
one navigation journey and one sidebar history-range rule.

Slice-plan refinement was not needed: the necessary Structure sits immediately
before its consuming Behavior, and every source promise has an owning slice
and observable proof. This review identified no remaining blocking concern.
The initial-load interpretation is recorded above; it is not a server-side
performance claim. Readiness is recorded by the product-backlog recorder,
separately from execution authority.
