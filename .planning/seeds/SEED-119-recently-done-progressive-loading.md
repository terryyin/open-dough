---
id: SEED-119
status: active
planted: 2026-10-07
planted_during: Terry's request to limit Recently done to the latest 10 items and reveal older items on demand
trigger_when: A developer reads a long Recently done list or an existing journey, such as Mark as done, lands on an older done entry
scope: story
---

# SEED-119: Recently done progressive loading

## Why This Matters

A developer following completed work needs a short initial Recently done list
without losing access to older items. Hiding older cards alone does not save
the cost of reading their detailed content. An existing journey that lands on
a done entry, such as marking a session done, must still reach it even when it
lies outside the initial list.

## Story

<a id="recently-done-progressive-loading"></a>

### Show the latest 10 done items and reveal older items on demand

**Identity:** SEED-119#recently-done-progressive-loading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/274-recently-done-progressive-loading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f521f4ef0c72ce0e589523cf5ac6d7d0c2bf0a6a55dfee7efc778ba878af2291","plan":"cd6695454b7ca730af94365683e4e26bc5eca0054237368f459a1ac45c14e59d"}}
```

**Beneficiary:** A developer reviewing completed work in the dashboard or
following a session they marked done into Recently done.

**Goal:** Recently done initially shows only the latest 10 items, reveals
older items when the developer explicitly asks, and reads their detailed
content only when demanded. An existing journey whose destination is an older
done entry still reaches it, and the developer can return to a short list
without losing records or session access. This keeps completed work easy to
scan while avoiding unnecessary detail reads.

**Scope:**

- Initially show the latest 10 top-level Recently done entries, or all entries
  when fewer than 10 exist. Preserve the existing combined ordering: published
  stories by completion time and standalone saved Done sessions by launch
  time, newest first. A story card counts once regardless of its nested
  sessions; a standalone session counts once. Preserve existing grouping,
  retention, tie ordering, and recovery access.
- One explicit, keyboard-accessible reveal action after the shown entries
  requests the next 10 entries, or the remaining entries when fewer exist,
  and names how many older entries remain. It is the only reveal trigger:
  initial display, scrolling, resize, horizontal column paging, and collapse
  never request another batch, so reading another column on the same
  page-scrolled row reads nothing from Recently done.
- Hidden items' detailed content is not loaded until needed for their reveal
  or a navigation request. Defer underlying content reads, rather than
  eagerly reading everything and hiding rendered cards. Minimal identity,
  ordering, retention, and grouping metadata may cover the eligible list;
  fetching every full done-record body is not that lightweight metadata read.
  Existing cross-project Sessions sidebar observation keeps its own demand;
  this story does not suppress reads it independently needs.
- Sessions sidebar membership is unchanged: it keeps listing open sessions
  only. When an existing journey's destination is a done entry outside the
  shown range, load and reveal every intervening entry through the target,
  then bring the target session entry or containing done card into view.
  Those journeys are the ones the dashboard already has: Mark as done
  returning the keyboard to the session's entry in its new home, closing a
  terminal or report returning to its session there, and any sidebar choice
  that resolves to a done entry, such as a Running Cursor sessions row the
  runner still holds. Extend exactly through the target, without rounding up
  to another batch or shrinking an already longer range. Preserve existing
  project switching, column reveal, selection, terminal/report opening,
  focus, and reduced-motion behavior. A later journey can reveal the same
  target again; completion of an earlier one cannot pull the developer back
  after they move elsewhere or collapse the list.
- Whenever more than 10 entries are shown, offer an explicit **Show latest
  10** action that is reachable without traversing the entire extended tail.
  Collapse returns the Recently done heading to view and retains keyboard
  focus on the invoking action if it remains available, otherwise at the
  start of Recently done. It supersedes pending extension/navigation demand
  so a late answer cannot reopen the tail. It does not remove records, change
  session state, or close an open terminal/report. A fresh reveal action or a
  journey landing on a hidden done entry can extend the list again.
- Keep the requested shown range during refresh of the same project, capped
  by the eligible entries now available. Apply current ordering and grouping;
  extend when necessary to keep a still-present focused entry or selected
  journey destination included until the developer moves elsewhere or explicitly
  collapses. Ordinary refresh retains scroll within the new page extent and
  preserves useful focus if the focused entry disappears. Page reload and
  project switching start at 10; a journey into that project whose
  destination is a done entry takes precedence and reveals its target.
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

**Deferred promises:** Scroll-triggered reveal, listing saved Done sessions in
the Sessions sidebar, remembering an expanded range across reloads or project
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
2. With entries 1–10 shown, the developer invokes the reveal action, which
   says 25 older entries remain → entries 11–20 are read and appended in
   order without moving focus off the invoking action or moving the entries
   already being read. Further reveals reach 30, then 35. The final reveal
   adds five entries and communicates exhaustion. No duplicate or omitted
   entry appears, and no detail beyond the demanded range is read. Scrolling
   the page to the end of the shown entries, with all three columns shown or
   with Recently done hidden, reads nothing and extends nothing.
3. Only items 1–10 are shown. A standalone session launched twelve days ago
   is open in Taken; the developer marks it done from its entry → it becomes
   item 27 of Recently done by its launch time, the list loads and reveals
   items 1–27, including the intervening items, and keyboard focus and view
   land on item 27. Items 28–35 remain hidden with their details unread. The
   same holds when Mark as done is used in the terminal or report panel and
   the panel closes, and when a sidebar choice resolves to a done entry, such
   as a Running Cursor sessions row the runner still holds, including when
   that choice first switches projects or Recently done's column is hidden.
   A journey landing on an already shown item does not extend the list.
4. After a reveal or a journey extends the list, the developer uses
   **Show latest 10** → only items 1–10 remain shown, the heading is in view,
   and keyboard focus has a retained home. The open terminal/report stays
   open. A pending older read answering afterwards does not re-extend the
   list. The reveal action, or a journey landing on item 27 again, can
   extend it. Previously read details may be reused when valid for the
   project's shown revision; still-unneeded details are not requested.
5. Entries 1–20 are shown → a same-project refresh publishes a newer first
   entry → the current first 20 remain shown in current order, without a
   return to 10 or a focus reset. A still-selected older journey target
   remains included if it still belongs in Recently done. A reload or a
   switch away and back starts with 10; a sidebar choice into that project
   resolving to item 27 still reveals through 27. Sidebar/panel opening and
   column resizing retain the requested range.
6. Entries 1–10 are usable → a requested older read is slow, then fails →
   the list reports loading and the affected failure while retaining the
   first 10 and independent session access. Retry requests the same range;
   its successful answer appends entries once in order. If a journey's
   target is absent from a successfully read eligible list, or cannot be
   read, explain that outcome without selecting an unrelated entry or
   presenting failure as absence. Switching projects or collapsing while
   a read is pending prevents its late answer from changing the new view.

Evaluate visible behavior and actual underlying detail reads through initial
display, explicit reveal, journeys landing on done entries, collapse, and
refresh. Distinguish permitted catalog reads and independent sidebar reads
from entry-detail demand. Card visibility alone does not prove deferred
loading. These examples establish behavior, not an executable slice plan.

**UI:** The user is the developer following the selected project's completed
work, usually right after their own or an agent's session finishes. Their
tasks, in order of frequency: scan what finished lately; confirm that the
session they just marked done reached Recently done with its report still
reachable; occasionally find one older done story or session.

What they see: the heading keeps its exact total entry count, which the
minimal metadata supplies without reading hidden details, so hidden entries
never read as absent. Below the shown entries, one explicit action names the
reveal and how many older entries remain. While a batch reads, that action
says so and the shown entries stay usable; a demanded entry whose details have
not arrived holds its place under its identity so later arrivals do not
reorder what the developer is reading. After the last batch the action gives
way to a statement that every entry is shown. Whenever more than ten entries
are shown, **Show latest 10** stays with the heading, so it is reachable from
the top of the column and from the tab order without passing the tail; its
name says what it shows, and the unchanged total count says nothing was
removed. A read failure names the affected entries and offers retry in place,
so a shorter list never looks complete. Keyboard, browser zoom, narrow
columns, and reduced motion keep every action and message understandable. No
layout, component, or rendering technology is selected. The batch, collapse,
and refresh policies above are draft refinement defaults; the two decisions
below are Terry's.

**Decisions (Terry, 2026-10-07):**

1. **Reaching an older done entry.** Sessions sidebar membership stays as it
   is: its main list excludes saved Done sessions (a built-dashboard
   observation with 35 done cards and a saved Done session inside the oldest
   card confirmed the session has no sidebar entry). Instead, every existing
   journey whose destination is a done entry beyond the shown range reveals
   through it: Mark as done returning the keyboard to the session's entry in
   its new home, closing a terminal or report returning to its session there,
   and a sidebar choice that resolves to a done entry, such as a Running
   Cursor sessions row the runner still holds. A standalone session orders
   by launch time, so a session launched days ago and marked done now lands
   deep in the list; that is the story's primary navigation example. The
   sidebar is the cross-project list of sessions still open, badged by how
   many need the developer; thirty days of done sessions per project would
   bury open ones, while a developer looking for an older done item is
   already in Recently done, where the reveal action serves them.
2. **Reveal trigger.** The explicit action is the only reveal. The page
   scrolls as one, and at 72rem or wider the three columns share a row, so
   scroll-triggered reveal would request batches while the developer reads
   Backlog's tail and **Show latest 10** would mainly undo unwanted growth.
   Scroll-triggered reveal is deferred, not rejected.

**Borrowed mechanism:** An archive reading room suggests separating a finding
aid from the material brought to a reading table. The finding aid maps to
minimal identity/order/grouping metadata, requested bundles to revealed
batches and their details, a catalogue reference to a journey's target, and
clearing the table to **Show latest 10** while preserving the archive. The
adaptation fits the seed's existing short-list and deferred-read goals. Its
limit is consequential: a reference may retrieve one physical file, whereas
this story must reveal every intervening entry through a journey's destination.
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
detail demand. Reconcile with the paged columns' reveal by holding column,
their incomplete entry counts while reading, and the page length that follows
the shown columns ([dashboard README](../../dashboard/README.md)).
Shared navigation and reading code does not establish a blocking prerequisite.
Reconcile failure feedback with
[temporary reading recovery](SEED-118-dashboard-reading-reliability.md#recover-from-temporary-github-failures)
without creating a second retry policy or requiring that story first.

## Breadcrumbs

- Terry's 2026-10-07 instruction to capture this story at the top of the
  product backlog, directly on main and synchronized with origin.
- [Dashboard reading and navigation](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
