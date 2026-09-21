# Publish the candidate

Reusable remote-publication mechanics for one owned unpublished suffix onto a
shared authorized target: fetch, reconcile in the owned workspace, rebase only
that suffix, validate, push that exact candidate, and recover a rejected push.
Local default-checkout access, preservation, and refresh are owned by
[maintain the default checkout](maintain-default-checkout.md). Remote
acceptance does not require that checkout to move, and a later maintenance
result does not erase an accepted publication.

A calling procedure supplies the owned workspace, the owned unpublished
suffix, the authorized remote target, and how it registers or validates the
pushed result. Nothing below requires execution's mode selection, Taken-claim
semantics, or CI-observer policy. [Trunk publication](trunk-publication.md) is
`dough-execute-plan`'s caller for claims and increments: it names the suffix
and workspace, then uses the sequence below.

## Preconditions

Resolve the owned workspace, the authorized remote target, and the owned
unpublished suffix. The suffix is that workspace's commits not yet on the
authorized remote target: the Taken commit when a claim still lives only on
the integration checkout, or the caller's consecutive unpublished commits
when a separate workspace already holds them. Its parent is the previously
published base when this caller has recorded one. Rewrite only that suffix.
Never rewrite published revisions or another writer's commits, force-push, or
publish a branch other than the authorized target.

The owned workspace is where the suffix is reconciled and from where it is
pushed. A preparation keep uses the preparation workspace. An increment that
already has an execution worktree uses that worktree. A queue claim committed
on the integration checkout before a separate workspace exists uses that
checkout.

