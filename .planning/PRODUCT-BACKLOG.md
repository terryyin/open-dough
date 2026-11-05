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

- [Show CI status and timing on the Intent homepage](seeds/SEED-239-intent-home-ci-status.md#show-ci-status-on-intent-home) — SEED-239#show-ci-status-on-intent-home ([plan](slice-plans/476-show-ci-status-on-intent-home/PLAN.md))
- [Load Intent without disruption or bulk source transfer](seeds/SEED-241-intent-loading-and-traffic.md#load-intent-without-disruption-or-bulk-source-transfer) — SEED-241#load-intent-without-disruption-or-bulk-source-transfer ([plan](slice-plans/477-load-intent-without-disruption/PLAN.md))

## Backlog list

- [Stop revision checks when a page leaves during stream setup](seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#stop-revision-checks-after-setup-disconnect) — SEED-240#stop-revision-checks-after-setup-disconnect
- [Read session assignment history when Session details opens](seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#read-session-assignments-on-demand) — SEED-240#read-session-assignments-on-demand
- [Review how well a story's intent is protected](seeds/SEED-192-review-product-intent.md#assess-story-intent-protection) — SEED-192#assess-story-intent-protection
- [Review complexity introduced by a story's tests](seeds/SEED-192-review-product-intent.md#assess-story-test-complexity) — SEED-192#assess-story-test-complexity
