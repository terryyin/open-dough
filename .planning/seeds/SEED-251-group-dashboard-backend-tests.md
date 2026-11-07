---
id: SEED-251
status: active
planted: 2026-11-07
scope: story
---

# Dashboard backend test grouping

## Context

Dashboard Backend Test is already an independent Intent entry backed by
`dashboard/backend-tests/`, beside `dashboard/tests/`
([SEED-249#organize-dashboard-tests](../done/SEED-249_organize-dashboard-tests.json)).
Its tests remain mostly flat. The browser suite now has ten feature folders; the
service suite needs its own smaller set of meaningful feature groups.

## Story

<a id="group-dashboard-backend-tests"></a>

### Group Dashboard Backend Test by feature

**Identity:** SEED-251#group-dashboard-backend-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/487-group-dashboard-backend-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"272eae0d9534f572b0dee45c58892120807694daae63cef2d3d1fb5ee23ea6d4","plan":"bee46c93e482402f1677b89bb6e194e96ac1fc0467bfec8e93d684ccc9039652"}}
```

**Beneficiary:** A developer browsing backend behavior and its CI protection
through Intent.

**Goal:** Opening Dashboard Backend Test reveals a concise, complete set of
service feature groups, so the behavior each test protects is easy to find,
without losing coverage or slowing the shared dashboard CI route.

**Scope:**

- **Required:**
  - Analyze the existing backend suite before choosing groups. Reuse the
    browser suite's domain vocabulary
    ([feature groups](../../dashboard/tests/feature-groups.md)) where it still
    names the protected service behavior accurately; prefer fewer groups than
    the browser suite's ten for the narrower service scope.
  - Place every backend `*.spec.ts` and every backend case-definition module
    under exactly one feature folder. Shared fixtures and support that several
    features reuse may remain shared outside those folders.
  - Update imports, discovery, Intent/proof path attribution, duration records,
    and maintained documentation so each moved path remains truthful.
  - Keep the independent Dashboard Backend Test entry and its sibling directory;
    keep the shared Playwright run, build, setup, and existing twelve-shard
    parallelism.
- **Required restrictions:**
  - At most ten feature groups. Each group name expresses one defining domain
    concept, without "and" or a list of concerns. Justification: Intent browsing
    stays scannable; compound names hide the defining owner.
  - Preserve every existing case and its assertions; execute each case once
    after regrouping. Justification: regrouping must not drop or duplicate
    protection.
  - Complete CI must still pass without increased wall time against a comparable
    successful baseline. Justification: organization must not tax the shared
    feedback loop.
- **Scope limits:**
  - Does not change product runtime behavior beyond Intent's folder browse of
    this entry.
  - Does not redesign the shared runner, shard count, deadlines, retries, or
    add CI jobs or builds.
  - Does not regroup the browser suite or create the frontend-test entry
    ([SEED-252](SEED-252-extract-dashboard-frontend-tests.md#extract-dashboard-frontend-tests)).
  - Exact group inventory and membership are chosen during execution from the
    analysis above; refinement does not freeze folder names.

**Key examples:**

1. Open Dashboard Backend Test in Intent → browse the chosen feature folders and
   reach every existing backend test under its owning feature.
2. A test spans several implementation modules → classify it by the behavior its
   assertions protect, using a single feature owner (same rule as the browser
   suite: choose the feature whose behavior the test proves, not an older
   filename prefix).
3. A backend case-definition module supports one feature's specs → it lives in
   that feature folder; a truly shared fixture stays outside the groups.
4. Run the existing CI validation after regrouping → every existing case still
   executes once, with proof and duration history attributed to its moved path,
   and wall time is no worse than a comparable successful baseline.

**Failure policy:** [Failing and flaky tests](../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Breadcrumbs

- [Current dashboard feature groups](../../dashboard/tests/feature-groups.md).
- [Shared test run and CI schedule](../../dashboard/tests/shards.md).
- [Backend suite README](../../dashboard/backend-tests/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
