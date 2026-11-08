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

- [Serve fake GitHub planning files from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#declare-fake-github-planning-data) — SEED-262#declare-fake-github-planning-data ([plan](slice-plans/530-declare-fake-github-planning-data/PLAN.md))
- [Build release source repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures) — SEED-262#migrate-shell-release-and-native-fixtures ([plan](slice-plans/533-migrate-shell-release-and-native-fixtures/PLAN.md))
- [Build git-publication native fixture repositories from explicit MakeMe data](seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-git-publication-native-fixtures) — SEED-262#migrate-git-publication-native-fixtures ([plan](slice-plans/534-migrate-git-publication-native-fixtures/PLAN.md))
- [Speed up Git fixture construction behind the builder](seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories) — SEED-262#reuse-immutable-git-histories ([plan](slice-plans/535-reuse-story-columns-git-history/PLAN.md))
- [Make kept launch record test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data) — SEED-261#map-launch-and-session-test-data ([plan](slice-plans/534-map-launch-and-session-test-data/PLAN.md))
- [Make live launch observation test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-observation-test-data) — SEED-261#map-launch-observation-test-data ([plan](slice-plans/536-map-launch-observation-test-data/PLAN.md))
- [Make launch completion and landing test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-launch-completion-and-landing-test-data) — SEED-261#map-launch-completion-and-landing-test-data ([plan](slice-plans/538-map-launch-completion-and-landing-test-data/PLAN.md))
- [Make Codex and Cursor session test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-host-continuation-test-data) — SEED-261#map-host-continuation-test-data ([plan](slice-plans/539-map-host-continuation-test-data/PLAN.md))

## Backlog list

- [Align story tab cost records, Taken heading, and wording](seeds/SEED-275-story-intent-tabs.md#align-story-tabs-records) — SEED-275#align-story-tabs-records
- [Make machine-local project configuration test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-project-configuration-test-data) — SEED-261#map-project-configuration-test-data
- [Make Intent and CI proof test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data) — SEED-261#map-intent-and-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
- [Give the dashboard a dark theme](seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme) — SEED-278#dashboard-dark-theme
