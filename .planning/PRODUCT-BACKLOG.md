# Product backlog

## Near-future direction

Help developers keep product intent clear, organized, and protected as a story
changes the product. Focus on reviewing how well a newly developed story's
intent has been distilled into maintained high-level automated tests, what
protection those tests provide, and what behavioral and test complexity the
change introduces.

Make Purpose and Proof reviewable together in story context: test source
expresses expected behavior, while execution reports show observed results
and the cost of running the proof. Help developers decide what intent or proof
to clarify, strengthen, simplify, or retain.

Discover and validate explainable ways to assess intent protection and
complexity, including AI-assisted judgment. Treat conventional code coverage as
supporting evidence. Judge success by whether these reviews help maintain
understandable intent and worthwhile protection at justified cost, including
the cost of the review itself, following the
[definition of improvement](../docs/adrs/0010-definition-of-improvement-accepted.md).

Use the [product intent review memorandum](../docs/product-intent-review-memorandum.md)
for the starting assessment criteria and longer-term direction. Domain models,
static types, written specifications, and assessment of whole-product intent
protection are later extensions; the immediate focus is automated tests and the
intent introduced or affected by a newly developed story.

## Taken

- [Reduce dashboard test feedback time with measured optimization (top 20%)](seeds/SEED-195-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback) — SEED-195#optimize-dashboard-test-feedback ([plan](slice-plans/422-optimize-dashboard-test-feedback/PLAN.md))

## Backlog list

- [Browse a project's test source in Intent](seeds/SEED-192-review-product-intent.md#browse-test-purpose) — SEED-192#browse-test-purpose
- [Review a story's impact on test intent](seeds/SEED-192-review-product-intent.md#review-story-intent-impact) — SEED-192#review-story-intent-impact
- [Read observed proof alongside test purpose](seeds/SEED-192-review-product-intent.md#read-observed-test-proof) — SEED-192#read-observed-test-proof
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
- [Find expensive proof in the test hierarchy](seeds/SEED-192-review-product-intent.md#inspect-hierarchical-proof-cost) — SEED-192#inspect-hierarchical-proof-cost
