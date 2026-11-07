---
id: SEED-251
status: active
planted: 2026-11-07
scope: story
---

# Dashboard backend test grouping

## Context

Dashboard Backend Test is already an independent Intent entry backed by
`dashboard/backend-tests/`, beside `dashboard/tests/`. Its tests remain mostly
flat. The browser suite now has ten feature folders; the service suite needs
its own smaller set of meaningful feature groups.

## Story

<a id="group-dashboard-backend-tests"></a>

### Group Dashboard Backend Test by feature

**Identity:** SEED-251#group-dashboard-backend-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer browsing backend behavior and its CI protection
through Intent.

**Outcome:** Opening Dashboard Backend Test reveals a concise, complete set of
service feature groups, making the behavior protected by each test easy to find.

**Scope:** Analyze the existing backend behavior before choosing the groups.
Reuse the browser suite's domain vocabulary where accurate, but prefer fewer
groups for the narrower service scope. Use at most ten groups; each name must
express one defining domain concept, without "and" or a list of concerns.
Every backend test and case-definition module belongs to exactly one feature
group. Shared fixtures may remain shared.

**Key examples:**

1. Open Dashboard Backend Test in Intent → browse feature folders and reach
   every existing backend test under its owning feature.
2. A test spans several implementation modules → classify it by the behavior
   its assertions protect, using a single feature owner.
3. Run the existing CI validation after regrouping → every existing case still
   executes once, with proof and duration history attributed to its moved path.

**Constraints:** Retain the independent Dashboard Backend Test entry and its
sibling directory. Preserve test behavior and coverage. Update imports,
discovery, proof attribution, timing records, and maintained documentation as
needed. Keep the shared CI setup and existing parallelism; verify complete CI
execution without increasing CI wall time against a comparable baseline.

**Failure policy:** [Failing and flaky tests](../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Breadcrumbs

- [Current dashboard feature groups](../../dashboard/tests/feature-groups.md).
- [Shared test run and CI schedule](../../dashboard/tests/shards.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
