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

- [Build each test’s Git repository from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures) — SEED-262#build-explicit-git-fixtures ([plan](slice-plans/510-build-explicit-git-fixtures/PLAN.md))
- [Make dashboard polling tests advance on controlled time and observed replies](seeds/SEED-262-faster-dashboard-test-feedback.md#drive-polls-with-time-and-replies) — SEED-262#drive-polls-with-time-and-replies ([plan](slice-plans/525-drive-cursor-session-polls/PLAN.md))

## Backlog list

- [Build dashboard test repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-dashboard-origin-fixtures) — SEED-262#migrate-dashboard-origin-fixtures
- [Build clean-trunk and managed delivery repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-clean-trunk-fixtures) — SEED-262#migrate-clean-trunk-fixtures
- [Build Node test repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-backlog-scratch-repositories) — SEED-262#migrate-backlog-scratch-repositories
- [Build shell release and native fixture repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures) — SEED-262#migrate-shell-release-and-native-fixtures
- [Speed up Git fixture construction behind the builder](seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories) — SEED-262#reuse-immutable-git-histories
- [Make launch and session test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data) — SEED-261#map-launch-and-session-test-data
- [Make Intent and CI proof test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data) — SEED-261#map-intent-and-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
