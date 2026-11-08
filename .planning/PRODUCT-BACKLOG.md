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

- [Review a selected story in Intent tabs](seeds/SEED-275-story-intent-tabs.md#story-intent-tabs) — SEED-275#story-intent-tabs ([plan](slice-plans/531-review-story-intent-tabs/PLAN.md))
- [Serve fake GitHub planning files from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#declare-fake-github-planning-data) — SEED-262#declare-fake-github-planning-data ([plan](slice-plans/530-declare-fake-github-planning-data/PLAN.md))
- [Build Node test repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-backlog-scratch-repositories) — SEED-262#migrate-backlog-scratch-repositories ([plan](slice-plans/524-migrate-backlog-scratch-repositories/PLAN.md))
- [Build release source repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures) — SEED-262#migrate-shell-release-and-native-fixtures ([plan](slice-plans/533-migrate-shell-release-and-native-fixtures/PLAN.md))
- [Build git-publication native fixture repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-git-publication-native-fixtures) — SEED-262#migrate-git-publication-native-fixtures ([plan](slice-plans/534-migrate-git-publication-native-fixtures/PLAN.md))

## Backlog list

- [Guard native fixture identity inputs against drift](seeds/SEED-262-faster-dashboard-test-feedback.md#guard-native-fixture-identity-inputs) — SEED-262#guard-native-fixture-identity-inputs
- [Speed up Git fixture construction behind the builder](seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories) — SEED-262#reuse-immutable-git-histories
- [Make kept launch record test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data) — SEED-261#map-launch-and-session-test-data
- [Make live launch observation test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-observation-test-data) — SEED-261#map-launch-observation-test-data
- [Make launch completion and landing test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-completion-and-landing-test-data) — SEED-261#map-launch-completion-and-landing-test-data
- [Make Codex and Cursor session test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-host-continuation-test-data) — SEED-261#map-host-continuation-test-data
- [Make machine-local project configuration test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-project-configuration-test-data) — SEED-261#map-project-configuration-test-data
- [Make Intent and CI proof test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data) — SEED-261#map-intent-and-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
