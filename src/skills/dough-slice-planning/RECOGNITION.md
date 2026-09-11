# Recognition: dough-slice-planning

Review: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/slice-planning/SKILL.md` in the supplied
doughnut repository. Project identity is provenance, not a recognition
condition.

## Purpose

Turn one understood story into an ordered executable plan of bounded,
proof-owned Behavior/Structure slices, report remaining concerns or a limited
no-concerns finding, then stop or continue only within the triggering
instruction's explicit execution authority.

## Triggers

A selected story has an agreed outcome, scope, and evaluable examples and the
user or parent agent requests implementation planning. Execution after planning
requires that same triggering instruction to request it explicitly.

## Distinguishing behavior

Behavior/Structure gate; outside-in promise ownership; safe stopping points;
value-and-learning ordering; isolated proof for concrete uncertain assumptions;
construction-time correction of obvious separable outcomes; report of remaining
slice-specific concerns (or a limited no-concerns finding) without prescribing
refinement or certifying execution readiness. Concern evidence assesses the plan
and does not authorize execution. Planning-only and parent-delegated
planning-only requests return the plan and stop; an explicit plan-and-execute
request may continue into the authorized execution handoff without a duplicate
confirmation, subject to project gates and unresolved concerns. A parent's
broader implementation task does not authorize execution by a planner delegated
only planning. Missing numeric limits alone do not block planning or create a
timing policy.

## Client project context

Story and seed; canonical executable-plan root, filename layout, lifecycle, and
active-plan status vocabulary; any supplied slice target, hard limit, exceptions,
and repeated-overrun policy; verification and delivery gates; relevant stack
rules and Accepted ADRs; the triggering human or parent-agent instruction's
execution authority.

## Differences that rule out replacement

A workflow that plans unresolved stories, slices by technical layer, omits
observable proof ownership, prepares beyond the next Behavior, guarantees
duration, issues a planner workflow verdict in place of concern evidence,
treats a clean assessment as execution permission, inherits a parent's broader
implementation task as planner execution authority, or implements without
separate authorization from the triggering instruction is not equivalent.

The source dependencies `problem-decomposition.mdc` and `planning.mdc` are
Cursor `alwaysApply: true` routing rules. Their targets became the shared Open
Dough references. Those references now also preserve the generalized
execution-level invariants recovered from the rules' pre-redirection history,
while this skill remains a concise entrypoint under ADR 0006. It does not
recreate automatic repository-wide application; client installation owns that
delivery.

The Proposed `references/architectural-thinking.md` addition keeps topic
direction with the same planner and links to `dough-pfe` as the authoritative
find-and-use behavior. It is not part of the declared payload until the complete
caller-and-reference dependency set is promoted.

## Validation needed

Before release, maintainers must review invocation context, required project
context, and useful outcome under [AGENTS.md](../../../AGENTS.md). Representative
walkthrough: given one bounded weekly-totals export story, a supplied plan path,
a five-minute target and ten-minute hard limit, and a stable export test entry
point, write one Behavior slice for a single-team export before later policy
exceptions. Put any necessary Structure immediately before that Behavior, map
every included promise to observable proof, and report remaining concerns when a
slice has separable beats or a plausible hard-limit path. With no plan destination,
stop before writing rather than inventing a location; with no numeric policy but
the other context, plan from cohesion and proof ownership without inventing a
timing limit.

Dependency review: the source routing targets supplied the story-level base;
their source copies were extended with ADR-0006-style execution sections for the
slice gate, sizing/escalation, executable-plan contract, and proof ownership.
Both slice skills link those authoritative sections rather than copying them.
Client installation remains separate validation.

### Story 44 Slice 3 architectural-thinking walkthrough — 2026-09-11

Candidate: uncommitted Proposed source changes in
`src/skills/dough-slice-planning/` and
`src/skills/dough-slice-plan-refinement/SKILL.md`. This was a manual source
walkthrough, not a native Codex, Cursor, or Claude Code run.

Shared input: an understood basket-total story, established plan root and plan
format, relevant product navigation and Accepted ADRs, and a responsibility to
provide the basket total. PFE searches the whole product and supplies the
evidenced solution decision; planning does not duplicate that search.

- **Established structure, no new topic:** The existing basket pricing
  operation owns the same sum under the same domain rules. PFE selects reuse.
  Existing structure and accepted decisions support it without another
  consequential choice, so the planner writes the ordinary Behavior slice and
  its proof. It creates no `NORTH-STAR.md`, topic, report, registry, approval
  step, or speculative Structure slice.
- **Existing consequential topic:** The project's established North Star has a
  short `Basket pricing ownership` topic supported by current callers and domain
  rules. PFE selects purpose-preserving modularization across the checkout
  boundary. The planner cites that topic and location, includes only the
  Structure needed immediately before the basket-total Behavior, and records
  how the choice follows the supported direction. It does not repeat PFE or
  invent future discount machinery.
- **Warranted new topic:** No North Star location exists, and evidence from two
  current affected stories establishes the consequential boundary that basket
  pricing owns pre-checkout totals. The planner chooses one shared
  `NORTH-STAR.md` under the supplied established planning root, records the path
  in the plan, and adds one short heading and paragraph with the direction,
  evidence, and affected work. Accepted ADRs are consistent; no extra report,
  registry, configuration, approval gate, or hypothetical structure appears.
- **Missing indispensable input:** Evidence leaves basket-versus-checkout
  discount ownership unresolved, or a proposed topic conflicts with an
  Accepted ADR whose exception has not been decided. The planner stops only the
  dependent solution/direction path and returns the competing evidence and
  human-owned decision. Independent plan construction may continue, but the
  affected path is not presented as executable and the planner does not settle
  the domain or ADR decision.

Plan refinement follows the same reference only when new evidence reopens that
same solution or direction decision. Otherwise it carries the decision forward
without another PFE pass or topic. These cases inspect instruction outcomes and
file side effects; they do not establish release or installed-host behavior.

### Slice 1 numbering walkthrough — 2026-09-10

Candidate: base revision `d0a8263366168cb9cccc82adbcbd642ee40890f3`; uncommitted source change in
`src/skills/dough-slice-planning/` for Quick 033 Slice 1.

Inputs: a disposable quick-plan root containing
`001-existing/PLAN.md` through `032-existing/PLAN.md`, a selected story, and
project layout `NNN-<slug>/PLAN.md`. The walkthrough also supplied an active
matching plan, created `033-new-story` after candidate selection, and omitted
the root in a separate case.

Observed results: a new story selected `033-new-story/PLAN.md`; the matching
active plan was reused; the newly occupied `033-new-story/PLAN.md` retained its
original contents and the result advanced to `034-new-story/PLAN.md`; the absent
root returned missing context without a number. The check inspected paths and
file contents, not wording in this record or skill.

Limitations: this is a disposable source-guidance walkthrough, not native
installed-host acceptance. Slice 2 separately covers absent sizing policy; the
release and installed-use slices retain the remaining native evidence.

Inspected source SHA-256 values (paths relative to the supplied repository):

- `.agents/skills/slice-planning/SKILL.md`:
  `08000845894c037b5ccc32b892ac738f355e4cfd4f2287ac7c389580b23e3517`
- `.cursor/rules/problem-decomposition.mdc`:
  `46ac1800552ff36274526cf9378643396f69b9ff4592ee1c41a59c53f9c1d3a9`
- `.cursor/rules/planning.mdc`:
  `2d7292270da9702738b1bdc3ade0c0dec1d1fef22ff8ce94a5d84584f1d7b488`
- `.agents/skills/dough-story-decomposition/references/problem-decomposition.md`:
  `b9f6b603680c60ba0b1c8e0ead0f2626f86f5b7b04d531060d232929f1fda626`
- `.agents/skills/dough-story-refinement/references/planning.md`:
  `6acb01af53cdef6c33497e03e8b8334c62c1cc425aa334b371170835e5f2ff89`

### Slice 2 optional-budget walkthrough — 2026-09-10

Candidate: base revision `ee88dab8fd6beed40fd4162f42ed1a903a7fd3e9`; uncommitted
source change in `src/skills/dough-slice-planning/`, its authoritative slice-sizing
reference, and `src/skills/dough-slice-plan-refinement/` for Quick 033 Slice 2.

Inputs: the Slice 1 disposable quick-plan layout (`001-existing/PLAN.md` through
`032-existing/PLAN.md`, with `NNN-<slug>/PLAN.md`) and one understood export story:
given team data, a user requests a single-team CSV export and receives that file;
the focused export check observes its row and headers. The no-policy case supplied
the canonical root but no numeric target or hard limit. The supplied-policy case
used the same story and root with a five-minute target and ten-minute hard limit;
comparable endpoint evidence predicted twelve minutes for implementation, focused
verification, and slice-local cleanup. The combined case omitted both a plan
number and numeric policy while retaining the root, story, and layout.

Observed results: the no-policy case produced one Behavior slice for the CSV
export, with the export check as its owning proof, and reported readiness from its
cohesive single outcome and proof loop without a time guarantee. The supplied
policy changed the same example to refinement recommended: its predicted work
had a plausible path beyond the supplied ten-minute hard limit. The combined case
allocated `033` from the established layout and produced the same proof-owned
export slice. The walkthrough inspected the generated slice boundaries, proof
ownership, and whether planning stalled for additional numeric policy; it did not
use phrase matching or authorize implementation.

Changed assumptions: numeric targets and hard limits constrain sizing only when
the project supplies them; in their absence, the Behavior/Structure gate, one
observable outcome, one proof loop, and concrete uncertainty remain the bounded
planning criteria. A missing canonical plan root or unresolved story scope still
stops planning.

Limitations: this is a disposable source-guidance walkthrough, not native
installed-host acceptance. It does not prove release publication or ordinary
adoption; those remain owned by Quick 033 Slices 3–4.

### Quick 035 Slice 1 authorization-boundary walkthrough — 2026-09-10

Candidate: uncommitted source change in `src/skills/dough-slice-planning/` for
Quick 035 Slice 1 on branch `worktree-quick-035-bounded-slice-planning`. Historical
Quick 033 walkthroughs above remain prior evidence; this review covers only the
execution-authority boundary.

Shared story and context (held constant across variants): one understood
single-team CSV export story with evaluable examples; established plan root
`.planning/quick/` with layout `NNN-<slug>/PLAN.md`; no numeric slice target or
hard limit supplied; stable export-check proof entry point. The planner would
write one Behavior slice for the CSV export with that check as owning proof and
report `ready for direct execution` from cohesion and a single proof loop.
No product implementation was performed; each variant inspects only the
authorized next action after the plan is written and reported.

#### Variant A — planning-only human request

Input: human asks only for a slice plan for the shared story.

Resulting plan/report: plan path, ordered export Behavior slice, no
considered-but-excluded additions that change the story, readiness
`ready for direct execution`, ending `## SLICE PLAN WRITTEN`.

