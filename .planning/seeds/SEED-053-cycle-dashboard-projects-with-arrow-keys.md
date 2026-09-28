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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/138-cycle-dashboard-projects-with-arrow-keys/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c00177a537a8f785c39d198e54f3fc6a9e120199c5d58cdbe9811976113e3f3b","plan":"5a9f598fc30e7aad62637cd43aafdee6cce3c34dad319d801b14a7cb082d9c17"}}
```

**Beneficiary:** Developers navigating the three projects in the dashboard.

**Goal:** Use the Right arrow key to select the next project and the Left arrow
key to select the previous project in the displayed order, cycling continuously
through all three projects.

**Scope:** Left and Right are dashboard shortcuts in both the stories and agent
roster views, without first focusing the project selector. Use the displayed
order: Open Dough, Doughnut, Pygardon. Each selection uses the existing project
navigation, URL history, and published-data read behavior. The project selector
remains keyboard accessible and consumes each key once.

Preserve editing and control-specific keyboard behavior: do not switch projects
from editable fields, controls using arrows for their own value or selection
(other than the project selector), or the open modal help dialog. Modified
shortcuts and already-handled key events retain their existing meaning.

**Key examples:**

- From the first project, Right selects the second; another Right selects the
  third; another Right wraps to the first.
- From the third project, Left selects the second; another Left selects the
  first; another Left wraps to the third.
- The selected project indicator and displayed project content follow each
  keyboard selection, just as they do when selecting a project with the pointer.
- With focus on the dashboard's Refresh control, successive Right presses
  select Doughnut, Pygardon, then Open Dough. The URL follows the selected
  project and browser Back returns through those selections.
- With the project selector focused, one Right press advances exactly one
  project and keeps focus on the newly selected project control.
- In the roster view, a project shortcut changes the project while retaining
  the roster view, as pointer selection does today.
- While the help dialog is open, Left and Right leave the project unchanged;
  closing the dialog restores ordinary project shortcuts. Editing controls
  keep their own Left/Right behavior.

**Deferred promises:** Configurable shortcuts, project registration, changes to
the catalog, and changes to refresh or source-reading policy.

**Refinement assumption:** Page-wide shortcuts are the working interpretation
of the UX request; a focus-scope question was offered during refinement. Existing
[dashboard navigation guidance](../../docs/dashboard-navigation.md) describes
native arrow-key switching within the selector; this story extends that experience.

**Slice plan:** [Cycle dashboard projects with arrow keys](../slice-plans/138-cycle-dashboard-projects-with-arrow-keys/PLAN.md).

**Priority:** First in the product backlog, as requested by the maintainer.
