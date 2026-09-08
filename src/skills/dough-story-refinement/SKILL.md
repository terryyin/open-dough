---
name: dough-story-refinement
description: >-
  Clarifies selected stories before execution planning by establishing goal,
  scope, and key examples in each story's home seed. Adds UI or architectural
  detail only when needed. Use for selected-story refinement, not broad problem
  decomposition, candidate selection, or execution-leaf sizing.
---

# Story Refinement

Build shared understanding of one selected story, or several related stories
whose boundaries need discussion. Read and apply
[planning scope and lifecycle](references/planning.md). Resolve repository paths
from the adopting checkout, not this skill’s location.

## Required adopter context

Identify the selected story links and home seeds, relevant prior decisions, and
the adopting repository root. When creating a missing home, resolve the
canonical seed directory, ID and filename conventions, required metadata, and
story-anchor convention. Use the shared
[seed format](../dough-story-decomposition/references/seed-format.md). The
execution-planning workflow is needed only for a requested handoff. ADR context
is needed only for a consequential architectural concern, as described by
[dough-adr-awareness](../dough-adr-awareness/SKILL.md).

If required context or a linked dependency is unavailable, name what is missing
and stop the affected activity. Do not invent project paths or decisions.

## Refine through conversation

Read the selected stories and relevant prior discussion. Reuse answers already
given; ask only questions that change understanding, with a concise proposed
answer. Do not turn the following into a questionnaire or mandatory approval
ceremony. Mark unresolved decisions explicitly; do not present proposals as
developer decisions.

For each story, establish:

- **Goal:** beneficiary, desired change, and its contribution to the business
  goal. Keep this story's observable outcome distinct from the broader ambition.
- **Scope:** included behavior, relevant exclusions, and boundary assumptions.
  Prefer the smallest useful outcome; exclude uncertain additions and report
  them. Clarify when exclusion would prevent the stated outcome from working.
- **Key examples:** concrete pre-condition → trigger → result situations that
  explain the scope. Include boundaries or exceptions when they resolve
  ambiguity; do not enumerate a complete test suite.

Add **UI** descriptions or sketches only when interaction or presentation needs
agreement. Add **Architecture** only for a new consequential concern; consult
[dough-adr-awareness](../dough-adr-awareness/SKILL.md) and relevant Accepted
ADRs. Inspect existing behavior or code only to resolve a concrete question,
without turning refinement into technical planning. Omit unused optional
sections.

A story may cross features. When refining several stories, keep each outcome and
boundary separate; do not merge them into one delivery by implication. Use
[dough-story-decomposition](../dough-story-decomposition/SKILL.md) if the parent
problem or candidate selection needs reconsideration.

## Keep the understanding in the story's home

Expand each existing story section in its home seed with **Goal**, **Scope**,
and **Key examples**, plus optional details above. Replace overlapping detail;
preserve story anchors, sibling stories, and seed metadata. Record only open
questions that affect this story. If no home exists, establish one in the
adopter’s canonical seed directory using the shared
[seed format](../dough-story-decomposition/references/seed-format.md). Do not
invent parent-problem decisions to fill it; route unresolved problem framing or
candidate selection to
[dough-story-decomposition](../dough-story-decomposition/SKILL.md).

Keep one home even for cross-feature journeys; link related seeds. The product
backlog remains ordered story links. Do not create a separate refinement file.
This is current understanding, revisable with the developer as evidence changes.

Report the story links, material exclusions, and unresolved decisions. When
slice planning is requested, hand off one selected story and continue without
repeating answered questions. Refinement alone does not authorize planning or
implementation. After implementation, reduce refinement detail to goal and scope
as specified in [planning scope and lifecycle](references/planning.md).
