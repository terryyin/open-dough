---
id: SEED-086
status: active
planted: 2026-10-03
planted_during: Maintainer request for production dashboard continuous delivery
trigger_when: A developer wants the production dashboard to follow qualifying changes on origin/main without creating a version tag
scope: unestimated
---

# SEED-086: Production dashboard continuous delivery

## Why This Matters

A developer running the production dashboard wants published application
changes to become available automatically. Today the watcher selects numeric
version tags, so a change on main needs a new tag before it reaches the running
dashboard. Follow main directly and use the same change exclusions as CI.

## Story

<a id="dashboard-continuous-delivery"></a>

### Automatically build and restart the production dashboard from main

**Identity:** SEED-086#dashboard-continuous-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and outcome:** A developer running the production dashboard
receives qualifying changes published to origin/main through the watcher,
which builds the application and restarts it without requiring a version tag.

**Requested behavior:**

- Replace the production dashboard watcher's version-tag selection with
  observation of published changes on origin/main.
- For a qualifying update, build the application from the selected published
  revision and restart the production dashboard with that build.
- Use the same path exclusions as CI. Currently those are `.planning/**` and
  `docs/**` in `.github/workflows/ci.yml`. An update confined to excluded paths
  produces no new dashboard deployment, build, or restart. A mixed update with
  at least one non-excluded change qualifies.
- Keep the watcher aligned with CI's exclusion policy as that policy changes;
  settle how it consumes that policy during refinement.

**Key examples:**

- An application change reaches origin/main without a new version tag. The
  watcher picks it up, builds it, and restarts the production dashboard.
- Only a story under `.planning/` or documentation under `docs/` changes. CI
  skips the update and the running production dashboard is not rebuilt or
  restarted.
- An update changes both documentation and application code. The watcher
  builds and runs the published application revision.
- Several commits arrive between checks, including excluded-only commits.
  A qualifying application change must still be picked up.

**Boundary:** This story changes production dashboard delivery. Open Dough
guidance installation and update retain the tagged-release contract in
[ADR 0003 — Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
Capture and queue this work now; implementation remains future work.

**Refinement questions:** Define the initial main revision, the comparison
baseline across skipped updates and watcher restarts, and treatment of multiple
pending changes. Decide whether deployment waits for successful CI; matching
CI exclusions alone does not settle that policy. Reconcile build and restart
failure handling with the existing watcher, which keeps the current application
on build failure and attempts restoration when a new application fails to start.

## Breadcrumbs

- Terry's 2026-10-03 request: put this story first in the product backlog;
  remove the dashboard's need for a new version tag; watch main, apply CI's
  exclusions, build the application, and restart it.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current production watcher](../../scripts/watch-dashboard.mjs).
- [Production release runner](../../dashboard/server/productionReleaseRunner.mjs).
- [CI path exclusions](../../.github/workflows/ci.yml).
