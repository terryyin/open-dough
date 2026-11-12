---
id: SEED-333
status: active
planted: 2026-11-13
planted_during: Terry reported that completed stories needing review were hard to spot and asked for a warning cue on story cards and sidebar rows
trigger_when: selected from the product backlog
scope: story
---

# SEED-333 — Spot completed stories that need review

<a id="spot-completed-stories-that-need-review"></a>

### Spot completed stories that need review

**Identity:** SEED-333#spot-completed-stories-that-need-review
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer scanning the Board's **Recently done** column or the Sessions
sidebar's **Recently done sessions** can spot completed stories that still
need review without selecting each entry.

#### Scope to refine

- Give an unreviewed story's **Mark as reviewed** button a prominent red
  warning treatment. Keep the action label readable in light and dark
  appearance. A reviewed card shows **Reviewed** and **Unreview** with their
  quieter styling.
- Apply the same warning treatment to sidebar rows linked to an unreviewed
  completed story. Use a visible **Needs review** label so the cue works
  without color and is available to assistive technology. The cue should be
  visible before selection, including for rows from a project other than
  the one shown on the Board. Keep the existing Select and Open behavior.
- Use the existing machine-local review state for the linked project and story
  identity. Marking or unreviewing a story updates its card and all linked rows
  on the page. Show the warning only when the completed-story link and its
  unreviewed state are known. A standalone session has no story review state.
- Keep the review cue distinguishable from an unread session report, a failure,
  and the selected row. Keep review state as local operational evidence under
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

#### Key examples to refine

1. Two done story cards are visible, one reviewed and one unreviewed. The red
   **Mark as reviewed** button lets the developer pick out the unreviewed card
   at a glance in either appearance.
2. The sidebar shows two sessions linked to that unreviewed story, including an
   Ad hoc session with a confirmed association. Both show **Needs review**
   before selection. Marking the story reviewed clears both cues. **Unreview**
   restores both.
3. The sidebar also shows sessions from another project. A row linked to an
   unreviewed completed story shows **Needs review** while the Board stays on
   the current project. A reviewed story's row and a standalone row show no cue.
4. A row's link or review state is still loading or could not be established.
   The row remains usable and shows a review warning only when a completed-story
   link and unreviewed state have been established.

#### Background

[SEED-328](../done/SEED-328_mark-recently-done-stories-as-reviewed.json) put
review state in the [story card's action row](../../dashboard/STORY-CARDS.md#story-cards).
Sidebar rows currently establish their completed-story link
[when selected](../../dashboard/src/recentlyDoneSelection.ts). Refinement
should account for story launches and Ad hoc sessions with a confirmed
completed-story association, and settle how shown rows learn those links.
