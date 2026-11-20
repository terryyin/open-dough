# Source review

Launch: fresh general-purpose reviewer (no conversation inheritance), 2026-11-20,
given only the seed section's Goal, Scope, Key examples and Scope limits of
SEED-413#refuse-story-launch-session-file-reads, told to read no project files and
number independently observable promises.

Unnumbered context returned: resolution keys (project, host, session) identify the
kept launch; motivation (send the reader to the story view); audience (dashboard
reader); scope limits defer typing, cancellation, adapter placement and builder
cleanup to the handler contract correction; reference and pair admission are
mechanism; "share the eligibility rule" is design direction observed through C6;
"still" marks C9–C12 as preserved behavior.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Session-addressed diff request for a kept story launch with a launch reference gets HTTP 400 "This session belongs to a story launch and is reviewed by its story." (Key example 1) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": refusal loop, storyReviewFileEndpoint with {...bySession, reference} asserts 400 + exact error body |
| C2 | Session-addressed diff request for a kept story launch with only the comparison pair gets the same 400 and message (Key example 1) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": refusal loop, storyReviewFileEndpoint with bySession (pair only) asserts 400 + exact error body |
| C3 | Session-addressed text request for a kept story launch with a launch reference gets the same 400 and message (Key example 1) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": refusal loop, storyReviewFileTextEndpoint with {...bySession, reference} asserts 400 + exact error body |
| C4 | Session-addressed text request for a kept story launch with only the comparison pair gets the same 400 and message (Key example 1) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": refusal loop, storyReviewFileTextEndpoint with bySession (pair only) asserts 400 + exact error body |
| C5 | Refusal decided from the kept launch's recorded story identity before reference or pair admission reads the comparison or repository (Scope) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": reference + mismatched baseline answers 400 (not 409) on both endpoints, and repositoryObservation/index unchanged afterwards; dashboard/server/storyReviewSessionFileAdmission.ts admitSessionReviewedFile calls reviewedSessionRecord before the reference/pair branch |
| C6 | Both file endpoints apply the session review's eligibility rule and give the same direction (Goal, Scope) | slice 1 | observed: dashboard/server/storyReviewSessionAdmission.ts reviewedSessionRecord shared by admittedSessionReview (snapshot) and admitSessionReviewedFile; snapshot refusal in ad-hoc-review-subject.spec.ts kept-story-launch case and file refusals in dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…" carry the identical body |
| C7 | Story identity plus retained reference returns the diff for that launch's captured comparison and a valid file (Key example 2) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": story-addressed storyReviewFileEndpoint returns 200 with printed containing +delivered.txt |
| C8 | The same story-addressed request returns the file text (Key example 2) | slice 1 | observed: dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…": story-addressed storyReviewFileTextEndpoint returns 200 equal to {kind: text, baseline: null, tree: delivered.txt\n} |
| C9 | Standalone ad hoc session: valid retained comparison and file still return the diff (Key example 3) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-review-file.spec.ts captured-run and kept-pair diff cases (s1-broad pass) |
| C10 | Standalone ad hoc session: valid retained comparison and file still return the file text (Key example 3) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-commits-file-text.spec.ts kept-pair text sides (s1-broad pass); ad-hoc-review-file.spec.ts rename text case |
| C11 | Standalone ad hoc session: mismatched kept pair on diff still gets HTTP 409 (Key example 3) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-review-file.spec.ts not-among-kept-commits 409 diff case (s1-broad pass) |
| C12 | Standalone ad hoc session: mismatched kept pair on text still gets HTTP 409 (Key example 3) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-commits-file-text.spec.ts 409 kept-commits mismatch at the wire (s1-broad pass) |
| C13 | Existing query validation unchanged; new 400 only for well-formed queries (Scope, Key example 1) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-review-request.spec.ts malformed-query cases and malformed rows in dashboard/backend-tests/review/story-review-one-shot-admission.spec.ts "foreign or malformed historical review requests…" still 400 with their validation errors (s1-green, s1-broad) |
| C14 | Unknown-project behavior unchanged on both file endpoints (Scope) | slice 1 | observed: dashboard/backend-tests/review/story-review-completed-file-admission.spec.ts source elsewhere 404 and story-review-refusal.spec.ts (s1-broad pass); project resolution precedes the session admission, unchanged in the diff |
| C15 | Unknown-session behavior unchanged on both file endpoints (Scope) | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-review-subject.spec.ts unknown-session snapshot case; dashboard/server/storyReviewSessionAdmission.ts reviewedSessionRecord calls namedSessionRecord with the same host/session before the story check, so the file endpoints' unknown-session refusal is the same call as before |
