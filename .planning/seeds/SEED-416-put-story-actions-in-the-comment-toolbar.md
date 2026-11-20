---
id: SEED-416
status: active
planted: 2026-11-20
planted_during: Requested one place for Dashboard story actions
trigger_when: selected from the product backlog
scope: one story
---

# SEED-416 — Put story actions in the comment toolbar

<a id="put-story-actions-in-the-comment-toolbar"></a>

### Put story actions in the comment toolbar

**Identity:** SEED-416#put-story-actions-in-the-comment-toolbar

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A Dashboard developer can select a story card and find its available
story actions together in the comment toolbar, including **Follow up** and
**Review changes**.

**Current behavior.** Board cards place story actions alongside story facts and
session controls. The available actions vary with the story's state.

**Examples.**

- Selecting a completed story that offers **Follow up** and **Review changes**
  shows both in the comment toolbar. Each opens its existing workflow for that
  story. The toolbar is the sole entry point for those story-level actions on
  the Board.
- Selecting a different story replaces the toolbar actions with those available
  for that story. Clearing the selection removes the story actions from the
  toolbar.

**Scope.** Story-level action buttons on Dashboard Board cards in Backlog,
Taken, and Recently done.
