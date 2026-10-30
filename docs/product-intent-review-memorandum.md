# Product intent expression and review memorandum

**Date:** 2026-10-30

**Source:** Terry Yin's product direction discussion

**Status:** Longer-term intention and starting assessment criteria

Make product intent understandable, maintainable, and reviewable as development
changes the product. Begin with high-level automated tests and the question of
how well a newly developed story's intent has been distilled and protected.
Domain models, static types, and written specifications extend this view later.

This memorandum records longer-term intention and starting criteria for
investigation. The [near-future direction](../.planning/PRODUCT-BACKLOG.md#near-future-direction)
selects the immediate focus.

## Three forms of intent expression and protection

1. **High-level automated tests.** These are Terry's most trusted form when
   they both explain the Purpose of product intent and provide its Proof. The
   preference applies to tests that express meaningful product behavior at a
   sufficiently high boundary, rather than to automated tests indiscriminately.
   Their source expresses expectations; execution supplies observations about
   whether the product fulfills those expectations.
2. **Domain models and static type systems.** Domain concepts and types also
   express intention. Static checking can protect the distinctions and
   constraints the type system encodes. Bring this form of expression and
   protection into the intent view in the longer term.
3. **Written specifications and other documentation.** Maintain the intentions
   that automated tests and static types cannot adequately express in written
   form. Specifications are a longer-term part of this direction. A particular
   spec-driven development workflow, tool, or specification format has not been
   selected.

These forms contribute to the same maintained product intent. The present
focus on test files is an initial entry point into that larger account.
The meanings of Purpose and Proof remain those in
[ADR 0001](adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts).

## Current focus on the intent distilled from a story

Two questions need different scopes:

- **Current investigation:** For a newly developed story, how well has its
  intent been distilled into the maintained product intent, expressed clearly,
  and protected by appropriate proof?
- **Later investigation:** Across the product, its structure, and its code,
  how well is the whole product's intent expressed and protected?

Focus this effort on the first question and primarily on automated tests.
Static typing and specifications remain longer-term extensions. Browsing the
whole project's test files can support a selected review without making a
comprehensive assessment of the whole product its goal.

The [Intent workspace design](dashboard-ux-ui-north-star.md#initial-intent-workspace)
provides the file browser, Purpose/Proof views, and story scope for this review.
The selected layouts are interface direction; they do not establish an intent
coverage measure by themselves.

## Discovering what intent protection means

Discovering defensible ways to assess distillation and protection is part of
the direction. Conventional code coverage does not answer this question and is
not a primary success measure for this effort.

Explore AI-assisted assessment of the relationship between a story's intended
outcome, the resulting expressions of product intent, and the proof that
supports them. Such an assessment should explain its reasoning through the
reviewed source and execution evidence, and distinguish an evidenced conclusion
from a gap or uncertainty. AI assistance is an approach to investigate, not an
already validated coverage measure.

The units of assessment, heuristics, possible numeric measures, and ways to
validate those judgments remain to be discovered. Do not equate test or file
counts, passing percentages, or code coverage with the amount of product intent
protected. Assess whether the method helps people make worthwhile decisions,
following [ADR 0010's definition of improvement](adrs/0010-definition-of-improvement-accepted.md).

## Observable proof cost and judged complexity

The initial observable proof cost is execution cost: run the tests and collect
reports with their timings and results. Keep the selection, run conditions,
and revision attached to those observations. Distinguish the elapsed time a
developer waits from summed test durations when execution is concurrent.
Reports do not by themselves measure the human effort of understanding or
maintaining proof; those costs still matter when judging an improvement.

Complexity requires judgment and the development of useful heuristics, much as
intent protection does. Keep behavioral complexity and complexity in its
expression or proof distinguishable. Execution time alone measures neither.

Terry's starting criteria for that assessment are:

- **Concise expression at a high boundary.** Value small tests with little code
  that explain meaningful intent. Keep the level of observation as high as
  possible, through an end-to-end journey or a stable system boundary. Small
  refers to the expression and supporting work; it does not mean a low-level
  test surface.
- **Low-level tests carry complexity cost.** Treat a lower-level test as added
  complexity even when it is short. Brevity alone does not compensate for the
  extra implementation concepts and relationships a reader must understand.
- **Mocking carries complexity cost.** Count the substituted behavior and its
  assumptions as additional complexity. A test can become superficially simple
  while its mocks supply the very behavior it claims to prove, undermining its
  usefulness as product-intent protection.
- **Consider the complete test expression.** Include setup and support code in
  the judgment so a short test body does not hide the complexity needed to
  understand and maintain it.

These are starting judgment criteria, not a validated scoring formula. Their
weighting, automated detection, and relationship to useful protection require
investigation. Existing test-boundary and mocking rules stay in force; this
memorandum does not replace them or establish a blanket ban on mocks.

## Evaluation and remaining choices

Use the review to understand what intent a development change expresses and
protects, what complexity it introduces, and what its proof costs. Judge any
response by the worthwhile product outcome or improved ability to change,
including the cost of the assessment itself, under
[ADR 0010](adrs/0010-definition-of-improvement-accepted.md).

The immediate learning questions are how to make a story's distilled intent
reviewable, how to assess the strength of its protection, and which complexity
signals help that judgment. The representation of domain/type evidence and
specifications, and assessment of protection across the whole product, remain
for the longer-term direction.
