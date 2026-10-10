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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/291-execution-handoff-in-preparation-worktree/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ac008280bf5e2f44899fc8270ee6abe91ee5cc8691b2a79d8c90fbae24847c1f","plan":"cc3ee35584c312e6bd0fa121e1be27ab2e0acb3c15d9b08ee5e378cd6f3f6931"}}
```

**Beneficiary:** A coordinator who instructs execution inside the active
preparation session, by attaching to it, while its owned workspace still holds
unlanded refinement or planning. The dashboard disables Start on a card whose
story has an open session, so this instruction is the only way to continue
that story without first ending the session.

**Goal:** The execution handoff lands the pending preparation on remote main,
then starts execution in the same owned workspace and branch through the
ordinary execution start, fast-forwarded to freshly fetched trunk. The
workspace the preparation created continues as the execution workspace: in
Story Branch Mode its branch becomes the story branch, in Trunk Mode the
temporary execution branch. Execution uses the integrated story and plan, and
no second worktree, branch, landing, or Take is created.

**Scope:**

Required behavior:

- Trigger: an execution instruction for the story being prepared, with its
  selected mode, arrives in the session that holds that story's Preparing
  assignment while the owned workspace holds uncommitted or unpublished
  preparation. A `--retain` result, a draft kept by an answered coordinator
  question, and any preparation before the automatic landing default exists
  are all this situation. When nothing is unlanded and the workspace was
  already retired, the ordinary start applies and this handoff adds nothing.
- Resolve the start before landing: the execution source and authority under
  [Establish execution context](../../src/skills/dough-execute-plan/SKILL.md#establish-execution-context)
  (a plan, or an explicit skip-planning instruction for a Flawless story),
  a recorded `ready` assessment on the result, which the start requires on
  trunk and which skip-planning authority lets the recorder write as
  planless, the mode, the publication preconditions, and every input the
  installed start needs (workspace path and branch, identity, publisher ID,
  remote, target, host). A stop here retains the draft and assignment;
  nothing lands.
- Land through the shared keep sequence of
  [preparation disposition](../../src/skills/dough-story-refinement/references/preparation-disposition.md#keep-and-publish-the-retained-result)
  as its third entry, "execution handoff": validate that the workspace holds
  only this preparation's result, stage `release`, land through Dough Land,
  and confirm the landed SHA on the fetched target. Two things differ from the
  journey default: the worktree is not retired, because it continues as the
  execution workspace, and no dashboard completion is reported, because the
  session continues and execution's own finish or wrap-up stays the final
  operation. The announcement's publication authority covers this landing;
  the execution instruction's authority covers the claim.
- Start execution with the installed `execution-start.mjs start`, supplying
  the preparation workspace path and branch, the selected mode, the recorded
  integration checkout, remote, and target. The start reuses the workspace
  under refresh eligibility (clean, on that branch, at or behind fetched
  trunk), publishes the Take, and in Story Branch Mode publishes that branch
  at the Take as the story branch. Retain its receipt as the execution
  identity, then continue at checkout-bound setup and the first slice, as an
  established start would.
- Recovery never repeats an accepted landing or duplicates a claim: after a
  landing stop, rerun `release` and the same landing from the same workspace
  and target; after a refused or interrupted start, rerun the same start with
  the same workspace, branch, and publisher ID, which answers `existing` or
  `resumed`. A `story-left-queue` or `release-conflict` release, a landing
  stop, or an unclear push ends with the draft retained, nothing more pushed,
  and the blocked transition reported with the decision or rerun that
  continues; execution has not started.
- Preserve across the handoff: the story identity, plan path, selected mode,
  integration checkout, dashboard reporting context, and the execution
  instruction. The creation record `created-for/<identity>` the preparation
  start wrote is what later lets wrap-up retire the worktree and branch;
  nothing rewrites it.
- Cohesive design: one landing concept with three entries, recorded once in
  the preparation disposition and entered from the
  [preparation journey](../../src/skills/dough-story-refinement/references/preparation-journey.md)
  beside the landing default, with the execution skill's established-start
  continuation reused for the handoff's result. No script change: `release`,
  Dough Land, the execution start's workspace reuse, and retirement already
  do this. Update [ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md)
  and ADR 0007's Story Branch Mode step 3 concisely so a reused owned
  workspace at fetched trunk is a named startup source and the preparation
  branch may continue as the story branch; both stay Proposed.

Deferred promises (not built or verified here):

- Retaining the worktree after the journey's automatic landing in case an
  execution instruction follows in the same session. After that landing
  retires the worktree, a same-session instruction takes the ordinary start,
  which creates a workspace.
- Starting execution from the dashboard for a story whose preparation session
  is still open; Start stays disabled there.
- One-shot execution from a preparation session, and the one-shot refinement
  journey's own review and `--auto-land` handling.
- The dashboard's launch record for the refinement launch: it stays open
  through execution and closes on execution's own completion report, as the
  completion contract already says.

Rejected, with its reason: carrying the unlanded draft into execution without
landing, as one-shot escalation carries edits. The installed start reads the
selected story and plan from fetched trunk, so execution needs the
preparation on main, and the coordinator needs to see it there.

**Key examples:**

- A session holds an uncommitted refined story and plan under its Preparing
  assignment and receives `/dough-execute-plan SEED-N#story`: the workspace
  validates, `release` stages the assignment's end, Dough Land pushes one
  preparation commit to main and leaves the worktree at that SHA, the start
  with the same path and branch answers `published` with `created: false`,
  the Take is on main, the branch `claude/<slug>` is published at the Take as
  the story branch, and the first slice runs in that worktree. The dashboard
  shows the story Taken with progress from that branch; the session reports
  nothing until its own finish.
