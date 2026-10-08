---
id: SEED-123
status: active
planted: 2026-10-08
planted_during: Terry's request to queue the local dashboard test flakiness seen in plans 257 and 276
trigger_when: Dashboard Playwright specs fail locally in unchanged code and pass alone or with fewer workers
scope: story
---

# SEED-123: The dashboard suite gives the same result under local load

## Why This Matters

Agents prove dashboard changes with local Playwright runs on a developer
machine that often runs other workloads. Specs that fail there in unchanged
code and pass on a rerun cost a rerun each time, leave the cause unexplained,
and teach agents to discount local failures. The repository expects one suite
result locally and in CI.

## Story

<a id="dashboard-suite-stable-under-load"></a>

### The dashboard Playwright suite gives the same result on a loaded developer machine as in CI

**Identity:** SEED-123#dashboard-suite-stable-under-load
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer or agent proving a dashboard change with local
Playwright runs on a machine that is also running other work.

**Goal:** A dashboard Playwright run at default workers on a loaded developer
machine gives the same pass or fail result as CI, so a local failure always
points at a real defect.

**Scope:** Keep each failed run's report and output before any rerun, so a
failure can be explained. Reproduce the failures under induced load at
default workers, and separate machine load from shared-output collisions
between concurrent runs in one checkout. Fix the waits, shared outputs, or
worker selection that the reproduction shows to cause them. Done when a
repeated loaded run passes at default workers.

**Evidence:** [ProjectFindings.md](../../ProjectFindings.md) DD-224, DD-226,
DD-240, and DD-257.

## Breadcrumbs

- [Tests](../../tests/README.md) and [native setup](../../tests/native-setup.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
