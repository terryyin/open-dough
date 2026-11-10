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

- [Make GitHub Actions run and attempt-job test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-github-actions-ci-test-data) — SEED-261#map-github-actions-ci-test-data ([plan](slice-plans/553-map-github-actions-ci-test-data/PLAN.md))
- [Finish opted-in stories with an Intent Coverage report](seeds/SEED-258-dough-intent-coverage.md#finish-opted-in-stories-with-intent-coverage) — SEED-258#finish-opted-in-stories-with-intent-coverage ([plan](slice-plans/572-finish-opted-in-stories-with-intent-coverage/PLAN.md))
- [Make Intent Coverage results easier to act on](seeds/SEED-258-dough-intent-coverage.md#make-intent-coverage-results-easier-to-act-on) — SEED-258#make-intent-coverage-results-easier-to-act-on ([plan](slice-plans/573-make-intent-coverage-results-easier-to-act-on/PLAN.md))
- [Submit a revived Cursor continuation](seeds/SEED-297-submit-revived-cursor-continuation.md#submit-revived-cursor-continuation) — SEED-297#submit-revived-cursor-continuation
- [Repeat a slow landed CI build once and flag a persistent slowdown](seeds/SEED-285-landed-ci-timing-history.md#retry-a-slow-landed-ci-build) — SEED-285#retry-a-slow-landed-ci-build ([plan](slice-plans/569-retry-a-slow-landed-ci-build/PLAN.md))

## Backlog list

- [Insert common prompts in the dashboard terminal](seeds/SEED-298-insert-common-prompts-in-the-dashboard-terminal.md#insert-common-prompts-in-the-dashboard-terminal) — SEED-298#insert-common-prompts-in-the-dashboard-terminal
- [Make CI adapter attempt, queue and coverage test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-ci-adapter-and-coverage-test-data) — SEED-261#map-ci-adapter-and-coverage-test-data
- [Make CI proof evidence test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-ci-proof-test-data) — SEED-261#map-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
- [Give the dashboard a dark theme](seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme) — SEED-278#dashboard-dark-theme
- [Make dashboard journeys fit the default timeout under load](seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) — SEED-287#fit-dashboard-journeys-in-default-timeout
- [Prove the destination cue restarts on repeated activation](seeds/SEED-296-prove-repeat-destination-cue-restarts.md#prove-repeat-destination-cue-restarts) — SEED-296#prove-repeat-destination-cue-restarts
