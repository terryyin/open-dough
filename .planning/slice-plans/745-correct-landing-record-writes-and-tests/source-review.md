# Source-only review

Fresh-context reviewer `source_reviewer` received the selected correction
source, including its goal, review findings, scope, examples and acceptance,
and preserved behavior from the correction input. The launch and numbered
reply are retained in the execution conversation. The review read no files and
made no changes. Its follow-up clarified entry 23. The source names
`keptRecords` as the session-only read and separately requires retention
and preservation of creation records on writes.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The landing decision returns record changes. | slice 1 | observed: dashboard/server/launchLandingDecision.ts LandingDecision.changeRecords and both decision owners |
| 2 | The landing adapter applies those changes inside `replaceRecords`. | slice 1 | observed: dashboard/server/launchLandingReporting.ts saveLandingRecordChange inside replaceRecords |
| 3 | A landing preserves every launch record it does not own. When one prepare runs in a project with a declared-landing launch and an unresolved creation record, the creation record stays. | slice 1 | observed: landingRecordPersistence.spec.ts retained and attempt cases, afterPrepare and exact resulting document |
| 4 | In that prepare journey, the declared-landing launch stays. | slice 1 | observed: landingRecordPersistence.spec.ts retained case keeps the same session in its afterPrepare array |
| 5 | In that prepare journey, the declared-landing launch gains preparation. | slice 1 | observed: landingRecordPersistence.spec.ts retained case saved preparation has receipt, base and revision |
| 6 | In that prepare journey, preparation is confined to the landing launch. | slice 1 | observed: landingRecordPersistence.spec.ts exact afterPrepare array keeps other and creation unchanged |
| 7 | When an attempt-path landing is decided while another session in the same project is marked Done, that session keeps its Done time. | slice 1 | observed: landingRecordPersistence.spec.ts attempt case changes other to Done between decision and save and checks its complete record |
| 8 | In that concurrent Done journey, no record moves to history as removed. | slice 1 | observed: landingRecordPersistence.spec.ts attempt case exact document retains all original session keys and the newly arrived one; launchRecordDocument.ts derives removed via key difference |
| 9 | A branch handoff preserves every launch record it does not own. | slice 2 | observed: branch-landing-handoff.spec.ts open-launch change proves exact unrelated session and creation remain |
| 10 | A branch-context save merges only `landingReporting` into the current record. | slice 2 | observed: acceptBranchLandingAnswer only sets landingReporting into current; branch-landing-handoff.spec.ts keeps newer stop explanation and answers saved context |
| 11 | The branch-context save rechecks `doneAt`. When the same session is marked Done while the handoff copies context, the saved record keeps `doneAt`. | slice 2 | observed: branch-landing-handoff.spec.ts concurrent production setRecordDoneAt keeps the exact stored Done time |
| 12 | The branch-context save rechecks `branchEntry`. | slice 2 | observed: branch-landing-handoff.spec.ts changed persisted defaultTip survives with no saved or returned context; sameBranchEntry tests all entry witnesses in production |
| 13 | When the same session is marked Done while the handoff copies context, the saved record gains no landing reporting. | slice 2 | observed: branch-landing-handoff.spec.ts concurrent Done leaves persisted landingReporting absent |
| 14 | The branch handoff includes `landingContext` only for a file it saved. In the concurrent Done journey, the answer carries no `landingContext`. | slice 2 | observed: branch-landing-handoff.spec.ts concurrent Done and changed entry cases omit landingContext; handler verifies saved reporting object |
| 15 | Without a concurrent change, the branch handoff answers with the saved file. | slice 2 | observed: branch-landing-handoff.spec.ts default context maker succeeds and the returned path equals the saved path and opens with the saved reference |
| 16 | The test-only re-export of `decideAttemptLanding` is retired. | slice 4 | observed: launchLandingDecision.ts no attempt decision re-export; launchLandingDecision.spec.ts exercises the public decideLanding |
| 17 | The duplicate retained lookup in `handleLanding` is removed. | slice 4 | observed: handleLanding asks decideRetainedLanding for the locked retained path; retainedLandingDecision.ts owns record selection |
| 18 | The unused `LandingDecision.path` is removed. | slice 4 | observed: LandingDecision uses an optional attempt update without path; both focused decision specs observe update/no-update results |
| 19 | The decision takes `now` from `receivedAt` in place of `Date.now()`. | slice 4 | observed: retainedLandingDecision.spec.ts receipt-time 404 differs from scratch wall-clock 409 in slice-4-clock-red.log and passes with receivedAt |
| 20 | The decision takes a typed input in place of seven positional arguments. | slice 4 | observed: LandingDecisionInput in launchLandingDecision.ts is shared by decideLanding and decideAttemptLanding; adapter and direct specs build named inputs |
| 21 | Landing admission accepts requests that `verifyLocalOrigin` accepts, including a request with `Sec-Fetch-Site: same-origin` and no `Origin` header. | slice 5 | observed: landingRequestAdmission.spec.ts metadata-only prepare admitted and foreign Host rejected; localOrigin.ts shares the Host/Origin decision; installedPublisher passes both fields |
| 22 | Landing admission returns 405 before 415, preserving the existing precedence. A GET with non-JSON content type receives 405. | slice 5 | observed: landingRequestAdmission.spec.ts IncomingMessage non-JSON GET returns 405 and non-JSON POST still returns 415; red returns 415 for GET |
| 23 | `composedLandingStores` reads session records only through `keptRecords` when applying writes. | slice 1 | observed: composedLandingStores.ts keptRecords applies the session discriminator to withinRetention; landingRecordPersistence.spec.ts passes creation in the persisted document |
| 24 | `composedLandingStores` applies record-store retention semantics. | slice 1 | observed: launchRecordDocument.ts recordRetention used by replaceRecords and composedLandingStores.ts; landingRecordPersistence.spec.ts excludes the aged-out launch |
| 25 | `composedLandingStores` keeps creation records when applying writes. | slice 1 | observed: landingRecordPersistence.spec.ts exact retained and attempt output retains the unresolved creation after both writes |
| 26 | Composed Done cases use production `setRecordDoneAt`. The test-only `markDone` and any other composed helper that writes Done are retired. | slice 3 | observed: recordDoneAt.ts and doneCapture.ts use the same optional LaunchRecordStore; the four composed scenarios and the intervening Done adapter cases call setRecordDoneAt with their stores; composedLandingStores no longer writes Done |
| 27 | Landing persistence cases use MakeMe-built cases. | slice 1 | observed: landingRecordPersistence.spec.ts MakeMe launch, creation, attempt, checkout work and report setup |
| 28 | Landing persistence cases run through `handleLanding` with composed stores. | slice 1 | observed: landingRecordPersistence.spec.ts calls handleLanding with composed stores for prepare and record on both paths |
| 29 | The landing persistence cases include an unresolved creation record alongside the declared-landing launch. | slice 1 | observed: landingRecordPersistence.spec.ts an unresolved creation sits beside the declared launch before prepare and remains after record |
| 30 | The landing persistence cases include a record updated between decision and save. | slice 1 | observed: landingRecordPersistence.spec.ts recordingStores intervenes after decision, and the final document includes its Done mark and new session |
| 31 | The decision suite keeps only refusal cases. | slice 6 | observed: launchLandingDecision.spec.ts and retainedLandingDecision.spec.ts have only five and four refusal cases respectively |
| 32 | The decision refusal cases run through `decideLanding`. | slice 6 | observed: both decision specs call decideLanding on MakeMe cases and assert exact status/message |
| 33 | Decision refusal cases are expressed as `test.each` tables. | slice 6 | observed: both decision specs present all refusals as test.each rows |
| 34 | The typed decision tests import only MakeMe for setup. | slice 6 | observed: the only test-support import in either decision spec is the MakeMe factory |
| 35 | Admission refusals are also expressed as `test.each` tables. | slice 5 | observed: landingRequestAdmission.spec.ts one test.each table of eight refusals with two separate admitted operation cases |
| 36 | The helpers in `attemptLandingDecisionCase.ts` become MakeMe steps or named examples. | slice 6 | observed: attemptLandingDecisionCase.ts deleted; MakeMe builders supply attempts, reports, authority, bound/declared records and retained settlement |
| 37 | One declared-landing example replaces both `aDeclaredRecord` and `aComposedDeclaredLanding`. | slice 6 | observed: LaunchReviewedSessionBuilder.withDeclaredLanding supplies the decision table, landing adapter and prepared Done test; aDeclaredRecord and aComposedDeclaredLanding are gone |
| 38 | Assertions that restate their inputs are removed. | slice 6 | observed: decision success/input assertions removed; landingRecordPersistence.spec.ts observes actual saved preparations and exact receipt retries; native retained spec observes expired attempt success |
| 39 | Record deletion in `declared-blank-launch-publication` acts on the record holding the landing. | slice 7 | observed: declared-blank-launch-publication.spec.ts invokes production deleteRecord on the composed store containing the saved landing, asserts composed absence and no Git pins; slice-7-pin-regression.log shows both surviving pins fail the exact assertion |
| 40 | The landing persistence cases fail when the landing persistence fix is reverted. | slice 1 | observed: slice-1-break.log and run record in worktree Git evidence; both adapter cases fail against the snapshot implementation |
| 41 | The branch-entry persistence cases fail when the branch-entry persistence fix is reverted. | slice 2 | observed: slice-2-red.log and run record in the worktree Git evidence; reverting the guarded save and response checks fails the open, concurrent Done and changed-entry cases |
| 42 | The local test count for the decision specs does not grow. | slice 6 | observed: baseline-serial.txt vs slice-6-verified.json: 12 prior decision cases and nine final cases |
| 43 | The local run time of the decision specs does not grow. | slice 6 | observed: baseline-serial.txt vs slice-6-verified.json: 1083 ms vs 12.03 ms summed decision case time on the same host and worker selection |
