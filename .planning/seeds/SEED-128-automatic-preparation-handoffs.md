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

These are three queued stories, not completed refinement or implementation.
Automatic preparation and landing do not authorize product execution.

## Stories

<a id="continue-refinement-to-slice-planning"></a>

### Continue completed refinement into slice planning when no coordinator question remains

**Identity:** SEED-128#continue-refinement-to-slice-planning
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A coordinator asking an agent to prepare a selected story.

**Goal:** After story refinement completes with no open question to the
coordinator, the agent automatically continues into slice planning in the same
owned temporary worktree and feature branch, including slice-plan refinement
when the existing planning workflow calls for it.

**Scope:**

- Make this continuation the refinement skill's normal behavior. Stop the
  automatic handoff only for a question requiring the coordinator's response
  or an explicit instruction on the refinement invocation not to continue
  into slice planning. Preserve useful missing-context and failure handling.
- Keep refinement and planning in one preparation workspace and branch,
  retaining the established story, assignment, and draft context across the
  handoff. The normal preparation journey ends with one commit landed on main
  once its landing is authorized by the applicable workflow.
- Retain the coordinator's ability to land completed refinement before a
  slice plan is written, including a refinement-only invocation. This is an
  intentional stopping point rather than the default preparation journey.
- Update the workflow ADRs concisely to express the normal combined
  preparation journey and its explicit stop; keep procedures in the skills.

**Architecture reminder for refinement and planning:** Design one cohesive
solution for this story, automatic landing after planning, and publishing dirty
preparation before execution. Consider future skill chaining without creating
separate handoff policies for each pair of skills. Find and reuse existing
workflow, workspace, disposition, and publication responsibilities; settle how
continuation intent, explicit stops, coordinator questions, and established
context pass through the chain. Keep each responsibility in one authoritative
home, with only necessary host adaptation. Do not implement speculative future
chains or prescribe a new framework merely for extensibility.

**Key examples:**

- Refinement records an understood story with no coordinator question and no
  stop instruction: proceed directly to slice planning in the same worktree;
  run slice-plan refinement when needed by that workflow.
- Refinement needs a coordinator scope decision: report the question and stop
  dependent planning until it is answered.
- The refinement invocation explicitly says not to continue into slice
  planning: retain the refinement result at that boundary; the coordinator
  can choose to land that result before planning.

<a id="land-planning-without-coordinator-questions"></a>

### Automatically land completed slice planning when no coordinator question remains

**Identity:** SEED-128#land-planning-without-coordinator-questions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A coordinator waiting for usable preparation on remote main.

**Goal:** Once slice planning and any needed slice-plan refinement finish with
no open question to the coordinator, the agent automatically lands the retained
preparation through Dough Land without another landing instruction.

**Scope:**

- Apply the same default after planning alone or planning followed by
  slice-plan refinement. When refinement is unnecessary, it adds no extra
  activity or approval step before landing.
- Stop automatic landing for an open coordinator question or an explicit
  instruction not to land automatically. Preserve the draft and explain what
  response would allow continuation; preserve existing verification,
  publication, recovery, and failure handling.
- Reuse the combined preparation context from the first story. Normally,
  refinement, planning, and any plan refinement become one preparation commit
  landed on main through the existing publication contract.
- Update the workflow ADRs concisely with this default and explicit opt-out.
  Landing preparation neither starts execution nor completes the product story.

**Key examples:**

- Planning finishes without needing plan refinement and without a coordinator
  question or opt-out: automatically land the preparation.
- Planning identifies concerns that slice-plan refinement resolves within the
  understood outcome: finish that refinement, then automatically land when no
  coordinator question remains.
- Planning or plan refinement leaves a coordinator decision open: report it
  and retain the draft without automatic landing.
- An explicit instruction disables automatic landing: finish the authorized
  preparation and retain it for the coordinator's later landing decision.

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
  currently describes preparation as granting no publication authority and
  requiring explicit keep. Reconcile that wording with the first two stories'
  new defaults in concise workflow ADR updates during their delivery.
- [ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md)
  describes fresh execution from fetched remote trunk and retained owned inputs.
  Align the third story's transition with that publication/startup contract.
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
