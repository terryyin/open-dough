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

- [Make landed CI repeat checks pass under moderately high load](seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load) — SEED-324#pass-landed-ci-repeat-checks-under-high-load ([plan](slice-plans/599-pass-landed-ci-repeat-checks-under-high-load/PLAN.md))
- [Express review and Side panel test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects) — SEED-300#express-review-test-intent-through-page-objects ([plan](slice-plans/582-review-test-intent/PLAN.md))
- [Express session discovery and report test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects) — SEED-300#express-session-test-intent-through-page-objects ([plan](slice-plans/585-session-test-intent/PLAN.md))
- [Use shared MakeMe and page-object guidance](seeds/SEED-329-use-shared-test-guidance.md#use-shared-test-guidance) — SEED-329#use-shared-test-guidance ([plan](slice-plans/603-use-shared-test-guidance/PLAN.md))
- [Run dashboard CI follow-up by default for GitHub Actions projects](seeds/SEED-330-dashboard-ci-follow-up.md#make-ci-follow-up-automatic) — SEED-330#make-ci-follow-up-automatic ([plan](slice-plans/604-make-ci-follow-up-automatic/PLAN.md))
- [Express Board and published-read test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-board-test-intent-through-page-objects) — SEED-300#express-board-test-intent-through-page-objects ([plan](slice-plans/584-board-test-intent/PLAN.md))

## Backlog list

- [Run dashboard CI follow-up through a custom CI rebuild trigger](seeds/SEED-330-dashboard-ci-follow-up.md#invoke-custom-ci-rebuilds) — SEED-330#invoke-custom-ci-rebuilds
- [Match touch review titles to what each viewport runs](seeds/SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage) — SEED-321#match-touch-review-titles-to-viewport-coverage
- [Express launch dialog and startup test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-launch-test-intent-through-page-objects) — SEED-300#express-launch-test-intent-through-page-objects
- [Express settings test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-settings-test-intent-through-page-objects) — SEED-300#express-settings-test-intent-through-page-objects
- [Express browser measurement test intent through shared setup](seeds/SEED-300-dashboard-test-page-objects.md#express-browser-measurement-test-intent) — SEED-300#express-browser-measurement-test-intent
- [Limit first-layer test cases to ten lines](seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#limit-first-layer-test-cases-to-ten-lines) — SEED-301#limit-first-layer-test-cases-to-ten-lines
- [Hold landed CI follow-up observations under load](seeds/SEED-319-landed-ci-follow-up-observations-under-load.md#hold-landed-ci-follow-up-observations-under-load) — SEED-319#hold-landed-ci-follow-up-observations-under-load
