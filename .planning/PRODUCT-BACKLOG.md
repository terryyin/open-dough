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

- [Speed up Git fixture construction behind the builder](seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories) — SEED-262#reuse-immutable-git-histories ([plan](slice-plans/535-reuse-story-columns-git-history/PLAN.md))
- [Make kept launch record test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data) — SEED-261#map-launch-and-session-test-data ([plan](slice-plans/534-map-launch-and-session-test-data/PLAN.md))
- [Make live launch observation test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-observation-test-data) — SEED-261#map-launch-observation-test-data ([plan](slice-plans/536-map-launch-observation-test-data/PLAN.md))
- [Make launch completion and landing test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-completion-and-landing-test-data) — SEED-261#map-launch-completion-and-landing-test-data ([plan](slice-plans/538-map-launch-completion-and-landing-test-data/PLAN.md))
- [Make Codex and Cursor session test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-host-continuation-test-data) — SEED-261#map-host-continuation-test-data ([plan](slice-plans/539-map-host-continuation-test-data/PLAN.md))

## Backlog list

- [Read done records for the catalog through one product rule](seeds/SEED-262-faster-dashboard-test-feedback.md#share-done-catalog-record-reading) — SEED-262#share-done-catalog-record-reading
- [Guard native fixture identity inputs against drift](seeds/SEED-262-faster-dashboard-test-feedback.md#guard-native-fixture-identity-inputs) — SEED-262#guard-native-fixture-identity-inputs
- [Align story tab cost records, Taken heading, and wording](seeds/SEED-275-story-intent-tabs.md#align-story-tabs-records) — SEED-275#align-story-tabs-records
- [Make machine-local project configuration test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-project-configuration-test-data) — SEED-261#map-project-configuration-test-data
- [Make Intent and CI proof test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data) — SEED-261#map-intent-and-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
- [Give the dashboard a dark theme](seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme) — SEED-278#dashboard-dark-theme