A pending human edit on the default checkout does not block publication from
a different owned workspace. Do not stage, unstage, reset, stash, or otherwise
change that edit in order to publish. Before mutating the default checkout —
only when the owned workspace is that checkout, or when a maintenance step
actually refreshes it — apply
[establish access before local mutation](maintain-default-checkout.md#establish-access-before-local-mutation)
and
[preserve pending local work](maintain-default-checkout.md#preserve-pending-local-work).
Those checks do not gate a remote push from a separate owned workspace. A
maintenance stop does not register a publication the remote has not accepted,
and does not undo one it has.

## Publish the candidate

Apply [Preconditions](#preconditions) before this sequence.

1. Fetch the authorized remote for the target branch from the owned workspace.
2. Reconcile in that workspace from the fetched remote target, not from the
   default checkout's tip. Push the caller's candidate SHA later, never the
   default checkout's branch tip, so unrelated commits and a pending human
   edit there stay unpublished. Leave that checkout's commits, index, and
   working tree untouched when the owned workspace is separate. When the
   caller cannot name a unique suffix, stop under
   [preserve pending local work](maintain-default-checkout.md#preserve-pending-local-work)
   instead of guessing which commit to publish.
3. When fetched trunk is still the previously published base, leave the suffix
   unchanged. When trunk advanced, rebase only that suffix onto fetched trunk
   in the owned workspace. The range is commits after the previously published
   base on the owned branch:
   `git -C <owned-workspace> rebase --onto <fetched-remote-trunk> <previously-published-base> <owned-branch>`.
   When that replay touches the product backlog, run the same range through
   the installed rebase adapter instead of that raw `git rebase`:
   `product-backlog-git-rebase.mjs rebase --onto <fetched-remote-trunk> --ref <previously-published-base> --branch <owned-branch> --cwd <owned-workspace>`,
   following
   [publication rebase conflicts](publication-rebase-conflict.md). After a
   rewrite, the pre-rebase SHA is not the candidate. A conflict, refusal, or
   disputed adapter result stops before the push and preserves the state Git
   left. Do not rebase the default checkout's branch unless it is the owned
   branch.
4. Validate the candidate using the check the caller supplied for this
   suffix. An unchanged base does not invalidate accepted proof. A rebase
   onto newer trunk invalidates only proof the combined changes affect;
   reverify that behavior and reuse the rest. Do not treat rebase success
   as behavioral proof, rerun unrelated checks, or wait for CI.
5. Immediately before pushing, retain the full candidate SHA and the base
   the owned suffix extends. When this candidate has not been rewritten,
   that base is the previously published base. When step 3 replayed the
   suffix, that base is the fetched trunk it was replayed onto, not the
   older revision and not the candidate tip. Push that exact candidate
   from the owned workspace:
   `git -C <owned-workspace> push <remote> <candidate>:<target-branch>`.
   Do not fast-forward the default checkout, force-push, or move that
   checkout's branch with `merge`, `update-ref`, or `branch -f`.
6. After the push, fetch again and confirm the authorized remote contains
   that exact candidate. That confirmation is publication acceptance. Do
   not require the default checkout's `HEAD`, index, or working tree to
   match. When this caller keeps published revisions, append that SHA; do
   not add a pre-rebase SHA or treat a later moving `HEAD` as the
   publication. When an observer is already bound, register that SHA.
   Registration failure is lost coverage: report it and do not claim the
   revision was observed. Do not wait for CI. Then record the separate
   [maintenance outcome](maintain-default-checkout.md#independent-maintenance-outcome)
   by inspecting the default checkout and not refreshing it in this
   sequence. A deferred or unfinished maintenance result is not an
   unfinished publication.

## Recover a rejected push

A non-fast-forward rejection leaves the owned suffix unpublished. Retain the
rejected candidate SHA and the base that suffix extends, the base retained
in step 5. After a rewrite, that base is the fetched trunk the suffix was
replayed onto. Do not use the rejected tip as the cutoff: that range is
empty and drops the suffix. Do not use an older published revision the
rewritten suffix no longer extends directly: that range includes another
writer's commits. Recheck
[Preconditions](#preconditions). If the owned workspace is the default
checkout, recheck
[default-checkout access and preservation](maintain-default-checkout.md)
before rebasing that checkout. A separate owned workspace does not wait on
that checkout. When the applicable checks hold, reconcile only the suffix and
retry one ordinary push:

1. Fetch the authorized remote. Current trunk is the fetched remote target.
2. In the owned workspace, replay the same owned-suffix range as
   [candidate step 3](#publish-the-candidate), using the base retained in
   step 5 as the cutoff: only commits after that base, onto fetched trunk.
   When the suffix touches the product backlog, that is the adapter
   invocation, not a raw `git rebase`. Do not rebase from the rejected
   candidate, and do not rebase the default checkout unless it is the owned
   branch. Either mistake can drop the suffix or rewrite another writer's
   commits. A conflict, refusal, or disputed adapter result stops here.
   Preserve the refs, worktree, and index Git left, report that result, and
   do not push.
3. The rewritten owned-branch tip is the candidate. The rejected SHA is not.
   Do not move the default checkout onto it.
4. Revalidate as in candidate step 4. The rebase invalidates only proof the
   combined changes affect. A failed recheck stops before the retry push and
   preserves the rewritten candidate.
5. Push the rewritten candidate once, as in candidate step 5. After confirmed
   remote acceptance, record that SHA and the separate maintenance outcome as
   in candidate step 6.

A second rejection or other persistent failure stops. Preserve the rewritten
candidate and the remote as they are. Report the persistent contention. Do
not rebase or push again.

## Resume an interrupted publication

After an interruption, classify the owned suffix from actual refs and retained
rewritten identities. Fetch the authorized remote before treating a push as
unfinished. Continue only the first unfinished obligation. Do not duplicate
the commit, push an already-published candidate, or replace the caller's
workspace. A pending human edit on the default checkout does not change this
classification and is not destroyed while resuming.

| Boundary | Actual state | Continue with |
| --- | --- | --- |
| Not on the remote | The owned workspace has the suffix, and fetched remote history does not contain that candidate. | [Publish the candidate](#publish-the-candidate) from step 1. Do not commit again, and do not fast-forward the default checkout first. |
| Candidate only on the default checkout | That checkout's target tip is the owned candidate, and the remote does not contain it. This is the claim that was committed there before a separate workspace existed. | Push that exact SHA ([Publish the candidate](#publish-the-candidate) step 5). Do not rebase or commit again unless a newer remote requires [rejected-push recovery](#recover-a-rejected-push). Preserve any pending human edit; the SHA push does not include it. |
| Already published | Fetched remote history contains the candidate, or the retained rewritten SHA that replaced it. | Append that SHA to retained published revisions if identity omitted it. Do not push again. Record default-checkout maintenance separately; it may still be deferred. |
| Missing registration | Fetched remote history contains the published SHA; an observer already bound to this caller does not yet reflect it. A caller that binds no observer has nothing to register. | Register that SHA with the existing observer. Do not push, and do not start a replacement observer. |

A lost or unknown push response is not unpublished. If the exact candidate is
already an ancestor of fetched remote history, treat it as already published,
including when another authorized session published it.

If the owned workspace, target, or candidate SHA is missing, contradictory, or
matches no unique owned suffix, preserve every existing worktree, branch, and
index under
[preserve pending local work](maintain-default-checkout.md#preserve-pending-local-work).
Report the gap. Do not create a replacement worktree, switch branches, or
guess which commit to publish.

## Preserve remaining state

Setup or publication failure preserves remaining state exactly as found:
existing worktrees, branches, commits, and index content stay untouched under
[preserve pending local work](maintain-default-checkout.md#preserve-pending-local-work).
An accepted remote candidate stays accepted. Preserved state is not permission
to start unauthorized work, continue from an unpublished result, or substitute
a different destination than the one already recorded for this caller.
