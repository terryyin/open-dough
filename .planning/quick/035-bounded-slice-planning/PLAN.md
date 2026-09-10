# Keep slice planning within the requested workflow

## Source and goal

[SEED-004 Story 11](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#keep-slice-planning-bounded).
Status: planned. Planning authorized 2026-09-10; implementation not requested.

A human or coordinating agent receives a useful slice plan and specific remaining
concerns while retaining ownership of the next workflow action. This repairs an
existing SDLC skill in support of the backlog's near-future direction.

## Scope and constraints

Clarify the triggering instruction's authorization boundary and replace the
planner's directional readiness verdict with concern evidence. Preserve story
understanding, decomposition, proof ownership, safe stopping points, automatic
plan numbering, and project-supplied sizing policy. Correct obvious plan defects
during construction. Align only directly contradictory referenced guidance.

Excluded: cross-tool testing and native acceptance (including host runs,
discovery matrices, harnesses, and acceptance-story maintenance); mandatory
refinement; coordinator tooling; changes to story scope or slice budgets;
redesign of refinement's own assessment; release, installation, adoption,
and hand-editing installed managed copies. Local behavior review remains required.
Source completion does not establish native acceptance or release readiness.

Author changes in `src/skills/dough-slice-planning/SKILL.md` and its
`RECOGNITION.md`. The linked decomposition and planning references already
separate planning, proof, and execution: edit them only if a concrete conflict
with this story is found. Keep historical recognition evidence, distinguishing
it from the new review and updating current descriptions of behavior.

Constraints from current Accepted ADRs:

- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  source revisions and review evidence do not update installed released copies.
- [ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  conventional authoring uses representative behavior review; source completion
  and release acceptance remain distinct. No release is part of this plan.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  keep one concise behavioral source, resolve context in the executing project,
  and keep maintenance evidence outside runtime prose.

## Outside-in proof and execution gates

The stable boundary is the planner's response and workflow action after reading
its source instructions. Use the repository's `AGENTS.md` manual behavior review:
walk the examples below with a bounded understood story, an established plan
root, and explicit triggering instructions. Record the input, resulting plan or
report, workflow stopping point, candidate revision, and limitations in the
recognition record. Review invocation context, required context, and useful
outcome. This is local authoring evidence, not native-host acceptance.

Use the same small story for each variant. Do not execute product changes to
prove an execution handoff: inspect the authorized next action at that boundary.
No new automated prose assessor or acceptance runner is needed.

For each slice, inspect the description, body, and directly linked guidance for
contradictions and run `git diff --check`. Check changed frontmatter and relative
links if affected. Installer/update suites do not prove these promises and are
not gates for this guidance-only scope. Preserve unrelated existing changes.

When execution is separately requested, follow `dough-execute-plan` for
independent post-change refactoring, proof review, formatting, plan updates,
coordinator-owned commit/push, and asynchronous CI handling. Resolve the actual
formatting/hook and push context before delivery; this planning turn commits or
pushes nothing. No numeric slice target, hard limit, or repeated-overrun threshold
is supplied here; do not invent one. Each slice includes its review and cleanup.

## Ordered slices

### 1. Preserve the triggering instruction's execution authority
Type: Behavior
Status: done
Proof: One authorization-boundary walkthrough, varying only the triggering
instruction. Planning-only human and parent-delegated requests end with the plan
returned; an explicit plan-and-execute request permits the authorized handoff
without a duplicate confirmation, subject to project gates and unresolved concerns.
Evidence: RECOGNITION.md Quick 035 Slice 1 walkthrough (Variants A/B/C);
`git diff --check`; frontmatter and relative-link check. Delivered on
`worktree-quick-035-bounded-slice-planning`. CI observer:
`/tmp/dough-ci-501/watch-lODs0J` (workflow `ci.yml` / `CI`).

Behavior: Given an understood story and a triggering human or parent-agent
instruction, when the plan is written, the next action remains within that
instruction's explicit execution authority.

Make the entrypoint and final handoff boundary consistent. A parent's broader
implementation task does not authorize execution by a planner delegated only
planning. Keep the existing missing-context and understood-story checks.
Document the walkthrough and current authorization contract in recognition.
Safe stopping point: planning requests cannot gain execution authority from a
readiness assessment; concern-report wording remains for Slice 2.
Sizing: small, high confidence; one boundary with three input variants, no new
infrastructure or delivery mechanism.

### 2. Return concern evidence without choosing the next workflow
Type: Behavior
Status: planned
Proof: One plan-report walkthrough with a clean plan and an uncertain Slice 5.
The clean report says only that no concerns were identified in this assessment;
the uncertain report names Slice 5, its integration assumption, and the sizing
consequence. Neither prescribes refinement nor certifies execution readiness.
An obvious independent second outcome is corrected before reporting, and every
resulting slice retains its proof owner and any supplied sizing constraints.

Behavior: Given a constructed plan, when the planner reports its assessment,
the recipient receives concrete remaining concerns or a limited no-concerns
finding from which to choose the next action under existing authority and policy.

Update the discovery description and reporting instructions together. Preserve
construction-time decomposition and sizing checks; replace only the planner's
workflow verdict. Inspect directly linked references for a contradictory planner
handoff without changing refinement's own assessment. Update current recognition
wording and record the walkthrough without rewriting historical results.
Safe stopping point: the whole bounded story is source-complete with local
behavior evidence; excluded acceptance and release work are not marked passed.
Sizing: small, high confidence; one report contract and its boundary variants,
with no separate tooling or speculative reference rewrite.

## Proof ownership

| Final-state promise / seed example | Owner and observation |
| --- | --- |
| Planning-only stops; parent-only delegation does not inherit execution authority | Slice 1: returned plan and stopping point |
| Explicit plan-and-execute can continue without repeat approval | Slice 1: permitted handoff under existing gates |
| Readiness is not authorization | Slice 1 boundary; Slice 2 removes planner verdict |
| Obvious separable outcomes corrected during construction | Slice 2: corrected slices with proof ownership |
| Remaining uncertainty is specific and does not choose next action | Slice 2: Slice 5 assumption and consequence |
| Clean assessment is limited, not a readiness certificate | Slice 2: clean report |
| Existing context, numbering, decomposition, and sizing remain intact | Both: focused before/after guidance review and walkthrough context |
| Shared source, runtime audience, directly linked consistency | Both: authoring review of changed guidance |

## Current decisions and readiness

No open story decision blocks this plan. Exact prose is an implementation choice.
Two cohesive Behavior slices have one proof loop each and no hidden preparation
or concrete integration uncertainty. No slice-plan refinement trigger remains:
ready for direct execution under the currently installed planning skill's report
contract. This assessment does not authorize execution or guarantee duration.

The story changes that reporting contract in source; this plan does not
preemptively edit the installed skill. No Structure slice is needed. Reassess
sizing if execution discovers a necessary reference change beyond a local
contradiction; revisit the story with the human if it would expand the boundary.

## Learnings

The source planner currently forbids product implementation unconditionally and
requires `ready for direct execution` / `refinement recommended` verdicts. Its
linked decomposition and planning references already supply the desired proof
and sizing checks. The change can stay concentrated in the entrypoint and
maintainer record, with reference edits conditional on actual contradiction.

Slice 1: Linked decomposition, planning, refinement, and execute-plan references
needed no edits for the authorization boundary. Readiness phrases retained for
Slice 2; readiness explicitly does not authorize execution.
