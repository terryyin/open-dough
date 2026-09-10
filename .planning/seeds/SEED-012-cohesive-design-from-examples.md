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

**Status:** Planned; second-priority backlog item.
**Plan:** [Executable slices](../quick/037-cohesive-design-from-examples/PLAN.md).
Human priority: keep this guidance improvement small and ready promptly; release
preparation is separate and waits for other improvements.

**Goal:** A developer using Open Dough can deliver small, evidenced increments
while evolving one cohesive design, without agents interpreting acceptance
fixtures as rejection rules or preserving accidental plan restrictions.

**Scope:** Make the following behavior consistent across existing story
refinement, slice planning and refinement, execution, post-change refactoring,
and execution retrospective guidance, including directly linked references.
Reconcile conflicting guidance as part of this story. Delivery scope is this
guidance improvement; the skills themselves retain a whole-product focus.
Story refinement defines delivery commitments, not implementation boundaries:
implementation changes whatever parts of the product need to change. Product
structure follows its own concepts and responsibilities; coincidence with story
boundaries is possible but exceptional, never a design objective.

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
  cohesion when those handlers duplicate the same domain knowledge. Strengthen
  the linked `references/refactor-checks.md`, including its preference for
  helper reuse and its test-retention advice. Keep this concrete structural
  examination in post-change refactoring; the implementation retrospective
  additionally owns the broader architectural assessment of the whole product.
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
- **Require a final implementation-structure review.** The implementation
  retrospective within the execution retrospective must strictly check that
  the resulting implementation has its own reasonable structure, justified by
  domain concepts and responsibilities. It must not directly mirror the story
  decomposition merely because work was delivered in that order or grouping.
  Assess the cumulative implementation and overall product architecture,
  including all representations implicated by the aggregate change and relevant
  untouched code. Story membership is not an implementation boundary. Include
  needed structural and architectural corrections in the retrospective's
  follow-up plan; surface disputed product constraints to the human.
- **Re-evaluate the test suite as product documentation.** In that same
  implementation retrospective, identify whether end-to-end tests drove the
  story's development, then review the suite with a whole-product focus,
  including existing tests beyond this story. Retain end-to-end tests that
  document the most important feature and integrated behavior. Move detailed
  behavior coverage to unit tests in the project's preferred style; if that
  guidance is absent, make unit tests as black box as possible, asserting
  observable behavior rather than internal structure. Merge redundant
  end-to-end tests with overlapping coverage when that lowers cost while
  preserving important behavior and integration proof. Do not delete all newly
  added end-to-end tests by default. Needed downgrades, consolidation, and
  suite-wide cleanup must be explicit work in the follow-up plan, including
  replacement coverage before removing or narrowing tests. The retrospective
  plans these corrections; it does not implement them.

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
- **Delivery structure has leaked into implementation:** Given separate
  handlers or representations corresponding to successive stories, the final
  implementation retrospective checks whether domain responsibilities justify
  those boundaries independently of the delivery decomposition. When only the
  decomposition explains them, the follow-up plan includes a correction toward
  a cohesive structure, even though each story's acceptance tests pass.
- **Development proof becomes lasting documentation:** Given end-to-end tests
  that drove delivery of a key user journey and detailed rule variations, the
  implementation retrospective retains end-to-end documentation of the
  important journey and identifies detailed cases for unit coverage in the
  project's preferred style. Its follow-up plan explicitly owns replacement
  unit coverage and removal or narrowing of the corresponding end-to-end
  tests. Include older overlapping end-to-end tests in the assessment and
  consolidate redundant scenarios when coverage is preserved at lower cost.
  If no end-to-end tests drove development, record that finding and still
  assess the suite; absence of new tests does not exempt existing tests from
  review. A downgrade requires an actual coverage finding.

**Material exclusions / deferred promises:** No Donut code changes, universal
layout support, exhaustive combinations, bulk-import performance commitment,
speculative extensibility framework, or replacement development workflow.
These exclusions limit this story's delivery and verification commitments;
they do not create runtime rejection requirements in the target product.

**Delivery and evaluation:** Update the shared public source under
`src/skills/` and directly affected references; do not hand-synchronize installed
copies. Walk the representative Donut sequence through refinement, planning,
execution, refactoring, and review, with the justified-restriction and
plan-conflict, implementation-structure, and test-retention variations above.
Confirm agents distinguish examples from constraints, inspect cumulative
conceptual cohesion, and leave conflicting contract decisions with the human.
Check that the final implementation retrospective evaluates structure against
domain responsibilities and overall architecture, and reassesses the whole
test suite for behavioral documentation and cost. Include an older overlapping
end-to-end test and a missing-test-style variation in the walkthrough. Needed
structural corrections, test downgrades, and consolidation are owned by its
follow-up plan. This is story-level acceptance input, not
an executable slice plan or a prescribed production design.

**Delivery boundary:** Make the smallest coherent changes to existing guidance
and its conflicting references. Focus on planning, post-change refactoring and
its refactor checks, and the implementation review within execution
retrospectives, with story refinement and execution aligned where necessary.
No Story Wrap-Up changes, new skill, workflow stage, report schema, mandatory
artifact, automated analyzer, separate testing-methodology extraction, release
preparation, or adoption work. Review reach is deliberately broader than the
current diff; limiting this guidance story does not impose story-shaped limits
on the product's implementation or test suite.

**Resolved refinement decisions:**

- Accidental plan restrictions go back to a human, even when they appear
  unsupported; do not silently correct away the plan's contract.
- Post-change refactoring inspects the complete implicated concepts. Final
  implementation retrospective includes broader architectural assessment and
  suite-wide test cleanup planning with a whole-product focus.
- No fresh Donut execution is required before this improvement is ready.
  Use the representative walkthrough and applicable existing checks.
- Release preparation is outside this story; other improvements precede release.
- End-to-end tests remain important behavioral documentation. Lower their cost
  through justified consolidation and moving details to black-box unit tests,
  preserving useful coverage rather than deleting tests based on their age.

**Existing testing guidance:** No standalone unit-testing skill or rule was
found under `src/`. The
[execution extraction record](../../src/skills/dough-execute-plan/EXTRACTION.md)
records partial extraction from `unit-testing.mdc`: stable boundaries and data
instead of internal mocks. The
[post-change refactoring skill](../../src/skills/dough-post-change-refactor/SKILL.md#verify-edits)
already calls for observable stable boundaries, real lower layers, crafted data,
and mocking external services rather than internal collaborators. Its
[refactor checks](../../src/skills/dough-post-change-refactor/references/refactor-checks.md)
reject tests that pin internal structure, but need reconciliation with the new
end-to-end retention and consolidation guidance. Reuse these principles and
state the black-box fallback; a separate unit-testing extraction can come later.

**Readiness:** The scope questions raised in refinement are resolved. Planning
must reconcile existing story-limited review/correction language and refactoring
gates with the whole-product instructions above, without treating story
boundaries as implementation boundaries or changing human-owned product
constraints. “Execution readiness” adds a design check at existing assessment
points, not a new certification stage. Executable planning is now requested; implementation remains unrequested.
