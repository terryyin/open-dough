---
id: SEED-102
status: active
planted: 2026-10-05
planted_during: Terry's request to make the Review changes panel compact and full-height
trigger_when: A developer reviews story changes and needs more space for file navigation and the code diff
scope: unestimated
---

# SEED-102: Review changes UI improvement

## Why This Matters

A developer reviewing a story needs the panel's available height for navigating
changed files and reading code. Compact context and independent scrolling let
them move through a large review without losing their place or repeatedly
scrolling past basic information.

## Story

<a id="full-height-review-changes"></a>

### Review changes in a full-height panel with compact context and independent file navigation

**Identity:** SEED-102#full-height-review-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer using the dashboard's Review changes panel can use its
full available height to browse changed files and read the diff, with the
review context always visible in a compact line and each pane scrolling
independently.

**Scope:**

- Make Review changes a dedicated full-height view within the panel.
- Collapse the basic information, including baseline, worktree, and branch,
  into one compact line fixed at the top. It may share the existing top toolbar
  or use its own toolbar; settle that layout during refinement.
- Make the folder/file browser a full-height sidebar beneath the fixed top
  area. Its vertical scroll is independent of the code review pane's scroll.
- Apply general UX/UI polish to the review, using familiar code review tools
  as design references. Refine the specific improvements around file navigation,
  reading the diff, and the compact toolbar.

**Key examples:**

- Opening Review changes fills the panel's available height, with basic context
  shown as one compact line at the top and the file browser beside the diff.
- With enough changed files to overflow the sidebar, scrolling its folders and
  files leaves the code pane at its current position and keeps the top context
  visible.
- With a long file diff, scrolling the code pane leaves the file browser at its
  current position and keeps the top context visible.
- Baseline, worktree, and branch remain understandable in the compact header;
  refinement decides how long values stay accessible within the single line.

**Refinement input:** Borrow useful patterns from common code review tools,
including GitHub's changed-files review and IntelliJ's diff review. The exact
toolbar arrangement and additional UI polish remain to be refined; this record
captures the requested outcome rather than an executable implementation plan.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard story review](../../dashboard/AGENT-LAUNCH-REVIEW.md).
- [Other story review capabilities](SEED-088-dashboard-story-code-review.md).
- Terry's 2026-10-05 request: capture this UI improvement as the highest-priority
  queued story; use a full-height panel, fixed compact single-line basic context,
  and a full-height folder/file sidebar with independent vertical scrolling;
  include general review UX/UI design improvements inspired by common tools.
