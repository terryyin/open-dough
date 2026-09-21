# Publish onto shared trunk

Use this rule for Trunk Mode work that must reach the authorized remote trunk
without publishing the execution branch. Startup uses it to publish a queue
claim. Slice delivery and story wrap-up use the same Git steps for each
verified increment, including wrap-up's before-cleanup and final-closure
commits. Do not invent a second publication sequence.

This rule does not create execution authority, wait for CI, or push the
execution branch. Observation is armed from the execution checkout against the
authorized target branch. A queue claim is published from the owned workspace
before implementation; retain its published SHA and register it after the
observer is armed. Later environment preparation does not unpublish that SHA.

## Publish a queue claim

After the owned execution workspace exists and
[Take queued work](../SKILL.md#take-queued-work) commits the Taken claim there,
publish that claim SHA with the steps below, before implementation. Do not
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

Apply [publish the candidate's preconditions](publish-the-candidate.md#preconditions).
For this caller the owned suffix is the Taken commit for a claim, or
consecutive execution commits not yet on authorized remote trunk for an
increment. The owned workspace is the execution worktree. A queue claim is
committed and published from that worktree. For a claim, the supplied
validation confirms the selected entry is **Taken** on the candidate and that
no empty commit was invented. For an increment, it reuses accepted proof whose
promise, boundary, implementation, setup, and observations still match.
[Default-checkout access and preservation](maintain-default-checkout.md)
apply only when this publication mutates that checkout. A maintenance stop
follows
[human judgment](execution-decisions.md#stop-for-human-judgment),
[delivery staging](wrap-up.md#deliver-the-change), and
[resume](../SKILL.md#continue-or-recover-at-an-execution-boundary).
It does not erase a remote acceptance the publisher has already recorded.

## Publish the candidate

Apply [Preconditions](#preconditions), then run
[publish the candidate](publish-the-candidate.md#publish-the-candidate) from
the owned workspace. A claim uses the execution workspace selected before its
commit; other publications retain theirs. Register an accepted SHA with any
bound observer only after the publisher's remote confirmation. After that
confirmation, attempt a refresh under
[Refresh eligibility](maintain-default-checkout.md#refresh-eligibility).
Report the publication acceptance and that maintenance result separately.
A deferred or stopped refresh does not erase the accepted publication and
does not authorize another push.

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
removes only this execution's clean local worktree and local execution branch,
applying
[preserve pending local work](maintain-default-checkout.md#preserve-pending-local-work)
when cleanup would mutate or discard a dirty or ambiguous checkout.

## Recover a rejected push

Before replaying a queue claim, recheck that identity's membership on the
fetched remote. Resume when retained execution context and the published
candidate's provenance agree this execution owns it, and do not push again.
A competing claim whose provenance names another execution is a recoverable
conflict: preserve this workspace and do not replay. Identical **Taken** text
is not that provenance. Ambiguous ownership keeps the conflict. When the
identity is still absent, apply
[recover a rejected push](publish-the-candidate.md#recover-a-rejected-push).
A second rejection or other persistent failure stops; preserve remaining
state and report it.

## Resolve a publication rebase conflict

Follow [publication rebase conflict](publication-rebase-conflict.md) for backlog
adapter routing of the owned-suffix rebase, ordinary conflict resolution, and
the required stop when identity or product intent remains unresolved. Fallback
domain knowledge applies only when that adapter is unavailable.

## Resume an interrupted publication

After interruption during a queue claim's publication or Trunk Mode delivery,
apply [publish the candidate's resume](publish-the-candidate.md#resume-an-interrupted-publication).
The owned suffix is a claim or an increment, using whichever execution
resources actually exist for this publication. Continue only the first
unfinished obligation that resume names. Do not duplicate the commit, push
an already-published candidate, or replace the execution worktree. The claim
uses the workspace selected before its commit, as
[Publish the candidate](#publish-the-candidate) already states for that case.
After that publication obligation is accepted, attempt
[Refresh eligibility](maintain-default-checkout.md#refresh-eligibility).
The resume classification itself still only inspects the checkout.

In that shared table, "Missing registration" is this project's CI
registration: a published SHA absent from the existing observer's coverage or
`register-push` receipt — except a Story Branch claim published to trunk
before any observer is armed there is unobserved coverage, not a missing
registration; see [Own one observer](ci-monitor.md#own-one-observer).

Workspace or environment-preparation failure after a confirmed claim
publication keeps that published SHA and reuses the claim and any verified
workspace: see [Preserve remaining state](#preserve-remaining-state) and
[execution location](execution-location.md)'s setup-failure rule. It does not
allocate a replacement claim or a nested worktree.

## Preserve remaining state

Apply [publish the candidate's preserved state](publish-the-candidate.md#preserve-remaining-state),
which defers local preservation to
[maintain the default checkout](maintain-default-checkout.md#preserve-pending-local-work).
For this caller, that state is not permission to start unclaimed queued work,
start implementation from an unpublished claim, or substitute Story Branch
Mode publication.
