---
name: dough-execution-retrospective
description: >-
  Reviews one completed or in-progress plan execution against its original story,
  aggregate commit set, and current project truth. Use for an execution
  retrospective, product review, or backlog recommendation even when cleanup
  removed the plan or the user supplies only a partial reference. `--skip-process`
  and `--skip-product` omit those reviews independently. May plan unresolved
  implementation findings and recommend product work; never implements them.
---

# Review an execution

Recover what one plan intended, identify the commits that executed it, and
review their combined outcome. By default, cover implementation, process, and
product learning. Leave the project with evidence and, only when needed, a
plan for bounded corrections. Do not implement, commit, or push those
corrections. A retrospective authorizes product recommendations; it does not grant
backlog-write authority.

## Select reviews

Ordinary invocation considers implementation, process, and product review.
`--skip-process` omits process analysis and recording, including any
`DearDough.md` write when that destination exists. `--skip-product` omits
product analysis, suggestions, and edits. Both flags may be supplied together.
Neither skips implementation review or its correction planning.

Choose the enabled set before loading focus-specific context or acting on that
focus. Skipped product review does not suppress the shared direction consideration
in implementation or enabled process review. Do not covertly review a skipped
focus or write its destination.

## Work from these principles

- **Original intent is the contract.** Recover the story, boundaries, approved
  changes, and promised proof before judging implementation.
- **Commit membership needs evidence.** A nearby commit is not part of the
  execution merely because it is in the same range.
- **Judge the aggregate result.** Review what the execution left behind, not the
  temporary state of an individual slice.
- **Current truth decides remediation.** Report later fixes and do not plan work
  that is already resolved.
- **Plan state decides the destination.** Amend an unfinished plan; create a
  follow-up plan only for a completed execution.
- **The user owns disputed scope.** Stop when evidence cannot distinguish two
  plans or when a finding would change the story rather than correct it.
- **Product learning is not an implementation defect.** Keep product
  recommendations out of correction plans and process findings.
- **Direction is a criterion, not a deliverable.** Question alignment of
  work and process with the established near-future direction; never propose
  or edit that text.

## Resolve this project's context

Require one useful clue: a capability or story phrase, plan path, commit, or the
current execution conversation. Resolve this project's plan and story locations,
status vocabulary, cleanup lifecycle, repository navigation, and focused test
commands. Preserve existing working-tree changes.

Resolve this project's established near-future direction when present. When
product review is enabled, resolve backlog and canonical-story conventions when
that review needs them. Do not invent a direction, backlog, or seed location.

If context needed for a review decision is missing, name it and stop that path.
Do not invent a plan location, completion rule, or project convention.
Return retrospective evidence in the response; do not create a separate artifact
unless the user asks. Keep the repository read-only except for an allowed plan
update described below and authorized product maintenance described in product
review.

Read [dough-post-change-refactor](../dough-post-change-refactor/SKILL.md) and its
refactor checks before assessing refactoring residue; apply its smell definitions
to the aggregate result without running its editing workflow. Read
[dough-slice-planning](../dough-slice-planning/SKILL.md) only when unresolved
findings need planning, then follow its story, proof, sizing, and destination
gates. Read [dough-product-backlog](../dough-product-backlog/SKILL.md) only when
product review is enabled and applying authorized product maintenance.

## Recover one execution

Search the current conversation, current planning material, and Git history in
that order. A partial reference or a plan removed by normal cleanup is sufficient
when history identifies it. Recover the earliest execution-ready plan, its story
and intended outcome, and any later changes supported by user approval or new
evidence.

Determine completion from the latest plan state and execution evidence, not file
presence. Any planned or in-progress slice makes the plan unfinished. A deleted
plan needs history evidence of completion. If two candidates remain equally
plausible, ask the user to choose and do not combine them.

Build a manifest of related commits. Include each SHA with a reason grounded in
the plan, commit message, diff, or execution transcript. Inspect intervening
commits and exclude unrelated work. Treat planning-only commits as provenance,
not product findings.

Use one net diff only when the implementation commits form an uncontaminated
range. Otherwise review the selected patches together and inspect their files at
the last related implementation commit. Never mutate the worktree to reconstruct
history or mix later work into the historical boundary.

## Consider near-future direction

For every enabled review, treat the established near-future direction as a
high-priority criterion. Read it once from the resolved project location. If it
is missing, say alignment cannot be assessed against an established direction
and continue the independently supported reviews. Otherwise question apparent
alignment and digression. Explain justified exceptions such as urgent fixes. Do
not merely assert that the work fits.

Route a supported deviation through that review's existing authority:

- Implementation: bounded defects of the original contract go to correction
  planning. A needed scope change is the user's decision, not a rewritten
  historical contract.
- Process: produce a process recommendation; do not add it to an
  implementation correction plan.
- Product: recommend work or priorities. Do not treat a direction mismatch as
  an implementation defect.

A later change in direction does not retroactively make approved historical work
a defect. Judge that work against its original approved contract; use today's
direction only for remaining or proposed work.

Never propose or apply a replacement or revision of the direction itself.

## Review the outcome

Apply the shared direction consideration. Then compare the story contract and
approved changes with the aggregate code, tests, documentation, and proof at
the execution boundary. For an unfinished plan, judge only the completed slices;
do not call unexecuted planned behavior missing or its explicitly temporary
predecessor obsolete.

