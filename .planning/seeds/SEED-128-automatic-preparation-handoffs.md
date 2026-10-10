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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/287-continue-refinement-into-slice-planning/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1e723d84c4013343ce0c9803b31d87e93622cc0d0b0ee6b3913136f72a4387f7","plan":"f5a3b7618f9dfd80be74dbee714faaa8f4bcf8ed43fcccbe6f0e2742f6c2a3af"}}
```

**Beneficiary:** A coordinator who starts story refinement from the dashboard's
Refinement launch or a direct `dough-story-refinement` invocation and wants a
plan-ready preparation from that one start.

**Goal:** After story refinement completes with no open question to the
coordinator, the agent continues into slice planning in the same owned
temporary worktree and feature branch, including slice-plan refinement when the
existing planning workflow calls for it. One launch yields one preparation
draft, the refined story and its plan with a recorded readiness assessment,
instead of a refinement report the coordinator must read and answer with a
second planning start. Landing that draft and starting execution from it are
the sibling stories; this story changes neither.

**Scope:**

Required behavior:

- Continuing into slice planning is the refinement skill's normal ending for
  a ready outcome, both "Ready for slice planning" and "Flawless". After the
  seed records goal, scope, and key examples and the recorder records
  `refined`, the same session invokes the installed slice-planning skill for
  the story the invocation names, in the same workspace, branch, and session.
  Slice planning runs as it does today: its `start` returns `continued` on the
  existing Preparing assignment, it writes the plan, runs slice-plan
  refinement when its own rule calls for it, and records the readiness
  assessment. The refinement outcome is reported before continuing; the
  session's final report is the planning report, which carries the story's
  refinement outcome, the plan path, the recorded assessment, and the pending
  draft and Preparing assignment as information.
- A Flawless outcome continues into slice planning too. Refinement alone never
  records `ready`, so an unplanned Flawless story shows "Not marked Ready for
  execution" on the dashboard's Execution launch. The one-slice plan makes the
  story ready; the coordinator's choice to execute it planless stays an
  execution-launch decision and is unchanged.
- Two conditions stop the continuation. A Needs human engagement outcome stops
  before planning and lists the expected responses as today; when the
  coordinator answers in the same session and no question remains, refinement
  finishes and continues into planning. An explicit refine-only instruction on
  the invocation stops at the refinement result, and the report names slice
  planning in that workspace as the next step, as today, so the coordinator
  can land refinement alone before planning. Missing-context stops and
  failure handling of both skills are unchanged.
- The refine-only instruction is an entry in the refinement skill's
  `refinement-options.json` (recommended flag `--refine-only`, label "Refine
  only"), beside the inquiry options. The dashboard's Refinement launch reads
  that file from the installed skill and offers every entry, so the checkbox
  appears without a dashboard change, and a direct invocation passes the flag.
  An ordinary-language instruction not to continue into planning counts the
  same. The flag composes with any inquiry option or focus.
- A refinement invocation authorizes slice planning of its story and still
  authorizes no execution and no publication. The combined draft stays
  uncommitted in the owned workspace with its Preparing assignment under the
  existing disposition until a keep lands it; `start` for the planning step
  announces nothing new, and no second Established preparation block,
  workspace, or branch is created. Refinement's current wording that it
  "does not authorize planning" and hands off planning only on request is
  replaced.
- When several related stories are refined together, continuation plans the
  story the invocation names (the established identity). Sibling stories
  refined for their boundaries end with their own refinement outcome.
- Update [ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md)
  concisely: its Story Branch Mode text and diagram show refinement flowing
  into slice planning in the same owned workspace unless a coordinator question
  or an explicit refine-only instruction stops it. Procedures stay in the
  skills; the ADR's status is unchanged. ADR 0009 describes no step this story
  changes; confirm during planning rather than editing it on assumption.
- The refinement skill's guidance tests, which pin its outcome and
  established-preparation wording, change with the guidance, and the shipped
  options definition keeps satisfying the dashboard's definition schema (each
  flag defined once; no exclusive group is needed).

Deferred promises:

- Automatic landing after planning and landing unpublished preparation before
  execution: the two sibling stories below.
- One-shot refinement (`--one-shot`) keeps its current journey: refine, commit,
  then stop for review or land with `--auto-land`. Its workspace holds no
  Preparing assignment, so planning there would need its own start handling;
  extending one-shot to planning is a later decision.
- A dashboard-side slice-planning launch, or a separate option category for
  journey controls in the options file. The offered list stays flat.

**UI:** The coordinator sees one new checkbox in the Refinement launch
dialog's options, "Refine only" with a one-line summary such as "Stop after
recording the story; leave slice planning for a later step", listed with the
existing inquiry options and recorded on the launch like them ("Options:
--refine-only (requested)"). Nothing else in the dialog or card changes: the
card shows "Being prepared" throughout refinement and planning, because the
published assignment's activity is preparation for both.

**Architecture:** The consequential concern is where the continuation rule
lives. Keep it in one home: a reference under the refinement skill, beside
its workspace, assignment, and disposition references, that states the
preparation journey (refinement, then slice planning, then slice-plan
refinement as planning already decides), its single stop rule (an open
coordinator question or an explicit refine-only instruction), and that the
same session, workspace, branch, and assignment carry the established context
through the chain with no new block and no re-announcement. Refinement's
outcome step and slice planning's "stay within the triggering instruction"
link to it. The sibling landing story extends that same home with landing
instead of adding a second handoff policy; no chain registry or generic
handoff protocol is introduced.

Accepted decisions consulted: [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation per conceptual solution; readiness separate from execution
authority; a default instead of a per-run coordinator choice leaves less
judgment in the repository), [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
(the chain works by following the installed skill's guidance on every host,
as slice planning already invokes plan refinement; no host-specific mechanism),
and [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(procedures in skills, concise ADR text). No conflict was found. Proposed ADRs
0007 and 0009 inform the design and bind nothing.

**Key examples:**

- The dashboard starts refinement with an established preparation and no
  refine-only option; refinement records the story with no coordinator
  question → the same session invokes slice planning; `start` returns
  `continued`, the plan is written and refined when needed, readiness is
  recorded → the final report is the planning report with the refinement
  outcome, plan path, assessment, and the draft pending in the workspace with
  its Preparing assignment; nothing is committed or pushed.
- Refinement needs a coordinator scope decision → the report lists the
  decision as Needs human engagement and no plan is written → the coordinator
  answers in the same session; refinement completes and continues into
  planning as above.
- The invocation carries `--refine-only`, from the dashboard checkbox or the
  command line, with or without inquiry options → refinement completes,
  applying any inquiry options → the session stops with the refinement
  report naming slice planning in that workspace as the next step; the
  coordinator may land the refinement alone first.
- Refinement judges the story Flawless → planning continues and writes a
  one-slice plan recorded `ready` → the coordinator may still execute it with
  an explicit skip-planning instruction.
- Refinement runs with `--one-shot` → the one-shot journey applies unchanged:
  the committed refinement stops for review or lands with `--auto-land`, and
  no plan is written.

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
