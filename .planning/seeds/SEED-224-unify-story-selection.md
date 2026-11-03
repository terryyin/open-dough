---
id: SEED-224
status: active
planted: 2026-11-03
planted_during: Terry Yin's request to unify dashboard story selection and highlighting
trigger_when: A developer inspects stories, opens story content in the Side panel, or reads the selected story in Intent
scope: story
---

# SEED-224: Unify story selection across Development and Intent

## Selected Stories

<a id="unify-story-selection"></a>

### Unify story selection across Development and Intent

**Identity:** SEED-224#unify-story-selection

**Goal:** A developer can tell which story the dashboard is showing and read
its Intent without reconciling a card's inspection border with a separate
session highlight.

**Acceptance examples**

- Opening a story's terminal, final report, or review in the Side panel
  selects that story. Its card is highlighted if visible. Switching to
  another story's content moves selection and highlighting together.
- Opening or closing Story B's inline details leaves Story A selected while
  the Side panel shows Story A. Inspecting a story with the Side panel closed
  leaves selection empty. The inspection control indicates expansion.
- Intent uses the same selected story as Development. Closing the Side panel
  or showing an unattached session clears the story selection, card highlight,
  and selected-story context in Intent.
- Use **selected story** for the shared state, **highlight** for its visual
  indication, and **inspect** for inline details. Align the applicable ADR
  terminology and the maintained Development, navigation, Side panel, and
  Intent documentation with those meanings.

**Decision references:** [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
defines dashboard concepts and calls for one name and responsibility per
concept. [ADR 0001, Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
guides consistent terms across the product and its documentation.
