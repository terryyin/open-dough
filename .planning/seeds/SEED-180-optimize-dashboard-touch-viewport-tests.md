---
id: SEED-180
status: active
planted: 2026-10-30
planted_during: Terry's review and wrap-up of dashboard test candidate triage
trigger_when: Redundant touch viewport cases may prolong ordinary local dashboard test feedback
scope: measured dashboard touch viewport test optimization
---

# SEED-180: Optimize dashboard touch viewport tests

## Why This Matters

Developers need prompt, trustworthy dashboard test feedback. Completed candidate
triage identified repeated phone/tablet journeys as a possible source of cost;
it did not establish that any particular case is redundant or measure a saving.
This story owns plan 413's implementation separately from that completed triage.

## Selected Stories

<a id="optimize-dashboard-touch-viewport-tests"></a>

### Collapse redundant dashboard touch viewport matrices

**Identity:** SEED-180#optimize-dashboard-touch-viewport-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"25661b05d116ceb5ac8d3aa4ea6d7b0ad7519a99e328002add9262635753aff8","plan":"855414f79f352ab1b5644bdc00b7cf3810f41d94a278e21db7a4492b4e808372"}}
```

**Beneficiary:** A developer running `npm run test:dashboard` during local work.

**Goal:** Shorten ordinary local dashboard test feedback by removing evidenced
redundant touch viewport repeats while preserving behavioral coverage and
confidence. A measured finding that no worthwhile saving is available also
satisfies the story; an unmeasured reduction in case count does not.

**Scope:** Establish comparable focused-family and ordinary-local suite
baselines. Classify the plan's touch matrix consumers by actual CSS/container
branches and unique state-changing interactions, including rotation. Establish
and name surviving proof before narrowing or removing any case. Experiment only
with redundant viewport repeats, then remeasure the same focused family and
ordinary local suite, including replacement proof cost. Retain only credible
wall-time gains that justify their maintenance cost; undo ineffective or
inconclusive experiments and record the outcome.

**Scope limits:** No product behavior changes, weaker coverage, invented
profile exclusions, retries, sleeps, or skips. No removal of unique native
touch/terminal integration or cross-step recovery protection. Long completion
and production-watcher journeys and the necessary-cost agent-launch poles are
outside this story. Historical SEED-176/SEED-177 timings are context, not this
experiment's comparable before/after pair.

**Key examples:**

1. Phone and tablet cases exercise the same layout branch and interaction:
   name the retained representative and its fault detection, remove the
   redundant repeat, and retain the change only after comparable local
   measurements support a worthwhile improvement.
2. A viewport crosses a distinct CSS branch, or rotation preserves a draft,
   session choice, recovery state, or terminal attachment: preserve that proof;
   a shared viewport helper alone does not establish redundancy.
3. Classification finds no redundant cases, or the experiment fails to show a
   credible worthwhile gain: leave or restore the tests and record a supported
   no-change result with the comparison limits.

**Plan:** [Plan 413](../slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md).

**Execution authority:** Queued first at Terry's request. Do not Take, profile,
or implement until a later instruction authorizes execution.

## Breadcrumbs

- Completed triage: SEED-178#resolve-dashboard-test-optimization-candidates;
  source at `0136acf88f0f639d368ad94d54d04279a067de34`,
  `.planning/seeds/SEED-178-resolve-dashboard-test-optimization-candidates.md`.
- [Accepted candidate decisions](../../docs/maintainer/dashboard-test-timings.md#resolved-2026-10-30-resolve).
- [Dashboard test guidance](../../dashboard/tests/README.md#where-a-check-goes).
- [ADR 0010: Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
