---
id: SEED-213
status: active
planted: 2026-11-01
planted_during: Terry Yin's request to renovate the Intent sidebar
scope: story
---

# Renovate the Intent sidebar

<a id="renovate-intent-sidebar"></a>

### Renovate the Intent sidebar with expandable group panels

**Identity:** SEED-213#renovate-intent-sidebar

**Beneficiary:** A developer browsing a project's configured Intent groups and
their file lists in the dashboard.

**Goal:** Make the Intent sidebar easier to scan and navigate by presenting
each configured Intent group as a panel, similar to the panels in the Sessions
sidebar, with at most one group expanded at a time.

**Requested behavior:**

- Each configured Intent group has its own recognizable panel and expandable
  file list, following the existing Sessions sidebar panel presentation.
- Expanding a group automatically collapses the currently expanded group.
- The developer can collapse the expanded group, leaving all groups closed.
- Files in the expanded group remain selectable for reading their Intent.

**Examples:**

- With group A expanded, expanding group B closes A and shows B's file list.
- With group B expanded, collapsing B leaves no group expanded.
- Selecting a file in an expanded group opens that file in the Intent reader.

**Open refinement detail:** Choose the initial expanded group, if any, and
whether expansion is remembered when returning to the Intent perspective.

**Priority:** Terry requested this item at the top of the product backlog on
2026-11-01. Capture the request now; implementation awaits selection.

**References:**

- [Current Intent group browser](../../dashboard/src/IntentBrowser.tsx).
- [Current group file tree](../../dashboard/src/IntentLocationTree.tsx).
- [Existing Sessions sidebar panels](../../dashboard/src/SessionsSidebar.tsx).
