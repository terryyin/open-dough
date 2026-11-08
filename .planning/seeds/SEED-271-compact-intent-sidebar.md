---
id: SEED-271
status: active
planted: 2026-11-08
scope: story
---

# Make the Intent sidebar easier to scan and hide

<a id="compact-intent-sidebar"></a>

### Make the Intent sidebar easier to scan and hide

**Identity:** SEED-271#compact-intent-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer reviewing a story in Intent can quickly spot the top-level
entries, give the reading pane more room, and see at a glance how many changed
files fall outside Intent locations.

**Examples.**

- With the sidebar open, each top-level Intent entry has a colored header that
  reaches both edges of the sidebar. The label and toggle are padded inside the
  color block, and the bold label distinguishes the header from folders and
  files below it.
- A toggle in the bar with **Intent** and **Optimization Candidates** hides or
  shows the locations and file tree. While the sidebar is hidden, the reading
  pane uses the freed space. Only the selected story's title appears in the
  remaining space at the trailing end of the bar, on a single line with the
  full title available on hover if it is truncated. The detailed story summary
  returns above the tree when the sidebar reopens, with the developer's
  selection and tree expansion preserved.
- If two changed files fall outside Intent locations, the story summary shows
  an icon and `2` in place of the repeated explanation. The indicator has an
  accessible label that explains the count and opens **Review changes** for the
  same comparison. When the count is zero, the indicator is absent.

The [Development and Intent guidance](../../docs/dashboard-development-intent.md)
describes the current location browser and selected-story summary.
