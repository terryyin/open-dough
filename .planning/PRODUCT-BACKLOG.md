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

- [Make dashboard journeys fit the default timeout under load](seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) — SEED-287#fit-dashboard-journeys-in-default-timeout ([plan](slice-plans/576-fit-dashboard-journeys-in-default-timeout/PLAN.md))
- [Run the slowest Dashboard checks together in under 30 seconds](seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks) — SEED-303#speed-up-slowest-dashboard-checks ([plan](slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md))
- [Make remaining test domain setup express intent](seeds/SEED-302-remaining-makeme-test-data.md#make-remaining-test-domain-setup-express-intent) — SEED-302#make-remaining-test-domain-setup-express-intent ([plan](slice-plans/583-make-remaining-test-domain-setup-express-intent/PLAN.md))
- [Restore Safari terminal prompts](seeds/SEED-309-restore-safari-terminal-prompts.md#restore-safari-terminal-prompts) — SEED-309#restore-safari-terminal-prompts

## Backlog list

- [Show trunk test scope timing history](seeds/SEED-310-trunk-test-scope-timing-history.md#show-trunk-test-scope-timing-history) — SEED-310#show-trunk-test-scope-timing-history
- [Express dashboard test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-dashboard-test-intent-through-page-objects) — SEED-300#express-dashboard-test-intent-through-page-objects
- [Apply shared test pattern rules per entry](seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-test-pattern-rules-per-entry) — SEED-307#apply-shared-test-pattern-rules-per-entry
- [Limit first-layer test cases to ten lines](seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#limit-first-layer-test-cases-to-ten-lines) — SEED-301#limit-first-layer-test-cases-to-ten-lines
