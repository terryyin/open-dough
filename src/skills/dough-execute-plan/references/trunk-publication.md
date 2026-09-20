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
starting unclaimed queued work.

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
   the freshly fetched remote, the retained SHA, and the execution branch
   all agree on the candidate SHA and `main...origin/main` is `0	0` on the
   integration checkout; a mismatch among those four identities is an
   unfinished publication, not a completed one.

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

A conflict while rebasing the owned unpublished suffix is not permission to
take `--ours` or `--theirs`, skip the commit, or continue Git blindly.

The ordinary rebase in [Publish the candidate](#publish-the-candidate) step 3 is run through this project's
installed product backlog rebase adapter, not a raw `git rebase`, whenever it touches the product backlog
(often `PRODUCT-BACKLOG.md`); see [reconcile product backlog Git operations](../../dough-product-backlog/references/merge-conflicts.md)
for how to resolve and run it. Its own `conflict`/`refused`/`blocked` result already identifies the real
replayed commit, its parent, and the current destination from Git's own rebase state, never from
ours/theirs labels. Resolve the backlog's own unmerged path following that reference, `git add` it, then
run the adapter's own `continue` for this same rebase — never a raw `git rebase --continue`. A clean
replay the adapter reports as `disputed` is not a Git conflict and has nothing staged to resolve the usual
way: repair the backlog by hand, or decide the current result should stand as is, then run the adapter's
own `validate` before this section's own revalidation below and before publishing. If neither the adapter
nor that reference is available, preserve the conflict and report the missing guidance.

[Recover a rejected push](#recover-a-rejected-push)'s two `--onto` rebases are not run through this
adapter: its CLI has no equivalent for rebasing a range other than the currently checked-out branch onto a
ref. Until that gap is closed, resolve a conflict touching the backlog on either of those two rebases with
[the fallback domain knowledge](../../dough-product-backlog/references/merge-conflicts.md#fallback-domain-knowledge)
instead, applied by hand exactly as below.

For other product or code paths, read the three Git versions (ancestor,
current side, and incoming side; index stages 1, 2, and 3). Identify the
fetched trunk versus the unpublished suffix from the actual commits; Git's
ours/theirs labels during rebase do not name intent. Compare each side with
the ancestor and retain a brief account of what each contributor changed.

When both sides' intent is understood and compatible, combine those changes.
Apply identical edits once. An unchanged region does not override the other
side. Do not choose an entire side. Continue the rebase only after the
combined working tree matches that account, then revalidate as in candidate
step 4: the combined change invalidates only the affected proof. Rebase
success is not behavioral proof. Do not publish until that recheck succeeds.

If identity, incompatible product intent, or a competing restriction remains
unresolved, preserve the exact refs, worktree, and index, including conflict
markers. Do not discard either side. Stop publication and report the specific
missing decision:

- Unclear value, domain meaning, architecture, or ambiguity that could
  waste a commit uses
  [human judgment](execution-decisions.md#stop-for-human-judgment).
- A change that would drop or weaken a required rejection or other
  contractual product constraint uses
  [a disputed plan restriction](execution-decisions.md#resolve-a-disputed-plan-restriction).

Do not register publication or continue as delivered. After a human
decision, resume from the preserved conflict state rather than inventing a
side.

## Resume an interrupted publication

After interruption during Trunk Mode delivery, classify the owned increment
from actual refs, retained rewritten identities, and observer receipts.
Continue the first unfinished obligation. Do not duplicate the commit, push
an already-published candidate, or replace the execution worktree. Verify
identity first as in
[execution location](execution-location.md). Fetch the authorized remote
before treating a push as unfinished.

Match the owned suffix to the retained rewritten candidate when that SHA
exists. A pre-rebase SHA that is no longer the tip is not a second increment.

| Boundary | Actual state | Continue with |
| --- | --- | --- |
| Only committed | Execution branch has the owned suffix; neither local target nor fetched remote trunk contains that candidate | [Publish a verified increment](#publish-a-verified-increment) from its preconditions. Do not commit again. |
| Integrated locally | Local target tip is the owned candidate; fetched remote trunk does not contain it | Exclusive-turn checks, then candidate push (step 6). Do not rebase or commit again unless a newer remote requires [rejected-push recovery](#recover-a-rejected-push). |
| Already published | Fetched remote trunk contains the candidate, or the retained rewritten SHA that replaced it | Append that SHA to retained published revisions if identity omitted it. Do not push again. |
| Missing CI registration | Remote trunk contains the published SHA; the existing observer's coverage or `register-push` receipt does not | Register that SHA with the existing observer. Do not push, and do not start a replacement observer. |

A lost or unknown push response is not unpublished. If the exact candidate is
already an ancestor of fetched remote trunk, treat it as already published.

If mode, checkout, branch, or candidate SHA is missing, contradictory, or
matches no unique owned suffix, preserve every existing worktree, branch, and
index. Report the gap. Do not create a replacement worktree, switch branches,
or guess which commit to publish.

## Preserve remaining state

Setup or publication failure preserves remaining state. It is not permission
to start unclaimed queued work, start implementation from an unpublished
claim, or substitute Story Branch Mode publication.
