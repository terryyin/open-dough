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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can show, hide, and reopen a Dashboard sidebar the same
way when browsing Sessions or using the shared Intent and Review changes file browser.

**Examples.**

- In each view, clicking or tapping the sidebar toggle reveals it when hidden
  and hides it when visible. The developer can reopen it with the same control.
- On a narrow screen, the sidebar opens as a drawer from the left over the main
  content. Clicking or tapping anywhere outside the drawer closes it and
  consumes that interaction. For example, a button behind the drawer's backdrop
  stays inactive until the developer clicks or taps it again.
- On a wide screen, the open sidebar sits alongside the main content. The
  developer can interact with that content while the sidebar stays open.
- The Files toggle stays reachable with the sidebar closed. In the file
  sidebar's top row a Home icon precedes Intent only and, in story scope,
  Changes only. The available controls fit on a phone in one row. The
  [Story Home story](SEED-420-unified-intent-review.md#read-story-evidence-from-intent-home)
  owns the action that clears the path selection and restores story evidence.
  [Project browsing](SEED-420-unified-intent-review.md#browse-the-project-at-a-revision)
  owns returning to the project's CI overview.

**Scope.** The Sessions sidebar and the shared file browser use one
implementation for toggling, responsive layout and outside-click dismissal.
The [file filtering story](SEED-420-unified-intent-review.md#filter-review-files)
owns the effect of the two filters on inventory and summaries.
