# Publish the candidate

Reusable Git mechanics for publishing one owned unpublished suffix onto a
shared authorized target: fetch, reconcile, rebase only that suffix, validate,
fast-forward the integration checkout, push the exact candidate, and recover a
rejected push. A calling procedure supplies the owned unpublished suffix's own
definition, its integration checkout, its authorized remote target, and how it
registers or validates the pushed result; nothing below requires execution's
mode selection, Taken-claim semantics, or CI-observer policy to make sense on
its own. [Trunk publication](trunk-publication.md) is `dough-execute-plan`'s
own caller: its claim/increment/CI-observer policy names the owned suffix and
calls the sequence below, and its own headings link into this file's matching
sections so every existing inbound link keeps working.

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
   [backlog adapter routing](trunk-publication.md#resolve-a-publication-rebase-conflict)
   whenever it touches the product backlog. After a rewrite, replace the
   unpublished candidate SHA; the pre-rebase SHA is not the increment. Update
   the execution branch to the rewritten candidate when a worktree already
   exists; otherwise keep the candidate on the integration checkout until
   workspace setup uses it. A rebase conflict uses
   [publication rebase conflicts](trunk-publication.md#resolve-a-publication-rebase-conflict)
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
   [publication rebase conflicts](trunk-publication.md#resolve-a-publication-rebase-conflict).
4. Revalidate as in candidate step 4. The post-rejection rebase
   invalidates only proof the combined changes affect.
5. Push the rewritten candidate once with an ordinary push. After
   confirmed success, record that SHA as in candidate step 6.

A second rejection or other persistent failure stops. Preserve remaining
state and report it. Do not loop.
