# Recognition: dough-product-backlog

Review: ready for maintainer review

## Original clues

Extracted from the on-demand `product-backlog` skill at
`.agents/skills/product-backlog/SKILL.md` in the supplied source repository.
Source SHA-256: `928e4579d3bed0411704f09d4e958d2229f01d88648e583950b526e97e4fae46`.
The original uses a planning backlog and numbered seeds containing canonical story sections.
Project identity is not a recognition condition.

## Purpose

Maintain selected backlog references without duplicating work details from
their canonical story sections or bounded-correction plans, and distinguish
active work whose execution has started from the still-prioritized queue.

## Triggers

Add, reorder, complete, or otherwise maintain product backlog references.
Exclude classroom and workshop exercise backlog preparation.

## Distinguishing behavior

Human-controlled near-future direction precedes **Taken**, which immediately
precedes the bulleted backlog queue. **Taken** remains present when empty.
It expresses a short-term vision focused on one customer value or goal and is
the most important input for story scope, including decomposition and refinement.
Add or change direction only on explicit human instruction; leave it absent
if missing. Entries contain exact linked titles and their canonical identities:
seed IDs for feature stories or plan identities for seedless corrections. Human
priorities, direction, value, learning, and prerequisites guide ordering, with
urgent exceptions. Each feature story has one canonical section within a seed;
a bounded correction without a supplied story uses its plan as the canonical
home. Authorized execution moves a queued entry to the end of **Taken** as its
first project-state change, preserving its title, canonical link, and identity
and adding a direct slice-plan link for a planned feature story. Planless quick
stories need no plan link; corrections already linked to a plan need no duplicate.
Refinement and planning do not take work.
Pauses, failures, completion, and resumption leave the entry taken. Story
wrap-up removes completed work from its active list and owns applicable seed,
plan, and proof cleanup. Authorized standalone queue maintenance may remove a
completed item from its active list while retaining those artifacts for later
wrap-up. Maintenance does not authorize execution, commit, or push.

## Client project context

Repository root, backlog path, the affected canonical seed or plan locations
and identities, stable link conventions, relevant
decomposition/refinement/slice-planning workflows, and commit conventions when
applicable replace source-specific paths and names.
The ordered-reference format remains part of the behavior.

## Differences that rule out replacement

A backlog that owns story details inline, inventories every candidate, serves as
an execution plan, or represents a classroom exercise needs manual comparison.
This on-demand skill does not replace automatically applied rules. Missing
seed/link conventions or required related workflows must be resolved before the
affected work proceeds. Maintainer changes after extraction replace numbered
items with bullets and restrict direction edits to explicit human instructions.
Direction also governs story scope.
The source checksum records the
original extraction, not equivalence with these updated behaviors.

## Validation needed

Before release, perform the representative behavior review in
[`AGENTS.md`](../../../AGENTS.md): confirm invocation context, required client project
context (including a useful stop when missing), and a useful outcome.
Use a backlog with active entries in **Taken** and **Backlog list**, including
an unfinished prerequisite. Verify prerequisite ordering or a human-visible
conflict, exact titles and links, uniqueness across both lists, and unrelated
order. Verify routine maintenance preserves direction exactly, leaves absent
direction absent, and changes it only on explicit human instruction.
For a direction of helping new users reach their first useful result, review a
story proposing onboarding help plus unrelated reporting. Verify the scope
focuses on onboarding and carries that direction into refinement without
rewriting the direction or treating scope review as execution authorization.
Check bullet formatting. Verify that a complete seedless correction queues once
by direct plan link without changing unrelated order or direction, while a
missing beneficiary or outcome leaves the queue unchanged. Verify story wrap-up
removes completed work from its active list and standalone maintenance removes
only the authorized active entry.
Promotion, release, and client installation remain separate work.

The 2026-09-10 source review walked a queued story with one existing **Taken**
entry. Refinement and planning left the queue unchanged; authorized execution
preserved the existing entry, moved the selected canonical link after it, and
left no duplicate; resume made no change; a pre-authorization failure made no
change; wrap-up removed the completed **Taken** entry. Missing or ambiguous
backlog context stops before execution. The human explicitly skipped new native
acceptance for this change; the existing native evidence does not prove the new
transition.

The 2026-09-12 source behavior review walked a planned story moving after an
existing taken entry: its canonical story link and identity remain, and a direct
link opens its resolved slice plan. Resume retains ordering and adds a missing
plan link without duplicating one. Missing or ambiguous plans stop the transition.
A planless quick story moves without inventing a plan; a seedless correction
retains its existing plan link. This is a source review, not native acceptance.
