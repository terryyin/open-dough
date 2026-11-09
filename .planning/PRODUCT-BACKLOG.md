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

- [Distinguish test cases and test files in Intent CI proof](seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#distinguish-test-cases-and-files-in-ci-proof) — SEED-281#distinguish-test-cases-and-files-in-ci-proof ([plan](slice-plans/547-distinguish-test-cases-and-files-in-ci-proof/PLAN.md))
- [Make machine-local project configuration test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-project-configuration-test-data) — SEED-261#map-project-configuration-test-data ([plan](slice-plans/540-map-project-configuration-test-data/PLAN.md))
- [Keep Done story Intent pinned to the landed result](seeds/SEED-283-keep-done-story-intent-pinned.md#keep-done-story-intent-pinned) — SEED-283#keep-done-story-intent-pinned ([plan](slice-plans/550-keep-done-story-intent-pinned/PLAN.md))
- [See landed CI wall time change over time](seeds/SEED-285-landed-ci-timing-history.md#see-landed-ci-wall-time-history) — SEED-285#see-landed-ci-wall-time-history ([plan](slice-plans/551-see-landed-ci-wall-time-history/PLAN.md))
- [Optimize tests from existing CI proof](seeds/SEED-284-optimize-tests-from-ci-proof.md#optimize-tests-from-ci-proof) — SEED-284#optimize-tests-from-ci-proof ([plan](slice-plans/552-optimize-tests-from-ci-proof/PLAN.md))
- [Trace a Done story’s timing history into test Proof](seeds/SEED-285-landed-ci-timing-history.md#trace-landed-proof-timing) — SEED-285#trace-landed-proof-timing ([plan](slice-plans/554-trace-landed-proof-timing/PLAN.md))

## Backlog list

- [Compare landed timing with a filtered moving average](seeds/SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds) — SEED-285#compare-landed-timing-with-recent-builds
