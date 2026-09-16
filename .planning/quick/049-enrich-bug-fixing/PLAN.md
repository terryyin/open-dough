# Enrich bug fixing with triage and backlog routing

## Source and outcome

Source: [SEED-004, Story 22](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-narrow-bug-fixing),
refined before planning. Planning requested on 2026-09-16. The user identified
bug fixing; it is currently second in the backlog, behind CI watching. This
plan selects the named story and leaves backlog order and Taken unchanged.

A reporter receives an evidence-backed resolution: a small confirmed defect
is repaired through main integration, correct behavior is explained, or larger
and unresolved work becomes an actionable first-priority story.

Enrich [dough-bug-fixing](../../../src/skills/dough-bug-fixing/SKILL.md) as a thin
caller of shared execution. Retain its useful reproduction guidance; replace
its local implementation/refactoring loop with an early planless execution
handoff, `--no-replan`, and a ten-minute slice allowance. Shared execution owns
timing, exceptions, preservation, rollback, refactoring, and delivery. Shared
closure owns integration; the coordinator owns subsequent reporter confirmation.

Exclude a debugging tutorial or external debugging dependency, severity levels,
a separate tracker/coordinator, new isolation machinery, a test harness or full
host matrix, promotion, release, and adoption. Do not edit installed copies.

## Existing solution and decisions

PFE inspection at `f6572af` supports changing only the bug-policy owner:

- [Execute-plan](../../../src/skills/dough-execute-plan/SKILL.md) already accepts
  contextual instructions with uncertainty, allows evidenced no-change returns,
  and supplies the shared isolated execution path.
