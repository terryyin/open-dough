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

- [Keep one launch store vocabulary and coherent kept records in dashboard tests](seeds/SEED-261-share-domain-test-data.md#align-kept-launch-store-setup) — SEED-261#align-kept-launch-store-setup ([plan](slice-plans/543-align-kept-launch-store-setup/PLAN.md))

## Backlog list

- [Choose Claude Code effort when starting a session](seeds/SEED-280-choose-claude-code-effort.md#choose-claude-code-effort) — SEED-280#choose-claude-code-effort
- [Verify stale-reclaimer exclusion without a fixed wait](seeds/SEED-279-observe-stale-reclaimer-handoff.md#observe-stale-reclaimer-handoff) — SEED-279#observe-stale-reclaimer-handoff
- [Pilot native evidence reuse for Git publication admission](seeds/SEED-262-faster-dashboard-test-feedback.md#pilot-admission-native-evidence-reuse) — SEED-262#pilot-admission-native-evidence-reuse
- [Guard native fixture identity inputs against drift](seeds/SEED-262-faster-dashboard-test-feedback.md#guard-native-fixture-identity-inputs) — SEED-262#guard-native-fixture-identity-inputs
- [Align story tab cost records, Taken heading, and wording](seeds/SEED-275-story-intent-tabs.md#align-story-tabs-records) — SEED-275#align-story-tabs-records
- [Keep the selected story when the Side panel closes](seeds/SEED-275-story-intent-tabs.md#preserve-story-on-panel-close) — SEED-275#preserve-story-on-panel-close
- [Make machine-local project configuration test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-project-configuration-test-data) — SEED-261#map-project-configuration-test-data
- [Make Intent and CI proof test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data) — SEED-261#map-intent-and-ci-proof-test-data
- [Make installation and native test setup map directly to the domain](seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data) — SEED-261#map-installation-and-native-test-data
- [Give the dashboard a dark theme](seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme) — SEED-278#dashboard-dark-theme
