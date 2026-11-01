---
id: SEED-209
status: active
planted: 2026-11-01
---

# Bound local test resources

<a id="bound-local-test-resources"></a>

### Bound local test resources

**Identity:** SEED-209#bound-local-test-resources
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Keep Open Dough's local full-suite verification from monopolizing a
shared development machine when agents work in multiple Git worktrees.

**Scope:** At most one full repository or dashboard suite runs across this
repository's worktrees at a time. Default local dashboard concurrency is two
workers and repository concurrency is four jobs; explicit worker/job overrides
remain supported. CI scheduling, defaults, selection and verdicts stay unchanged.
Focused checks remain independent. Nested suite fixtures inherit the outer
admission without deadlocking. Exit, failure and cancellation release admission;
an abandoned owner must not permanently block later runs. This is separate from
dashboard proof-cost plan 432 and does not change its tests or coverage.

**Key examples:** A full dashboard run in worktree A makes a full repository run
in B wait until A finishes. A focused check in B can run meanwhile. A nested run
started by A completes without waiting for A. Independent repositories do not
block each other. Local defaults are two/four, explicit overrides still work,
and CI keeps its existing parallelism with no local gate.
