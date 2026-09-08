# Planning scope and lifecycle

Read during story refinement and when cleaning up an implemented story. This
extract preserves the source planning rule's story-level scope and lifecycle. It
is not an automatically applied host rule or an execution-planning workflow.

## Route the work

Read
[problem decomposition](../../dough-story-decomposition/references/problem-decomposition.md)
when parent framing, splitting, or story ordering needs reconsideration.

- Unresolved parent problem or candidate selection: use
  [dough-story-decomposition](../../dough-story-decomposition/SKILL.md).
- Selected stories needing goal, scope, or examples: refine in their home seeds.
- One understood story and an explicit request for planning: use the adopter's
  execution-planning workflow. Pass along existing answers.
- An existing plan needing smaller or clearer execution leaves: use the
  adopter's execution-plan refinement workflow on that plan, not story
  refinement.
- A seed alone does not select a story or authorize execution.

## Scope discipline

Deliver the understood story conservatively. Unexpected extras add complexity.
Clarify uncertain behavior when possible; otherwise exclude it and tell the
human what was considered. If exclusion prevents the stated goal or examples,
resolve the question before dependent planning or implementation. Necessary
implementation details are not extra product scope; speculative generality is.

Refinement is revisable understanding. Discuss goal or scope changes with the
human and keep the home story and any active plan aligned; discovery alone does
not authorize expansion. Do not silently cancel remaining scope or change
sibling stories. Preserve compatible work and evidence when revising boundaries.

## Artifact ownership

Use the adopter's canonical seed directory, home IDs, metadata, and stable story
anchors. Keep the parent problem, candidates, and each story's refinement in its
home seed. The product backlog contains ordered story links, not duplicate story
details. Do not create a separate refinement file.

Executable plans, phase artifacts, and project memory use the adopter's own
locations and workflows; do not infer them from the source project's layout.
Keep planning-only numbering out of product code, tests, and permanent docs.

## Cleanup after implementation

Keep enduring behavior in tests and product documentation, and enduring design
in code and ADRs. Once that knowledge is captured, reduce each implemented
story's refinement detail to Goal and Scope, including exclusions. Remove spent
examples, UI sketches, and architectural discussion; preserve its anchor,
completion status, and unfinished siblings. Do not discard still-needed detail
before the enduring knowledge has a home.
