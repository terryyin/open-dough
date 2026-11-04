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

- [Read Pygardon pytest proof](seeds/SEED-192-review-product-intent.md#read-pytest-proof) — SEED-192#read-pytest-proof ([plan](slice-plans/459-read-pytest-proof/PLAN.md))
- [Reduce remote Sessions traffic](seeds/SEED-229-reduce-remote-sessions-traffic.md#reduce-remote-sessions-traffic) — SEED-229#reduce-remote-sessions-traffic ([plan](slice-plans/462-reduce-remote-sessions-traffic/PLAN.md))

## Backlog list

- [Guard the CI proof revision and trim the proof specs](seeds/SEED-230-summarize-ci-proof-in-intent.md#guard-ci-proof-revision-and-trim-proof-specs) — SEED-230#guard-ci-proof-revision-and-trim-proof-specs
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
- [Read frontend Vitest proof in both projects](seeds/SEED-192-review-product-intent.md#read-vitest-proof) — SEED-192#read-vitest-proof
- [Read Open Dough dashboard Playwright proof](seeds/SEED-192-review-product-intent.md#read-playwright-proof) — SEED-192#read-playwright-proof
- [Read Node script-test proof](seeds/SEED-192-review-product-intent.md#read-node-test-proof) — SEED-192#read-node-test-proof
- [Read shell-check proof at its observed granularity](seeds/SEED-192-review-product-intent.md#read-shell-check-proof) — SEED-192#read-shell-check-proof
