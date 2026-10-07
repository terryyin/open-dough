---
id: SEED-119
status: active
planted: 2026-10-07
planted_during: Terry's request to limit Recently done to the latest 10 items and reveal older items on demand
trigger_when: A developer reads a long Recently done list or selects an older done session from the Sessions sidebar
scope: story
---

# SEED-119: Recently done progressive loading

## Why This Matters

A developer following completed work needs a short initial Recently done list
without losing access to older items. Hiding older cards alone does not save
the cost of reading their detailed content. Sidebar navigation must still
reach an older done item even when it lies outside the initial list.

## Story

<a id="recently-done-progressive-loading"></a>

### Show the latest 10 done items and reveal older items on demand

**Identity:** SEED-119#recently-done-progressive-loading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/274-recently-done-progressive-loading/PLAN.md","assessment":"not-ready","reasons":["Slice 5 has no agreed real sidebar trigger: saved Done sessions are excluded today. Terry must choose additional sidebar access or a narrower existing-selection example, then align the seed, navigation slice, and consumer proof."],"basis":{"document":"3e2d96a244e66551411b314d47750ba8aefe139a99de8ea906dba7ccf7fae2f6","plan":"ef07472c66fd0a573f7953ba858cad7b7631df1542e9732bed1efde4e8577c7e"}}
```

**Beneficiary:** A developer reviewing completed work in the dashboard or
locating a done session through the Sessions sidebar.

**Goal:** Recently done initially shows only the latest 10 items, reveals
older items as the developer reads further, and reads their detailed content
only when demanded. The developer can reach an older sidebar-selected item
and return to a short list without losing records or session access. This
keeps completed work easy to scan while avoiding unnecessary detail reads.

**Scope:**

- Initially show the latest 10 top-level Recently done entries, or all entries
  when fewer than 10 exist. Preserve the existing combined ordering: published
  stories by completion time and standalone saved Done sessions by launch
  time, newest first. A story card counts once regardless of its nested
  sessions; a standalone session counts once. Preserve existing grouping,
  retention, tie ordering, and recovery access.
- Downward scrolling to the end of the shown Recently done entries requests
  the next 10 entries, or the remaining entries when fewer exist. The column
  must be shown, and each further batch needs renewed downward scrolling;
  initial display, resize, horizontal column paging, and collapse alone do
  not request another batch. An explicit, keyboard-accessible action offers
  the same reveal for someone who cannot or does not want to scroll.
- Hidden items' detailed content is not loaded until needed for their reveal
  or a navigation request. Defer underlying content reads, rather than
  eagerly reading everything and hiding rendered cards. Minimal identity,
  ordering, retention, and grouping metadata may cover the eligible list;
  fetching every full done-record body is not that lightweight metadata read.
  Existing cross-project Sessions sidebar observation keeps its own demand;
  this story does not suppress reads it independently needs.
- When a Sessions sidebar selection synchronizes the dashboard to a done
  item outside the shown range, load and reveal every intervening entry
  through the target, then bring the target session entry or containing done
  card into view. Extend exactly through the target, without rounding up to
  another batch or shrinking an already longer range. Preserve existing
  project switching, column reveal, selection, terminal/report opening, focus,
  and reduced-motion behavior. A later explicit selection can reveal the
  same target again; completion of an earlier selection cannot pull the
  developer back after they select elsewhere or collapse the list.
- Whenever more than 10 entries are shown, offer an explicit **Show latest
  10** action that is reachable without traversing the entire extended tail.
  Collapse returns the Recently done heading to view and retains keyboard
  focus on the invoking action if it remains available, otherwise at the
  start of Recently done. It supersedes pending extension/navigation demand
  so a late answer cannot reopen the tail. It does not remove records, change
  session state, or close an open terminal/report. A fresh scroll, reveal
  action, or sidebar selection can extend the list again.
- Keep the requested shown range during refresh of the same project, capped
  by the eligible entries now available. Apply current ordering and grouping;
  extend when necessary to keep a still-present focused entry or selected
  navigation target included until the developer moves elsewhere or explicitly
  collapses. Ordinary refresh retains scroll within the new page extent and
  preserves useful focus if the focused entry disappears. Page reload and
  project switching start at 10; explicit sidebar
  navigation into that project takes precedence and reveals its target.
  Opening/closing a sidebar or side panel and changing column width do not
  reset the range.
- Communicate the shown entry count, whether older entries remain, loading,
  and exhaustion without treating hidden entries as absent. Existing heading
  and edge counts retain their common top-level meaning and completeness
  rules; unread evidence is not an exact total or an empty list. Do not fetch
  hidden detail solely to fill a count. Additional reads keep already shown
  entries usable. A failure states the affected read and offers retry of the
  demanded range; it does not silently skip an entry, declare exhaustion, or
  prevent independently available session access. Preserve existing read
  bounds and rate-limit handling.

**Deferred promises:** Remembering an expanded range across reloads or project
switches, access beyond the existing retention windows, searching/filtering
done records, a new automatic retry policy, and shared or persistent caching.
This story adds no prohibition on behavior an existing mechanism naturally
supports. The initial limit bounds detail demand, not the number of retained
done records.

**Key examples / evaluation:**

1. There are 35 eligible top-level entries, including both done stories and
   standalone done sessions. Opening Recently done shows entries 1–10,
   newest first. A story's three nested sessions do not consume three extra
   places. Detailed content for entries 11–35 has not been read, even if the
   displayed boundary initially fits in the viewport. With six entries, all
   six are shown and no older-entry or collapse action is offered; a known
   empty set retains its existing empty state.
2. With entries 1–10 shown, downward scrolling reaches their end, or the
   developer invokes the explicit reveal action → entries 11–20 are read
   and appended in order without moving focus off the invoking action or
   moving the entries already being read. Subsequent downward scrolling or
   explicit reveals reach 30, then 35. The final reveal adds five entries
   and communicates exhaustion. No duplicate or omitted entry appears, and
   no detail beyond the demanded range is read. Scrolling elsewhere while
   Recently done is horizontally hidden does not extend it.
3. Only items 1–10 are shown. The developer selects a session belonging to
   item 27 in the Sessions sidebar. The list loads and reveals items 1–27,
   including the intervening items, and brings item 27 into view. Items 28–35
   remain hidden with their details unread. Selecting an already shown item
   does not extend the list. The same journey reveals Recently done when
   its column is hidden, and works when navigation first switches projects.
4. After scrolling or sidebar selection extends the list, the developer uses
   **Show latest 10** → only items 1–10 remain shown, the heading is in view,
   and keyboard focus has a retained home. The open terminal/report stays
   open. A pending older read answering afterwards does not re-extend the
   list. Scrolling down or explicitly selecting item 27 again can extend it.
   Previously read details may be reused when valid for the project's shown
   revision; still-unneeded details are not requested.
5. Entries 1–20 are shown → a same-project refresh publishes a newer first
   entry → the current first 20 remain shown in current order, without a
   return to 10 or a focus reset. A still-selected older navigation target
   remains included if it still belongs in Recently done. A reload or a
   switch away and back starts with 10; navigating to item 27 through the
   sidebar still reveals through 27. Sidebar/panel opening and column
   resizing retain the requested range.
6. Entries 1–10 are usable → a requested older read is slow, then fails →
   the list reports loading and the affected failure while retaining the
   first 10 and independent session access. Retry requests the same range;
   its successful answer appends entries once in order. If navigation's
   target is absent from a successfully read eligible list, or cannot be
   read, explain that outcome without selecting an unrelated entry or
   presenting failure as absence. Switching projects or collapsing while
   a read is pending prevents its late answer from changing the new view.

Evaluate visible behavior and actual underlying detail reads through initial
display, scroll and explicit reveal, sidebar synchronization, collapse, and
refresh. Distinguish permitted catalog reads and independent sidebar reads
from entry-detail demand. Card visibility alone does not prove deferred
loading. These examples establish behavior, not an executable slice plan.

**UI:** The developer first scans a short recent list, learns that older work
remains available, and requests another batch by reading further or using the
explicit reveal action. Loading and read failures explain what is pending
without replacing already readable content. The collapse action returns to
the short overview without changing the selected session's lifecycle. All
actions and feedback remain understandable with keyboard navigation, browser
zoom, narrow columns, and reduced motion. No new layout, component, or
rendering technology is selected. The batch, collapse, and refresh policies
above are draft refinement defaults, not a separately recorded human decision.

**Open decision found during planning:** The current Sessions sidebar uses
`openSessionsOf`, which excludes every saved Done session; open sessions of
completed stories instead appear in Taken. A built-dashboard observation with
35 done cards and a saved Done session inside the oldest card confirmed that
the session has no sidebar entry. Terry must choose whether this story adds
saved Done session access to the sidebar, or preserves sidebar membership and
applies the reveal rule only when an existing selection resolves to Recently
done. The recommendation is to add that access so the direct older-item
selection example is possible. Until decided, do not change sidebar membership
or claim the navigation slice ready. Keep the understood range/read work and
its plan; align this story's scope and examples with the answer before that
slice proceeds.

**Borrowed mechanism:** An archive reading room suggests separating a finding
aid from the material brought to a reading table. The finding aid maps to
minimal identity/order/grouping metadata, requested bundles to revealed
batches and their details, a catalogue reference to a sidebar target, and
clearing the table to **Show latest 10** while preserving the archive. The
adaptation fits the seed's existing short-list and deferred-read goals. Its
limit is consequential: a reference may retrieve one physical file, whereas
this story must reveal every intervening entry through a navigation target.
The analogy neither proves read savings nor permits a hidden eager read;
the observed requests must establish that result.

**Architecture:** The current reader lists done-record files and reads every
full body before returning the collection
([listed records read](../../dashboard/server/listedRecordsRead.ts),
[done-story read](../../dashboard/src/doneStories.ts)); the directory listing
supplies paths/blob identities but no completion times
([records beside backlog](../../dashboard/server/recordsBesideBacklog.ts)).
The done-record body currently mixes ordering metadata with card facts.
Planning must establish how the minimal catalog supports exact existing
ordering/grouping without eagerly fetching hidden full bodies. Keep details
and valid reuse associated with their published project/revision; do not
substitute local worktree facts or stale facts from another revision. This is
a feature design concern, kept here under
[ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md).
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one cohesive solution with shared navigation/reading work and
requires evidence for a blocking prerequisite. No read protocol, storage
format, or new prerequisite is selected by refinement. Dashboard ADR 0008
remains Proposed, not a binding decision; no Accepted-ADR conflict was found.

**Boundary:** This story changes the Recently done list's shown range and
detail demand. Reconcile with the existing
[column reveal and count correction](SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction)
and [shown-column height story](SEED-106-dashboard-paged-columns.md#paged-columns-height-follows-shown).
Shared navigation and reading code does not establish a blocking prerequisite.
Reconcile failure feedback with
[temporary reading recovery](SEED-118-dashboard-reading-reliability.md#recover-from-temporary-github-failures)
without creating a second retry policy or requiring that story first.

## Breadcrumbs

- Terry's 2026-10-07 instruction to capture this story at the top of the
  product backlog, directly on main and synchronized with origin.
- [Dashboard reading and navigation](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
