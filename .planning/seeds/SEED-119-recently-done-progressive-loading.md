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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reviewing completed work in the dashboard or
locating a done session through the Sessions sidebar.

**Goal:** Recently done initially shows only the latest 10 items, reveals
older items as the developer scrolls down, and loads hidden items' detailed
content only when needed. The developer can reach an older sidebar-selected
item and return the extended list to its initial size.

**Scope:**

- Initially show the latest 10 Recently done list items, or all items when
  fewer than 10 exist, preserving the existing ordering and grouping.
- Scrolling down reveals additional older items in that order until the list
  is exhausted. Select the reveal increment and scroll trigger in refinement.
- Hidden items' detailed content is not loaded until needed for their reveal
  or a navigation request. This includes deferring underlying detail reads,
  rather than eagerly loading every item and merely hiding its rendered card.
  Minimal identity and ordering information may be read to find an item.
- When a Sessions sidebar selection synchronizes the dashboard to a done
  item outside the shown range, load and reveal all list items through the
  target, then bring that item into view. Preserve the existing selection
  behavior, including revealing the Recently done column when it is hidden.
- Offer an explicit option or button on the extended list to collapse it back
  to only the latest 10 items. Older items remain available through scrolling
  or sidebar selection after collapsing; collapse does not remove done records.

**Key examples / evaluation:**

1. There are 35 done items. Opening Recently done shows items 1–10, newest
   first. Detailed content for items 11–35 has not been read. With six items,
   all six are shown and the list has no further items to reveal.
2. The developer scrolls down past the initially shown items. Older entries
   appear in order and their needed details are loaded as they are revealed;
   entries beyond the revealed range still have no detail reads. Continued
   scrolling can reach item 35 without duplicates or omissions.
3. Only items 1–10 are shown. The developer selects a session belonging to
   item 27 in the Sessions sidebar. The list loads and reveals items 1–27,
   including the intervening items, and brings item 27 into view. Items 28–35
   remain hidden with their details unread. Selecting an already shown item
   does not require extending the list.
4. After scrolling or sidebar selection extends the list, the developer uses
   the collapse control. Only items 1–10 remain shown. Scrolling down or
   selecting item 27 can extend it again. Previously read details may be
   reused, while still-unneeded details are not requested.

Evaluate both visible behavior and actual detail reads across initial display,
scroll reveal, sidebar synchronization, and collapse; card visibility alone
does not prove deferred loading.

**Open questions for refinement:** Reveal increment and trigger, collapse
control placement and focus/scroll behavior, and how an extended range behaves
after refresh or project switching.

**Boundary:** This story changes the Recently done list's shown range and
detail demand. Reconcile with the existing
[column reveal and count correction](SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction)
and [shown-column height story](SEED-106-dashboard-paged-columns.md#paged-columns-height-follows-shown).
Shared navigation and reading code does not establish a blocking prerequisite.

## Breadcrumbs

- Terry's 2026-10-07 instruction to capture this story at the top of the
  product backlog, directly on main and synchronized with origin.
- [Dashboard reading and navigation](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
