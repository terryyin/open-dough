---
name: dough-story-wrap-up
description: >-
  Closes one completed feature story or bounded retrospective correction using
  available execution context. Assimilates lasting product knowledge, handles
  existing follow-ups and authorized product decisions, removes that work's spent
  plan and history so Git can recover it, and reports truthfully when required
  inputs are missing or unfinished. Use to wrap up a story or correction, close
  completed work, or delete spent plan and execution history.
---

# Story wrap-up

Close one selected feature story or bounded retrospective correction when the
coordinator invokes wrap-up. Use available execution context and optional
retrospective advice. Leave this project with maintained product knowledge and
no spent source or plan history in the current snapshot. Do not invent
findings, records, or a requirement for another conversation.

## Resolve this project's context

Require one selected work identity. Use a canonical feature story only when it
is explicitly supplied as that work's active home. Otherwise use the bounded
correction plan itself when it satisfies the correction-input contract defined by
[planning scope and lifecycle](../dough-story-refinement/references/planning.md#choose-the-planning-level).
Do not require or create a seed for that correction. Name any missing required
field, leave the affected work intact, and stop before closure.

Resolve from this project, not this skill's location:

- repository root and Git working tree;
- canonical seed location, story identity, heading or stable-anchor conventions
  for a selected feature story;
- for planned work: executable-plan location, status vocabulary, and the
  selected work's plan identity;
- for planless feature work: the story, its changes, and available execution
  results;
- optional retrospective advice when it is present, including an empty
  result;
- Git commit conventions used to preserve a recoverable revision;
- the product backlog path when a **Taken**, queue, or finished-history entry
  points at the selected work; and
- shared records that name the selected work: its seed when applicable, process
  log (`DearDough.md` unless this project sets another canonical location),
  incoming links, and assessment or recognition records.

Do not invent a retrospective artifact or require another review. Do not invent
a plan path, completion rule, feature-story seed location, or Git convention.
Planless feature work does not require a plan. Keep the bounded-correction
identity contract above; do not invent a planless correction format.

If context needed for a closure decision is missing, name the gap, leave
affected material intact, and do not claim closure.

## Establish execution completion

Judge completion from the selected work and available execution evidence.

- Planned work is complete when every slice is done.
- Planless feature work is complete when the supplied story, changes, and
  execution results show the promised outcome is delivered.
- Incomplete implementation leaves the affected active work intact. Report
  the unfinished implementation and stop. Do not delete an unfinished
  correction plan to manufacture a wrap-up.

When retrospective advice is present, apply it under existing authority in the
closure actions below. When it is absent or empty, perform the same ordinary
closure using the other available inputs: the story or bounded-work context,
implementation results, maintained product knowledge, existing follow-ups, and
coordinator instructions.

## Assimilate lasting knowledge

Move lasting behavior and design into this project's maintained code, tests,
documentation, or current Accepted decisions. Describe the current product
without execution narration, impact chronology, story or plan identity, or
retrospective judgments. Preserve existing product tests and documents that
already state current behavior. Do not invent product knowledge. When a current
product fact is written only in spent execution context or review and is not
already stated in maintained documentation, write it into maintained
documentation before deleting that spent copy. Tests that exercise related
behavior do not replace that documentation step.

## Queue an existing follow-up plan first

When an existing follow-up plan is present, validate it against the
correction-input contract above, then put its one canonical active home first
in the queue. Do not refine, replan, or execute it. Preserve the plan contents
needed for later execution. Handle that follow-up by its presence, including
when retrospective advice is absent.

Resolve one canonical active home under
[dough-product-backlog](../dough-product-backlog/SKILL.md#canonical-active-homes):

- If a canonical follow-up story is supplied, keep that story in its seed and
  link the plan there. Queue the story; do not duplicate it as a plan entry.
- Otherwise queue the existing correction plan directly. The plan is its
  canonical active home; do not create or recover a seed solely for queueing.
- If required correction input is missing, name the missing field and do not
  guess or queue the addition. Keep the follow-up plan and any other needed
  active-work context, report the gap, and stop before deleting the completed
  predecessor's history.

Preserve unrelated queue order after that first item, near-future direction,
and human text. Repeating wrap-up must recognize either canonical home and must
not duplicate the follow-up or queue entry.

## Apply product-review decisions

When retrospective product advice or additional human input is present, apply
only authorized compatible backlog and canonical-home changes. Follow
[dough-product-backlog](../dough-product-backlog/SKILL.md) for queue and
active-home conventions. Explicit human input wins over advice.

Supported changes: relevant reorder, queue membership, understood new-story
addition, understood bounded-correction plan addition, and canonical-detail
edits. Apply the backlog skill's canonical-home admission rules to every new
entry. Keep existing follow-up work first unless a later explicit human
instruction changes that priority. Preserve unrelated content, still-needed
acceptance work, and near-future direction.

A skipped, empty, or absent product review, or absent extra human input,
introduces no mandatory question. Ordinary closure continues using the other
available inputs. Leave unresolved necessary context with active work and
report the choice; do not invent scope, launch discovery, or start another
review.

## Leave no extra wrap-up ceremony

Do not launch discovery or another review. Absent or empty retrospective
advice is valid and changes nothing beyond the supported closure and follow-up
actions above.

## Preserve Git recovery

After supported follow-up queue changes and before deleting anything, make the
current revision recoverable with this project's ordinary Git conventions.
Include an uncommitted active follow-up plan and its queue edit in that revision
as well as the spent material, so cleanup cannot strand the plan's only copy. If
affected files are uncommitted, commit them first using those conventions, then
record that revision as the before-cleanup commit. If commit conventions,
ownership, or recovery cannot be resolved, leave the material intact and report
the gap.

Do not rewrite Git history. Do not create an archive, tombstone, finished-list
entry, or replacement summary for later readers.

## Delete spent history, including shared records

When completion and recovery are resolved, delete only material the selected
work's identity and references identify as spent:

- its executable plan and owned proof, evidence, and assessment records, when
  a plan exists. A plan decision that retained the plan at execution completion
  still leaves that spent plan for wrap-up to delete.
- its canonical story section when it has one; delete the seed only when every
  remaining section is spent;
- **Taken**, queue, and finished-history / recently-done entries for that
  completed work;
- related occurrences in the process log, and an issue or container that
  becomes empty afterward; and
- incoming links that exist solely to preserve that spent history.

After deleting spent files, remove directories named by that spent work when
they are empty, including nested untracked evidence directories. Verify those
directory paths are absent, not merely free of files.

Preserve unrelated human text, sibling stories, unrelated log issues and
occurrences, product and version identity, maintained tests or documents,
still-needed acceptance work, and any follow-up plan queued above. A direct
queue link to that plan is active navigation, not an incoming historical link
to delete with the completed predecessor. Preserve the active plan's correction
input and provenance. When its source locator points into the predecessor being
deleted, replace that locator with the before-cleanup commit and the predecessor's
repository-relative path rather than deleting the active context or recreating
spent history.
Resolve ambiguous attribution before deleting that portion; if a log issue or
link cannot be tied to the selected execution, leave it intact and say so.

Repair remaining Markdown links that this deletion breaks; do not leave a
live link to a removed path. Unrelated links stay unchanged.

Do not replace deleted history with a summary, archive, tombstone, recently-done
ledger, or judgment for later readers. Assimilate current product knowledge
instead of preserving the removed work's identity. An already-absent artifact
does not prove different work complete. Repeating wrap-up must not recreate
history, duplicate edits, or claim that missing files close a different story
or correction.

Inspect tracked and untracked files. Absence is the current snapshot, including
untracked paths. Recover removed files with
`git show <before-cleanup-commit>:<spent-path>` using the recorded revision.

## Report

Report the selected work and its canonical identity, completion judgment,
before-cleanup commit when deletion happened, assimilated knowledge, deleted
paths, preserved unsupported material, and any gap that blocked closure.
Distinguish a completed wrap-up from a refusal that left files intact.

End a successful closure with:

`## STORY WRAP-UP COMPLETE`

Do not emit that marker when required context, unfinished work, or
unresolved recovery blocked deletion.
