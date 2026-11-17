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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/692-declare-every-worker-preparation-with-its-own-budget/PLAN.md"}
```

**Goal:** A maintainer relies on the preparation mechanism that
SEED-340#keep-one-time-test-preparation-out-of-case-budgets delivered: every
worker-scoped preparation lives in the shared worker pool with its own
preparation lifetime, no leftover per-spec opt-in suggests otherwise, and
its proofs are lasting and run once.

**Scope:** Correct that execution's test support, the remaining worker
fixtures its retrospective found on `preparationPage` consumers, and its
runtime proofs; no product change.

**Plan:** [Worker preparation correction](../slice-plans/692-declare-every-worker-preparation-with-its-own-budget/PLAN.md).
