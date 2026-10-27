# Dashboard repository state

Part of the [project visibility requirements](project-visibility-requirements.md).
Their discussion status, scope, and source apply to this page.

## Repository-backed project state

Most project state must remain in the project's Git repository and be published
to origin to become visible remotely. Access to that published Git state should
be sufficient for the dashboard to recover most of the project's recorded
status, even without access to a developer's local clone or temporary runtime
data.

The state available from the repository should include:

- Which stories are in the product backlog.
- Which stories are Taken.
- Whether a story has been refined or slice planned.
- The execution mode recorded for each active story.
- The developer name assigned to each Taken story, and to each queued story
  being prepared.
- The origin branch carrying a Taken story's execution in Story Branch Mode.
- Which slices have been completed.

These facts must not depend on temporary files, an active agent session, or
retained conversation context. The dashboard should observe the project's
records rather than require the project to keep its durable workflow state
only inside the dashboard.

### Story states

Terry anticipates needing explicit story states for visualization, despite a
preference to avoid additional state-management overhead. Stories can exist
outside the product backlog; membership in the backlog is itself a meaningful
state, not a condition that defines whether a story exists.

The view should be able to distinguish backlog membership, Taken work, and
whether refinement and slice planning have occurred. The exact vocabulary,
transitions, and storage remain open. These facts need not form a single linear
sequence: this document does not decide whether to represent them as one state
or several attributes, or require every story to pass through slice planning.
Prefer deriving facts from authoritative repository records where sufficient;
decide what additional explicit metadata is needed through concrete dashboard
stories.

### Blocking story dependencies

A blocking dependency is recorded in the dependent story's canonical home,
separately from preparation: supplier identity and link, required implementation,
reason for sequencing, completion condition, and waiting, satisfied, or
decision-needed state. Resolution evidence names a recoverable supplier revision
and canonical path, the accepted integration revision, and the verification or
remaining question. Shared code alone does not justify a blocking wait.
The condition names the supplier outcome needed before the consumer can start;
the consumer's own implementation belongs to its scope and acceptance examples.

An unresolved dependency prevents new execution from starting. Loading,
unreadable, or malformed dependency facts also prevent a new start. The actual
start command checks current facts before creating a workspace or publishing a
Take; an already accepted execution can continue. Refinement and inspection
remain available. Satisfying every dependency removes this block without
changing preparation judgments or other execution requirements.

The dependency agreement is the only record of a prerequisite; it is not a
readiness reason, so a preparing agent records Ready for a story that waits only
on its suppliers. Start eligibility is derived from the recorded readiness
assessment and the dependency facts, never stored: a story is eligible when its
assessment is Ready and no dependency is unsatisfied, and otherwise it is
blocked by the assessment, each unsatisfied dependency, or unreadable facts.
The dashboard, `read-state`, and the start command answer from this one
derivation and name the same blockers. Becoming eligible grants no execution
permission. The readiness basis covers each agreement's supplier,
implementation, rationale, and condition, but not its state, resolution
evidence, or decision, so editing an agreement reports "Changed since readiness
review" while a supplier's resolution does not.

The supplying story's landing or wrap-up discovers current consumers and judges
each condition against the completed, accepted outcome. It may reconcile bounded
story or plan assumptions whose answer is settled by the consumer's existing
intent. Unspecified choices remain decision-needed with the actual developer
question. An agreement that includes the consumer's own implementation is
corrected within its established intent or explicit developer direction before
judging the supplier prerequisite; that correction grants no consumer execution
authority and claims no consumer implementation. Unfulfilled supplier conditions
stay waiting. Source disappearance, an increment, or queue removal never
proves fulfillment. After satisfying a condition, the agent rereads the
consumer's Not ready reasons and, by judgment, records a fresh assessment
without any reason that only restated that condition, keeping every other
reason. The [supplier resolution procedure](../src/skills/dough-product-backlog/references/supplier-dependencies.md)
owns discovery, evidence, guarded writes, and publication.

Only the dependent card exposes its dependencies; the
[dashboard documentation](../dashboard/README.md#blocking-story-dependencies)
describes presentation. Informational dependencies that allow parallel execution
and close multi-agent collaboration remain future scope.

### Recently finished stories

A recently finished story is a published record of its own, beside the agent
profiles. Completing a backlog entry through `product-backlog complete` writes
one JSON done record under `.planning/done/` beside the backlog, in the same
change that removes the entry and releases its execution profile, so
committing the closure publishes it. The file name comes from the identity
alone, with `#` read as `_` (`SEED-107_recently-done.json`), so completing the
same identity again replaces its record. Work dropped rather than finished is
removed with `complete --dropped`, which leaves the done records to finished
work. The record keeps only facts that outlive wrap-up cleanup: the identity and
title, the UTC completion time, the developer configured in that workspace's
Git, and, when the work had an execution profile, its agent, host tool, and
model. It links to no seed or plan, so wrap-up still deletes the spent
history. The same `complete` run removes records completed more than 30 days
before; a published record older than that is not recent work. The backlog
scripts own the format and the window, and the dashboard reads the records at
the revision it reads the backlog and profiles. That read is a later detail,
like owners' humans and slice clocks. Owners, preparation, and progress never
wait for it. If it is still unanswered at the read's wait bound, or it fails,
the column says done stories could not be read and still lists the sessions.
A record the shared format rejects is listed by file name with its problem,
beside the readable ones. A few records are read at once, and each text is
kept under its Git blob, so a later revision rereads only new or changed
records.

Git history was explored first and does not identify completions within a
bounded read: closure commits share no subject convention, profile deletions
also come from preparation releases, and the backlog sees over a thousand
commits a month. Separate files, rather than a completion section in the
backlog, let parallel closures integrate without merge adapters.

### Taken-item information

The backlog needs enough information on each Taken item to identify its owner
and interpret its execution:

| Information | Requirement |
| --- | --- |
| Developer name | Record which named agent has taken the story. |
| Execution mode | Distinguish Story Branch Mode from Trunk Mode. |
| Origin execution branch | For Story Branch Mode, identify the story's branch on origin so a repository reader can locate its published progress. Trunk Mode does not require this story-branch field. |

Here, origin execution branch means the branch carrying the story's work, not
the base branch from which it was created. Local worktree paths and local branch
details should be derived from dynamic machine information when available,
rather than required as durable backlog fields for the repository-only view.

The Taken entry format itself carries none of these fields. They live in the
owning agent's [profile](dashboard-agent-assignments.md#agent-profiles-and-rotating-names),
which refers to the work by identity.
