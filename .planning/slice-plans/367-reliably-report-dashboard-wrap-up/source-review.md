# Source review — SEED-163#reliably-report-dashboard-wrap-up

**Launch:** Fresh general-purpose reviewer with no conversation inheritance;
supplied only Goal, Scope, key examples, and exclusions from
`.planning/seeds/SEED-163-dashboard-wrap-up-reporting.md#reliably-report-dashboard-wrap-up`.
No plan, return, product, or proof was provided. Reviewer return retained below
as the commitment ids.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A successful dashboard-started wrap-up retains its supplied landing evidence. | slice 3 | observed: story-branch-landing-capture.spec.ts integrate omits flag yet records landing; history-preserving-landing-expectation.test.mjs |
| 2 | A successful dashboard-started wrap-up acknowledges quiet completion so the session settles without unnecessary human attention. | slice 4 | observed: agent-completion-quiet-closure.spec.ts quiet completed + landing/closure → doneAt; guidance quiet wording |
| 3.1 | When a reporting duty is incomplete after accepted product work, the session leaves a specific recoverable explanation that separates accepted product work from missing dashboard evidence. | slice 4 | observed: slice 1 panel + quiet-closure unacked/unfinished identify incomplete reporting without inventing product failure |
| 3.2 | When a reporting duty is incomplete after accepted product work, the session leaves a specific recoverable explanation that does not treat normal workspace retirement as product failure. | slice 1 | observed: FinalReport.tsx shows productClosureEvidencePresent only from gates; workspaceMissing independent; retirement-cursor no-completion case does not invent product failure |
| 4.1 | Carry supplied landing and final-completion duties through first trunk publication. | slice 3 | observed: resolvePublicationLandingContext + capture on first integrate without explicit flag |
| 4.2 | Carry those duties through observation/shutdown. | slice 4 | observed: planned-wrap-up-continuation / completion-attention guidance; duties remain on completion command after settlement |
| 4.3 | Carry those duties through refresh. | slice 4 | observed: same shared wrap-up/land completion reporting contract; no new lifecycle for refresh |
| 4.4 | Carry those duties through workspace retirement. | slice 4 | observed: retirement-cursor panel after workspace gone; completion still via dashboard-completion, not retirement gate |
| 5.1 | Responsibility stays with the first-trunk publication handoff that already accepts `--landing-context` / `landingContext`. | slice 3 | observed: history-preserving-publication / execution-increment-publication resolve via existing landingContext path; explicit still wins |
| 5.2 | Responsibility stays with the final dashboard completion command after wrap-up or land settles. | slice 4 | observed: agent-completion-quiet-closure uses dashboard-completion / completionDelivery; no parallel owner |
| 6 | Do not add another store, completion-inference owner, or lifecycle. | slice 4 | observed: proof-only on existing completionDelivery/dashboard-completion/completionClosesSession; no new store |
| 7 | Instruction-only reminders are rejected as the prevention mechanism. | slice 3 | observed: mechanical expectation + resolvePublicationLandingContext; capture specs omit flag |
| 8 | Prevention must make those duties leave observable receipts that a native final reply, marker, silence, or process exit cannot substitute. | slice 4 | observed: quiet-closure: no native turn manufactures Done; Done only with receipt + gates |
| 9.1 | Preserve the distinction among product-story completion. | slice 1 | observed: productClosureEvidencePresent vs completion explanation vs Mark as done meaning in FinalReport.tsx |
| 9.2 | Preserve the distinction among dashboard session disposition. | slice 1 | observed: sessionDoneMeaning unchanged; panel does not auto-Done from directory absence |
| 9.3 | Preserve the distinction among native activity. | slice 1 | observed: nativeLimit wording retained; Codex native path in final-report-admission.spec.ts |
| 9.4 | Preserve the distinction among saved-directory availability. | slice 1 | observed: workspaceMissing independent line in retirement-cursor/claude specs |
| 10 | Explicit Mark as done keeps its existing session meaning and neither completes a product story nor fabricates a landing receipt. | slice 1 | observed: FinalReport.tsx still renders sessionDoneMeaning; store baseline unchanged on read in retirement-cursor specs |
| 11 | Direct invocations without supplied dashboard context still make no dashboard contact. | slice 4 | observed: completion-attention-guidance + planned-wrap-up-continuation guidance: no dashboard contact without context |
| 12 | Preserve the shared Codex, Cursor, and Claude Code reporting contract; add host-specific proof only where that host's integration changes. | slice 1 | observed: Codex available turn path in final-report-admission.spec.ts; Claude twin updated for shared quiet wording |
| 13.1 | no completion receipt is distinct from a quiet `completed` receipt with an empty message. | slice 1 | observed: finalReportAdmission.ts branches; final-report-admission.spec.ts quiet vs absent explanations |
| 13.2 | missing or unknown workspace is an independent directory fact. | slice 1 | observed: workspaceLimitation / workspaceMissing composed separately in FinalReport.tsx |
| 14 | Claim published product closure in the panel only from dashboard-readable evidence under the existing tracked-execution closure gates (retained landing and readable published closure). | slice 1 | observed: finalReportResponse.ts + trackedExecutionClosureReadable; retirement-cursor planted-closure case |
| 15 | When those facts are absent, do not claim the story is complete because a directory disappeared. | slice 1 | observed: quiet-empty missing-workspace case asserts not productClosureEvidencePresent |
| 16 | Do not present ordinary retirement as evidence that the product work failed. | slice 1 | observed: retirement panel shows directory limitation and report facts without failure-from-retirement wording |
| E1.1 | Landing is retained against the original launch. | slice 3 | observed: story-branch-landing-capture.spec.ts retained landing pair; later-publication keeps first pair |
| E1.2 | The receipt acknowledges quiet completion. | slice 4 | observed: quiet-closure records empty completed receipt |
| E1.3 | With published closure confirmed, the dashboard marks the session Done quietly, with no unread attention message or alert. | slice 4 | observed: quiet-closure doneAt === receipt.receivedAt with landing+closure; no unread attention |
| E1.4 | Normal retirement needs no human acknowledgment. | slice 4 | observed: guidance settled closure quiet; retirement panel needs no acknowledgment for success path |
| E2.1 | Accepted product work stays accepted. | slice 4 | observed: quiet-closure unavailable path retains accepted Git; retry reporting-only |
| E2.2 | The exact surviving reporting-only retry input is retained. | slice 4 | observed: completionRecoveryFaults + quiet-closure Retained completion / --retry |
| E2.3 | The unfinished reporting operation is identified. | slice 4 | observed: unfinished completion identified in recovery faults / quiet-closure |
| E2.4 | Retry never repeats publication or retirement. | slice 4 | observed: Retry reporting only; no Git/retirement in retry path |
| E2.5 | A lost acknowledgment recovers the original receipt without duplicate work. | slice 4 | observed: quiet-closure lost-ack recovers same receipt |
| E3.1 | Empty successful completion is not presented as “no retained final report.” | slice 1 | observed: retirement-cursor/claude quiet-empty cases; admission quiet explanation |
| E3.2 | Absent completion says no final dashboard message was saved. | slice 1 | observed: finalReportAdmission.ts; admission + retirement-cursor no-completion cases |
| E3.3 | Missing workspace states only that terminal continuation is unavailable. | slice 1 | observed: workspaceMissing copy in sessionAccess.ts; retirement specs |
| E3.4 | None of these alone invents product success or product failure. | slice 1 | observed: quiet-empty without planted closure omits productClosureEvidencePresent; no failure-from-retirement claim |
| E4.1 | The panel states that product closure evidence is present. | slice 1 | observed: retirement-cursor no-completion + planted closure expects productClosureEvidencePresent |
| E4.2 | The panel states that the temporary workspace is gone so terminal continuation is unavailable. | slice 1 | observed: same case expects workspaceMissing; terminal region count 0 |
| E4.3 | The panel states that no final dashboard message was saved. | slice 1 | observed: same case expects that sentence |
| E4.4 | Directory absence is not treated as the proof of completion. | slice 1 | observed: productClosureEvidence requires landing+closure gates, not rmSync alone |
| E5.1 | The exact useful message is retained. | slice 4 | observed: unfinished attention message retained in quiet-closure / recovery fixtures |
| E5.2 | Unfinished work stays unfinished. | slice 4 | observed: unfinished outcome keeps doneAt undefined |
| E5.3 | A native final reply or process exit does not manufacture dashboard success. | slice 4 | observed: quiet-closure asserts no native turn/start from reporting; no manufactured Done |
| E6.1 | No dashboard contact is made. | slice 4 | observed: guidance tests no dashboard submission without context |
| 17 | Manually reconciling the original stale session is a separate recovery task (out of scope). | | G-excl-stale |
| 18 | A wording-only change does not complete prevention of the observed omission. | slice 3 | observed: plant/open expectation + publish resolve, not wording-only |
| 19.1 | This story does not promise a native Cursor transcript reader. | | G-excl-native-reader |
| 19.2 | This story does not promise automatic reconstruction of a missed historical landing. | | G-excl-reconstruct-landing |
| 19.3 | This story does not promise automatic Done based solely on a missing directory, deleted branch, native response, or exit. | | G-excl-auto-done |
| 20 | Do not add another store, completion-inference owner, or lifecycle. | slice 4 | observed: same as 6 — existing owners only |
| 21 | Instruction-only reminders are rejected as prevention. | slice 3 | observed: same mechanical prevention as commitment 7 |
| 22 | Mark as done neither completes a product story nor fabricates a landing receipt. | slice 1 | observed: sessionDoneMeaning; read does not mutate store in retirement-cursor specs |
