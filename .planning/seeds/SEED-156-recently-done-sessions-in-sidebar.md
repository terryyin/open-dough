---
id: SEED-156
status: active
planted: 2026-10-28
planted_during: Maintainer request to capture a top-priority dashboard story
trigger_when: A developer wants to return to a recently completed session across projects
scope: story
---

# SEED-156: Recently done sessions in the sidebar

## Why This Matters

A developer returning to completed work needs to find recent sessions across
projects in one place, without switching through each project's Recently done
column. The sidebar already offers a collapsible Running Cursor sessions panel
whose interaction provides the reference for this new panel.

## Selected Story

<a id="recently-done-sessions-in-sidebar"></a>

### Browse recently done sessions across projects in the sidebar

**Identity:** SEED-156#recently-done-sessions-in-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/362-recently-done-sessions-in-sidebar/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6fe479b597d83904054417b1aae5ce3e86ec82e5bca4e7361a22ad402e38f560","plan":"ada72108546052722b4e53e13fa8cd8721df4deb353f6a0057df2fb2eeacd9a0"}}
```

**Beneficiary:** A developer using the dashboard to revisit recently completed
sessions from any project.

**Goal:** Find and open a recently done session from a single sidebar panel,
with the newest completions first and older sessions available on demand by
scrolling.

**Scope:**

- Add a **Recently done sessions** panel to the Sessions sidebar, collapsed by
  default on page load.
- Follow the existing **Running Cursor sessions** panel's expand/collapse,
  resizing, independent scrolling, and session-opening behavior. Keep access
  usable when the panels share the sidebar.
- List all dashboard sessions marked Done across all projects, independent of
  the currently selected project, newest completion first.
- Show how long ago each session was marked done beside its entry. Use the
  completion time for both ordering and elapsed time.
- Initially load only the newest 20 entries, or all entries when fewer than
  20 exist. Scrolling to the end loads more older entries while keeping the
  entries already shown usable.

Here, loading means progressively revealing entries from the page's existing
shared machine-session read, not changing that read into a paginated API. This
is the preparation's recommended interpretation of the initial-load requirement,
not a new server-performance promise. “All projects” means the dashboard's
configured projects; “all sessions” means their retained dashboard records,
across supported hosts and workflows, including unattached sessions. Existing
Done retention remains 30 days. Native activity, unread reports and published
story membership do not decide inclusion or order.

**UI:** The developer expands Recently done sessions, scans session titles and
completion ages, checks the existing project/host/session details when needed,
and opens an entry through the existing session navigation. The completion age
must be distinguishable from launch age, including its accessible description.
Opening chooses the session's project and its available terminal, final report,
or existing unavailable-session destination. It does not promise to resurrect
a removed workspace; a successful native reopen retains its existing effects
on Done membership.

Both optional sections may be expanded together with the open-session list.
Each expanded list can scroll independently and be resized within usable bounds;
short windows keep all headers and entries reachable. Expansion, loaded range
and chosen sizes survive project/view changes and sidebar hiding within a page.
Reload collapses the new section and starts its range at 20; only its preferred
size survives as a disposable browser preference, following Running Cursor.
Keyboard and touch can expand, scroll, resize and open sessions. Reading and
empty states stay distinguishable; existing read/recovery feedback is reused.

**Key examples / evaluation:**

1. On a fresh page load, the new panel is collapsed. Expanding it exposes the
   recent done sessions with the same panel interactions as Running Cursor
   sessions.
2. Project A has a session marked done two minutes ago, and project B has one
   marked done ten minutes ago. Both appear while project C is selected; A's
   session comes first and their entries show the respective elapsed times.
3. A session launched yesterday but marked done one minute ago appears above
   one launched today but marked done five minutes ago. Its displayed age is
   one minute.
4. With 45 done sessions, the first load contains the newest 20. Scrolling to
   the end loads older sessions in completion order, allowing the developer
   to reach all 45 without duplicate or skipped entries.
5. With fewer than 20 done sessions, show all of them. With none, show an
   empty state; scrolling past the final entry adds nothing.
6. Choosing an entry reaches that session through the existing session
   navigation, including when it belongs to another project.
7. With both optional sections expanded, scrolling or resizing one leaves the
   other lists usable. Collapsing either returns its room; after a short-window
   fallback, enlarging the window restores the preferred usable sizes.
8. After revealing 40 sessions, a newly marked-done session arrives on refresh:
   it appears in completion order without duplicating identities or losing the
   older entries already reached. A reopened/deleted/expired record disappears
   according to existing state. Equal completion times have a stable order.
9. An old Done session is beyond its project's initially shown Board entries.
   Choosing it from this sidebar switches projects and uses the existing reveal
   journey. On a narrow screen the sidebar closes; focus returns to a useful
   control when the session's side panel closes, including when reopening has
   removed the Done row.

**Scope boundary:** This story adds session history access in the sidebar.
Use the existing saved Done state; published story completion and native
session activity retain their existing meanings. The project's Recently done
column keeps its own behavior.

Deferred promises: server-side session pagination, longer retention or permanent
archives, search/filtering, new native host operations, and new session actions.
These are not rejection rules for naturally supported records or navigation.

**Exploration and borrowed mechanism:**

| Candidate | User effect and system consequence | Assessment |
| --- | --- | --- |
| Keep using each project's Recently done column | No new mechanism, but requires project switching and mixes published done stories with local sessions; its ordering and ten-entry paging serve another task. | Simpler existing solution does not meet the selected cross-project outcome. |
| Add Done to the existing open-session list | One list to scroll, but attention-first open work and completion-first history need different ordering, and this loses the requested independent disclosure. | Does not meet the fixed panel behavior. |
| Borrow a recent-documents index: completion event orders a retained session reference, selecting it returns to its existing destination | Gives one cross-project entry point while keeping the session store and navigation authoritative. Adapt “last used” to “marked Done,” and directory/document to project/session. | Recommended within the requested panel. The analogy ends at retention and reopen effects: this is neither an archive nor a promise that the original workspace still exists. |

**Architecture and investigation:**

- [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps machine-local session evidence separate from repository-owned story
  completion, and browser presentation disposable. This adds a derived section
  in the Sessions sidebar, not a new Column, Side panel, completion state or
  persistence authority. No conflict or exception was found.
- [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
  and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  support the existing Session entry vocabulary and one representation of each
  responsibility. The current [session direction](../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
  already supplies the shared read across configured projects.
- Facts: `LaunchRecord.doneAt`, `setRecordDoneAt`, and `withinRetention` retain
  the Done timestamp and its 30-day lifetime. `PageFrame.goToSession` already
  switches project and delegates opening/reveal. `runningCursorHeight.ts` owns
  a two-list room calculation, so copying its formula for a third list would
  create competing claims on the same room.
- Local observation at the preparation revision: the existing browser journey
  opens a held Done Cursor session from another project and reveals Board entry
  27; existing resize journeys preserve the split across page changes and keep
  controls reachable in short windows. Disabling the reveal demand makes that
  navigation journey fail before entry 27; the scratch edit was reverted.
- Hypothesis still to evaluate through implementation proof: a shared bounded
  room calculation can preserve those behaviors with three visible lists.
  This is the new behavior to build and test, not an assumed existing capability.
  The first-20 rendering interpretation above is an explicit design assumption;
  changing it to network pagination requires revisiting the plan.

## Priority and Source

Terry requested this new story at the top of the product backlog on
2026-10-28 and authorized recording it directly on main and syncing with
origin. This request captures queued work; implementation is a later step.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Session history and sidebar navigation](../../dashboard/AGENT-LAUNCH-HISTORY.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
