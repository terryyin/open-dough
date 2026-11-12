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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/608-spot-completed-stories-that-need-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ae6ce7b5b399067aed89d00c9aebbae3828b47b09143b4cd0db7f1d87b993560","plan":"8c1de4f8ca0e1449ea16893ac33ab3c98e98b1f6da22eac0d9e64262df62e462"}}
```

#### Goal

A developer scanning the Board's **Recently done** column or the Sessions
sidebar's **Recently done sessions** can spot completed stories that still
need review without selecting each entry.

#### Scope

- Give an unreviewed story's **Mark as reviewed** button a prominent red
  warning treatment. Keep the action label readable in light and dark
  appearance. A reviewed card shows **Reviewed** and **Unreview** with their
  quieter styling.
- Apply the same warning treatment to **Recently done sessions** rows linked
  to an unreviewed completed story. Use a visible **Needs review** label so the
  cue works without color and is available to assistive technology. The cue should be
  visible before selection, including for rows from a project other than
  the one shown on the Board. Keep the existing Select and Open behavior.
- Use the existing machine-local review state for the linked project and story
  identity. Marking or unreviewing a story updates its card and all linked rows
  on the page. Show the warning only when the completed-story link and its
  unreviewed state are known. A standalone session has no story review state.
- Keep the review cue distinguishable from an unread session report, a failure,
  and the selected row. Keep review state as local operational evidence under
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

The warning means that the story has not been marked reviewed on this machine;
it does not claim that its execution failed or that its session report is unread.
Resolve the links of shown rows without requiring a click or moving the Board
to their projects. Preserve the existing completed-story association meaning,
including an Ad hoc session's confirmed association and its **Ad hoc** label.

**Required restrictions:** Never infer an unreviewed completed story from a
session being Done, an unread report, an unavailable read, or another project's
identically named story. Both a confirmed completed-story link and a successfully
read review state are necessary to avoid a false review warning. A failed save
keeps the last saved state and the existing failure feedback.

**Scope limits:** This story adds a scanning cue to the existing card action
and Recently done sessions rows. It does not add sidebar review actions,
review-based sorting or filtering, a review count, a new review workflow,
published review state, or a change to which sessions are retained or listed.

#### Key examples

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
   link and unreviewed state have been established. A later successful read
   supplies the cue without selecting the row. A late answer for an earlier
   project or association does not give another row the warning.
5. An unreviewed story's session also has an unread report, or its row is
   selected. **Needs review**, the unread-report mark, and selection remain
   distinguishable. Selecting the row or reading its report does not mark
   the story reviewed. If **Mark as reviewed** cannot save, the card and linked
   rows retain their unreviewed cues and the card explains the save failure.

#### UI

The developer scans the existing Board and expanded Sessions sidebar. The
unreviewed card's red **Mark as reviewed** action and a linked row's red
**Needs review** words identify the same outstanding task before either entry
is selected. Red alone carries no status. The label stays visible with long
titles and narrow or touch presentation, and is available when assistive
technology reaches the row. Light and dark appearance preserve readable text,
visible keyboard focus, and usable Select and Open controls.

Reviewing from the card clears the warning from every linked row on the page;
**Unreview** restores it. Both keep the developer's selection, perspective,
Side panel, and keyboard behavior. A row whose evidence is unknown remains
usable; absence of a warning does not assert that its story was reviewed.
Existing selection-check feedback and recovery remain available.

#### Architecture

Showing the cue before selection requires observing completed-story links for
shown sidebar rows independently of navigation. Reuse the current published
done-catalog and confirmed Ad hoc association responsibilities; observing a link
must not select a story, switch projects, open a session, or attach a terminal.

The Board and sidebar need one coherent page view of each project's existing
machine-local review state, keyed by project and story identity. Reuse its
successful-save updates and periodic reads rather than keeping independent
review flags on sessions. Cross-project rows need their own project's evidence
without replacing the Board's project. Unknown evidence stays distinct from a
confirmed unreviewed state, and obsolete asynchronous answers cannot overwrite
newer evidence.

This follows [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for derived published facts, local operational state, selection, and sidebar
responsibilities, and [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
for the story/session distinction. No new persistence or ADR exception is
needed. The [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
supplies contrast and non-color access criteria; the explicit red review cue
here extends its usual warning palette to an outstanding review task, with
words distinguishing it from evidence failures.

**Slice plan:** [Spot completed stories that need review](../slice-plans/608-spot-completed-stories-that-need-review/PLAN.md).

#### Background

[SEED-328](../done/SEED-328_mark-recently-done-stories-as-reviewed.json) put
review state in the [story card's action row](../../dashboard/STORY-CARDS.md#story-cards).
Sidebar rows currently establish their completed-story link
[when selected](../../dashboard/src/recentlyDoneSelection.ts). This story moves
that observation ahead of selection for shown rows, reusing story-launch links
and confirmed Ad hoc completed-story associations.
