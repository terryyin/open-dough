# Source-only review

Fresh reviewer `/root/source_review` ran with no inherited conversation and no
repository reads. Its input was the selected correction's Goal and Scope and the
correction plan's original Preserved promises and constraints. The reviewer
returned the numbered source clauses below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | “A developer using Follow up keeps a lean dashboard” | slice 1 | observed: agent-launch-sessions-listing.spec.ts compares open and Done follow-up entries from the actual sessions overview with the kept inputs |
| 2 | “the sessions overview the page polls stops carrying each follow-up's resolved context” | slice 1 | observed: agent-launch-sessions-listing.spec.ts expects the raw overview body to omit the context marker and the session entries to keep only the source and first-input state |
| 3 | “repeats the source sessions' requests” | slice 1 | observed: agent-launch-follow-up-session.spec.ts checks the original request in the Follow up dialog and first input |
| 4 | “and final reports” | slice 1 | observed: agent-launch-follow-up-session.spec.ts checks the supplied final report in the Follow up dialog and first input |
| 5 | “can reach about 20 KB per held session” | slice 1 | observed: launchRequest.ts and completionReport.ts allow 4,000 and 16,000 characters respectively; sessionListing drops the context fields without regard to length |
| 6 | “repeating a follow-up whose start is still retained resumes that start” | slice 2 | observed: agent-launch-follow-up-identity.spec.ts checks the same attempt ID and acceptance time after source removal, the restored first input and saved request |
| 7 | “even after its source record has expired” | slice 2 | observed: agent-launch-follow-up-identity.spec.ts checks the same attempt ID and acceptance time after source removal, the restored first input and saved request |
| 8 | “This corrects the delivered Start a follow-up from recently done work (SEED-273#follow-up-from-done) story” | slice 2 | observed: The follow-up regression spans the same host-refused launch journey in agent-launch-follow-up-identity.spec.ts; session and story browser journeys still pass |
| 9 | “it adds no new promise” | slice 2 | observed: agentLaunchAccept.ts reuses existing continuation and the established matching rule; distinct launches still use the existing source reader |
| 10 | “The done listing” is one surface from which the follow-up session’s resolved context is removed. | slice 1 | observed: agent-launch-sessions-listing.spec.ts compares the Done follow-up overview entry with its exact source and first-input state |
| 11 | “open-entry listing of a follow-up session's recorded context” | slice 1 | observed: agent-launch-sessions-listing.spec.ts compares the open follow-up overview entry with its exact source and first-input state |
| 12 | “admission's resume of a retained follow-up start whose source record is gone” | slice 2 | observed: agent-launch-follow-up-identity.spec.ts checks the same attempt ID and acceptance time after source removal, the restored first input and saved request |
| 13 | “duplicate per-host Default main input cases” | slice 2 | observed: The duplicate Default main cases are absent from Codex and Cursor, with the exact context, request and reporting sequence checked by agent-launch-follow-up-boundary.spec.ts |
| 14 | “a re-export kept only for an old import” | slice 2 | observed: StartLaunch.tsx imports LaunchWorkItem from launchStarts.ts and the dashboard typecheck passes without a launchAttempts.ts re-export |
| 15 | “with focused proof” applies to the scoped correction. | slice 2 | observed: The plan's focused suite and the follow-up, worker-liveness and kept-start proofs for the final admission changes pass |
| 16 | “All SEED-273#follow-up-from-done promises stay” | slice 2 | observed: agent-launch-follow-up-session.spec.ts and recently-done-follow-up.spec.ts preserve eligibility, dialog context, launch and source placement; backend specs preserve per-host launch and refusal behavior |
| 17 | “the server resolves the context from current records at Start” | slice 2 | observed: The source-backed Start tests in agent-launch-follow-up-boundary.spec.ts and agent-launch-follow-up-story.spec.ts assert machine and published facts in the native input |
| 18 | “never accepts page-written text” | slice 2 | observed: agent-launch-follow-up-identity.spec.ts asserts 400 for wire context even when a matching attempt can resume |
| 19 | “the resolved text stays on the recorded request for retries” | slice 2 | observed: agent-launch-follow-up-identity.spec.ts asserts persisted context and exact retry input; the Codex pending-input case checks the saved follow-up on the new attempt |
| 20 | “Startup recovery” | slice 2 | observed: agent-launch-follow-up-identity.spec.ts and the Codex and Cursor follow-up specs exercise Continue after removal; launchAttemptContinuation.ts readmits the attempt from its saved request |
| 21 | “Codex's rebuilt input” | slice 2 | observed: agent-launch-follow-up-codex.spec.ts checks the rebuilt input after refusal and the identical retried input on the pending conversation |
| 22 | “the source … is the launch identity” | slice 2 | observed: The distinct-source tests in agent-launch-follow-up-identity.spec.ts and agent-launch-follow-up-story.spec.ts assert separate launches and the correct native context |
| 23 | “not the text” | slice 2 | observed: launchRequest.ts delegates identity to sameFollowUpSource; agent-launch-follow-up-identity.spec.ts matches the source-only wire request to a saved attempt containing context |
| 24 | “the first input order per host” | slice 2 | observed: agent-launch-follow-up-boundary.spec.ts asserts Default main and Isolated workspace block order; the retained Codex and Cursor specs inspect their actual first input |
| 25 | “the 404/502 refusals for a new follow-up whose source cannot be read” preserves the 404 alternative under the stated new-follow-up condition. | slice 2 | observed: agent-launch-follow-up-identity.spec.ts asserts fresh 404 with different attachments after the source is removed; the missing published story test asserts 404 independently |
| 26 | The same clause preserves the 502 alternative under that condition. | slice 2 | observed: agent-launch-follow-up-story.spec.ts simulates a failed published read and asserts 502 before a native launch |
| 27 | “The sessions history still carries the full record” | slice 1 | observed: agent-launch-sessions-listing.spec.ts asserts the full Done record in the history answer and the restored details with the current listing title |
