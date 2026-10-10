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

Refinement already continues into slice planning under the
[preparation journey](../../src/skills/dough-story-refinement/references/preparation-journey.md).
The two stories below are queued, not completed refinement or implementation.
Automatic preparation and landing do not authorize product execution.

## Stories

<a id="land-planning-without-coordinator-questions"></a>

### Automatically land completed slice planning when no coordinator question remains

**Identity:** SEED-128#land-planning-without-coordinator-questions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/290-land-planning-without-coordinator-questions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"af8ac5ffd2c5f98f3a9c9346682cdf4b874b35e46267385de757021c3b4c8f14","plan":"413f9b933ae0eedff9be393b4d5492d4b1b9ecd26ad42de7ee6bfaf5505c5450"}}
```

**Beneficiary:** A coordinator waiting for usable preparation on remote main.

**Goal:** When a queued story's preparation ends with slice planning, and any
slice-plan refinement it invokes, with no open coordinator question and no
opt-out, the agent lands the retained preparation on remote main through the
existing keep sequence and Dough Land. The coordinator sees the refined story,
its plan, the recorded facts and assessment, and the ended Preparing
assignment in one commit without issuing a keep instruction.

**Scope:**

Required behavior:

- The landing default belongs to the end of preparation for a queued story
  with an announced Preparing assignment: after slice planning records its
  readiness assessment, whether planning followed refinement in the same
  session or was the session's first activity, including the slice-plan
  refinement planning invokes, and after a slice-plan refinement invoked
  directly on that story's plan. When plan refinement is unnecessary, nothing
  is added before landing: no approval step, no second report.
- Automatic landing is the existing keep sequence of
  [preparation disposition](../../src/skills/dough-story-refinement/references/preparation-disposition.md#keep-and-publish-the-retained-result),
  entered without a per-result keep instruction: validate that the workspace
  holds only this preparation's result (scratch observation edits reverted),
  stage `release`, land through Dough Land, and report publication, refresh,
  and retirement. Result and assignment end publish in one snapshot. The
  announcement's publication authority (`--push-authorized`) covers landing to
  the same remote target.
- The recorded assessment does not gate landing. A `ready` or `not-ready`
  plan whose reasons, early probe slices, or pre-Take decisions are already
  named in the plan is complete preparation; it lands so the coordinator sees
  it on main. The story stays queued with the recorder's facts; landing
  neither Takes it, starts execution, nor completes it.
- An open coordinator question is a response the preparation needs before its
  result is complete: a Needs human engagement refinement outcome, missing
  required context, a disputed constraint or Escalate finding, a story-resplit
  recommendation, or a stopped write or recording. Any of these stops
  automatic landing: report the expected response, keep the draft and its
  Preparing assignment, and say what continues once it is given. When the
  coordinator answers in the same session and no question remains, finish
  preparation and land.
- Opt-out: a refinement option `--retain` (label "Retain for review") in
  [refinement options](../../src/skills/dough-story-refinement/references/refinement-options.json),
  which the dashboard offers automatically, or an ordinary-language
  instruction to leave landing for later. It finishes the authorized
  preparation, records the assessment, and retains the result with its
  Preparing assignment for an explicit keep. `--refine-only` ends before
  planning and never lands: its workspace waits for planning. An explicit
  no-publish instruction, which already prevents the announcement, also
  disables landing.
- A landing stop keeps the existing handling: `story-left-queue` or
  `release-conflict` from the release, other content found in the workspace,
  a publication conflict, a second rejection, or an unclear push ends with the
  draft retained, nothing more pushed, and the receipt reported with the
  decision or rerun that continues. Recovery reruns `release`, then the same
  landing from the same workspace and target.
- With supplied dashboard reporting context, the landing's completion report
  under
  [dashboard completion](../../src/skills/dough-land/references/dashboard-completion.md)
  is the session's final operation, after the landing settles; a retained or
  stopped result reports `unfinished` with the expected response.
- Cohesive design: one landing policy, recorded in the
  [preparation journey](../../src/skills/dough-story-refinement/references/preparation-journey.md),
  which the story refinement, slice planning, and slice-plan refinement skills
  link to instead of restating. Automatic landing shares the keep sequence
  with one-shot `--auto-land` (see Architecture); no second handoff policy or
  copied landing steps. `src/skills/dough-slice-planning/SKILL.md` is at its
  250-line limit; shorten or split it to add the link.
- Update [ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md)
  concisely: completed preparation lands on `main` by default with an explicit
  opt-out, replacing "announcing work does not authorize landing", "preparation
  grants neither execution nor publication authority", Story Branch Mode step
  2, and the "Explicit keep instruction" flow edge. Landing preparation still
  grants no execution authority. ADR 0009 keeps its wording unless delivery
  finds a conflict; ADR status stays Proposed.

Deferred promises (not built or verified here):

- Landing comparison receipts (`landing-context.json`) for announced
  preparation launches; only one-shot launches capture one today.
- Dashboard dialog wording that describes the automatic landing.
- Automatic landing for story decomposition results or for a session that ends
  at refinement (`--refine-only` or a coordinator question).
- The one-shot refinement journey keeps its review default and `--auto-land`.

**Key examples:**

- A dashboard-established refinement continues into slice planning, which
  finds no concern and records `ready`: `release` stages the assignment end,
  Dough Land commits seed, plan, and release as one preparation commit on
  main, retires the worktree, and the completion report runs last. The report
  names the landed commit and the story's next step.
- Slice planning identifies boundary concerns, slice-plan refinement resolves
  them within the understood outcome, and the reassessment is recorded: land
  immediately with no approval step.
- Planning records `not-ready` because one premise needs a credentialed
  observation the plan already assigns to an early probe slice: land; the
  coordinator sees the plan and its Not ready reason on main.
- Slice-plan refinement counts 17 slices and recommends a story resplit, or
  reports an Escalate finding: report it, keep the draft and assignment in the
  workspace, land nothing, and name the resplit or scope decision as the
  expected response.
- The launch instruction carries `--retain`: planning finishes and records its
  assessment; the report gives the result commit location and an explicit keep
  as the next step; others still see the story as Preparing.
- `release` returns `story-left-queue` because another agent took the story:
  nothing is committed or pushed; the report lists its `choices` for the
  coordinator.
- The workspace still holds an unreverted scratch edit from a premise
  observation: the keep validation stops before any commit and names the file.

**Architecture:**

One concept, "automatic landing of a preparation result", with two entry
conditions and one shared sequence. The sequence is the keep path in
preparation disposition: ownership and content validation, candidate check,
Dough Land, reporting. One-shot `--auto-land` enters it as an advance keep
with `recheck` as the candidate check and no assignment to release; the
journey default enters it at preparation's end with `release` staging the
assignment's end. Each entry names only its condition and candidate check;
the sequence is written once. Slice planning's and plan refinement's final
sections point at the journey's end rather than carrying their own
disposition text, which also returns the slice-planning skill under its line
limit.

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
  requiring explicit keep. Reconcile that wording with the landing story's
  new default in a concise workflow ADR update during its delivery.
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
