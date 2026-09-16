# Publish onto shared trunk

Use this rule for Trunk Mode work that must reach the authorized remote trunk
without publishing the execution branch. Startup uses it to publish a queue
claim. Later verified increments use the same Git steps once delivery routes
here; do not invent a second publication sequence.

This rule does not create execution authority, start an observer, wait for CI,
or push the execution branch.

## Publish a queue claim

After the local Taken claim commit succeeds on the originating branch, publish
that claim with the steps below, then create the local execution
branch/worktree from the published revision. Do not start implementation from
an unpublished claim. An unavailable destination or failed publication leaves
the exact remaining state and does not authorize starting unclaimed queued
work.

## Preconditions

Resolve source, mode, target branch, authorized remote, and the owned
unpublished suffix before mutating the shared integration checkout. For a
queue claim, that suffix is the Taken commit only.

Acquire an exclusive integration turn through available coordinator context
before changing the shared integration checkout. A clean working directory
alone is not ownership. If another writer cannot be coordinated, stop without
altering its work. Do not treat Git lock files as a transaction lock.

Known unrelated local commits on the target, dirty or ambiguous target state,
or unknown ownership stop this path. Do not silently publish those commits.

## Publish the candidate

Keep the same execution worktree throughout. Rebase only owned unpublished
execution work; never rewrite published trunk history or another writer's
commits. No force push.

1. Fetch the authorized remote for the target branch.
2. Reconcile the fetched target with the local integration checkout. If the
   local target has unpublished commits that are not this execution's owned
   suffix, or ownership is ambiguous, stop and preserve that state.
3. Rebase only the owned unpublished suffix onto the current remote trunk.
   For a claim, that is the Taken commit. Update the execution branch to the
   rewritten candidate when a worktree already exists; otherwise keep the
   candidate on the integration checkout until workspace setup uses it.
4. Validate the candidate. For a claim, confirm the selected entry is
   **Taken** on the candidate and that no empty commit was invented. Do not
   treat rebase success as behavioral proof of later product changes.
5. Fast-forward the local target to the exact candidate. Do not merge.
6. Immediately before pushing, retain the full candidate SHA. Push that
   exact revision to the authorized remote target. After confirmed success,
   record that SHA as the published revision in the existing plan or
   conversation. Do not read a later moving `HEAD` as that publication.

A push rejection after local integration leaves the owned unpublished suffix
recoverable. Do not start implementation from an unpublished claim. Further
reconciliation of a rejected increment is not specified here; preserve the
exact refs, worktree, and index, and report them.

Setup or publication failure preserves remaining state. It is not permission
to start unclaimed queued work or to substitute Story Branch Mode publication.
