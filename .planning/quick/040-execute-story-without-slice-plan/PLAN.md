# Execute a simple story as one quick slice

## Source and goal

[SEED-004 Story 15](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#execute-simple-story-as-one-quick-slice).
Status: planned, 2026-09-11.

Execute an explicitly selected simple story without a slice plan through the
ordinary execution procedure, and allow retrospective review from its chat
history. Convert an oversized attempt into ordinary planned execution.

## Scope and decisions

The 2026-09-11 human clarification establishes execute-plan as the entry point.
The caller has already chosen to skip slice planning and supplies the canonical
story. No coordinator selection policy or new command syntax is required.
The successful example reaches a commit after the usual refactoring and delivery
gates. Keep existing push/CI obligations; do not introduce a commit-only variant
or repeat the ordinary procedure in quick-path instructions.

A successful quick execution creates neither a plan nor a substitute execution
record. Its conversation supplies execution context, directly or as provided
chat history. Retrospective handles a plan that never existed. Existing source,
proof, authority, ownership, and attribution requirements still apply.

Primary implementation surfaces are `src/skills/dough-execute-plan/SKILL.md`,
its delegation, execution-decisions, and wrap-up references, and
`src/skills/dough-execution-retrospective/SKILL.md`, with their recognition
records. Inspect directly linked lifecycle guidance for actual contradictions;
change what the promised behavior requires. Keep one shared execution procedure
and condition only plan-dependent context and updates. No installed managed-copy
edits, new tracking files, generic execution-state framework, or duplicated
runtime workflow.

Wrap-up from available execution context is current
`src/skills/dough-story-wrap-up` behavior. Recover the predecessor story and plan
from `5e82f7e:.planning/seeds/SEED-010-learn-from-execution-retrospectives.md`
and `5e82f7e:.planning/quick/039-wrap-up-from-available-context/PLAN.md`. Native
acceptance of that wrap-up revision remains with SEED-010 Story 2. This plan
covers execution and retrospective; do not implement wrap-up here.

Excluded: coordinator orchestration, choosing which stories are simple, changes
to story refinement, numeric time limits, concurrent quick slices, release,
adoption, and automatic retrospective or wrap-up invocation.

Relevant Accepted decisions:

- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  author source revisions; installed guidance changes only through release.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  local authoring walkthroughs establish implementation evidence, not native
  host acceptance. Keep affected native behavior proof pending before release.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  write the direct current procedure for the executing project; link common
  rules instead of copying them.

## Ordered slices

### 1. Execute an explicitly selected story without a plan
Type: Behavior
Status: planned

Behavior: Given an understood canonical story and an instruction to execute it
without slice planning, execute-plan uses the story as one slice and produces
a committed change through its ordinary procedure without creating a plan or
substitute execution-record artifact.

Adapt discovery, context resolution, queued-work handling, delegation input,
plan updates, and completion reporting wherever an unconditional plan assumption
would block this journey. Reuse the normal refactoring, proof, delivery, and CI
rules. Ordinary invocation still requires an executable plan. Keep quick scope
and observed progress in the conversation. If the attempt outgrows a single
slice, stop safely under existing execution decisions; slice 3 adds continuation.

Proof: One representative local authoring walkthrough at the execute-plan
invocation boundary, using a small story such as moving a queued entry into
Taken. Inspect invocation selection, required inputs, proposed actions through
commit, and ordinary delivery continuation. Verify no plan/record creation,
correct Taken handling, and that missing authorization or story context stops
before implementation. Vary the invocation to ordinary planned execution and
confirm its plan requirement and existing flow remain intact. Inspect all
plan-path handoffs through refactoring and delivery so an indirect prerequisite
does not reintroduce a plan. Use AGENTS.md's invocation/context/outcome review.

Safe stopping point: planless execution can deliver a simple story; an oversized
attempt remains safely stopped and attributable in chat until continuation is
available. Retrospective support is delivered by slice 2.

Sizing: medium confidence; one guidance journey spanning existing references.
No separate setup or delivery framework is needed. Keep implementation,
walkthrough, and local cleanup in this proof loop.

### 2. Review an execution whose plan never existed
Type: Behavior
Status: planned

Behavior: Given a completed quick execution and its current or supplied chat
history, retrospective recovers intent, completion, related commits, and proof
from that record and the story, then performs its ordinary enabled reviews
without requiring or reconstructing a historical plan.

Adapt execution recovery and completion judgment to available evidence. Preserve
ordinary review content, commit attribution, review options, and existing
correction routing for completed executions. Distinguish a never-created plan
from a removed plan whose historical recovery is still useful. Missing required
proof or ambiguous attribution limits that review decision; file absence alone
does not. Create no execution-record artifact. Existing authorized retrospective
outputs, including warranted correction plans and process findings, retain their
normal rules.

Proof: One local retrospective authoring walkthrough of the slice 1 execution,
using current chat and supplied-history variants. Observe the same story,
completion conclusion, commit membership, and review boundary, without a plan
recovery demand. Include an unrelated nearby commit and a missing-proof variant
to verify evidence-based limits. Preserve completed planned-execution recovery
as a comparison. Inspect description, principles, recovery, correction routing,
and reporting for contradictory mandatory-plan assumptions.

Safe stopping point: successful quick execution can be reviewed from its chat
history. Full wrap-up still uses the separately owned dependency.

Sizing: high confidence; one retrospective input/recovery rule with variants,
using the unchanged downstream reviews.

### 3. Continue an oversized quick attempt through a slice plan
Type: Behavior
Status: planned

Behavior: Given a quick attempt that proves too complex or takes too long,
execute-plan safely stops that attempt, uses the established planning/refinement
workflow for remaining work, and resumes ordinary planned execution while
preserving completed work, proof, backlog placement, and execution continuity.

Use existing sizing and learning-escalation rules without adding a numeric
threshold. Safely park or revert only attempt-owned incomplete work under the
existing ownership rules. Distinguish completed compatible work from unfinished
changes. Transfer necessary context from chat into the ordinary plan for remaining
work; do not fabricate earlier planned slices or a second execution history.
Keep the canonical story and existing Taken entry. Scope changes or disputed
constraints still require the existing human decision; complexity alone does
not authorize expanded scope. Retrospective must recognize the quick attempt
and its planned continuation as the same execution.

Proof: One local authoring walkthrough starting with an explicitly authorized
quick attempt that fails to converge within one slice. Supply completed proof,
attributable partial changes, and unrelated pre-existing edits. Observe safe
work disposition, ordinary planning and refinement as needed, a remaining-work
plan linked to the original story and chat evidence, then resumption with no
repeated completed work or duplicate Taken entry. Inspect the retrospective
boundary for the combined execution. Vary unclear ownership or changed story
scope to confirm the relevant conflicting path stops for human judgment.

Safe stopping point: remaining work has one authoritative ordinary plan and
preserved completed evidence; execution can resume under existing authority.

Sizing: medium confidence; one transition journey crossing execution decisions
and the existing planning interface. No planner redesign is expected. A new
state model or broader story-policy change would invalidate this hypothesis.

## Proof ownership and verification

Slice 1 owns direct story execution through commit, absence of new tracking
artifacts, ordinary delivery preservation, and ordinary plan requirements.
Slice 2 owns planless retrospective using current or supplied history and
substantive evidence-gap handling. Slice 3 owns oversized-attempt conversion,
work/proof/backlog preservation, ordinary resumption, and combined attribution.

For each slice, review the final guidance using AGENTS.md's representative
behavior review and record decisive observations and limitations in the existing
recognition record. These maintainer authoring records are not artifacts required
of a runtime quick execution. Review frontmatter and changed links, and run
`git diff --check`. Use existing focused payload checks only if affected payload
or reference behavior warrants them; do not add prose-matching tests or run
installer/CI-runtime suites merely because execution guidance changed.

Native quick-entry, retrospective, and escalation proof for Codex, Cursor, and
Claude Code remains pending. Existing delivery-mechanism evidence can be reused
only with justification; it cannot establish the new behavior. Release/adoption
is excluded here. At implementation, attach those pending requirements to the
appropriate native-acceptance story before any affected release; do not claim
local walkthroughs as native acceptance or expand sibling stories in this plan.

## Execution context

Established plan location: `.planning/quick/NNN-<slug>/PLAN.md`; slice statuses
are planned, in-progress, and done. No active plan for this story was found.
039 was the highest allocated directory before creation. Planning leaves backlog
placement unchanged. Preserve existing changes in both seeds and the backlog.
No numeric slice target, hard limit, or repeated-overrun threshold
was supplied; assess boundedness through cohesive behavior and one proof loop.
No infrastructure or storage experiment is implicated.

When separately authorized, execute this implementation plan using ordinary
`dough-execute-plan`, including its independent refactoring and delivery gates.
The repository's preparation/check entry points are `npm run format` and
`npm run lint`; resolve the applicable hook contract and authorized push target
at execution. This planning request does not authorize implementation or commit.

## Cumulative design assessment

One model covers the sequence: the selected story and available execution
context establish intent and progress; an existing plan supplies slices when
there is one. Plan-dependent operations apply only when a plan exists. Chat
provides quick execution context; an ordinary remaining-work plan becomes the
resume source after escalation. Do not build parallel execution procedures or
special record types for these variants.

The three slices have distinct observable outcomes: deliver, review, and resume
after escalation. Each retains one proof loop. The third walkthrough has several
steps because they prove one continuity transition; splitting it into parking,
planning, and resuming would leave that promise unproved. No remaining
slice-specific decomposition or cumulative-design concerns were identified.
No separate slice-plan refinement pass was invoked.

## Learnings

None from execution yet.