- [Execution decisions](../../../src/skills/dough-execute-plan/references/execution-decisions.md#refine-an-oversized-slice)
  already preserve evidence under the project's plan root before removing only
  attempt-owned incomplete changes, then return without planning or retry when
  replanning is disabled. Delivery/integration failures use ordinary recovery.
- [Story wrap-up](../../../src/skills/dough-story-wrap-up/SKILL.md) already closes
  contextual work and owns integration to the selected target, defaulting to main.
- [Product backlog](../../../src/skills/dough-product-backlog/SKILL.md) owns
  canonical references, deduplication, priority, and Taken placement;
  [story refinement](../../../src/skills/dough-story-refinement/SKILL.md) owns
  goal, scope, and examples. Bug fixing supplies evidence and routing policy.

Reuse the shared execution/rollback source walkthroughs recorded in
`01de291^:.planning/quick/033-execute-small-work-from-context/PLAN.md`, Slices 1–2
(implemented in `5ac4f24` and `8e7317f`). Their inspected boundaries still match
the current source. These are manual guidance reviews, not native execution
proof. This story verifies the new caller and routing; it does not recreate
the underlying execution proof or claim fresh native acceptance.

Follow [AGENTS.md](../../../AGENTS.md)'s representative behavior review and:

- [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  use the smallest sufficient solution and evidence-driven stop-and-fix judgment.
  Reuse the existing human-authorized small-work isolation exception recorded in
  the source plan above; add no broader branch policy. ADR 0007 remains Proposed.
- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  author in `src/skills/`; this story does not change payload declarations or tags.
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  use short behavior walkthroughs for this conventional guidance change, with
  shared integration mechanisms unchanged. Do not claim a native host run.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  direct project-relative instructions, concise prose, one owner per rule.

No new architectural direction or North Star topic is needed. The common rule
is to resolve a reported discrepancy through existing execution, then route
remaining uncertainty or repair work through the existing story/backlog homes.

## Execution and verification

This request authorizes planning only. All slices remain `planned`; execution
will supply identity and proof here through the ordinary execution workflow.
Use the established `.planning/quick/NNN-name/PLAN.md` layout; 049 follows the
highest allocation found in Git history, 048, without reusing a spent number.

Each slice below is one small guidance change and one manual proof loop,
including slice-local cleanup. No numeric authoring budget was supplied. The
ten-minute allowance is behavior of the resulting bug skill, not a new budget
for implementing this plan. No Structure slice is needed.

At each slice, read the changed skill as an executing agent and record the
decisive source locations and observed routing in this plan. Check invocation,
required context, and useful outcome under AGENTS.md. Run `git diff --check`;
check changed frontmatter and relative links directly. Reuse existing focused
checks only where their covered boundary changes; installation/runtime suites
are not bug-routing proof and are not required for this prose-only change.

Before commit, use existing post-change refactoring and coordinator delivery
gates. Preserve the plan and story for retrospective and ordinary story wrap-up.
If implementation exposes a shared execution gap, report that specific gap
before adding another execution mechanism or expanding this story.

## Slices and proof ownership

### 1. Resolve a reported discrepancy through shared execution

Type: Behavior
Status: planned

Behavior: Given an authorized reported discrepancy, invoking bug fixing passes
the report and uncertainty into bounded shared execution and returns an
evidence-backed disposition to the coordinator.

Change: Update the description and entry flow to trigger on discrepancies,
defects, or regressions rather than the word “fix” alone. Gather supplied
expectations, actual behavior, evidence, and gaps; invoke execution early,
planlessly with `--no-replan` and the ten-minute allowance. Carry the existing
stable-boundary failing-test, useful expected-versus-actual assertion, related
verification, and refactoring requirements into that handoff. Link shared rules
instead of duplicating them. Keep reporting/refinement-only requests within
their authority and contribute evidence/examples to existing artifacts.

Proof: Walk the report “total is 12; intended total is 15” from entry through
the execution handoff and returned evidence. Observe reproduction before repair,
focused green proof, shared refactoring, and coordinator-invoked closure owning
main integration. Branch delivery alone must not be reported as integrated.
In the same disposition walkthrough, vary the evidence to establish that 12
is correct: observe an explained no-change resolution, not an invented defect.
An unconfirmed report remains unresolved, and a failed delivery remains recovery.
Check that removal history alone cannot justify absence assertions, while the
explicit promise “cancellation creates no order” can. Reporter confirmation on
main is reported as pending when needed, never fabricated by the skill.

Safe stop: Resolved reports are useful independently. Until Slice 2 is added,
an incomplete return goes honestly to the coordinator without claiming resolution
or automatic queuing. Reporting-only requests cause no execution or code change.

### 2. Queue larger or unresolved reports as actionable first-priority work

Type: Behavior
Status: planned

Behavior: Given known larger work or an incomplete returned attempt, bug fixing
places an actionable canonical story first in the queue, or returns the specific
ownership conflict to the coordinator when that move cannot be made safely.

Change: Add one routing rule for larger and inconclusive reports. Reuse an
owning story where moving it preserves scope; otherwise use existing story
guidance to create the canonical home. Link execution-preserved planning-folder
evidence, expectations, remaining uncertainty, and acceptance examples. Use
product-backlog rules for priority/deduplication; do not repeat rollback or retry.
Known larger work can enter this route without an unnecessary investigation attempt.

Proof: Walk an inconclusive discount report returned under `--no-replan`: the
story links the preserved evidence and first asks whether intended behavior is
violated, then repairs a confirmed violation. It appears once, first under
Backlog list; control returns to the coordinator. Compare a known larger repair
using the same rule and priority without severity categories. With an existing
owning story, observe reuse rather than duplication; if promotion distorts its
scope or ownership is ambiguous, observe a Jidoka handoff naming the decision
instead of a guessed move. Taken work stays running and in place; contradictions
are reported to the coordinator. Later refinement/planning receives the same
expectations, evidence, gaps, and examples without inventing another tracker.

Safe stop: Both resolved and unresolved reports now have their promised outcome;
queued work does not silently start execution or interrupt Taken work.

## Assessment and learnings

The refined story supplies the goal, boundaries, and evaluable examples. All
promises map to the two walkthroughs above. The slices extend one disposition
rule with unresolved-work routing; they add no parallel execution lifecycle.
No remaining slice-specific sizing or integration concern was identified in
this assessment. Execution evidence and consequential learnings are pending.