Workflow stopping point: stop after reporting. Neither implement nor invoke
execution. The readiness phrase does not authorize continuing into execution.

#### Variant B — parent delegates only slice planning

Input: a parent agent whose own broader task is implementing the export story
delegates only slice planning to this skill.

Resulting plan/report: same plan and readiness report as Variant A, returned to
the parent.

Workflow stopping point: return the plan to the parent and stop. The parent's
broader implementation task is not an explicit execution request to the
delegated planner and does not inherit execution authority into this turn.

#### Variant C — explicit plan-and-execute request

Input: triggering instruction explicitly asks to plan and then execute the
shared story.

Resulting plan/report: same plan and readiness report as Variant A.

Workflow stopping point: after reporting, the authorized workflow may continue
into execution (for example via `dough-execute-plan`) without asking again for
the same plan-and-execute authorization. Continuation remains subject to
project gates and any unresolved concerns that still block progress. This
walkthrough did not run product changes; it inspected only that the handoff is
permitted at the boundary.

#### Candidate revision

Entrypoint description, opening constraint, and final handoff section now name
the triggering instruction's execution authority explicitly; readiness is stated
as assessment only. Existing missing-context and understood-story checks,
numbering, decomposition links, and sizing guidance are unchanged. Concern-report
wording (`ready for direct execution` / `refinement recommended`) is left for
Quick 035 Slice 2.

