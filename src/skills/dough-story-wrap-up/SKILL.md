---
name: dough-story-wrap-up
description: >-
  Closes one completed story after plan execution and retrospective. Assimilates
  lasting product knowledge, removes that story's spent plan and history so Git
  can recover it, and reports truthfully when required inputs are missing or
  unfinished. Use to wrap up a story, close a completed story, or delete spent
  plan and execution history after retrospective.
---

# Story wrap-up

Close one selected story after its plan execution and retrospective are
complete. Leave this project with maintained product knowledge and no spent
story or plan history in the current snapshot. Do not invent findings, records,
or a requirement for another conversation.

## Resolve this project's context

Require a selected story. Resolve from this project, not this skill's location:

- repository root and Git working tree;
- canonical seed location, story identity, heading or stable-anchor conventions;
- executable-plan location, status vocabulary, and the selected story's plan;
- how this project records that a retrospective finished, including an empty result;
- Git commit conventions used to preserve a recoverable revision; and
- the product backlog path when a queue entry points at the selected story.

An empty retrospective result is valid input. Do not invent a retrospective
artifact or require another review. Do not invent a plan path, completion rule,
seed location, or Git convention.

If context needed for a closure decision is missing, name the gap, leave
affected material intact, and do not claim closure.

## Confirm execution and retrospective are complete

Judge the selected plan from its latest state and execution evidence. Any
planned or in-progress slice is unfinished. A missing retrospective completion
is unfinished even when the plan is done. Empty retrospective output still
counts as complete when this project or the user records that the review
finished with nothing to act on.

If execution or retrospective is unfinished, leave the story, plan, and
related files intact. Report what remains and stop. Do not delete unfinished
work to manufacture a wrap-up.

## Preserve Git recovery

Before deleting the only copy of spent material, make that revision
recoverable with this project's ordinary Git conventions. If spent files are
uncommitted, commit them first using those conventions, then record that
revision as the before-cleanup commit. If commit conventions, ownership, or
recovery cannot be resolved, leave the material intact and report the gap.

Do not rewrite Git history. Do not create an archive, tombstone, finished-list
entry, or replacement summary for later readers.

## Assimilate lasting knowledge

Move lasting behavior and design into this project's maintained code, tests,
documentation, or current Accepted decisions. Describe the current product
without execution narration, impact chronology, story or plan identity, or
retrospective judgments. Preserve existing product tests and documents that
already state current behavior. Do not invent product knowledge.

## Leave unsupported wrap-up actions intact

This closure handles a standalone completed story with no follow-up plan,
shared process log, or product-review advice to apply. If those are present,
leave their required inputs intact, report them as unsupported by this closure,
and continue only with the supported standalone deletions below.

Do not create, execute, or replan follow-up work. Do not launch discovery or
another review.

## Delete spent standalone history

When completion and recovery are resolved, delete only the selected story's
spent material:

- its executable plan and owned proof, evidence, and assessment records;
- its canonical story section, and the seed when that seed would become empty;
- queue entries whose only remaining work is that completed story; and
- incoming links that exist solely to preserve that spent history.

Preserve unrelated active content, sibling stories, product and version
identity, and maintained tests or documents. Delete an empty container that
held only spent material. Repair remaining Markdown links that this deletion
breaks; do not leave a live link to a removed path.

Do not replace deleted history with a summary, archive, tombstone, recently-done
ledger, or judgment for later readers. An already-absent artifact does not prove
a different story complete. Repeating wrap-up must not recreate history or
duplicate edits.

Inspect tracked and untracked files. Absence is the current snapshot, including
untracked paths. Recover removed files with
`git show <before-cleanup-commit>:<spent-path>` using the recorded revision.

## Report

Report the selected story, completion judgment, before-cleanup commit when
deletion happened, assimilated knowledge, deleted paths, preserved
unsupported material, and any gap that blocked closure. Distinguish a completed
wrap-up from a refusal that left files intact.

End a successful closure with:

`## STORY WRAP-UP COMPLETE`

Do not emit that marker when required context, unfinished work, or
unresolved recovery blocked deletion.