- The same session receives `--trunk`: the same landing, then a Trunk Mode
  start; the branch stays the temporary local execution branch, and the first
  increment publishes to main from it.
- The session ended at a Needs human engagement outcome, and the coordinator's
  next message is the execution instruction without the expected answer: the
  preparation is not complete; report the expected response, land nothing,
  claim nothing.
- The session ended at refinement with `--refine-only` and receives execution
  with an explicit skip-planning instruction for a Flawless story: the
  recorder writes planless and `ready`, the refinement lands, and a planless
  execution starts in the same worktree.
  Without that instruction, the source rule stops before landing and names
  slice planning as the next step.
- `release` answers `story-left-queue` because another agent took the story:
  nothing is committed or pushed; the report lists its `choices`; no start.
- The landing was accepted, then the start was refused because the remote was
  unreachable: the rerun's `release` answers `already-released`, Dough Land
  finds the tip contained and pushes nothing, and the same start answers
  `published` or `resumed`; one worktree, one Take.
- The worktree holds an unreverted scratch edit from a premise observation:
  the keep validation stops before any commit, names the file, and execution
  does not start.
- The journey's automatic landing already landed and retired the worktree,
  and the coordinator types the execution instruction next: nothing is
  unlanded; the ordinary start creates the execution workspace.

**Architecture:**

The landing concept gains its third automatic entry, so disposition's list of
keep sources, which starts with the explicit keep instruction, names four.
Each entry names its condition, candidate check, retirement gate, and final
operation; the sequence is written once in preparation disposition:

| Entry | Condition | Candidate check | Retirement | Final operation |
| --- | --- | --- | --- | --- |
| One-shot `--auto-land` | Verified one-shot result | `recheck` | Retire | Completion report |
| Journey default | Preparation ends, no question, no opt-out | `release` | Retire | Completion report |
| Execution handoff | Execution instruction in the session | `release` | None: the workspace continues | None: execution's finish owns it |

The execution side adds no mechanism. The installed start already reuses an
owned workspace that is clean, on the named branch, and at or behind fetched
trunk, and already publishes a Story Branch Mode branch at the Take when the
remote lacks it. Dough Land leaves the worktree at the accepted SHA and never
publishes the preparation branch, so that branch name is free on the remote.
One creation record, written at preparation start and naming the story
identity, serves preparation, execution, and wrap-up retirement. Accepted
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
shapes this: one representation per conceptual solution, and integration
into trunk before dependent work starts. Accepted
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps the guidance concise and linked. Proposed ADR 0009's "fresh workspace
from fetched trunk" and ADR 0007's "create its feature branch and worktree"
describe creation only; the reuse path both starts already share is the
concise alignment named in scope. No Accepted decision conflicts.

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
- Terry's 2026-10-10 refinement direction for the execution-handoff story:
  when the coordinator continues the same session into execution, keep the
  preparation worktree and branch, and let that branch become the story
  branch in Story Branch Mode.
- [Product backlog](../PRODUCT-BACKLOG.md).
