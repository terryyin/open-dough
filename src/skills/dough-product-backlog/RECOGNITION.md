# Recognition: dough-product-backlog

Status: ready for maintainer review

## Original clues

Extracted from the on-demand `product-backlog` skill at
`.agents/skills/product-backlog/SKILL.md` in the supplied source repository.
Source SHA-256: `928e4579d3bed0411704f09d4e958d2229f01d88648e583950b526e97e4fae46`.
The original uses a planning backlog and numbered seed documents as story homes.
Project identity is not a recognition requirement.

## Purpose

Maintain a selected, ordered product queue without duplicating story details
from their canonical homes.

## Triggers

Add, reorder, defer, complete, or otherwise maintain product backlog references.
Exclude classroom and workshop exercise backlog preparation.

## Distinguishing behavior

Near-future direction precedes a numbered unfinished queue. Entries contain
only exact linked story titles and home IDs. Owner priorities, direction,
value, learning, and prerequisites guide ordering, with urgent exceptions.
One outcome has one canonical home. Evidence-backed completions move to a
newest-first history capped at ten; deferrals retain their source stories.
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

## Validation needed

Before release, perform the representative behavior review in
[`AGENTS.md`](../../../AGENTS.md): confirm invocation context, required adopter
context (including a useful stop when missing), and a useful outcome.
Use a backlog with an unfinished prerequisite, a deferred story, and ten recent
completions. Verify prerequisite ordering or an owner-visible conflict,
retention of the deferred story, evidence in the completed story's home, and
eviction of only the oldest history reference. Check exact titles, links, and
unrelated order. Publication and adopter delivery remain separate work.
