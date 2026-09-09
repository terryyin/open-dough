---
id: SEED-009
status: active
planted: 2026-09-09
planted_during: Near-future direction hardening
trigger_when: Before further first-round SDLC skill extraction
scope: medium
---

# SEED-009: Keep only work that manifests external value

## Goal

The Open Dough maintainer can trust that every retained work-in-progress item
advances a named external outcome under the current direction. Work retained
only because it might become useful is deleted and may be recreated if demand
returns.

## Stories

<a id="harden-direction-change"></a>

### 1. Remove WIP without external value and find a home for the rest

**Status:** Refined.

**Goal:** The Open Dough maintainer sees a minimal, coherent working set in
which every remaining WIP has a named beneficiary, an evaluable external
outcome, and one canonical story home.

**Scope:** Review active and dormant seeds, backlog entries, executable plans,
unreleased skills and rules, retained acceptance evidence, and uncommitted work
created before the direction change. Keep an item only when its external value
is concrete. Give retained work one canonical story section and repair its
links; delete everything else instead of archiving it for possible future use.
Preserve immutable release history and the minimum enduring evidence required
by a current contract or Accepted ADR. Do not execute retained stories, extract
new guidance, or invent replacement work during this cleanup.

**Key examples:**

- Given a plan, seed, draft, or uncommitted change has no named beneficiary and
  observable outcome, when it is reviewed, then it is deleted rather than
  retained as potentially useful.
- Given WIP still manifests external value but has no canonical story, when it
  is reviewed, then the smallest corresponding story is placed in the seed that
  owns its outcome and all live references point there.
- Given completed evidence only repeats behavior already durable in released
  content, tests, or Git history, when it is reviewed, then the duplicate WIP
  evidence is deleted while any evidence required by a current contract or
  Accepted ADR remains.
- Given an uncommitted change has another active owner or unresolved intent,
  when cleanup reaches it, then ownership and external value are established
  before deletion; uncertainty alone is not treated as permission to destroy
  someone else's work.

**Evaluation:** No retained WIP lacks a named beneficiary, evaluable external
outcome, or canonical story home; the backlog contains only selected current
stories; all surviving links resolve; and removed work is recoverable from Git
history when it was previously committed.

**Effort:** M, medium confidence; the amount and ownership of uncommitted WIP
must be resolved during execution.

**Depends on:** None. This hardening precedes further extraction work.

## Ordering

Complete Story 1 before selecting or extracting another SDLC skill. Stop after
the cleanup; later demand, not preserved speculation, recreates deleted work.