#### Linked-reference inspection

Direct links to slice decomposition, executable-plan decisions, story
refinement, story decomposition, slice-plan refinement, and execute-plan were
inspected for contradictory handoff wording. No edit required: those sources
already separate planning from product implementation, and refinement already
states that execution requires separate authorization from the invoking
workflow.

#### Limitations

This is local source-guidance authoring evidence under AGENTS.md, not native
installed-host acceptance or release readiness. It does not prove Slice 2's
concern-evidence report contract. Installed managed copies under `.agents/` and
`.claude/` were not hand-synchronized.

### Quick 035 Slice 2 concern-evidence walkthrough — 2026-09-10

Candidate: uncommitted source change in `src/skills/dough-slice-planning/` for
Quick 035 Slice 2 on branch `worktree-quick-035-bounded-slice-planning`. Historical
Quick 033 and Quick 035 Slice 1 walkthroughs above remain prior evidence; this
review covers only the planner report contract after construction.

Shared story and context: one understood bounded export story with evaluable
examples; established plan root `.planning/quick/` with layout
`NNN-<slug>/PLAN.md`; no numeric slice target or hard limit unless a variant
states otherwise; stable export-check proof entry point. No product
implementation was performed. Each variant inspects the constructed plan and
the reported assessment only.

#### Variant A — clean cohesive plan

