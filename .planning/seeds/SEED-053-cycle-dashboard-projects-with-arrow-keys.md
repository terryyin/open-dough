---
id: SEED-053
status: active
planted: 2026-09-28
planted_during: Maintainer request for dashboard keyboard navigation
trigger_when: Developers want to switch dashboard projects with left and right arrow keys
scope: story
---

# SEED-053: Cycle dashboard projects with left and right arrow keys

## Why This Matters

Developers viewing the Open Dough dashboard should be able to move between its
three projects quickly using the keyboard.

## Stories

<a id="cycle-dashboard-projects-with-arrow-keys"></a>

### Cycle dashboard projects with left and right arrow keys

**Identity:** SEED-053#cycle-dashboard-projects-with-arrow-keys
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers navigating the three projects in the dashboard.

**Goal:** Use the Right arrow key to select the next project and the Left arrow
key to select the previous project in the displayed order, cycling continuously
through all three projects.

**Evaluation examples:**

- From the first project, Right selects the second; another Right selects the
  third; another Right wraps to the first.
- From the third project, Left selects the second; another Left selects the
  first; another Left wraps to the third.
- The selected project indicator and displayed project content follow each
  keyboard selection, just as they do when selecting a project with the pointer.

**Context for refinement:** Existing [dashboard navigation guidance](../../docs/dashboard-navigation.md)
describes three project choices and native arrow-key switching. Clarify the
keyboard focus scope during refinement; this story adds explicit cyclic behavior.

**Priority:** First in the product backlog, as requested by the maintainer.
