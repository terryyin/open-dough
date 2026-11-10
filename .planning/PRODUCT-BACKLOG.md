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

- [Make the Intent CI comparison tests sub-second](seeds/SEED-286-fast-intent-ci-comparison-tests.md#fast-intent-ci-comparison-tests) — SEED-286#fast-intent-ci-comparison-tests ([plan](slice-plans/556-fast-intent-ci-comparison-tests/PLAN.md))
- [Settle trunk freshness before expensive proof and before delivery](seeds/SEED-010-learn-from-execution-retrospectives.md#hold-delivery-on-freshness-before-expensive-proof) — SEED-010#hold-delivery-on-freshness-before-expensive-proof ([plan](slice-plans/561-settle-trunk-freshness-before-proof/PLAN.md))
- [Plan the cohesive reorganization of an already-oversized file a slice touches](seeds/SEED-010-learn-from-execution-retrospectives.md#plan-cohesive-reorganization-of-oversized-files) — SEED-010#plan-cohesive-reorganization-of-oversized-files ([plan](slice-plans/562-plan-cohesive-oversized-file-reorganization/PLAN.md))

## Backlog list

- [Give the local CI container the hosted runner’s fonts](seeds/SEED-289-named-test-results-locally-and-in-ci.md#match-hosted-fonts-in-ci-container) — SEED-289#match-hosted-fonts-in-ci-container
- [Reuse equivalent CI adapter build timing for a skipped landing](seeds/SEED-288-landed-ci-evidence-follow-ups.md#reuse-adapter-equivalent-timing) — SEED-288#reuse-adapter-equivalent-timing
- [Keep each unit's gaps and name visible in Intent CI proof](seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#keep-unit-gaps-and-names-visible) — SEED-281#keep-unit-gaps-and-names-visible
- [Show no count difference across a missing or ambiguous part](seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#no-count-difference-across-gaps) — SEED-281#no-count-difference-across-gaps
- [Compare landed timing with a filtered moving average](seeds/SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds) — SEED-285#compare-landed-timing-with-recent-builds
- [Repeat a slow landed CI build once and flag a persistent slowdown](seeds/SEED-285-landed-ci-timing-history.md#retry-a-slow-landed-ci-build) — SEED-285#retry-a-slow-landed-ci-build
- [Make GitHub Actions run and attempt-job test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-github-actions-ci-test-data) — SEED-261#map-github-actions-ci-test-data
- [Make CI adapter attempt, queue and coverage test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-ci-adapter-and-coverage-test-data) — SEED-261#map-ci-adapter-and-coverage-test-data
- [Make CI proof evidence test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-ci-proof-test-data) — SEED-261#map-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
- [Give the dashboard a dark theme](seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme) — SEED-278#dashboard-dark-theme
- [Make dashboard journeys fit the default timeout under load](seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) — SEED-287#fit-dashboard-journeys-in-default-timeout