Input: the shared story yields one Behavior slice for the CSV export with the
export check as owning proof; all slices are cohesive with one proof loop and
no remaining integration or sizing uncertainty.

Resulting report: plan path, ordered export Behavior slice, and
`no concerns were identified in this assessment`, ending
`## SLICE PLAN WRITTEN`.

Observed constraints: the report does not claim that no further refinement is
required, does not prescribe a next workflow, and does not certify execution
readiness or treat the finding as permission to execute.

#### Variant B — uncertain Slice 5 integration assumption

Input: the same construction path produces five ordered Behavior slices; Slice 5
depends on an integration assumption (external totals service shape unknown)
that makes its sizing uncertain under the linked sizing guidance.

Resulting report: plan path, ordered slices, and a remaining concern that names
Slice 5, the integration assumption, and the sizing consequence. Ending
`## SLICE PLAN WRITTEN`.

Observed constraints: the report does not prescribe
`dough-slice-plan-refinement`, does not say `refinement recommended`, and does
not certify execution readiness. The recipient retains choice of refinement,
evidence gathering, or another applicable next action under existing authority.

#### Variant C — obvious independent second outcome corrected during construction

Input: a draft slice initially bundled the CSV export outcome with an independent
email-delivery outcome (two externally observable postconditions / proof loops).

Resulting plan: construction applies the linked decomposition gate and splits
before reporting into (1) Behavior: CSV export with the export check as owning
proof, and (2) Behavior: email delivery with its own delivery-check proof. Any
supplied sizing constraints that applied to the original work remain stated on
each resulting slice. The subsequent concern-evidence report follows Variant A
or B from the corrected plan; the defect is not knowingly passed to a later
refinement step.

#### Candidate revision

Entrypoint description and reporting instructions replace the planner workflow
verdicts `ready for direct execution` / `refinement recommended` with concern
evidence (named remaining concerns, or a limited no-concerns finding).
Construction-time decomposition and sizing checks, proof ownership, numbering,
and the Slice 1 authorization boundary are preserved. Refinement remains linked
as the owner of resolving concerns when separately invoked.

#### Linked-reference inspection

Direct links to slice decomposition, executable-plan decisions, story
refinement, story decomposition, slice-plan refinement, and execute-plan were
inspected for a contradictory planner handoff. No edit required:
decomposition and planning references already supply construction-time checks
without issuing the planner's readiness verdict; refinement retains its own
`ready for direct execution` assessment when refinement is invoked and states
that execution still requires separate authorization.

#### Limitations

This is local source-guidance authoring evidence under AGENTS.md, not native
installed-host acceptance or release readiness. Excluded acceptance and release
work are not marked passed. Installed managed copies under `.agents/` and
`.claude/` were not hand-synchronized.
