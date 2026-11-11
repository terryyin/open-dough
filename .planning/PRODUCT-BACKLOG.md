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
- [Express Intent test reading through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-dashboard-test-intent-through-page-objects) — SEED-300#express-dashboard-test-intent-through-page-objects ([plan](slice-plans/581-intent-test-reading/PLAN.md))
- [Apply shared page-object rules per entry](seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-page-object-rules-per-entry) — SEED-307#apply-shared-page-object-rules-per-entry ([plan](slice-plans/590-apply-shared-page-object-rules-per-entry/PLAN.md))
- [Select and copy text in the Dashboard terminal on mobile](seeds/SEED-316-mobile-terminal-text-selection.md#select-and-copy-terminal-text-on-mobile) — SEED-316#select-and-copy-terminal-text-on-mobile ([plan](slice-plans/591-select-and-copy-terminal-text-on-mobile/PLAN.md))
- [Upgrade all dependencies](seeds/SEED-317-upgrade-all-dependencies.md#upgrade-all-dependencies) — SEED-317#upgrade-all-dependencies
- [Speed up touch review checks](seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks) — SEED-312#speed-up-touch-review-checks ([plan](slice-plans/592-speed-up-touch-review-checks/PLAN.md))
- [Speed up Cursor session checks](seeds/SEED-313-cursor-session-checks.md#speed-up-cursor-session-checks) — SEED-313#speed-up-cursor-session-checks ([plan](slice-plans/593-speed-up-cursor-session-checks/PLAN.md))

## Backlog list

- [Run MakeMe harness checks once by default](seeds/SEED-307-shared-test-pattern-rules.md#run-makeme-harness-once) — SEED-307#run-makeme-harness-once
- [Speed up landed CI repeat checks](seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks) — SEED-314#speed-up-landed-ci-repeat-checks
- [Speed up provider rate-limit checks](seeds/SEED-315-provider-rate-limit-checks.md#speed-up-provider-rate-limit-checks) — SEED-315#speed-up-provider-rate-limit-checks
- [Speed up the remaining Dashboard checks](seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks) — SEED-303#speed-up-slowest-dashboard-checks ([plan](slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md))
- [Express review and Side panel test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects) — SEED-300#express-review-test-intent-through-page-objects
- [Express Terminal test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-terminal-test-intent-through-page-objects) — SEED-300#express-terminal-test-intent-through-page-objects
- [Express Board and published-read test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-board-test-intent-through-page-objects) — SEED-300#express-board-test-intent-through-page-objects
- [Express session discovery and report test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects) — SEED-300#express-session-test-intent-through-page-objects
- [Express launch dialog and startup test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-launch-test-intent-through-page-objects) — SEED-300#express-launch-test-intent-through-page-objects
- [Express settings test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-settings-test-intent-through-page-objects) — SEED-300#express-settings-test-intent-through-page-objects
- [Express browser measurement test intent through shared setup](seeds/SEED-300-dashboard-test-page-objects.md#express-browser-measurement-test-intent) — SEED-300#express-browser-measurement-test-intent
- [Limit first-layer test cases to ten lines](seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#limit-first-layer-test-cases-to-ten-lines) — SEED-301#limit-first-layer-test-cases-to-ten-lines
