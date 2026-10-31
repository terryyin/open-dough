# Product backlog

## Near-future direction

Help developers keep product intent clear, organized, and protected as a story
changes the product. Focus on reviewing how well a newly developed story's
intent has been distilled into maintained high-level automated tests, what
protection those tests provide, and what behavioral and test complexity the
change introduces.

Make Purpose and Proof reviewable together in story context: test source
expresses expected behavior, while execution reports show observed results
and the cost of running the proof. Help developers decide what intent or proof
to clarify, strengthen, simplify, or retain.

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

- [Experience the Development and Intent frame](seeds/SEED-192-review-product-intent.md#open-development-intent-frame) — SEED-192#open-development-intent-frame ([plan](slice-plans/424-development-intent-frame/PLAN.md))
- [Keep dashboard refresh work bounded across viewers](seeds/SEED-202-bounded-dashboard-refresh.md#bounded-dashboard-refresh) — SEED-202#bounded-dashboard-refresh ([plan](slice-plans/426-bounded-dashboard-refresh/PLAN.md))
- [Attach an image when starting a session](seeds/SEED-204-attach-image-at-launch.md#attach-image-at-launch) — SEED-204#attach-image-at-launch ([plan](slice-plans/427-attach-image-at-launch/PLAN.md))

## Backlog list

- [Browse a project's test source in Intent](seeds/SEED-192-review-product-intent.md#browse-test-purpose) — SEED-192#browse-test-purpose
- [Browse the other configured test sources](seeds/SEED-192-review-product-intent.md#browse-configured-test-source) — SEED-192#browse-configured-test-source
- [Review test optimization candidates and accepted slow tests](seeds/SEED-192-review-product-intent.md#review-test-optimization-candidates) — SEED-192#review-test-optimization-candidates
- [Review a story's impact on test intent](seeds/SEED-192-review-product-intent.md#review-story-intent-impact) — SEED-192#review-story-intent-impact
- [Read observed proof alongside test purpose](seeds/SEED-192-review-product-intent.md#read-observed-test-proof) — SEED-192#read-observed-test-proof
- [Check locally collected Cucumber proof against CI](seeds/SEED-192-review-product-intent.md#check-cucumber-proof-in-ci) — SEED-192#check-cucumber-proof-in-ci
- [Read Doughnut Cucumber proof with recent history](seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof) — SEED-192#read-cypress-cucumber-proof
- [Find expensive proof in the test hierarchy](seeds/SEED-192-review-product-intent.md#inspect-hierarchical-proof-cost) — SEED-192#inspect-hierarchical-proof-cost
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
- [Read frontend Vitest proof in both projects](seeds/SEED-192-review-product-intent.md#read-vitest-proof) — SEED-192#read-vitest-proof
- [Read Open Dough dashboard Playwright proof](seeds/SEED-192-review-product-intent.md#read-playwright-proof) — SEED-192#read-playwright-proof
- [Read Pygardon pytest proof](seeds/SEED-192-review-product-intent.md#read-pytest-proof) — SEED-192#read-pytest-proof
- [Read Node script-test proof](seeds/SEED-192-review-product-intent.md#read-node-test-proof) — SEED-192#read-node-test-proof
- [Read shell-check proof at its observed granularity](seeds/SEED-192-review-product-intent.md#read-shell-check-proof) — SEED-192#read-shell-check-proof
