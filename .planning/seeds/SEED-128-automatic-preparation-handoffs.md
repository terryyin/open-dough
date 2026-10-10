---
id: SEED-128
status: active
planted: 2026-10-10
planted_during: Terry's request for automatic refinement, planning, landing, and preparation-to-execution handoffs
trigger_when: An active preparation session can continue without a coordinator decision or receives an execution instruction while its preparation is unpublished
scope: multi-story
---

# SEED-128: Continue preparation without unnecessary coordinator handoffs

## Why This Matters

A coordinator normally expects an owned temporary worktree to finish story
refinement, slice planning, and any needed slice-plan refinement in one go.
Stopping between these activities when no question remains adds coordination
without changing the result. The usual result is one preparation commit landed
on main. A subsequent execution instruction must start from published
preparation and fresh remote trunk in its selected execution mode.

Refinement continues into slice planning, and completed preparation lands by
default, under the
[preparation journey](../../src/skills/dough-story-refinement/references/preparation-journey.md).
The story below is queued, not completed refinement or implementation.
Automatic preparation and landing do not authorize product execution.

## Stories

<a id="publish-dirty-preparation-before-execution"></a>

### Land unpublished preparation before starting execution from fresh remote main

**Identity:** SEED-128#publish-dirty-preparation-before-execution
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A coordinator invoking plan execution in an active session
whose owned preparation worktree still contains uncommitted refinement or
planning changes.

**Goal:** The execution handoff first lands the pending preparation, then
starts execution from freshly fetched origin/main in the selected execution
mode, so execution uses the integrated story and plan rather than carrying a
dirty preparation draft into its new workspace.

**Scope:**

- Handle an execution-skill instruction received during the same session's
  refinement or planning when its preparation worktree is dirty. Land that
  preparation before execution startup, then establish execution from fresh
  remote trunk using the selected Story Branch Mode or Trunk Mode.
- Preserve the selected story, plan, execution instruction, and selected mode
  across landing and any retirement of the preparation worktree. Use the
  published result to establish execution rather than reusing a stale or
  dirty starting point.
- Reuse the shared handoff design and Dough Land's publication and recovery
  contract. If a coordinator question, explicit no-land instruction, or failed
  publication prevents landing, preserve the preparation and report the
  blocked execution transition instead of starting on an unpublished draft.
- Establish successful remote publication before execution starts. Recovery
  must not repeat an already accepted landing or start duplicate execution.
  Retain the existing execution authority and readiness requirements.

**Key examples:**

- An active session has uncommitted story refinement and slice-plan changes
  and receives authorized Story Branch Mode execution: land preparation, fetch
  origin/main, and establish the story's execution workspace in that mode.
- The same situation selects Trunk Mode: land preparation first, then establish
  Trunk Mode execution from fresh origin/main with the published story and plan.
- Landing pauses for an unresolved coordinator question or fails publication:
  the draft remains recoverable and execution has not started.
- Landing succeeds but execution startup is interrupted: resume from the
  accepted preparation and fresh remote trunk without landing it a second time.

## Constraints and Existing Behavior to Reconcile

- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps one representation per conceptual solution and readiness separate from
  execution authority. Shared design and ordinary reconciliation do not alone
  create blocking story dependencies.
- [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  and [AGENTS.md](../../AGENTS.md) require concise shared behavior, authored in
  `src/skills/`, with procedures linked from their authoritative homes.
- [ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
  describes completed preparation landing on `main` by default. Reconcile the
  execution handoff with it in a concise workflow ADR update during delivery.
- [ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md)
  describes fresh execution from fetched remote trunk and retained owned inputs.
  Align the execution-handoff story's transition with that publication/startup contract.
  ADRs 0007 and 0009 are Proposed; queueing these stories changes no ADR status.
- [Story refinement](../../src/skills/dough-story-refinement/SKILL.md),
  [slice planning](../../src/skills/dough-slice-planning/SKILL.md),
  [slice-plan refinement](../../src/skills/dough-slice-plan-refinement/SKILL.md),
  [preparation disposition](../../src/skills/dough-story-refinement/references/preparation-disposition.md),
  [Dough Land](../../src/skills/dough-land/SKILL.md), and
  [execution startup](../../src/skills/dough-execute-plan/SKILL.md) are the
  existing responsibilities to inspect when refining and planning this work.

## Breadcrumbs

- Terry's 2026-10-10 request: queue these three stories in the stated order
  before the existing fifth priority; allow direct main editing and origin sync;
  require a cohesive architecture design reminder in the first story and concise
  workflow ADR updates for the first two.
- [Product backlog](../PRODUCT-BACKLOG.md).
