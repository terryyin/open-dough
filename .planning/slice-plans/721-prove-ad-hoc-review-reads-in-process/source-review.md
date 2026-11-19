# Source review

**Launch:** 2026-11-19, a fresh general-purpose reviewer with no conversation
inheritance, by the execution coordinator before the first delegation.
**Input:** only the story text of
`SEED-413#renovate-dashboard-backend-unit-tests` (heading through
"Safe stopping point", without its dependency and state blocks), saved as
`source-review-input.md` in this checkout's evidence location. The reviewer was
told to read no other file, change nothing, and number independently observable
promises.

Unnumbered context the reviewer kept: the family framing; ADR 0010 judgement;
delivery and proof cover session subjects only; the scope limits (checkout and
mark-Done cases including key example 6, branch result, manual landing and
handoff, `kept-commits-*`, `story-review-*`, the range read, the three support
modules while imported, `backend.playwright.config.ts`, `Distribution/src/`);
the architecture rationale; the 2026-11-19 baselines; the effort hypothesis;
the safe stopping point.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The review, file diff and file text reads are split into a thin wire adapter and typed handlers; the adapter owns method, origin, turning the query into a typed subject, answering the status a refusal carries, and turning a closed response into a bounded abort signal (Scope: server 1; Architecture) | slice 4 | |
| 2 | A handler takes a `ReviewedWorkSubject` (with the run or file pair the read names) and an `AbortSignal`, answers `StoryReview`, `ReviewedFileDiff` or `ReviewedFileText`, keeps every admission and repository rule, and refuses by throwing `RefusedRequest` with the message and status the adapter answers (Scope: server 1; Architecture) | slice 4 | |
| 3 | The types come from `reviewedWorkSubject.ts` and `storyReviewContract.ts`; the story adds no second contract (Scope: server 1) | slice 4 | |
| 4 | The handlers serve story subjects through the same admission path as today (Scope: server 2) | slice 4 | |
| 5 | Every ad hoc review case whose state is kept launch records and a repository becomes a plain Node Vitest case through the handlers in `*.unit.spec.ts` specs, none lost: all of `ad-hoc-review`, `ad-hoc-review-file`, `ad-hoc-review-subject`, the three kept-record cases of `ad-hoc-review-unavailable`, the unreadable kept comparison case of `ad-hoc-session-commits`; no server or request wrapper (Scope: cases 1; Goal) | slice 5 | |
| 6 | A case states its machine through MakeMe: configured project, kept launch records as the stored document, the repository with its revisions; MakeMe builds the launch store and project list as stored documents kept under the case's own machine home (Scope: cases 2; Architecture) | slice 2 | |
| 7 | A case mounts the project configuration through the production function a server uses, under its own machine home; process-wide state a case needs uses its production owner, given one in production code when missing (Scope: cases 2; Architecture) | slice 2 | |
| 8.1 | Wire check: a query naming both a story and a session gets 400 (Scope: cases 3; Key examples 5) | slice 3 | |
| 8.2 | Wire check: a foreign origin gets 403 | slice 3 | |
| 8.3 | Wire check: a refused method gets 405 | slice 3 | |
| 8.4 | Wire check: an unknown session gets 404 | slice 3 | |
| 8.5 | Wire check: a malformed run or file pair is refused at the wire | slice 5 | |
| 8.6 | Wire check: the statuses a story session and a foreign file pair map to | slice 5 | |
| 9 | The moved cases total at most about 3 s summed case time at two workers (Scope: cases 4) | slice 6 | |
| 10 | `dashboard/backend-tests/README.md` adds: state a case's machine and repositories through MakeMe; call another handler in arrangement only when that step is the behavior under test; mount process-wide server state through its production function (Scope: guidance 1) | slice 6 | |
| 11 | Every `dashboard/test-support/` function and module with no importer left is deleted (Scope: guidance 2) | slice 6 | |
| 12 | Nothing is added outside MakeMe builders (Scope: guidance 2) | slice 6 | |
| 13 | A kept Done session landed from `base` to `result`, trunk advanced afterwards: the handler answers `landed` with baseline `base`, tree `result`, `delivered.txt` modified; `HEAD` and index unchanged; no server runs (Key examples 1) | slice 2 | |
| 14 | A kept session whose landing repository is gone: the review handler answers `unavailable` with the explanation of the gap (Key examples 2) | slice 2 | |
| 15.1 | A kept session with one kept run: the file diff handler asked for that run's pair answers the diff (Key examples 3) | slice 5 | |
| 15.2 | Asked for another pair, it refuses (Key examples 3) | slice 5 | |
| 16.1 | A subject naming a story launch's session is refused with today's message (Key examples 4) | slice 3 | |
| 16.2 | An unknown session is refused with today's message (Key examples 4) | slice 3 | |
