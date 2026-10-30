---
id: SEED-189
status: active
planted: 2026-10-30
scope: reveal omitted unchanged lines in dashboard review diffs
---

# SEED-189: Expand dashboard diff context

<a id="expand-dashboard-diff-context"></a>

### Load more diff context from the line-number gutter

**Identity:** SEED-189#expand-dashboard-diff-context
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reviewing a story's changed files in the dashboard.

**Goal:** Read the unchanged code surrounding a change without leaving the
review, using load-more controls in the line-number gutter like the GitHub
diff controls shown in Terry's screenshot.

**Scope:** Add directional controls where unchanged lines are omitted before,
between, or after diff hunks. Reveal more preceding or following context next
to the selected boundary, and allow repeated expansion until that gap is
exhausted. Keep old and new line numbers, change markers, and code order
correct; overlapping expansions show each context line once. Context must
come from the same file revisions as the comparison being reviewed. Keep the
current reading position usable when lines are inserted above it. Controls
must be usable with pointer, keyboard, and touch.

**Key examples / evaluation:**

- A hunk starts at line 54 with earlier unchanged lines omitted: an upward
  gutter control reveals the preceding lines immediately above it.
- Two hunks end at line 61 and start at line 124: a downward control after
  the first hunk and an upward control before the second reveal context from
  the corresponding ends of the omitted gap. Repeated expansion eventually
  closes the gap without duplicate lines.
- Unchanged lines remain after the final hunk: its downward gutter control
  reveals those following lines. A control disappears or becomes unavailable
  when no more lines remain in its direction; no expansion is offered beyond
  the beginning or end of the file.
- The comparison contains additions or removals: expanding unchanged context
  preserves the old/new numbering and the existing added/removed styling.
- If additional context cannot be read, the existing diff remains readable
  and the failure is visible with a way to retry.

**For refinement:** Choose the number of lines revealed per activation and
the smallest revision-consistent reading path supported by the existing
review. The screenshot establishes the interaction, not exact GitHub styling.

**Priority and authority:** Queue first at Terry's request. This request adds
and publishes the story; implementation awaits a later execution instruction.

**Source:** Terry's 2026-10-30 request and attached GitHub diff screenshot,
showing directional expansion buttons in the line-number gutter.
