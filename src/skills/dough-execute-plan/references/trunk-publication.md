# Publish onto shared trunk

Use this rule for Trunk Mode work that must reach the authorized remote trunk
without publishing the execution branch. Startup uses it to publish a queue
claim. Slice delivery and story wrap-up use the same Git steps for each
verified increment, including wrap-up's before-cleanup and final-closure
commits. Do not invent a second publication sequence.

This rule does not create execution authority, wait for CI, or push the
execution branch. Observation is armed from the execution checkout against the
authorized target branch. A queue claim may be published before that workspace
exists; retain its published SHA and register it after the observer is armed.

## Publish a queue claim

After [Take queued work](../SKILL.md#take-queued-work) commits the local Taken
claim on the resolved integration branch, publish it with the steps below, then
create the local execution branch/worktree from the published revision. Do not
start implementation from an unpublished claim. An unavailable destination or
failed publication leaves the exact remaining state and does not authorize
starting unclaimed queued work. CI coverage for this claim, including a Story
Branch claim's unobserved trunk target, follows
[Own one observer](ci-monitor.md#own-one-observer).

## Publish a verified increment

After wrap-up proof, refactor, format, and commit succeed, publish the owned
unpublished increment through [Publish the candidate](#publish-the-candidate).
Keep the same execution worktree for planned, quick, and contextual work.

## Preconditions

Resolve source, mode, target branch, authorized remote, and the owned unpublished
suffix. The suffix is the Taken commit for a claim, or consecutive execution
commits not yet on authorized remote trunk for an increment. Its parent is the
previously published base: the last recorded published revision when this
execution has one. Rewrite only that suffix; never rewrite published revisions
or another writer's commits, force-push, or push the execution branch.

Before mutating the shared integration checkout, acquire an exclusive integration
turn through available coordinator context and inspect the target. These checks
do not gate execution-checkout commits, proof, or formatting. A clean directory
or Git lock file does not establish exclusivity; coordinate with a declared owner
or stop. Do not invent a merge queue, lock, or extra claim.

Unknown ownership, dirty or ambiguous target state, or unrelated unpublished
local commits stop publication without target mutation. Preserve exact refs,
worktrees, index, and staged/unstaged content; do not stash, reset, unstage,
revert, or silently publish unrelated work.
Keep the owned suffix recoverable on the execution branch, or the local Taken
commit before workspace creation. Report the competing writer or inspectable
state and do not register publication or continue as delivered. Apply this same
stop after a rejected push; do not undo its locally integrated suffix.
Ownership uncertainty follows [human judgment](execution-decisions.md#stop-for-human-judgment),
[delivery staging](wrap-up.md#deliver-the-change), and
[resume](../SKILL.md#continue-or-recover-at-an-execution-boundary).

## Publish the candidate

Apply [Preconditions](#preconditions) before this sequence. A claim may have no
execution worktree yet; other publications retain theirs.

1. Fetch the authorized remote for the target branch.
2. Reconcile from the fetched remote target, not a stale local target tip.
   A local target that is only behind the remote is usable; unrelated
   unpublished commits or ambiguous ownership stop under Preconditions.
3. When fetched trunk is still the previously published base, leave the suffix
   unchanged. When trunk advanced, rebase only that suffix onto it, following
   the [backlog adapter routing](#resolve-a-publication-rebase-conflict) below
   whenever it touches the product backlog. After a rewrite, replace the
   unpublished candidate SHA; the pre-rebase SHA is not the increment. Update
   the execution branch to the rewritten candidate when a worktree already
   exists; otherwise keep the candidate on the integration checkout until
   workspace setup uses it. A rebase conflict uses
   [publication rebase conflicts](#resolve-a-publication-rebase-conflict)
   before continuing Git.
4. Validate the candidate. For a claim, confirm the selected entry is
   **Taken** on the candidate and that no empty commit was invented. For an
   increment, reuse accepted proof whose promise, boundary, implementation,
   setup, and observations still match. An unchanged-trunk fast-forward does
   not invalidate that proof. A newer-trunk rebase invalidates only proof
   the combined changes affect; reverify that behavior and reuse the rest.
   Do not treat rebase success as behavioral proof, rerun unrelated checks,
   or wait for CI.
5. Fast-forward the local target to the exact candidate by running
   `git -C <integration-checkout> merge --ff-only <candidate>` on the
   integration checkout named in [execution location](execution-location.md),
   not on the execution checkout. Do not substitute a same-command SHA push
   from the execution worktree (for example `git push origin <candidate>:main`),
   `git update-ref`, or `git branch -f` on that branch: none of these move the
   integration checkout's `HEAD` or working tree, so it would still report a
   stale `main` after the remote moved. Do not merge with any strategy other
   than `--ff-only`.
6. Immediately before pushing, retain the full candidate SHA and the
   previously published base. Push that exact candidate from the integration
   checkout to the authorized remote target, then fetch again on that
   checkout to refresh its view of the target. After confirmed success,
   append that SHA to this execution's retained published revisions in the
   existing plan or conversation. Do not drop earlier published SHAs of this
   execution, add a pre-rebase unpublished SHA, or treat a later moving
   `HEAD` as that publication. When an observer is already bound to the
   execution checkout, register that SHA with it. Registration failure is
   lost coverage: report it and do not claim the revision was observed. Do
   not wait for CI. Do not report or register success until local `main`,
   the freshly fetched remote, and the retained SHA all agree on the
   candidate SHA and `main...origin/main` is `0	0` on the integration
   checkout. When an execution branch already exists for this publication —
   always for an increment, and for a claim published after workspace
   setup — it must also agree on that same candidate SHA. A mismatch among
   the identities that apply to this publication is an unfinished
   publication, not a completed one.

## Publish wrap-up closure

Story wrap-up treats each owned wrap-up commit on the execution checkout as a
verified increment. Publish it immediately through [the common sequence](#publish-the-candidate)
before the next wrap-up mutation that depends on its recovery from shared trunk.
Do not merge the execution branch.

Resolve observation ownership before the first wrap-up publication: recover
the execution's observer when it still exists; if execution already stopped
it, arm one observer from the same execution checkout against the authorized
target using [CI observation](ci-monitor.md). Register each confirmed
published SHA with that observer. After the last wrap-up publication this
invocation will perform, stop only that observer through the host adapter,
report the exact published closure SHAs and remaining coverage, and do not
wait. An unavailable bridge or registration failure is lost coverage: report
it and continue.

A publication stop leaves the commit recoverable on the execution branch.
Do not delete spent history, remove resources, or claim closure. After the
final-closure publication and wrap-up observer shutdown succeed, wrap-up
removes only this execution's clean local worktree and local execution branch.

## Recover a rejected push

A non-fast-forward rejection leaves the local target's owned suffix unpublished.
Retain the rejected candidate SHA and previously published base, and recheck
[Preconditions](#preconditions), including the exclusive turn. If they hold,
reconcile only that suffix and retry one ordinary push:

1. Fetch the authorized remote for the target branch. Current trunk is
   the fetched remote target.
2. On the integration checkout, replay only commits after the previously
   published base onto that fetched trunk:
   `git rebase --onto <fetched-remote-trunk> <previously-published-base> <target-branch>`.
   Do not rebase from the rejected candidate; that would drop the suffix
   or rewrite another writer's commits.
3. Replace the unpublished candidate SHA with the rewritten target tip;
   the rejected SHA is not the increment. When an execution worktree
   exists and that branch has no remaining commits beyond the rejected
   candidate, move it with
   `git rebase --onto <target-branch> <rejected-candidate> <execution-branch>`.
   That second rebase is not permission to drop additional unfinished
   work. Update retained identity to the rewritten candidate.
   A conflict on either rebase uses
   [publication rebase conflicts](#resolve-a-publication-rebase-conflict).
4. Revalidate as in candidate step 4. The post-rejection rebase
   invalidates only proof the combined changes affect.
5. Push the rewritten candidate once with an ordinary push. After
   confirmed success, record that SHA as in candidate step 6.

A second rejection or other persistent failure stops. Preserve remaining
state and report it. Do not loop.

## Resolve a publication rebase conflict

Follow [publication rebase conflict](publication-rebase-conflict.md) for backlog
adapter routing, fallback domain knowledge for the two `--onto` rebases, ordinary
conflict resolution, and the required stop when identity or product intent
remains unresolved.

## Resume an interrupted publication

After interruption during a queue claim's publication or Trunk Mode delivery,
classify the owned suffix — a claim or an increment — from actual refs,
retained rewritten identities, and observer receipts, using whichever
execution resources actually exist for this publication: a claim may have no
execution branch/worktree yet, as [Publish the candidate](#publish-the-candidate)
already states for that case. Continue the
first unfinished obligation. Do not duplicate the commit, push an
already-published candidate, or replace the execution worktree. Verify
identity first as in
[execution location](execution-location.md). Fetch the authorized remote
before treating a push as unfinished.

Match the owned suffix to the retained rewritten candidate when that SHA
exists. A pre-rebase SHA that is no longer the tip is not a second claim or
increment.

| Boundary | Actual state | Continue with |
| --- | --- | --- |
| Only committed | Execution branch has the owned suffix; neither local target nor fetched remote trunk contains that candidate. A claim before any workspace exists has no execution branch separate from local target, so it cannot be in this row's state; see "Integrated locally" for that case instead. | [Publish a verified increment](#publish-a-verified-increment) from its preconditions. Do not commit again. |
| Integrated locally | Local target tip is the owned candidate; fetched remote trunk does not contain it. A claim before any workspace exists is in this state as soon as it is committed, since [Take queued work](../SKILL.md#take-queued-work) commits it directly on local target rather than on a separate execution branch. | Exclusive-turn checks, then candidate push (step 6). Do not rebase or commit again unless a newer remote requires [rejected-push recovery](#recover-a-rejected-push). |
| Already published | Fetched remote trunk contains the candidate, or the retained rewritten SHA that replaced it (see the ancestor and owner-published notes below) | Append that SHA to retained published revisions if identity omitted it. Do not push again. |
| Missing CI registration | Remote trunk contains the published SHA; the existing observer's coverage or `register-push` receipt does not. This row assumes an observer already covers that target; a Story Branch claim published to trunk before any observer is armed there is unobserved coverage, not a missing registration — see [Own one observer](ci-monitor.md#own-one-observer). | Register that SHA with the existing observer. Do not push, and do not start a replacement observer. |

A lost or unknown push response is not unpublished. If the exact candidate is
already an ancestor of fetched remote trunk, treat it as already published,
including when a different authorized owner's own session is the one that
published it.

If mode, integration checkout, target branch, or candidate SHA is missing,
contradictory, or matches no unique owned suffix, preserve every existing
worktree, branch, and index. Report the gap. Do not create a replacement
worktree, switch branches, or guess which commit to publish. For a claim
before any workspace exists, a not-yet-created execution branch/worktree is
expected and is not itself a missing-identity gap.

Workspace-setup failure after a confirmed claim publication reuses that claim
and any verified workspace: see [Preserve remaining state](#preserve-remaining-state)
and [execution location](execution-location.md)'s setup-failure rule. It does
not allocate a replacement claim or a nested worktree.

## Preserve remaining state

Setup or publication failure preserves remaining state. It is not permission
to start unclaimed queued work, start implementation from an unpublished
claim, or substitute Story Branch Mode publication.
