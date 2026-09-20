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

Alongside that owned workspace identity, record this preparation's
integration checkout: the checkout it was invoked from, or a reused host
workspace's own already-recorded integration checkout when one applies — the
project's established checkout for ordinary work, never the owned preparation
workspace itself. Record its authorized remote target the same way
[execution location](../../dough-execute-plan/references/execution-location.md)
resolves the integration checkout and branch and the authorized remote target
for ordinary work in this project, defaulting the branch to `main` only when
neither caller nor project supplies one. A later keep decision publishes onto
this recorded target; see
[Decide what happens to the written result](#decide-what-happens-to-the-written-result).

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

## Decide what happens to the written result

Leave a written seed, story, or plan record in the owned workspace for the
developer's review by default. Do not commit it to a shared or host checkout,
integrate, or publish it merely because the write finished. Treat a "quick" or
already-decided edit the same way — it is not authorization to skip this step.
Two explicit developer decisions change that default:

- **An explicit instruction to keep this preparation's retained result**
  authorizes committing it in the owned workspace, reconciling it with the
  current integration target, and publishing it through
  [Keep and publish the retained result](#keep-and-publish-the-retained-result)
  below. Only an explicit instruction counts as keep: continuing discussion,
  pausing for more review, or silence is never a keep decision.
- **An explicit instruction to leave the result unpublished** is preserved and
  overrides any default publication. The record stays in the owned workspace
  exactly as the developer left it; this reference performs no additional
  commit, integration, or push.

Absent either explicit instruction, continue leaving the draft isolated: no
commit, integration, or publication happens under this reference.

## Validate a keep instruction before acting

Before committing or publishing anything, confirm — or require the calling
skill (one of the four preparation skills above, at its disposition/report
step) to have already confirmed — that the keep instruction:

- names this preparation session's own retained seed, story, or plan
  record, not implementation, unrelated changes, or another session's work;
  and
- has a known, unambiguous integration checkout, branch, and authorized
  remote target to publish onto, per the identity recorded in
  [Select or reuse the workspace](#select-or-reuse-the-workspace) above.

A keep instruction that does not clearly identify its own retained result, or
whose destination is unknown or ambiguous, stops before any commit or
publication; report the exact gap. This is a real stop, not permission to
guess a destination or assume "the usual place."

## Keep and publish the retained result

Apply this sequence only after a validated explicit keep instruction.

1. **Commit the retained result.** If the developer's retained seed, story,
   or plan record is not already committed in the owned workspace, commit
   exactly the files the keep instruction names there — nothing else. This
   produces the owned workspace's own unpublished suffix: one or more commits
   on its branch, since its recorded starting revision, not yet on the
   authorized remote target. Do not commit implementation, unrelated edits,
   or another session's changes.
2. **Use the recorded integration checkout and target.** Reuse the
   integration checkout, branch, and authorized remote target recorded in
   [Select or reuse the workspace](#select-or-reuse-the-workspace); do not
   invent a different or preparation-specific destination. If that identity
   is missing, contradictory, or ambiguous, stop before any commit or
   publication and report the exact gap — a missing destination or unknown
   integration ownership is a real stop, not permission to guess.
3. **Publish through the existing procedure.** Apply
   [publish the candidate](../../dough-execute-plan/references/publish-the-candidate.md)
   "Preconditions", "Publish the candidate", and, if a push is rejected,
   "Recover a rejected push" — do not invent a second publication sequence or
   a preparation-specific merge/rebase policy. For this caller:
   - the owned unpublished suffix is the commit(s) from step 1;
   - the integration checkout and authorized remote target are the ones
     resolved in step 2;
   - "Preconditions"' exclusive integration turn applies unchanged; this
     reference adds no second coordination mechanism;
   - validating the candidate (step 4 of "Publish the candidate") means
     reconfirming that the suffix's commits are exactly the retained record
     the keep instruction named and nothing else — there is no **Taken**
     commit to confirm and no accepted implementation proof to reuse for a
     planning record. An unchanged-trunk fast-forward needs no
     re-validation; a rebase onto advanced trunk invalidates only content the
     combined changes actually touch;
   - no CI/execution observer is bound to a preparation workspace, so no
     registration happens — see
     [What keep does not do](#what-keep-does-not-do) below;
   - an unresolved rejection, unrelated unpublished local commits, or
     ambiguous target ownership stops exactly as that reference already
     describes; report it and do not loop.

After a successful push, the retained result is reachable at the authorized
remote target, with any writer's intervening work still present in its
history. When the developer instead gave an explicit no-push instruction (see
[Decide what happens to the written result](#decide-what-happens-to-the-written-result)),
this section is never entered: the retained result stays committed (or
uncommitted, as the developer left it) in the owned workspace, recoverable and
unpublished, and the authorized remote target is left unchanged.

## What keep does not do

Keep authorizes only committing and publishing this preparation's own
retained seed, story, or plan record. It does not:

- move a backlog entry to **Taken** or perform any part of
  [take queued work](../../dough-execute-plan/SKILL.md#take-queued-work);
- start implementation of the kept record;
- start, arm, or register with a CI/execution observer — that remains
  execution's own concern under
  [Own one observer](../../dough-execute-plan/references/ci-monitor.md#own-one-observer),
  not preparation's;
- establish an execution identity, mode, or claim.

This keeps "keep" a narrower operation than an execute-plan delivery: only the
retained planning record reaches the authorized remote target. Planning-only
execution limits are preserved — this capability never begins implementation
or takes the story, whatever the kept record describes.

## Close or retain the workspace

When a preparation session using one of the four skills above concludes,
apply [own a temporary exploration workspace](../../dough-manual-testing/references/exploration-workspace.md)
"Close or retain it": remove only a clean, unambiguous, session-created
workspace; retain and report a reused, host-owned, or otherwise unsafe one
instead of forcing its removal.
