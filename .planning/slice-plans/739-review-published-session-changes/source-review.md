# Source review — SEED-418#review-published-session-changes (narrowed)

Launch: a fresh general-purpose subagent on 2026-11-21 with no inherited
conversation. It received only the narrowed story's Goal, Scope, Key examples
and Architecture text after the authorized 2026-11-21 resplit. It was told to
read no project files, change nothing and number independently observable
promises. It replaces the pre-split review, which now sits beside plan 744 as
provisional input.

Unnumbered context returned:

- Deferred to "Attribute every workflow session's published changes": other
  workflow closes and earlier publications, multiple ranges, shared-checkout
  uncertainty, close retry, story association, 30-day lifetime.
- Deferred to linked stories: story-session selection, combined comparisons,
  recovery of expired reviews from Git history, carrying the UUID in a
  follow-up message.
- Architecture basis: ADR 0008.
- N6 is numbered because record contents are checkable.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| N1 | When Land closes a standalone publishing session, it publishes one JSON record in the project repository. ("When Land closes a standalone publishing session, publish one JSON record in the project repository.") | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs: standalone Land publishSessionClose publishes .planning/sessions/<uuid>.json read from a second clone |
| N2 | The record holds the session UUID, workflow, close time and accepted comparison, assembled from accepted publication evidence. ("Record the session UUID, workflow, close time, and the accepted comparison of its published work." / "The workflow assembles the record from accepted publication evidence") | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs: full-record deepEqual of sessionId, workflow, closedAt and the accepted base/candidate range |
| N3 | Only accepted Git evidence enters the comparison; local-only work and failed pushes stay out. ("Use accepted Git evidence so work left locally and unsuccessful push attempts stay outside the published comparison.") | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs: local-only base and pre-receive-refused cases publish no record and leave origin unchanged; accepted pair diff holds only the edit |
| N4 | On a machine with the published repository and no local launch history, the standalone Done entry offers Review changes, read through the configured project. ("The existing standalone Done entry offers Review changes on a machine with the published repository and no local launch history." / "the Dashboard reads that record through the configured project") | slice 7 | observed: e2e/sessions/recently-done-published-session-second-machine.spec.ts: configured checkout with empty launch storage lists the Published session <uuid> entry with Review changes from a real publishSessionClose record |
| N5 | Review changes shows the session's file diff from a fresh clone after workspace retirement and trunk advance, using only the UUID and readable Git endpoints. ("A developer with a fresh clone opens its Done entry, selects Review changes, and reads the file diff even after the original workspace is retired and trunk has advanced." / "A UUID and readable Git endpoints must remain sufficient after workspace retirement.") | slice 7 | observed: e2e/sessions/recently-done-published-session-second-machine.spec.ts: after a trunk advance Review changes opens the recorded diff of published-session-edit.txt through reviewChangesPage and excludes the later trunk file |
| N6 | The published record carries no launch state, conversations, workspace paths or native session controls. ("Keep launch state, conversations, workspace paths, and native session controls on the originating machine.") | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs: full-record deepEqual holds only version, sessionId, workflow, closedAt, ranges |
