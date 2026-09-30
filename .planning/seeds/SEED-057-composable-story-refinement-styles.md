---
id: SEED-057
status: active
planted: 2026-09-30
planted_during: Maintainer request for configurable story refinement styles
trigger_when: A developer wants to choose or combine how story refinement approaches a story
scope: story
---

# SEED-057: Composable story refinement styles

## Why This Matters

A developer refining a story may want different emphases depending on what
needs to be learned or challenged. Configurable, composable styles could make
that intent explicit when invoking the story refinement skill.

## Story

<a id="composable-refinement-styles"></a>

### Choose and compose styles for story refinement

**Identity:** SEED-057#composable-refinement-styles
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer using `dough-story-refinement` can configure and
  combine refinement styles to suit the questions and uncertainties of the story.
- **Evaluation:** The developer selects one style or combines several; refinement
  follows those emphases and produces a clarified goal and scope consistent with
  the developer's intent. Representative combinations and their expected behavior
  must first be explored during this item's own refinement.
- **Candidate styles:**
  - **Critical:** Rigorously challenge and clarify the purpose, then work hard
    to narrow scope to the smallest scope sufficient to deliver the goal.
  - **Exploratory:** Explore ideas and possibilities before settling the story.
  - **Straightforward:** Refine directly toward a clear goal and scope.
  - **Architecture focus:** Emphasize architectural questions during refinement.
  - **UX/UI design focus:** Emphasize user experience and interface design.
- **Boundary:** These are examples, not a complete or agreed taxonomy. First
  explore what the styles mean, which can be combined, and how combinations
  should behave. Invocation syntax, configuration location, defaults, persistence,
  and handling conflicting emphases remain open; this capture selects no
  implementation. The requested capability belongs to the story refinement skill.
- **Depends on:** No queued prerequisite identified.
- **Capture:** Terry requested this as the new top queued story on 2026-09-30,
  explicitly asking to explore the ideas when refining it.

## Breadcrumbs

- [Story refinement skill source](../../src/skills/dough-story-refinement/SKILL.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
