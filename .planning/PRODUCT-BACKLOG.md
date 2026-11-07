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

- [Compare a short manual intent assessment with ordinary review](seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage) — SEED-258#compare-manual-intent-coverage ([plan](slice-plans/498-compare-manual-intent-coverage/PLAN.md))
- [Scan CI summaries in dashboard Intent](seeds/SEED-259-scan-intent-ci-summaries.md#scan-intent-ci-summaries) — SEED-259#scan-intent-ci-summaries ([plan](slice-plans/499-scan-intent-ci-summaries/PLAN.md))
- [Retry unavailable CI comparison slots](seeds/SEED-118-dashboard-reading-reliability.md#retry-unavailable-ci-comparison-slots) — SEED-118#retry-unavailable-ci-comparison-slots ([plan](slice-plans/500-retry-unavailable-ci-comparison-slots/PLAN.md))
- [Distinguish Branch and Landed figures in precise CI summaries](seeds/SEED-258-dough-intent-coverage.md#distinguish-branch-and-landed-summary-figures) — SEED-258#distinguish-branch-and-landed-summary-figures ([plan](slice-plans/501-distinguish-branch-and-landed-summary-figures/PLAN.md))

## Backlog list

- [Restore default timeouts across automated tests](seeds/SEED-260-restore-default-test-timeouts.md#restore-default-test-timeouts) — SEED-260#restore-default-test-timeouts
- [Invoke Dough Intent Coverage manually across test mixes](seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually) — SEED-258#invoke-intent-coverage-manually
- [Find the intent assessment in a recently done story](seeds/SEED-258-dough-intent-coverage.md#assess-intent-coverage-during-wrap-up) — SEED-258#assess-intent-coverage-during-wrap-up
