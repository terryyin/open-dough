# Product backlog

## Near-future direction

Help developers keep product intent clear, organized, and protected as a story
changes the product. Focus on reviewing how well a newly developed story's
intent has been distilled into maintained high-level automated tests, what
protection those tests provide, and what behavioral and test complexity the
change introduces.

Make a story's intent reviewable in context: test source expresses expected
behavior as Purpose, while CI proof shows observed results and the cost of
running the tests. Help developers decide what intent or proof to clarify,
strengthen, simplify, or retain.

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

- [Review a completed story including its merge changes](seeds/SEED-253-review-delivered-merge-changes.md#review-delivered-merge-changes) — SEED-253#review-delivered-merge-changes ([plan](slice-plans/491-review-delivered-merge-changes/PLAN.md))
- [Compare CI time without runner waits](seeds/SEED-256-compare-ci-time-without-runner-waits.md#compare-ci-time-without-runner-waits) — SEED-256#compare-ci-time-without-runner-waits ([plan](slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md))

## Backlog list

- [Compare story CI builds from custom adapters in Intent](seeds/SEED-257-compare-story-ci-through-adapters.md#compare-story-ci-through-adapters) — SEED-257#compare-story-ci-through-adapters
- [Use the nearest ancestor's CI proof for skipped builds](seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds) — SEED-254#use-ancestor-ci-proof-for-skipped-builds
- [Compare before-and-after CI proof in Intent](seeds/SEED-255-compare-before-and-after-ci-proof.md#compare-before-and-after-ci-proof) — SEED-255#compare-before-and-after-ci-proof
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
