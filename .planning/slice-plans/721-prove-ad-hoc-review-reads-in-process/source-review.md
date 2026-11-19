# Source review

**Launch:** 2026-11-19, a fresh general-purpose reviewer with no conversation
inheritance, by the execution coordinator after Terry's story amendments of
the same day (typed kept state instead of a mounted machine, then narrowed to
the kept launch records under the refactoring guidance's "Design production
code for testability"). It replaces the earlier reviews.
**Input:** only the amended story text of
`SEED-413#renovate-dashboard-backend-unit-tests` (heading through "Safe
stopping point", without its dependency and state blocks), saved as
`source-review-input-3.md` in this checkout's evidence location. The reviewer
was told to read no other file, change nothing, and number independently
observable promises.

Unnumbered context the reviewer kept: the family split and the goal's reasons;
ADR 0010 judgement; delivery and proof cover session subjects; the scope
limits; ADRs 0008 and 0002, the SEED-353 relation and the amendment's reason;
the 2026-11-19 baselines; the effort hypothesis; the safe stopping point.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The review, file diff and file text reads separate a thin wire adapter from typed handlers; the adapter owns method, origin, turning the query into a typed subject, answering the status a refusal carries, and turning a closed response into a bounded abort signal (Scope: server 1; Architecture) | slice 4 | |
| 2 | A handler takes a `ReviewedWorkSubject` (with the run or file pair) and an `AbortSignal`, answers `StoryReview`, `ReviewedFileDiff` or `ReviewedFileText`, keeps every kept-record and repository rule, and refuses by throwing `RefusedRequest` with the message and status the adapter answers (Scope: server 1; Architecture) | slice 4 | |
| 3 | For a session subject the handler also takes as typed input the kept state it reads, the kept launch records alone; only the adapter reads them from the process-wide stores, on every request (Scope: server 1; Architecture, amended) | slice 4 | |
| 3.1 | A handler's typed contract carries only the data its responsibility reads (Scope: server 1) | slice 4 | |
| 4 | The adapter still refuses an unknown source before reading the kept records (Scope: server 1; Architecture) | slice 4 | |
| 5 | The types come from `reviewedWorkSubject.ts` and `storyReviewContract.ts`; no second contract (Scope: server 1) | slice 4 | |
| 6 | The handlers serve story subjects through the same admission path as today (Scope: server 2) | slice 4 | |
| 7 | Every ad hoc review case whose state is kept launch records and a repository becomes a plain Node Vitest case through the handlers in `*.unit.spec.ts` specs, none lost: all of `ad-hoc-review`, `ad-hoc-review-file`, `ad-hoc-review-subject`, three kept-record cases of `ad-hoc-review-unavailable`, the unreadable kept comparison case of `ad-hoc-session-commits`; no server or request wrapper (Scope: cases 1; Goal) | slice 5 | |
| 8 | A case constructs only the typed state its handler takes through MakeMe, the kept launch records and the repository with its revisions, and sets no machine home, writes no stored document, mounts no process-wide server state (Scope: cases 2; Architecture; Key examples 1) | slice 5 | |
| 9 | One focused wire check through a started server keeps what only the wire owns for these reads (Scope: cases 3) | slice 5 | |
| 9.1 | Wire check: a refused method gets 405 | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-wire.spec.ts: POST to the review endpoint through a started server answers 405 "Only GET is accepted here." |
| 9.2 | Wire check: a foreign origin gets 403 | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-wire.spec.ts: a foreign Origin answers 403 |
| 9.3 | Wire check: a query naming both a story and a session gets 400 | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-wire.spec.ts refusal loop: a query naming both a story and a session answers 400 "The review names both a story and a session." |
| 9.4 | Wire check: a malformed run or file pair is refused | slice 5 | |
| 9.5 | Wire check: an unknown session maps to 404 | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-wire.spec.ts refusal loop: an unknown session answers 404 with today's message |
| 9.6 | Wire check: the status a story session maps to | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-wire.spec.ts refusal loop: a story launch's session answers 400 with today's message |
| 9.7 | Wire check: the status a foreign file pair maps to | slice 5 | |
| 10 | The moved cases total at most about 3 s summed case time at two workers (Scope: cases 4) | slice 6 | |
| 11 | `dashboard/backend-tests/README.md` adds: a handler takes the state it reads as typed input and only the adapter reads process-wide stores; a case constructs exactly that state and its repositories through MakeMe; call another handler in arrangement only when that step is the behavior under test (Scope: guidance 1) | slice 6 | |
| 12 | Every `dashboard/test-support/` function and module with no importer left is deleted (Scope: guidance 2) | slice 6 | |
| 13 | Nothing is added outside MakeMe builders (Scope: guidance 2) | slice 6 | |
| 14 | A kept Done session landed from `base` to `result`, trunk advanced afterwards: the handler answers `landed` with baseline `base`, tree `result`, `delivered.txt` modified (Key examples 1) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-review-landed.unit.spec.ts "Given a kept Done ad hoc landing whose trunk advanced afterwards…": landed, baseline base, tree result, delivered.txt modified, through storyReview in-process with makeMe.aSessionReviewRead |
| 14.1 | In that example the repository's `HEAD` and index are unchanged (Key examples 1) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-review-landed.unit.spec.ts "Given a kept Done ad hoc landing whose trunk advanced afterwards…": HEAD equals the later MakeMe revision and the index bytes are equal after the read |
| 15 | A kept session whose landing repository is gone: the handler answers `unavailable` with the explanation of the gap (Key examples 2) | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-review-unavailable.unit.spec.ts "Given an ad hoc landing whose repository is gone…": landing-unavailable with "The captured landing repository is missing or unreadable." |
| 16 | A kept session with one kept run: the file diff handler asked for that run's pair answers the diff (Key examples 3) | slice 5 | |
| 16.1 | Asked next for another pair, it is refused (Key examples 3) | slice 5 | |
| 17 | A subject naming a story launch's session is refused with the message a reviewer reads today (Key examples 4) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-subject.unit.spec.ts "Given a kept story launch's session…": RefusedRequest 400 "This session belongs to a story launch and is reviewed by its story." in-process |
| 17.1 | An unknown session is refused with the message a reviewer reads today (Key examples 4) | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-review-subject.unit.spec.ts "Given no kept launch of a session…": RefusedRequest 404 "This dashboard launched no such session for this project." in-process |
| 18 | A case that commits in a Default main checkout and marks the session Done stays a Playwright spec after this story (Key examples 6) | slice 6 | |
