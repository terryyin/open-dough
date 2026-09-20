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

Apply [publish the candidate's preconditions](publish-the-candidate.md#preconditions):
resolve source, mode, target branch, authorized remote, and the owned
unpublished suffix — the Taken commit for a claim, or consecutive execution
commits not yet on authorized remote trunk for an increment — then acquire an
exclusive integration turn and inspect the target before mutating the shared
integration checkout. Unknown ownership, dirty or ambiguous target state, or
unrelated unpublished local commits stop publication without target mutation,
following [human judgment](execution-decisions.md#stop-for-human-judgment),
[delivery staging](wrap-up.md#deliver-the-change), and
[resume](../SKILL.md#continue-or-recover-at-an-execution-boundary).

## Publish the candidate

Apply [Preconditions](#preconditions), then run
[publish the candidate](publish-the-candidate.md#publish-the-candidate): fetch
the authorized remote, reconcile from it, rebase only the owned suffix when
trunk advanced (following
[backlog adapter routing](#resolve-a-publication-rebase-conflict) whenever it
touches the product backlog), validate the candidate, fast-forward the
integration checkout named in [execution location](execution-location.md)
with `git -C <integration-checkout> merge --ff-only <candidate>`, and push the
exact candidate before registering it with any bound observer. A claim may
have no execution worktree yet; other publications retain theirs.

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

Apply [recover a rejected push](publish-the-candidate.md#recover-a-rejected-push):
retain the rejected candidate SHA and previously published base, recheck
[Preconditions](#preconditions) including the exclusive turn, and — if they
hold — reconcile only the owned suffix onto freshly fetched trunk (replaying
only commits after the previously published base, never from the rejected
candidate) and retry one ordinary push, moving the execution branch and
revalidating as in candidate step 4 before that retry. A second rejection or
other persistent failure stops; preserve remaining state and report it. Do
not loop.

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
| Integrated locally | Local target tip is the owned candidate; fetched remote trunk does not contain it. A claim before any workspace exists is in this state as soon as it is committed, since [Take queued work](../SKILL.md#take-queued-work) commits it directly on local target rather than on a separate execution branch. | Exclusive-turn checks, then candidate push ([publish the candidate](publish-the-candidate.md#publish-the-candidate) step 6). Do not rebase or commit again unless a newer remote requires [rejected-push recovery](#recover-a-rejected-push). |
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
