---
id: SEED-340
status: active
planted: 2026-11-13
planted_during: execution of SEED-300#express-session-test-intent-through-page-objects, whose obligation G6 found cold preparation inside a first case's 30 s budget and whose G8 left the remaining consumers
trigger_when: Terry asked on 2026-11-13 to queue a story that removes this risk
scope: story
---

# SEED-340 — Keep one-time browser test preparation out of case budgets

## Why this matters

Dashboard browser cases take one-time preparation (queued origins, app build,
server bundle) from worker fixtures in `dashboard/tests/support/pageTest.ts`,
outside each case's 30 s budget, so a case gets the same verdict whether it
runs first or later in a worker. Under the project's failure policy a case
that times out only when it happens to run first under ordinary machine load
is a flaky test, not a speed preference. The remaining story below finishes
that mechanism's coverage.

<a id="declare-every-worker-preparation-with-its-own-budget"></a>

### Declare every worker preparation with its own budget

**Identity:** SEED-340#declare-every-worker-preparation-with-its-own-budget
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/692-declare-every-worker-preparation-with-its-own-budget/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0dd33e82b097d948460532a0391bc0724801ea82eae5b0cdc3638bca72993c5a","plan":"7813898251f6dd7382b09b265a03826c4c30a33425ba8bf2c4c8c9cf1c68de03"}}
```

**Goal:** A maintainer can run a preparation-page case first or after a case
with a different history. Both use the same worker pool. Cold history and
queued-origin preparation have the project's 60-second worker budget, and
each case has its full 30 seconds for its private setup and assertions.

**Scope:** Finish the pooled fixture declarations, remove redundant
preparation-page opt-ins, and keep one runtime proof for each distinct
preparation promise. This correction covers the test support and consumers
identified by the retrospective. Product behavior and the case timeout stay
as delivered.

**Key examples**

- In a one-worker run, the comparison retry can use a kept Story Branch and
  the shallow-history case can use an ordinary queued trunk. Both finish on
  the same worker with independent writable origins.
- A case that first needs a kept history or the native Codex queued origin
  gets the 60-second preparation allowance without extending its case budget.
- A custom landed-CI boundary server prepares the bundle. A development
  notification server starts from source with zero app or bundle requests.
  The three runner groups accept both queued host layouts, while one cold run
  proves timing, private copies and the later-revision override.

**Plan:** [Worker preparation correction](../slice-plans/692-declare-every-worker-preparation-with-its-own-budget/PLAN.md).