Keep only findings with concrete evidence and plausible impact:

1. bugs or regressions;
2. story drift or an unresolved scope dispute;
3. refactoring residue exposed by the aggregate change; and
4. another consequential improvement specific to this execution.

Look explicitly for additions later worked around or replaced: dead branches,
flags, callers, fixtures, compatibility paths, overlapping tests, tests of
obsolete internals, and documentation that preserves implementation history
instead of product truth. An explicit user decision is not drift. Style
preferences, speculative redesigns, duplicate symptoms, and unsupported claims
are not findings. Do not retain a negative test or documentation merely to prove
that temporary behavior is gone unless its absence is an enduring requirement.

Use focused read-only checks when they can confirm or dismiss a finding. Do not
run broad suites.

## Reconcile findings with current truth

Recheck every finding against the current revision and working tree. Report a
later fix, deduplicate remaining findings by root cause, and keep corrections
within the original story. If none remain, leave planning unchanged.

For an unfinished plan, update that plan in place. Preserve completed and
in-progress evidence and history; place corrective work before still-planned
work and revise overlapping planned slices instead of duplicating them. Do not
renumber completed slices. Record the finding and reviewed commit manifest as a
concise learning when this project's plan format supports it.

For a completed execution, use `dough-slice-planning` to create one follow-up
plan in this project's established location and cite the original story and
commit manifest. If correction would change the story outcome or boundaries,
stop for the user's decision instead of creating a plan that bypasses the scope
gate. Stop likewise when the findings cannot form one bounded correction.

When two authorized reviews cover the same plan, only the designated writer
reconciles findings into it; the other reviewer returns read-only evidence.
After any planning change, do not refine or execute that correction unless the
user separately requests it. Continue every other enabled review, then
report. That restriction applies to correction refinement and implementation, not
to other enabled reviews.

## Review process only from a real record

When process review is enabled, apply the shared direction consideration, then
when the current conversation or a sufficiently complete transcript contains the
execution, separately identify evidence-backed process improvements: wasted
work, rule-induced churn, a missing stop condition, a disproved sizing or
decomposition assumption, avoidable digression from direction, or a useful
practice to learn. Consider whether instructions were concise and context was
organized for easy consumption, including this retrospective's own avoidable
rereading, duplication, or reconstruction. Distinguish necessary investigation
from avoidable waste.

Record observations separately from inferred cost and cause. Use token counts
only when they are available in the record; otherwise cite the repeated work and
qualify the cost. Neither shorter text nor skipped necessary investigation proves
improvement. If the record is insufficient for a process conclusion, state that
limit instead of manufacturing a finding. Do not infer missing events, edit
guidance, require token measurement, write `DearDough.md`, or recursively
launch another retrospective. Do not put process proposals into the repository
correction plan.

Surface a concrete overlooked request, decision, warning, failed verification,
or Jidoka stop only when the record clearly shows that it still needs user
attention. Put this banner at the absolute end when that gate passes:

```text
!!!!!!!!!! DEVELOPER ATTENTION REQUIRED !!!!!!!!!!
<the overlooked item, its impact, and the response needed>
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

## Review product learning

When product review is enabled, apply the shared direction consideration, then
inspect queue entries and canonical stories only when they are relevant to this
execution or a supported finding. An isolated urgent fix with no connection to
other queued work does not trigger queue investigation. Preserve existing priority
instructions.

Connect supported learning to a relevant priority or story recommendation, or
state a reasoned no-change result. Do not claim to validate unread backlog
entries. Do not invent learning. Label inspirations as hypotheses. When
beneficiary or outcome is unresolved, return a concrete exploration proposal; do
not launch discovery or decomposition.

If backlog or story conventions cannot be resolved, keep product conclusions
provisional, identify that gap, and do not invent files. Independent supported
implementation and enabled process review still proceed.

Apply backlog or canonical-story edits only when session or project authority
already permits that maintenance. Then follow
[dough-product-backlog](../dough-product-backlog/SKILL.md). Do not ask for another
permission. A skip option is never write authority.

Apply only justified compatible changes: reorder, queue membership, understood
new-story addition, and canonical detail. A new queued story needs a named
beneficiary and an evaluable outcome. Removing a story from the queue does not
delete its canonical definition or cancel active execution. Preserve unrelated
order, content, valid links, and near-future direction.

Leave unresolved: a disputed goal or scope, conflicting explicit priorities, and
ideas whose beneficiary or outcome is unknown. Report applied changes, remaining
proposals, and unresolved choices distinctly. Do not implement product or
implementation findings.

## Report

Report the resolved story and completion state, provenance, included commit
manifest and review boundary, findings ordered by impact or `none`, planning
result, and evidence limitations. Include supported process proposals only for
enabled process review. Include product recommendations or a reasoned no-change
result, and applied product maintenance when authorized, only for enabled
product review. Omit skipped-focus analysis, suggestions, and destination
writes. Distinguish evidence from hypotheses, and applied changes from
proposals and unresolved choices. State whether planning was updated in place,
newly generated, read-only, or unchanged. End with:

`## EXECUTION RETROSPECTIVE COMPLETE`

Append the attention banner after that marker only when its evidence gate
passes; otherwise nothing follows the marker.
