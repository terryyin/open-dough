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

## Backlog list

- [Explain a running later build after a proofless one](seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#explain-running-after-proofless-later-build) — SEED-254#explain-running-after-proofless-later-build
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
- [Compare a short manual intent assessment with ordinary review](seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage) — SEED-258#compare-manual-intent-coverage
- [Invoke Dough Intent Coverage manually across test mixes](seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually) — SEED-258#invoke-intent-coverage-manually
- [Find the intent assessment in a recently done story](seeds/SEED-258-dough-intent-coverage.md#assess-intent-coverage-during-wrap-up) — SEED-258#assess-intent-coverage-during-wrap-up
