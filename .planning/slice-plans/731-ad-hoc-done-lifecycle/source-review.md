# Source-only review

A fresh isolated reviewer, `source_review`, received the selected seed section's goal, scope, examples and exclusions. The launch instructed it to use only that text, read no files, make no changes and derive independently observable promises without allocating slices. Its numbered return is below.

The reviewer retained the earlier boundary-server, reporting CLI and reflog-shim setup, the 23-second CI baseline, and the existing owners and exclusions from the source as context.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A quiet completion marks a Default main record Done at the receipt’s `receivedAt`. | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-commits.spec.ts, keptSession doneAt equals actual receipt.receivedAt |
| 2 | The quiet completion keeps the session’s commits. When a launch reports through reference `R` and commits `typo`, a quiet completion for `R` leaves one review commit run showing `typo`. | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-commits.spec.ts, typed review of the one dated typo commit has exactly one run with one commit |
| 3 | A reopened session keeps its earlier capture until its next Done. | slice 3 | |
| 4 | A quiet report after a confirmed native Done keeps the additional commit. | slice 3 | |
| 5 | A quiet report received during an earlier rename wait refreshes the commit capture. | slice 2 | |
| 6 | Retrying the same quiet delivery resumes native Done. | slice 3 | |
| 7 | That retry does not read the checkout again. | slice 3 | |
| 8 | When the dashboard closes its Done marks during a quiet report’s native rename wait, the rename stops. | slice 2 | |
| 9 | When the dashboard abandons that rename wait, the record keeps the commits read at that Done. | slice 2 | |
| 10 | While the latest Done’s capture is unfinished, the record refuses review of the previous capture. | slice 4 | |
| 11 | While that capture is unfinished, the record refuses access to the previous review’s files. | slice 4 | |
| 12 | While that capture is unfinished, the record does not inherit the previous capture’s “no commits” finding. | slice 4 | |
| 13 | The capture excludes a commit that arrives after Done reads the tip. | slice 4 | |
| 14 | A launch in a checkout Git cannot read keeps no start. | slice 6 | |
| 15 | Deleting a kept record removes that record’s session-run references. | slice 5 | |
| 16 | Deleting a kept record removes that record’s landing references. | slice 5 | |
| 17 | Deleting a kept record preserves another kept record’s session-run references in the same repository. | slice 5 | |
| 18 | Deleting a kept record preserves another kept record’s landing references in the same repository. | slice 5 | |
| 19 | Expiring a kept record removes that record’s session-run references. | slice 5 | |
| 20 | Expiring a kept record removes that record’s landing references. | slice 5 | |
| 21 | Expiring a kept record preserves another kept record’s session-run references in the same repository. | slice 5 | |
| 22 | Expiring a kept record preserves another kept record’s landing references in the same repository. | slice 5 | |
| 23 | A kept record can still be deleted when its saved repository is gone. | slice 5 | |
| 24 | A kept record can still expire when its saved repository is gone. | slice 5 | |
| 25 | The fourteen selected cases move to plain Node Vitest and retain their distinct inputs and expected outcomes. | slice 6 | |
| 26 | The moved cases exercise `deliverCompletion`, `NativeDoneMarks`, `setRecordDoneAt`, `readSessionCommits`, the typed review and `deleteRecord` directly where applicable. | slice 6 | |
| 27 | The moved cases use MakeMe kept records and attempts where applicable. | slice 6 | |
| 28 | The moved cases use real Git for their Git behavior. | slice 6 | |
| 29 | `NativeDoneMarks` accepts its host lookup as a typed collaborator. | slice 1 | observed: dashboard/server/doneMarks.ts, DoneCollaborators.hostFor and the Vitest case's injected Claude rename observation |
| 30 | `NativeDoneMarks` accepts its reporting folder as a typed collaborator. | slice 1 | observed: dashboard/server/doneMarks.ts, DoneCollaborators.reportingFolder; dashboard/server/launchBoundary.ts production wiring and Vitest rename folder assertion |
| 31 | A test case can await a report’s continuation. | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-commits.spec.ts, delivered receipt reaches reported and the returned continuation resolves before review |
| 32 | Each `dashboard/test-support/` export whose last consumer leaves is retired, starting with `DefaultMainSessionWork.launchReporting`. | slice 6 | |
| 33 | The move adds no `dashboard/test-support/` exports. | slice 6 | |
