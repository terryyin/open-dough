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

- [Correct Intent CI label announcements and summary sort fallback](seeds/SEED-259-scan-intent-ci-summaries.md#correct-scan-intent-ci-summaries) — SEED-259#correct-scan-intent-ci-summaries ([plan](slice-plans/504-correct-scan-intent-ci-summaries/PLAN.md))
- [Invoke Dough Intent Coverage manually across test mixes](seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually) — SEED-258#invoke-intent-coverage-manually ([plan](slice-plans/503-invoke-intent-coverage-manually/PLAN.md))

## Backlog list

- [Share one published agent profile builder across test entries](seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders) — SEED-261#share-published-agent-profile-builders
- [Make published work test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-published-work-test-data) — SEED-261#map-published-work-test-data
- [Make launch and session test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data) — SEED-261#map-launch-and-session-test-data
- [Make Intent and CI proof test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data) — SEED-261#map-intent-and-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
- [Pilot fluent page objects in dashboard Side panel tests](seeds/SEED-263-fluent-dashboard-page-objects.md#pilot-fluent-dashboard-page-objects) — SEED-263#pilot-fluent-dashboard-page-objects
- [Find the intent assessment in a recently done story](seeds/SEED-258-dough-intent-coverage.md#assess-intent-coverage-during-wrap-up) — SEED-258#assess-intent-coverage-during-wrap-up
- [Reuse immutable Git histories across dashboard tests](seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories) — SEED-262#reuse-immutable-git-histories
- [Prepare dashboard test artifacts only when selected tests need them](seeds/SEED-262-faster-dashboard-test-feedback.md#prepare-artifacts-on-demand) — SEED-262#prepare-artifacts-on-demand
- [Set up test preconditions without replaying unrelated workflows](seeds/SEED-262-faster-dashboard-test-feedback.md#arrange-prerequisite-state) — SEED-262#arrange-prerequisite-state
- [Exercise dashboard updates without unnecessary page reloads](seeds/SEED-262-faster-dashboard-test-feedback.md#refresh-without-unneeded-reloads) — SEED-262#refresh-without-unneeded-reloads
- [Reduce the cost of private dashboard test fixtures](seeds/SEED-262-faster-dashboard-test-feedback.md#reduce-private-fixture-lifecycle-cost) — SEED-262#reduce-private-fixture-lifecycle-cost
- [Make dashboard polling tests advance on controlled time and observed replies](seeds/SEED-262-faster-dashboard-test-feedback.md#drive-polls-with-time-and-replies) — SEED-262#drive-polls-with-time-and-replies
