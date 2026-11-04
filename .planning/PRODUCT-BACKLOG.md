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

## Backlog list

- [Keep the same project fresh across views with fewer GitHub requests](seeds/SEED-232-reduce-dashboard-refresh-traffic.md#share-published-git-refreshes) — SEED-232#share-published-git-refreshes
- [See published changes without recurring browser checks](seeds/SEED-232-reduce-dashboard-refresh-traffic.md#see-published-changes-over-sse) — SEED-232#see-published-changes-over-sse
- [Keep Running Cursor sessions current with fewer local requests](seeds/SEED-232-reduce-dashboard-refresh-traffic.md#reduce-running-cursor-session-requests) — SEED-232#reduce-running-cursor-session-requests
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
- [Read Open Dough dashboard Playwright proof](seeds/SEED-192-review-product-intent.md#read-playwright-proof) — SEED-192#read-playwright-proof
- [Read Node script-test proof](seeds/SEED-192-review-product-intent.md#read-node-test-proof) — SEED-192#read-node-test-proof
- [Read shell-check proof at its observed granularity](seeds/SEED-192-review-product-intent.md#read-shell-check-proof) — SEED-192#read-shell-check-proof
- [Consolidate proof recording guidance](seeds/SEED-233-consolidate-proof-recording-guidance.md#consolidate-proof-recording-guidance) — SEED-233#consolidate-proof-recording-guidance
