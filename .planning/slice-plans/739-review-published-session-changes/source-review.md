# Source review — SEED-418#review-published-session-changes

Launch: a fresh general-purpose subagent on 2026-11-20 with no inherited
conversation, given only the story's Goal, Scope, Key examples and
Architecture text from the seed section, told to read no project files, change
nothing and number independently observable promises. It returned the ids
below verbatim in substance.

Unnumbered context it returned:

- Architecture basis: ADR 0008 places attribution in the published repository.
- Deferred to linked stories: story-session selection, combined comparisons,
  recovery of expired reviews from Git history, and carrying the UUID in a
  follow-up message.
- The Done entry and Review changes are existing behaviour this story extends.
- In C13, the earlier Git snapshot still holding the original record is
  ordinary Git history grouped with pruning; recovery from it is deferred.
- C14 is numbered because record contents are checkable.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | When Land or Story Wrap-up closes a publishing session, one JSON session record is published in the project repository. ("When Land or Story Wrap-up closes a publishing session, publish one JSON record in the project repository." / "The workflow assembles the record from accepted publication evidence") | slice 4 |  |
| C2 | The record holds the session UUID, the workflow and the close time; each session has its own UUID so later reviews and follow-ups can refer to the same contribution. ("Record the session UUID, workflow, close time" / "A stable UUID also lets later story reviews and follow-ups refer to the same published contribution." / "A refinement and a later ad hoc story follow-up each have their own UUID") | slice 7 |  |
| C3 | When a story is associated, the record holds its identity, for refinement and ad hoc story follow-up records. ("story identity when associated" / "A refinement and a later ad hoc story follow-up each have their own UUID and the associated story identity.") | slice 7 |  |
| C4 | The record lists the commits or exact comparison ranges for the session's published work across every workflow; the UUID resolves all its publications, including earlier ones on trunk or a story branch. ("the commits or exact comparison ranges attributable to its published work. This covers refinement, execution, standalone ad hoc work, and ad hoc story follow-ups, including earlier publications on trunk or a story branch." / "At wrap-up, its UUID resolves both contributions") | slice 7 |  |
| C5 | An earlier story-branch publication still resolves after history-preserving integration and branch retirement. ("An earlier story-branch publication still resolves after history-preserving integration and branch retirement.") | slice 5 |  |
| C6 | When intervening work would make one enclosing range inaccurate, the record lists multiple ranges and the intervening change is excluded. ("Record multiple ranges when intervening work makes an enclosing range inaccurate." / "its UUID resolves both contributions while excluding the intervening change.") | slice 4 |  |
| C7 | When a shared checkout makes attribution uncertain, the record marks the affected ranges that may contain another session's work. ("Mark the affected ranges when a shared checkout makes attribution uncertain." / "its record identifies which published comparison may contain the other session's work.") | slice 6 |  |
| C8 | Retrying a close gives the same record: same UUID, original close time, same attributable comparisons. ("A retry preserves the UUID and original close time." / "Retrying a close after an interrupted response yields the same record, with its initial close time and attributable comparisons.") | slice 3 |  |
| C9 | The published comparison is built only from accepted Git evidence; local-only work and failed push attempts are excluded. ("Use accepted Git evidence so work left locally and unsuccessful push attempts stay outside the published comparison.") | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs: accepted-pair diff from second clone holds only edited.txt; local-only and remote-refused (pre-receive) cases publish no record and leave origin tip unchanged |
| C10 | On a machine with the published repository and no local launch history, the standalone Done entry offers Review changes, read through the configured project. ("The existing standalone Done entry offers Review changes on a machine with the published repository and no local launch history." / "the Dashboard reads that record through the configured project") | slice 2 |  |
| C11 | Review changes shows the session's file diff after workspace retirement and trunk advance; UUID and readable Git endpoints suffice. ("and reads the file diff even after the original workspace is retired and trunk has advanced." / "A UUID and readable Git endpoints must remain sufficient after workspace retirement.") | slice 2 |  |
| C12 | Records stay current for 30 days from close; at expiry the current review stops offering the repository-backed entry. ("Keep records current for 30 days from close. The current review stops offering the entry at expiry" / "At 30 days from close, a repository-backed entry leaves the current review.") | slice 8 |  |
| C13 | The next authorized session-record publication after expiry removes expired files from the current snapshot; the earlier snapshot still holds the record. ("the next authorized session-record publication removes expired files from the current snapshot." / "A later authorized session-record publication prunes its file, and the earlier Git snapshot still holds the original record.") | slice 8 |  |
| C14 | The published record carries no launch state, conversations, workspace paths or native session controls. ("Keep launch state, conversations, workspace paths, and native session controls on the originating machine.") | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs: full-record deepEqual holds only version, sessionId, workflow, closedAt, ranges |
