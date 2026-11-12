---
id: SEED-322
status: active
planted: 2026-11-12
planted_during: Terry reported that selecting a dance story from a dance session in the sidebar scrolls the board so the target card is partly covered by the fixed top bar
trigger_when: Developers select the sidebar-selected board card scroll-offset bug for investigation or repair
scope: story
---

# SEED-322 — Sidebar-selected board card scroll offset

<a id="keep-sidebar-selected-board-cards-visible-below-fixed-header"></a>

### Keep sidebar-selected board cards fully visible below the fixed header

**Identity:** SEED-322#keep-sidebar-selected-board-cards-visible-below-fixed-header
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planless"}
```

**Goal:** When a developer selects a dance story from a dance session in the
Sessions sidebar, the board scrolls so the targeted story or session card is
fully visible beneath the fixed top bar.

**Reported behavior:** Selecting a dance story from a dance session in the
sidebar scrolls and jumps to the matching story or session box on the board,
but the scroll position is too high: the fixed top bar covers the top of the
box, so the entire card is not visible.

**Acceptance example:** From the Sessions sidebar, select a dance story under
a dance session whose board card sits below the fold. After the board scrolls,
the full top edge of the targeted story or session card remains visible below
the fixed top bar, with no part of that card covered by the bar.

**Remaining uncertainty:** Whether the same offset affects other
sidebar-driven board selections; repair the confirmed selection path first and
extend only when the same defect is evident there.
