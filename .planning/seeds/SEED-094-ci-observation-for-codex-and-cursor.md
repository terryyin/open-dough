---
id: SEED-094
status: active
planted: 2026-10-03
planted_during: Retrospective-findings runbook, 2026-10-03, first selected problem
trigger_when: A Codex or Cursor execution publishes an increment and no CI verdict reaches its coordinator
scope: story
---

# SEED-094: CI observation for Codex and Cursor executions

## Why This Matters

Managed delivery attaches CI observation for a Claude Code coordinator. On
Codex and Cursor the same delivery reports the publication unobserved, so
increments land with no CI verdict, and a Codex failure that was repaired
still holds completion open. The retained reports cover every recent Cursor
execution and most Codex executions across three projects.

## Story

<a id="observe-ci-on-codex-and-cursor"></a>

### Keep CI observed for Codex and Cursor executions

**Identity:** SEED-094#observe-ci-on-codex-and-cursor
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A developer running an execution on Codex or Cursor needs each
published increment's CI failure to reach the coordinator, as it does on
Claude Code, without reading scripts to find a workaround.

**Goal:** A Codex or Cursor coordinator's first managed delivery, and each
later one, is observed. A CI failure reaches that coordinator, and a failure
it has handled no longer holds completion open.

**Findings:**
[ODF-154](../../docs/maintainer/finding-names.md#odf-154),
[ODF-201](../../docs/maintainer/finding-names.md#odf-201),
[ODF-202](../../docs/maintainer/finding-names.md#odf-202).
Execution evidence stays in the catalog and the project logs.

**Scope:** To be refined. Bounded to how managed delivery identifies and binds
a Codex or Cursor coordinator, and how the Codex stream acknowledges a
delivered failure.

**Boundary:** Claude Code observation is unchanged. Dashboard-owned observation
is [SEED-063](SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring);
refinement decides whether this story builds on it or stays in the skill's
own observer. A transient transport loss (ODF-121) is not in this story.

**Evaluation:** A Codex and a Cursor execution each deliver an increment whose
CI fails, with no manual observer start. The coordinator receives the failure,
repairs it, and completes without a retained shutdown for the repaired failure.

**Completion:** Record the actual response and its first containing release on
ODF-154, ODF-201 and ODF-202 in the catalog.
