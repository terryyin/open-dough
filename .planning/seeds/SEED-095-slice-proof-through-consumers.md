---
id: SEED-095
status: active
planted: 2026-10-03
planted_during: Retrospective-findings runbook, 2026-10-03, second selected problem
trigger_when: A slice passes its chosen proof and CI then fails in a consumer of the behavior the slice changed
scope: story
---

# SEED-095: Slice proof through consumers

## Why This Matters

Implementers choose a slice's proof from the files they edited. Specs, page
objects and callers that consume the changed behavior from elsewhere are not
run, so CI is the first to fail and the execution pays a pause, diagnosis,
repair and republication. This is the most frequent retained finding: more
than fifteen executions across three projects, still occurring on 0.3.54.

## Story

<a id="prove-slices-through-consumers"></a>

### Prove a slice through the consumers of what it changes

**Identity:** SEED-095#prove-slices-through-consumers
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The agent implementing or accepting a slice needs the slice's
local proof to include the tests that consume the behavior, text or default it
changed, so a consumer's failure appears before publication.

**Goal:** When a slice changes shared behavior, a visible message, or a
default, its proof is selected from the consumers of that change, not only
from the edited components. Acceptance does not publish while a known consumer
is unrun.

**Findings:**
[ODF-150](../../docs/maintainer/finding-names.md#odf-150),
[ODF-107](../../docs/maintainer/finding-names.md#odf-107).
Execution evidence stays in the catalog and the project logs.

**Scope:** To be refined. Bounded to how a slice's proof is selected and
checked at implementation hand-back and acceptance.

**Boundary:** Planning-time premise observation (ODF-074, ODF-110) already has
released responses and is not reopened here, though refinement may weigh its
post-fix reports. Open Dough's own CI-only test failures are
[SEED-093](SEED-093-local-checks-agree-with-ci.md).

**Evaluation:** Replay retained cases where a changed store method, message or
shared default broke a consumer's spec. The slice's selected proof includes
that consumer and fails locally before publication.

**Completion:** Record the actual response and its first containing release on
ODF-150 and ODF-107 in the catalog.
