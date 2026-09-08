# Recognition: dough-product-backlog

Status: ready for maintainer review

## Original clues

Extracted from the on-demand `product-backlog` skill at
`.agents/skills/product-backlog/SKILL.md` in the supplied source repository.
Source SHA-256: `928e4579d3bed0411704f09d4e958d2229f01d88648e583950b526e97e4fae46`.
The original uses a planning backlog and numbered seed documents as story homes.
Project identity is not a recognition requirement.

## Purpose

Maintain a selected, ordered backlog list without duplicating story details
from their canonical homes.

## Triggers

Add, reorder, complete, or otherwise maintain product backlog references.
Exclude classroom and workshop exercise backlog preparation.

## Distinguishing behavior

Human-controlled near-future direction precedes a bulleted backlog list.
It expresses a short-term vision focused on one customer value or goal and is
the most important input for story scope, including decomposition and refinement.
Add or change direction only on explicit human instruction; leave it absent
if missing. Entries contain exact linked story titles and home IDs. Human priorities, direction,
value, learning, and prerequisites guide ordering, with urgent exceptions.
One outcome has one canonical home. Evidence-backed completions move to a
newest-first history capped at ten.
Completed items whose homes were removed retain only their plain-text titles;
definitions remain recoverable through Git history.
Maintenance does not authorize execution, commit, or push.

## Adopter-provided context

Repository root, backlog path, story home locations and IDs, stable link
conventions, relevant decomposition/refinement/slice-planning workflows, and
commit conventions when applicable replace source-specific paths and names.
The ordered-reference format and ten-item history remain part of the behavior.

## Differences that rule out replacement

A backlog that owns story requirements inline, inventories every candidate,
serves as an execution plan, uses different completion retention semantics, or
represents a classroom exercise needs manual comparison. This on-demand skill
does not replace automatically applied rules. Missing home/link conventions or
required related workflows must be resolved before the affected work proceeds.
Maintainer changes after extraction replace numbered items with bullets,
restrict direction edits to explicit human instructions, and permit title-only
history entries for removed story homes. Direction also governs story scope.
The source checksum records the
original extraction, not equivalence with these updated behaviors.

## Validation needed

Before release, perform the representative behavior review in
[`AGENTS.md`](../../../AGENTS.md): confirm invocation context, required adopter
context (including a useful stop when missing), and a useful outcome.
Use a backlog with an unfinished prerequisite and ten recent
completions. Verify prerequisite ordering or a human-visible conflict,
evidence in the completed story's home, and
eviction of only the oldest history reference. Check exact titles, links, and
unrelated order. Verify routine maintenance preserves direction exactly,
leaves absent direction absent, and changes it only on explicit human instruction.
For a direction of helping new users reach their first useful result, review a
story proposing onboarding help plus unrelated reporting. Verify the scope
focuses on onboarding and carries that direction into refinement without
rewriting the direction or treating scope review as execution authorization.
Check bullet formatting and title-only retention when a completed story home
is removed, including recovery from Git history when needed.
Publication and adopter delivery remain separate work.
