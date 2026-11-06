---
id: SEED-249
status: active
planted: 2026-11-06
scope: story
---

# Dashboard test organization

## Story

<a id="organize-dashboard-tests"></a>

### Organize dashboard tests

**Identity:** SEED-249#organize-dashboard-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Make the dashboard's automated behavior inventory navigable through
the ten agreed feature groups, with the backend suite exposed as a separate
Dashboard Backend Test entry, while preserving complete CI execution without
increasing CI wall time.

**Scope:** Move browser-free boundary specs out of `dashboard/tests/` into a
sibling test directory. Group every remaining dashboard spec under exactly one
of Configuration, Stories, Launches, Sessions, Terminals, Review, Intent,
Navigation, Observation, or Runtime. Update discovery, shared support, imports,
Intent locations, proof attribution, timing allocation, CI, and maintained
documentation as required by the move. Retain every existing test case and its
behavior. Keep the existing test parallelism and shared build/setup costs.

**Key examples:** Backend tests appear as their own Intent entry and still run
in the same CI validation; dashboard tests appear under the ten feature folders;
the pre/post test inventory has no missing or duplicate cases; timing history
follows renamed specs so CI allocation has no cold-start regression.

**Proof:** Compare discovered cases and shard allocation before and after the
move, run the affected local suite with the maintained macOS sleep guard, and
verify the published revision's complete CI result and wall time against a
comparable successful baseline. A slower or incomplete result requires diagnosis
and correction before completion.

**Failure policy:** [Failing and flaky tests](../../AGENTS.md#failing-and-flaky-tests)
applies without exception.
