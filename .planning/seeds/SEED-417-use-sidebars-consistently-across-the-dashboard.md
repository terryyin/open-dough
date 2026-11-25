---
id: SEED-417
status: active
planted: 2026-11-20
planted_during: Requested shared responsive sidebar behavior
trigger_when: selected from the product backlog
scope: one story
---

# SEED-417 — Use sidebars consistently across the Dashboard

<a id="use-sidebars-consistently-across-the-dashboard"></a>

### Use sidebars consistently across the Dashboard

**Identity:** SEED-417#use-sidebars-consistently-across-the-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/837-use-sidebars-consistently-across-the-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5b65596c3295445a03a627d7925f134c6cd590a840d0fda83bdd8cb4a84dc346","plan":"825019076aa2bc664d98d7fdc78ccca79a8dedd94513e85c1b3266eaa842b8cc"}}
```

**Goal.** A developer can show, hide and reopen the sidebar the same way while
browsing Sessions, reading Intent or reviewing changes. On a phone the drawer
lets the developer browse without taking space from the reading area or
activating another action on the way back to it.

**Scope.** Sessions, Intent Files and Review changes Files use one Dashboard
implementation for toggle, placement and drawer dismissal. Effective room
determines whether the sidebar docks beside the reader or opens as a left
drawer. A constrained Review changes panel uses the drawer even in a wide
window. A newly entered Files view at drawer widths starts with the reader
available and Files reachable. Preserve each view's existing docked preference,
reading place, and content behavior. Sessions keeps its existing preference,
shortcut and session-opening behavior.

The Files sidebar lays out the available Home, Intent only and Changes only
controls in that order, together on a phone. Whole-project scope offers Home
and Intent only when their actions are available. The
[Story Home story](SEED-420-unified-intent-review.md#read-story-evidence-from-intent-home)
owns clearing the path and restoring story evidence.
[Project browsing](SEED-420-unified-intent-review.md#browse-the-project-at-a-revision)
owns returning to project CI. The
[file filtering story](SEED-420-unified-intent-review.md#filter-review-files)
owns the filter actions and their inventory and summary effects. This story
owns placement and fit as each view supplies the applicable controls. Tree
unification and changes to the right-hand Side panel are outside its scope.

**Key examples.**

- With a sidebar closed, use its visible toggle to open it from the left. Use
  the same control to close and reopen it. Its accessible name and expanded
  state identify the control and the current state.
- With a drawer open on a phone, tap an exposed point over an underlying
  button. The drawer closes and the button stays inactive. A second tap can
  activate the button. Escape closes the drawer and returns keyboard focus to
  its toggle. An inside interaction such as expanding a folder leaves it open.
- With a file drawer open, choose a file to read it, then reopen Files. The
  reader shows the chosen file and the drawer returns to the browsing place.
- With room for both panes, operate the reader while the docked sidebar stays
  open. When Review changes is constrained, the same Files control opens the
  drawer and the diff retains its reading area.
- With Home and both filters supplied in story scope, they form one usable row
  in that order on a phone. In whole-project scope the row has the applicable
  controls and Changes only is absent.

**Architecture.** Share the presentation and input handling while the views
own session actions, file selection, Home, filters and their existing
preferences. Use one active drawer input boundary when narrow surfaces meet.
This keeps layout and navigation state in the Dashboard UI under
[ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#spatial-presentation-remains-derived).
The [file filtering story](SEED-420-unified-intent-review.md#filter-review-files)
owns the effect of the two filters on inventory and summaries.
