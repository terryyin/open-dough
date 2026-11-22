# Source review

Launch: a fresh general-purpose reviewer (no fork, no conversation
inheritance) on 2026-11-22, given only the Goal, Scope, key examples and scope
limits of
[SEED-418#expire-published-session-records](../../seeds/SEED-418-review-published-session-changes.md#expire-published-session-records)
as text, told to read no project files and change nothing, and to number
independently observable promises. No plan, return or proof was supplied.

Unnumbered context the reviewer kept: the split origin; the reason (each
listing reads every published record); the shared `isWithinDoneWindow` window
and `complete`-style pruning as settled baseline; records expiring after a
commit wait for a later close (reads hide them, promises 1–3); recovery and
explanation of expired sessions deferred to Recover expired session reviews.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Recently done lists a published record while no more than 30 days have passed since its sealed `closedAt`, and drops it once more than 30 days have passed, even with no close since ("An expired record leaves the published-session listing in Recently done"; "reads already hide them"; 29 days 23 hours example) | slice 2 | |
| 2 | The UUID review route of an expired record answers as for a session the project did not publish, even while the file still exists at the fetched revision; a current record stays reviewable | slice 1 | observed: dashboard/backend-tests/review/published-session-expiry.spec.ts: storyReview reviewable at closedAt+30d, 404 "This project published no such session." 1 ms later with the file at the fetched revision |
| 3 | File reads of an expired record answer as for an unpublished session, even while the file still exists at the fetched revision | slice 1 | observed: dashboard/backend-tests/review/published-session-expiry.spec.ts: reviewedFileDiff diff at closedAt+30d, same 404 just past it |
| 4 | Expiry counts from `closedAt`, whatever its commit time: a record committed 10 days after its `closedAt` still expires 30 days after `closedAt` | slice 1 | observed: dashboard/backend-tests/review/published-session-expiry.spec.ts: record committed 10 days after closedAt expires 1 ms past closedAt+30d |
| 5 | A kept local launch standing for an expired UUID keeps its own lifecycle | slice 2 | |
| 6 | Every session-record commit through the shared sealed-record publisher adds its own record and removes only the expired record files beside the backlog, so the current snapshot stops accumulating session files | slice 3 | |
| 7 | A record file whose close time cannot be read stays for a person to inspect | slice 3 | |
| 8 | Earlier Git snapshots keep pruned records at their original paths ("The commit before it still holds the expired record.") | slice 3 | |
| 9 | Pruning never removes a live record a concurrent writer publishes while the record commit is rebased; after the rebase trunk holds both live records and neither expired file, with no conflict | slice 3 | |
| 10 | Publications that write no session record prune nothing | slice 3 | |
| 11 | A resumed close whose identical record is already published prunes nothing | slice 3 | |
