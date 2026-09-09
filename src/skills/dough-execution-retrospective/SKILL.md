---
name: dough-execution-retrospective
description: >-
  Audits one completed or in-progress plan execution by recovering its story and
  related commits, then reviewing the aggregate change for bugs, story drift,
  refactoring residue, and consequential improvements. Use for an execution
  retrospective even when cleanup removed the plan or the user supplies only a
  partial reference. Plans unresolved repository findings but never executes them.
---

# Review a plan execution

Produce an evidence-backed retrospective of one completed or in-progress plan
execution. Recover the original story and exact execution commit set, review
their combined effect, and plan only meaningful repository findings that remain
unresolved. Never implement, commit, or push the planned work.

## Resolve project context

Require a clue that identifies one execution, such as a capability name, story
phrase, old plan path, commit, or the current conversation. Resolve from this
project's guidance:

- plan and story locations, plan format, status vocabulary, and cleanup lifecycle;
- repository navigation, domain vocabulary, subsystem boundaries, and generated
  artifact rules;
- focused verification and history-inspection commands; and
- any task assignment that designates a writer and a read-only reviewer.

Read [dough-post-change-refactor](../dough-post-change-refactor/SKILL.md) and its
refactor checks in full, but apply only its smell definitions to the aggregate
execution result; do not run its editing workflow. Read
[dough-slice-planning](../dough-slice-planning/SKILL.md) before changing planned
work and follow its story, proof, slice, sizing, and destination gates.

If required project context is unavailable, identify the missing context and
stop without writing. Preserve all working-tree changes. The review is read-only
except for an allowed plan update through `dough-slice-planning`. Do not create a
separate retrospective artifact unless the user asks.

## Recover the plan and story

Use evidence in this order:

1. The current conversation or execution transcript.
2. Current project plan and story locations.
3. Git history for renamed or deleted planning files.
4. Commit messages and diffs containing distinctive story language.

Use focused `git log`, `git show`, path history, message search, and pickaxe
searches as needed. A deleted plan is normal when the project's lifecycle cleans
up completed work; do not require its exact former name.

Recover the earliest execution-ready plan revision, its story when present,
beneficiary, intended outcome, boundaries, key examples, and outside-in proof.
Record later plan changes that were explicitly approved or supported by new
evidence so they are not misclassified as drift.

Determine completion from the latest plan state and execution evidence. Any
planned or in-progress slice means the plan is unfinished. Record delivered and
remaining slices separately. A deleted plan needs history evidence of
completion. If two plans remain equally plausible, ask the user to choose; do
not merge them.

## Build the execution commit set

Include a commit only when evidence connects it to the execution, for example:

- it changes the plan's slice status or performs its lifecycle cleanup;
- its message names the story, capability, or slice;
- its diff implements, proves, refactors, or documents the recovered story; or
- the execution transcript explicitly associates it with the plan.

Record every included SHA and reason. Inspect intervening commits and exclude
unrelated work; contiguity alone is not evidence. Treat planning-only commits as
provenance rather than product-quality findings.

When the implementation commits form one uncontaminated range, review the net
diff from the parent of the first implementation commit through the last related
commit. Otherwise review the selected patches together and inspect their changed
files at the last related implementation commit. Do not mutate the worktree to
reconstruct history, and do not let later commits or current uncommitted changes
contaminate the historical result.

## Review the aggregate outcome

Compare the original story contract, approved changes, aggregate diff, and the
code, tests, and documentation at the execution boundary. For an unfinished
plan, assess only the work its completed slices promise. Do not call planned
delivery missing or interim code obsolete solely because a later planned slice
has not run.

Report only concrete findings with evidence and plausible impact:

1. **Bugs** — incorrect behavior, regressions, unsafe edge cases, broken
   contracts, or missing proof that makes a defect plausible.
2. **Story drift or dispute** — missing promised outcomes, unapproved additions
   or removals, or contradictions of the original boundary. An explicit user
   decision is not drift.
3. **Missed refactoring smells** — apply `dough-post-change-refactor` checks to
   the whole execution result rather than one incremental commit.
4. **Consequential improvements** — specific improvements tied to this execution
   that do not fit the categories above.

Explicitly inspect cumulative-execution residue: superseded implementations,
callers, flags, branches, fixtures, compatibility paths, overlapping tests,
tests that pin obsolete internals, and documentation or comments that preserve
implementation history instead of current product truth. When a later slice
replaced temporary behavior, remove its residue unless absence is an enduring
product requirement.

Use focused read-only checks or tests to verify suspected findings when useful.
Do not run broad suites. Exclude style preferences, speculative redesigns,
duplicate symptoms, and claims without plausible impact.

## Plan unresolved repository findings

Recheck each historical finding against the current revision and working tree.
Report later fixes, but do not plan resolved work. Deduplicate remaining findings
by root cause and keep the correction within the original story.

If no meaningful findings remain, leave planning unchanged. If the findings
change the story outcome or boundaries, cannot form one bounded outcome, or lack
required planning context, stop at `dough-slice-planning`'s input gate and ask
for the necessary user decision.

For an unfinished plan, update that same plan in place. Preserve completed slice
identifiers, statuses, proof, and resume history, plus any in-progress status and
recorded work. Insert corrective slices after completed slices and before
remaining work. Revise affected planned slices and dependencies without
duplicating work or retaining obsolete detail; do not renumber completed slices.
Record a concise learning citing the findings and reviewed commit set.

For a completed execution, use `dough-slice-planning` to create one follow-up
plan in this project's normal plan location. Cite the original story and reviewed
commit set as its source. When two authorized reviews cover the same plan, only
the designated writer reconciles both sets of findings against current content;
the other reviewer returns read-only evidence.

After a plan update, stop. Do not refine it unless the user separately requests
refinement, and never execute its slices. State whether planning was updated in
place, newly generated, read-only, or unchanged.

## Review the execution process when evidence exists

Only review process when the current conversation or a sufficiently complete
transcript contains the execution. Use actual waits, failures, corrections,
reversals, tool use, and user responses. If the record is incomplete, state the
limitation instead of inferring missing events.

Keep process proposals separate from repository findings. Propose only
evidence-backed reductions in waste or churn, clearer rules or stop conditions,
better decomposition or sizing assumptions, and concrete practices the user
could learn. Do not edit guidance or plan process changes unless the user later
selects one.

## Surface overlooked user attention

Look for a concrete unresolved request, decision, warning, failed verification,
or Jidoka stop that required user attention and appears to have been overlooked.
Do not infer neglect from an incomplete transcript or lack of ceremonial
acknowledgement.

When evidence is clear, put this banner at the absolute end of the response:

```text
!!!!!!!!!! DEVELOPER ATTENTION REQUIRED !!!!!!!!!!
<the overlooked item, its impact, and the response needed>
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

Nothing follows the banner. Omit it without clear evidence.

## Report completion

Report the resolved plan and completion state, provenance, included commit
manifest and aggregate boundary, findings ordered by impact or `none`, planning
result, process proposals when supported, and evidence limitations. End with:

`## EXECUTION RETROSPECTIVE COMPLETE`

Append the developer-attention banner after that marker only when its evidence
gate passes.
