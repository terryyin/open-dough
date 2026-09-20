# Prepare records in an owned workspace

Apply this rule in [dough-story-decomposition](../../dough-story-decomposition/SKILL.md),
[dough-story-refinement](../SKILL.md) itself,
[dough-slice-planning](../../dough-slice-planning/SKILL.md), and
[dough-slice-plan-refinement](../../dough-slice-plan-refinement/SKILL.md)
before any of them writes a seed, story, or plan record, including a small,
already-decided correction. Reading, discussing, answering questions, or
reviewing an existing seed or plan needs no workspace at all.

## Determine whether a write needs a workspace

Only the first write to a seed, story, or plan record in this preparation
session requires an owned workspace. Continue ordinary discussion, inspection,
and question-answering without one. Once a write is about to happen, establish
or confirm the workspace immediately before making it.

## Select or reuse the workspace

Apply [own a temporary exploration workspace](../../dough-manual-testing/references/exploration-workspace.md)
"Select the checkout" and "Use and resume it" as this preparation's Git
lifecycle; do not duplicate its recipe here. First check whether the current
story, active plan, session, or a host-supplied workspace already owns a
suitable checkout for this preparation. Use it, and do not create a nested or
per-invocation workspace merely because a different one of the four skills
above is now writing. When no suitable owned workspace exists, start one using
that reference's create step, from a suitable existing host workspace when one
is available, otherwise from the verified current revision of the checkout
this preparation was invoked from.

Shared checkout identity is decided by role, not by Git merely reporting a
worktree: a directory `git worktree list` shows is not automatically this
preparation's workspace. Verify that a candidate workspace is actually owned
by the current story, plan, session, or host — the same verification that
reference's resume step performs — before writing into it. Treat an
unverifiable or ambiguous match the same as a missing workspace.

Resolve this project's own conventions for the write — seed directory and
ID/filename rules, plan root and layout, required metadata, and installed
skill guidance — from the intended, owned checkout, not from wherever the
invocation started.

## Continue related preparation

Reuse the same workspace across decomposition, refinement, planning, and
plan refinement while they continue the same story, plan, or session,
including across discussion, a pause for a developer's answer, and successive
invocations of any of the four skills above. Do not start a second workspace
for continuation work that could reuse the first.

## Stop only the write that needs it

When ownership cannot be established or stays ambiguous after the checks
above, stop only the pending record write and report the exact gap: what was
checked and what remains unresolved. Reading, discussing, or continuing to
answer questions does not require resolving it first. Do not invent or guess a
workspace to avoid reporting the gap.

## Tiny corrections are included; the Taken transition is not

A small or already-decided drafting correction — for example fixing a typo or
a misordered example while refining a seed or plan — still goes through this
workspace rule. It gains no direct-edit exception on a shared or host checkout
merely because it is small or already decided.

This rule does not apply to [take queued work](../../dough-execute-plan/SKILL.md#take-queued-work)'s
own commit moving a backlog entry to **Taken**. That execution-startup
transition keeps its existing location, timing, and authority; none of the
four preparation skills above route it through this reference or change its
behavior.

## Leave the shared checkout free for other writers

Preparation under this reference never holds an integration turn on a shared
or host checkout, unlike delivery. A second writer may fetch, integrate, and
push their own prepared or published increment onto the shared integration
branch at any time, including while this preparation is mid-question. Nothing
in this reference locks, blocks, or reserves that checkout.

## Leave drafts isolated for review

Leave a written seed, story, or plan record in the owned workspace for the
developer's review. Do not commit it to a shared or host checkout, integrate,
or publish it under this reference; a later capability decides whether a
retained result is kept and delivered. Treat a "quick" or already-decided edit
the same way — it is not authorization to skip this step.

## Close or retain the workspace

When a preparation session using one of the four skills above concludes,
apply [own a temporary exploration workspace](../../dough-manual-testing/references/exploration-workspace.md)
"Close or retain it": remove only a clean, unambiguous, session-created
workspace; retain and report a reused, host-owned, or otherwise unsafe one
instead of forcing its removal.
