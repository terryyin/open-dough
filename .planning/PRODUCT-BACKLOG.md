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

- [Load Intent without disruption or bulk source transfer](seeds/SEED-241-intent-loading-and-traffic.md#load-intent-without-disruption-or-bulk-source-transfer) — SEED-241#load-intent-without-disruption-or-bulk-source-transfer ([plan](slice-plans/477-load-intent-without-disruption/PLAN.md))

## Backlog list

- [Improve Intent home and selection summaries](seeds/SEED-243-intent-home-and-selection-summaries.md#improve-intent-home-and-selection-summaries) — SEED-243#improve-intent-home-and-selection-summaries
- [Compare a story's CI and entry timing changes](seeds/SEED-244-story-ci-timing-changes.md#compare-story-ci-timing-changes) — SEED-244#compare-story-ci-timing-changes
- [Compare a story's Intent entry, folder, and file summaries](seeds/SEED-245-story-intent-summary-differences.md#compare-story-intent-entry-folder-and-file-summaries) — SEED-245#compare-story-intent-entry-folder-and-file-summaries
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
