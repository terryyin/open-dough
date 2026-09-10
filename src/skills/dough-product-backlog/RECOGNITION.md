# Recognition: dough-product-backlog

Review: ready for maintainer review

## Original clues

Extracted from the on-demand `product-backlog` skill at
`.agents/skills/product-backlog/SKILL.md` in the supplied source repository.
Source SHA-256: `928e4579d3bed0411704f09d4e958d2229f01d88648e583950b526e97e4fae46`.
The original uses a planning backlog and numbered seeds containing canonical story sections.
Project identity is not a recognition condition.

## Purpose

Maintain a selected, ordered backlog list without duplicating story details
from their canonical sections in seeds.

## Triggers

Add, reorder, complete, or otherwise maintain product backlog references.
Exclude classroom and workshop exercise backlog preparation.

## Distinguishing behavior

Human-controlled near-future direction precedes a bulleted backlog list.
It expresses a short-term vision focused on one customer value or goal and is
the most important input for story scope, including decomposition and refinement.
Add or change direction only on explicit human instruction; leave it absent
if missing. Entries contain exact linked story titles and seed IDs. Human priorities, direction,
value, learning, and prerequisites guide ordering, with urgent exceptions.
Each story has one canonical section within a seed. Completed-story closure
belongs to dough-story-wrap-up rather than a recently-done history list.
Standalone queue maintenance may drop a completed item from the active list
without creating a tombstone. Maintenance does not authorize execution, commit,
or push.

## Client project context

Repository root, backlog path, seed locations and IDs, stable link
conventions, relevant decomposition/refinement/slice-planning workflows, and
commit conventions when applicable replace source-specific paths and names.
The ordered-reference format remains part of the behavior. Finished-list
retention does not.

## Differences that rule out replacement

A backlog that owns story details inline, inventories every candidate,
serves as an execution plan, uses different completion retention semantics, or
represents a classroom exercise needs manual comparison. This on-demand skill
does not replace automatically applied rules. Missing seed/link conventions or
required related workflows must be resolved before the affected work proceeds.
Maintainer changes after extraction replace numbered items with bullets,
restrict direction edits to explicit human instructions, and permit title-only
history entries for removed seeds. Direction also governs story scope.
The source checksum records the
original extraction, not equivalence with these updated behaviors.

## Validation needed

Before release, perform the representative behavior review in
[`AGENTS.md`](../../../AGENTS.md): confirm invocation context, required client project
context (including a useful stop when missing), and a useful outcome.
Use a backlog with an unfinished prerequisite and ten recent
completions. Verify prerequisite ordering or a human-visible conflict,
evidence in the completed story's section within its seed, and
eviction of only the oldest history reference. Check exact titles, links, and
unrelated order. Verify routine maintenance preserves direction exactly,
leaves absent direction absent, and changes it only on explicit human instruction.
For a direction of helping new users reach their first useful result, review a
story proposing onboarding help plus unrelated reporting. Verify the scope
focuses on onboarding and carries that direction into refinement without
rewriting the direction or treating scope review as execution authorization.
Check bullet formatting and title-only retention when a completed story's seed
is removed, including recovery from Git history when needed.
Promotion, release, and client installation remain separate work.
