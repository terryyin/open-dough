---
id: SEED-012
status: active
planted: 2026-09-10
planted_during: Human report of delivery examples becoming production restrictions in Donut
trigger_when: Before refining, planning, or executing further example-driven delivery
scope: bounded
---

# SEED-012: Cohesive design from incremental delivery examples

## Why This Matters

The user reports a process failure in Donut: successive stories covered README
plus three Notes, then README plus two Notes and one Relationship. Planning
turned those acceptance examples into instructions to accept exactly those
layouts and reject other mixed counts. Implementation followed the plans,
accumulating count gates and layout recognizers despite shared persistence
helpers. Delivery boundaries had become unjustified domain boundaries.

This is supplied evidence, not an independent audit of Donut. The improvement
belongs across the existing development lifecycle guidance and supports the
backlog's direction of learning reusable skills and rules from Donut.

## Stories

<a id="cohesive-design-from-examples"></a>

### 1. Evolve a cohesive design from incremental delivery examples

**Status:** Refined; second-priority backlog item. No executable plan yet.

**Goal:** A developer using Open Dough can deliver small, evidenced increments
while evolving one cohesive design, without agents interpreting acceptance
fixtures as rejection rules or preserving accidental plan restrictions.

**Scope:** Make the following behavior consistent across existing story
refinement, slice planning and refinement, execution, post-change refactoring,
and execution retrospective guidance, including directly linked references.

- **Separate examples, constraints, and deferred promises.** Acceptance
  examples demonstrate required behavior. Product constraints justify
  rejection. Deferred promises identify behavior or verification the story
  does not commit to deliver. An unlisted example is not automatically forbidden.
- **Decompose delivery, not the solution's structure.** Small slices evolve
  one cohesive design. Fixture counts and arrangements must not become
  production gates without an independent domain requirement. A naturally
  general implementation does not automatically expand the story's delivery
  or verification commitment.
- **Recognize shared rules during implementation.** When another example
  appears to require another recognizer, count exception, or parallel
  representation, reassess the implicated concept. Prefer the simplest common
  rule supported by current evidence, avoiding both accumulating special cases
  and speculative frameworks.
- **Review conceptual cohesion.** Post-change refactoring examines all
  representations of the implicated concept, including orchestration and
  layout-specific handlers. Shared persistence helpers alone do not establish
  cohesion when those handlers duplicate the same domain knowledge.
- **Allow challenges to the plan.** Reviewers can identify accidental
  restrictions in the plan itself. Cite the conflicting plan contract and
  supporting story or domain evidence, stop the conflicting path, and surface
  the planning/design conflict for human resolution. Behavior-preserving
  refactoring cannot remove a contractual restriction; neither preserving it
  unquestioningly nor silently broadening behavior is an acceptable resolution.
- **Check cumulative design.** Execution readiness and retrospectives ask:
  “Are these examples exercising a coherent model, or becoming a catalogue of
  special cases?” Apply this alongside slice size and proof ownership.
  Passing acceptance tests and following a plan do not establish that its
  restrictions were justified.

**Key examples:**

- **Successive Donut examples:** Given the README/three-Notes example and then
  the README/two-Notes/one-Relationship example, refinement records required
  outcomes separately from actual rejection constraints and deferred promises.
  Planning does not prescribe exact-count gates merely from those examples.
  Execution considers the shared rule evidenced by both examples, without
  promising every future combination or bulk-import performance.
- **An independently justified restriction:** Given an explicit domain rule
  limiting a count or forbidding an arrangement, the plan can require rejection
  and tie its proof to that rule. Removing accidental fixture restrictions
  does not authorize removing a genuine product constraint.
- **Cohesion beyond helpers:** Given handlers sharing persistence helpers but
  separately recognizing layouts and repeating domain knowledge, a new example
  triggers reassessment of all implicated representations. Refactoring seeks
  the simplest supported common rule; helper reuse does not end the review,
  and hypothetical future cases do not justify a framework.
- **The plan is the source of the problem:** Given an existing plan requiring
  rejection of other mixed counts with no independent product justification,
  review cites that contract and its conflict with the story's examples and
  deferred promises. It surfaces the decision before a conflicting change,
  rather than claiming a behavior-preserving refactor can fix it. Readiness or
  retrospective review can raise this even when all planned tests pass.

**Material exclusions / deferred promises:** No Donut code changes, universal
layout support, exhaustive combinations, bulk-import performance commitment,
speculative extensibility framework, or replacement development workflow.
These exclusions limit this story's delivery and verification commitments;
they do not create runtime rejection requirements in the target product.

**Delivery and evaluation:** Update the shared public source under
`src/skills/` and directly affected references; do not hand-synchronize installed
copies. Walk the representative Donut sequence through refinement, planning,
execution, refactoring, and review, with the justified-restriction and
plan-conflict variations above. Confirm agents distinguish examples from
constraints, inspect cumulative conceptual cohesion, and leave conflicting
contract decisions with the human. This is story-level acceptance input, not
an executable slice plan or a prescribed production design.

**Related work:** Follow the lifecycle boundaries established by
[Story Wrap-Up](SEED-011-story-wrap-up.md#story-wrap-up), which remains first in
the queue. This story changes the substance of design review and planning;
it does not reopen that story's handoff or cleanup responsibilities.

**Readiness / open decisions:** The beneficiary, outcome, scope, and key
examples are established by the supplied proposals. No unresolved product
decision blocks planning. Inspect exact source conflicts during planning;
no implementation, release, or executable planning is authorized by this
backlog update.
