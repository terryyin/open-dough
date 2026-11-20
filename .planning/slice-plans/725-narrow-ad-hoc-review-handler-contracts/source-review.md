# Source-only review

**Story:** SEED-413#narrow-ad-hoc-review-handler-contracts

**Launch:** Fresh general-purpose reviewer with no conversation inheritance
(replaced after trunk absorbed amendment that named the file-read follow-up
exclusion as identity `SEED-413#refuse-story-launch-session-file-reads`).
Input was only the amended story's Goal, Scope, and Scope limits. No plan,
product, proof, or current-slice scope was supplied. The reviewer was
instructed to read no other project files and change nothing.

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
  `SEED-413#refuse-story-launch-session-file-reads` owns the story-launch
  refusal.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Session review read typed shape (no story-only field) — Goal contract holds only what each read uses; Scope: session review read gets its own typed shape with no story-only field. | slice 1 | observed: `SessionReviewRead` + session `ReviewInput`; scratch TS2353 on `historical` (`scratch-typecheck-expect-fail.log`) |
| 2 | Session file read typed shape (no story-only field) — same Goal contract; Scope: session file read gets its own typed shape with no story-only field. | slice 1 | observed: `SessionFileRead` + session `ReviewedFileInput`; scratch TS2353 on `completion`; builder `Omit` drops `completion` |
| 3 | Published-completion refusal copy removed from the session-read handler — "The handler's copy of the adapter's refusal for a published completion on a session read is deleted." | slice 1 | observed: `admitReviewedFile` session branch no longer checks `completion` / malformed published comparison |
| 4 | Departed file reader stops its admission Git reads — "A departed reader's file read also stops its admission Git reads." | slice 3 | observed: signal reaches admission Git; abort cases reject `AbortError` (`slice3-green-abort`); red/unavailable at HEAD (`slice3-red-abort`); timeout-alone scratch fails abort cases |
| 5 | Wire answers for every non-aborted read unchanged — "The wire answers every non-aborted read as it does today." | slice 4 | |
| 6 | Admission uses the file handlers' request signal; cancellation stops the read — "Admission takes the file handlers' request signal … Request cancellation stops the read." | slice 3 | observed: `admitReviewedFile(input, signal)` → session + historical; abort cases green; timeout-alone scratch fails |
| 7 | File-handler admission keeps each existing 30-second deadline and the existing expiry refusal — "Admission … keeps each existing 30-second deadline. … Expiry while the caller stays active keeps the existing refusal." | slice 3 | observed: `AbortSignal.timeout(30_000)` combined via `AbortSignal.any`; controlled expiry → 409 kept-commits / missing-objects; expiry-as-cancel scratch fails |
| 8 | Follow-up admission keeps its existing deadlines — "Follow-up admission also keeps its existing deadlines." | slice 3 | observed: optional signal; follow-up callers without signal keep timeout-alone; both follow-up file specs exit 0 (`slice3-follow-up-node`) |
| 9 | Process-wide store reads live in adapter modules — "the reading of process-wide stores sits in adapter modules." | slice 2 | observed: session `keptRecords`/`knownSource` only via `storyReviewInput.ts` (`slice-2-import-search.log`) |
| 10 | File admission is separate from the range-read adapter — "File admission is separate from the range read's adapter." | slice 2 | observed: `admitReviewedFile` in `storyReviewAdmission.ts`; range in `storyReviewRangeRequest.ts` |
| 11 | Admitted-file type is named for every file read — "The admitted-file type is named for every file read" | slice 2 | observed: `AdmittedReviewedFile` (no Historical alias) |
| 12 | Session lookup is written once — "the session lookup is written once" | slice 2 | observed: `keptSessionOf` used by both session admissions |
| 13 | Stale comment is fixed — "the stale comment is fixed." | slice 2 | observed: `namedKeptSession` comment fixed |
| 14 | Backend README points at the moved module — "The backend README points at the moved module." | slice 2 | observed: README cites `storyReviewInput.ts` |
| 15 | Landed ad hoc session is a `LaunchRecordBuilder` step — "The landed ad hoc session … become `LaunchRecordBuilder` steps" | slice 4 | |
| 16 | Session with a kept run is a `LaunchRecordBuilder` step — "the session with a kept run become `LaunchRecordBuilder` steps" | slice 4 | |
| 17 | Session review read builder composes those steps — "the session review read builder composes them." | slice 4 | |
| 18 | Story subjects keep their admission path — "Story subjects keep their admission path." | slice 1 | observed: story arm unchanged; `review/` group exit 0 including story-subject paths |
