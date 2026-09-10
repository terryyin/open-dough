---
name: dough-execution-retrospective
description: >-
  Reviews one completed or in-progress plan execution against its original story,
  aggregate commit set, and current project truth. Use for an execution
  retrospective, product review, or backlog recommendation even when cleanup
  removed the plan or the user supplies only a partial reference. May plan
  unresolved implementation findings and recommend product work; never
  implements them.
---

# Review an execution

Recover what one plan intended, identify the commits that executed it, and
review their combined outcome. Cover implementation, process, and product
learning. Leave the project with evidence and, only when needed, a plan for
bounded corrections. Do not implement, commit, or push those corrections. A
retrospective authorizes product recommendations; it does not grant backlog-write
authority.

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

## Resolve this project's context

Require one useful clue: a capability or story phrase, plan path, commit, or the
current execution conversation. Resolve this project's plan and story locations,
status vocabulary, cleanup lifecycle, repository navigation, and focused test
commands. Preserve existing working-tree changes.

For product review, also resolve this project's established near-future
direction when present. Resolve backlog and canonical-story conventions when
that review needs them. Do not invent a direction, backlog, or seed location.

If context needed for a review decision is missing, name it and stop that path.
Do not invent a plan location, completion rule, or project convention.
Return retrospective evidence in the response; do not create a separate artifact
unless the user asks. Keep the repository read-only except for an allowed plan
update described below.

Read [dough-post-change-refactor](../dough-post-change-refactor/SKILL.md) and its
refactor checks before assessing refactoring residue; apply its smell definitions
to the aggregate result without running its editing workflow. Read
[dough-slice-planning](../dough-slice-planning/SKILL.md) only when unresolved
findings need planning, then follow its story, proof, sizing, and destination
gates.

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

## Review the outcome

Compare the story contract and approved changes with the aggregate code, tests,
documentation, and proof at the execution boundary. For an unfinished plan,
judge only the completed slices; do not call unexecuted planned behavior missing
or its explicitly temporary predecessor obsolete.

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
After any planning change, stop. Do not refine or execute it unless the user
separately requests that work.

## Review process only from a real record

When the current conversation or a sufficiently complete transcript contains
the execution, separately identify evidence-backed process improvements: wasted
work, rule-induced churn, a missing stop condition, a disproved sizing or
decomposition assumption, or a useful practice to learn. Distinguish necessary
investigation from avoidable waste. Do not infer missing events, edit guidance,
or put process proposals into the repository correction plan.

Surface a concrete overlooked request, decision, warning, failed verification,
or Jidoka stop only when the record clearly shows that it still needs user
attention. Put this banner at the absolute end when that gate passes:

```text
!!!!!!!!!! DEVELOPER ATTENTION REQUIRED !!!!!!!!!!
<the overlooked item, its impact, and the response needed>
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

## Review product learning

Read the established near-future direction, then inspect queue entries and
canonical stories only when they are relevant to this execution or a supported
finding. An isolated urgent fix with no connection to other queued work does not
trigger queue investigation. Preserve existing priority instructions. Never
propose or edit the direction text.

Connect supported learning to a relevant priority or story recommendation, or
state a reasoned no-change result. Do not claim to validate unread backlog
entries. Do not invent learning. Label inspirations as hypotheses. When
beneficiary or outcome is unresolved, return a concrete exploration proposal; do
not launch discovery or decomposition.

If direction is missing, say alignment cannot be assessed against an established
direction and continue the independently supported reviews. If backlog or
story conventions cannot be resolved, keep product conclusions provisional,
identify that gap, and do not invent files. Independent supported implementation
and process review still proceed.

## Report

Report the resolved story and completion state, provenance, included commit
manifest and review boundary, findings ordered by impact or `none`, planning
result, supported process proposals, product recommendations or a reasoned
no-change result, and evidence limitations. Distinguish evidence from
hypotheses. State whether planning was updated in place, newly generated,
read-only, or unchanged. End with:

`## EXECUTION RETROSPECTIVE COMPLETE`

Append the attention banner after that marker only when its evidence gate
passes; otherwise nothing follows the marker.
