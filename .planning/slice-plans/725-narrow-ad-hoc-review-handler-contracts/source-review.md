# Source-only review

**Story:** SEED-413#narrow-ad-hoc-review-handler-contracts

**Launch:** Fresh general-purpose reviewer with no conversation inheritance.
Input was only the story's Goal, Scope, and Scope limits from
`.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#narrow-ad-hoc-review-handler-contracts`.
No plan, product, proof, or current-slice scope was supplied. The reviewer
was instructed to read no other project files and change nothing.

## Unnumbered context retained

- **Identity / correction frame:** `SEED-413#narrow-ad-hoc-review-handler-contracts`;
  correction of typed ad hoc review handlers after the retrospective of
  `SEED-413#renovate-dashboard-backend-unit-tests` (recoverable at
  `b3b57f9f92ff351d1abf1df189e994954fc3e4f8:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md`).
- **Audience framing (not a separate result):** callers or copiers of the
  handlers as the reference family.
- **Scope limit / deferred ownership:** moving
  `ad-hoc-session-commits-file-text.spec.ts` and the Default main landing case
  to unit cases stays with the Done capture family
  (`#renovate-remaining-dashboard-backend-unit-tests`).
- **Scope limit / deferred ownership:** the file-read follow-up
  (`#refuse-story-launch-session-file-reads`) owns the story-launch refusal.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Narrowed session-review request contract — "Developers who call the ad hoc review handlers, or copy them as the reference family, get a contract that holds only what each read uses, so a case cannot build input the handler ignores or refuses"; "A session review read … get[s] [its] own typed shape[]. These carry no story-only field." | slice 1 | observed: `SessionReviewRead` + session `ReviewInput`; scratch TS2353 on `historical` (`scratch-typecheck-expect-fail.log`) |
| 2 | Narrowed session-file request contract — same Goal contract clause as (1); "a session file read get[s] [its] own typed shape[]. These carry no story-only field." | slice 1 | observed: `SessionFileRead` + session `ReviewedFileInput`; scratch TS2353 on `completion`; builder `Omit` drops `completion` |
| 3 | Published-completion refusal removed from the session-read handler — "The handler's copy of the adapter's refusal for a published completion on a session read is deleted." | slice 1 | observed: `admitReviewedFile` session branch no longer checks `completion` / malformed published comparison (`storyReviewAdmission.ts`) |
| 4 | Request cancellation / departed reader stops the read (including admission Git reads) — "A departed reader's file read also stops its admission Git reads"; "Admission takes the file handlers' request signal"; "Request cancellation stops the read." | slice 3 | |
| 5 | Admission keeps each existing 30-second deadline — "Admission … keeps each existing 30-second deadline." | slice 3 | |
| 6 | Expiry while the caller stays active keeps the existing refusal — "Expiry while the caller stays active keeps the existing refusal." | slice 3 | |
| 7 | Follow-up admission keeps its existing deadlines — "Follow-up admission also keeps its existing deadlines." | slice 3 | |
| 8 | Non-aborted wire answers unchanged — "The wire answers every non-aborted read as it does today." | slice 4 | |
| 9 | Process-wide store reads live in adapter modules — "the reading of process-wide stores sits in adapter modules." | slice 2 | observed: session `keptRecords`/`knownSource` only via `storyReviewInput.ts`; handlers import `reviewInput`/`keptSessionOf` (`slice-2-import-search.log`) |
| 10 | File admission is separate from the range-read adapter — "File admission is separate from the range read's adapter." | slice 2 | observed: `admitReviewedFile` remains in `storyReviewAdmission.ts`; `rangeRequest`/`AdmittedStoryReviewRange` in `storyReviewRangeRequest.ts` |
| 11 | Admitted-file type named for every file read — "The admitted-file type is named for every file read." | slice 2 | observed: `AdmittedReviewedFile` (no `AdmittedHistoricalReviewedFile` alias) |
| 12 | Session lookup written once — "the session lookup is written once." | slice 2 | observed: `keptSessionOf` used by both session admissions |
| 13 | Stale comment fixed — "the stale comment is fixed." | slice 2 | observed: `namedKeptSession` comment names mutating/unread paths; review via review-input adapter |
| 14 | Backend README points at the moved module — "The backend README points at the moved module." | slice 2 | observed: README cites `storyReviewInput.ts` for `ReviewInput` |
| 15 | Landed ad hoc session is a `LaunchRecordBuilder` step — "The landed ad hoc session … become `LaunchRecordBuilder` steps." | slice 4 | |
| 16 | Session with a kept run is a `LaunchRecordBuilder` step — "the session with a kept run become `LaunchRecordBuilder` steps." | slice 4 | |
| 17 | Session review read builder composes those steps — "the session review read builder composes them." | slice 4 | |
| 18 | Story subjects keep their admission path — "Story subjects keep their admission path." | slice 1 | observed: story arm of `ReviewInput` / `admitReviewedFile` unchanged; `review/` group exit 0 (`review-backend-2`) including story-subject paths |
