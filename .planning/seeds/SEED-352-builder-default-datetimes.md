---
id: SEED-352
status: active
planted: 2026-11-14
scope: story
---

# SEED-352 — Builder defaults for incidental datetimes

<a id="use-builder-defaults-for-incidental-datetimes"></a>

### Use builder defaults for incidental datetimes

**Identity:** SEED-352#use-builder-defaults-for-incidental-datetimes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Test authors express meaningful examples while MakeMe supplies values needed only to construct valid records.

**Scope:** Evaluate MakeMe default and beforePlease guidance, clarify it where needed, and replace incidental datetime setup across tests with existing or coherent builder defaults. Preserve explicit times for time-sensitive behavior, ordering, boundaries, and invalid-data examples.

**Examples:** A recorded session unrelated to time omits its datetime override and receives a valid builder default. A test proving recency still selects its time. Explicit overrides survive default evaluation.

The current contextual instruction authorizes evaluating and applying the bounded change directly in the established workspace. Required checks follow [the project failure policy](../../AGENTS.md#failing-and-flaky-tests).
