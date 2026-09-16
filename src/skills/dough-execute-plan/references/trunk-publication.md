# Publish onto shared trunk

Use this rule for Trunk Mode work that must reach the authorized remote trunk
without publishing the execution branch. Startup uses it to publish a queue
claim. Wrap-up delivery uses the same Git steps for each verified increment.
Do not invent a second publication sequence.

This rule does not create execution authority, start an observer, wait for CI,
or push the execution branch.

## Publish a queue claim

After the local Taken claim commit succeeds on the originating branch, publish
that claim with the steps below, then create the local execution
branch/worktree from the published revision. Do not start implementation from
an unpublished claim. An unavailable destination or failed publication leaves
the exact remaining state and does not authorize starting unclaimed queued
work.

## Publish a verified increment

After wrap-up proof, refactor, format, and commit succeed, publish the owned
unpublished increment with the same steps below. Keep the same execution
worktree. Planned, quick, and contextual Trunk Mode work share this rule.

The owned unpublished suffix is the execution commit or consecutive commits
not yet on the authorized remote trunk. When the last published revision is
that suffix's parent and remote trunk is still that parent, the increment is
already based on current trunk: do not rewrite it; fast-forward the local
target to that commit and publish it.

When fetch shows a newer remote trunk than that parent, publish through the
candidate steps so only that suffix is rebased onto current trunk.
Previously published revisions remain ancestors; never rewrite them or
another writer's commits.

## Preconditions

Resolve source, mode, target branch, authorized remote, and the owned
unpublished suffix before mutating the shared integration checkout. For a
queue claim, that suffix is the Taken commit only. For a verified increment,
use the suffix defined in the increment rule.

Acquire an exclusive integration turn through available coordinator context
before changing the shared integration checkout. A clean working directory
alone is not ownership. If another writer cannot be coordinated, stop without
altering its work. Do not treat Git lock files as a transaction lock.

Known unrelated local commits on the target, dirty or ambiguous target state,
or unknown ownership stop this path. Do not silently publish those commits.

## Publish the candidate

Rebase only owned unpublished execution work; never rewrite published trunk
history or another writer's commits. No force push. An increment keeps the
same execution worktree; a claim may have none yet.

1. Fetch the authorized remote for the target branch.
2. Reconcile from the fetched target. Current trunk is the fetched remote
   target, not a stale local target tip. A local target that is only behind
   that remote is not a stop. If the local target has unpublished commits
   that are not this execution's owned suffix, or ownership is ambiguous,
   stop and preserve that state.
3. Rebase only the owned unpublished suffix onto the current remote trunk.
   For a claim, that is the Taken commit. For an increment, that is the
   unpublished execution suffix. When that suffix is already based on
   current trunk, leave its commits unchanged. When trunk advanced, rewrite
   only that suffix onto it and replace the unpublished candidate SHA with
   the rewritten SHA; the pre-rebase SHA is not the increment. Update the
   execution branch to the rewritten candidate when a worktree already
   exists; otherwise keep the candidate on the integration checkout until
   workspace setup uses it. A rebase conflict in this project's product
   backlog uses
   [backlog merge conflicts](../dough-product-backlog/references/merge-conflicts.md)
   before continuing Git. Other conflicts are not specified here: preserve
   the exact refs, worktree, and index, and report them.
4. Validate the candidate. For a claim, confirm the selected entry is
   **Taken** on the candidate and that no empty commit was invented. For an
   increment, reuse accepted proof whose promise, boundary, implementation,
   setup, and observations still match. An unchanged-trunk fast-forward does
   not invalidate that proof. A newer-trunk rebase invalidates only proof
   the combined changes affect; reverify that behavior and reuse the rest.
   Do not treat rebase success as behavioral proof, rerun unrelated checks,
   or wait for CI.
5. Fast-forward the local target to the exact candidate. Do not merge.
6. Immediately before pushing, retain the full candidate SHA. Push that
   exact revision to the authorized remote target. After confirmed success,
   record that SHA as the published revision in the existing plan or
   conversation. Do not read a later moving `HEAD` as that publication.

A push rejection after local integration leaves the owned unpublished suffix
recoverable. Do not start implementation from an unpublished claim. Preserve
the exact refs, worktree, and index, and report them.

Setup or publication failure preserves remaining state. It is not permission
to start unclaimed queued work or to substitute Story Branch Mode publication.
