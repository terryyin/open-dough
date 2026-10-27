---
id: SEED-153
status: active
planted: 2026-10-27
planted_during: Terry's dashboard UI vocabulary decision
trigger_when: Dashboard UI regions or their implementation use competing names for the same concept
scope: dashboard
---

# SEED-153: Consistent dashboard UI domain concepts

## Why This Matters

A developer discussing the dashboard or tracing its implementation should use
the same precise names throughout. The three-column overview has been called
the page, dashboard, and board, while the shared Side panel can be confused
with its terminal, final report, or story review content. Terry accepted the
concise [dashboard UI concepts in ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
and selected global alignment as the highest-priority queued work.

## Selected Story

<a id="align-dashboard-ui-domain-concepts"></a>

### Align the dashboard globally with its UI domain concepts

**Identity:** SEED-153#align-dashboard-ui-domain-concepts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/358-align-dashboard-ui-domain-concepts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"dc76ac6b9cfa869d994e39ff280e6d0a5d7289d8632d955ee28cc63c6aa3cca0","plan":"3a0be9b914469103aee17c6fbafb875e5570177e56595cf172326d9f96e7b060"}}
```

**Beneficiary:** A developer using, discussing, testing, or changing the
dashboard, including one who navigates it by keyboard or screen reader.

**Goal:** Every dashboard UI concept maps directly to its architectural
responsibility, implementation names, tests, and documentation, with no
translation between competing vocabularies, so a developer who names a region
can find it in the UI, the code, and the docs under that one name.

**Scope:**

- Audit the whole dashboard against ADR 0008's Board, Column, Story card,
  Session entry, Sessions sidebar, Side panel, Panel divider, and Scrollbar
  definitions, and align UI wording and accessible names, components, modules,
  files, types, functions, state, CSS classes and custom properties, test
  selectors, test support, and maintained documentation (`docs/dashboard-*.md`,
  `dashboard/*.md`, `dashboard/tests/writing-journeys.md`, code comments)
  wherever they represent those concepts. Remove competing synonyms and alias
  layers rather than mapping old names to new ones.
- Content names identify Side panel content: terminal, final report, story
  review. Neither content nor its components carry the shared container's name,
  and the final report has one name (today also "session result").
- A Session entry is one concept wherever it appears (Story card, Column,
  Sessions sidebar); placement may vary its presentation, not its name.
- Resize controls and scroll controls stay distinct. The Panel divider is only
  the Board–Side panel control. The Running Cursor sessions resize control and
  the Board's hidden-column controls are named for their own responsibility,
  not "edge" or "Panel divider". Each Scrollbar is qualified by the region it
  actually scrolls.
- The Board becomes its own scroll region instead of scrolling with the
  document, so the Board scrollbar sits at the Board's edge and scrolls only
  the Board in side-by-side and stacked layouts. Story reveal, keyboard
  scrolling, hidden-column controls, the pinned banner, and Maximize/Restore
  keep their current behavior against that region.
- Preserve published story facts, session identities, story URLs, existing
  behavior, and saved browser preferences. A renamed preference key still
  recovers the value saved under its former key.
- Dashboard concepts outside ADR 0008's table (banner, agent roster, project
  selection, settings, dialogs, the control visual style called "frame") keep
  their names, except where one reuses an adopted concept's name for something
  else.

**Deferred promises:** Defining further UI concepts in ADR 0008, and visual or
layout redesign beyond making the Board its own scroll region.

**Key examples / evaluation:**

- A developer can trace Board, its Columns, Story cards, and Session entries
  from the accepted definition through architecture, code, tests, and docs
  using the same names, adapted only to programming syntax. A screen reader
  announces the Board region as the Board, not "Work stages".
- Opening a terminal, final report, or story review uses the same Side panel
  responsibility; content names identify the content rather than the shared
  container. The Sessions sidebar remains a separate cross-project region.
- The Panel divider resizes the Side panel and is named Panel divider in code,
  styles, tests, and docs. Dragging the Running Cursor sessions resize control
  still resizes that section, under its own name.
- With the Side panel open beside a long Board, scrolling the Board moves only
  the Board, through a scrollbar at the Board's edge left of the Panel divider.
  In a stacked layout, scrolling the Board leaves the Side panel above it in
  place. Revealing a story through its URL or a Session entry still brings its
  card's top into view below the banner and Column heading.
- A browser that saved a Side panel width, Sessions sidebar open state, Running
  Cursor sessions height, or Board column position before the rename shows the
  same layout after it.
- A whole-dashboard review finds no competing name for an adopted concept or
  single name used for incompatible concepts. Existing relevant automated
  journeys still pass after their names and selectors are aligned.

**UI and architecture findings (2026-10-27, observed):**

| Concept | Current competing names |
| --- | --- |
| Board | `DashboardColumns`, `WorkStages`, `stages`, accessible name "Work stages", "story overview", "the page"/"the dashboard" in navigation docs; no `Board` name exists |
| Column | `stage`, `StageView`, `stage-header`, "stage heading" |
| Story card | `WorkCard`, "work card" |
| Session entry | `SessionEntry` beside a separate `SidebarEntry`/`sidebar-entry` for the same concept |
| Sessions sidebar | `SessionSidebar`, `session-sidebar`, `page-with-sidebar` |
| Side panel | `TerminalPanel`, `StoryReviewPanel`, `SessionResultPanel`, `OpenSessionPanel`, "frame", "right-side panel" |
| Panel divider | `SidePanelEdge`, `side-panel-edge`, generic `ResizeEdge`, "left edge"; `ColumnEdge` also uses "edge" for hidden-column controls |
| Scrollbar | No region-qualified names; see the open decision |

The Board is not its own scroll region: `.page-column` (banner and Board)
scrolls with the document while the Sessions sidebar and Side panel are sticky
(`dashboard/src/side-panel.css`, `session-sidebar.css`). Observed against the
running dashboard with headless Chromium: at 1400×420 with a story review open,
wheel scrolling moved the Board 362px through the document while the Side panel
stayed in place, so the Board's scrollbar is the window's, drawn at the
window's right edge beside the Side panel. At 700×800 (stacked), the same
document scroll moved the Side panel off-screen with the Board. Side panel
content scrolls inside its own regions (terminal, final report, story review
lists and diffs), and each Sessions sidebar list scrolls on its own.

**Decision — Board scrollbar (Terry, 2026-10-27):** The Board becomes its own
scroll region, so the Board scrollbar satisfies ADR 0008's Scrollbar definition
in every layout. Keeping document scrolling was rejected because the stacked
scrollbar would scroll the Side panel too and need a name outside ADR 0008.

**Preparation:** Refined and planned in [plan 358](../slice-plans/358-align-dashboard-ui-domain-concepts/PLAN.md).

## Breadcrumbs

- Terry's direction to define the UI concepts, accept ADR 0008, reference it
  from ADR 0001, and queue global alignment first, 2026-10-27.
- [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-ui-vocabulary).
- [Dashboard navigation](../../docs/dashboard-navigation.md).
