# Source-only review

Fresh reviewer `/root/source_review` received only the selected story's
[Goal, Scope, and six key examples](../../seeds/SEED-258-dough-intent-coverage.md#assess-intent-coverage-during-wrap-up).
The launch asked it to split compound commitments and preserve the examples as
examples. The reviewer received no plan or product proof. The returned
commitments and coordinator's allocations follow. Items 54–61 record scope
limits. Items 62–97 belong to the six key examples in order.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Wrap-up automatically runs targeted intent coverage for each completed feature story it closes. | slice 3 | |
| 2 | Planned feature stories qualify. | slice 3 | |
| 3 | Planless feature stories qualify. | slice 3 | |
| 4 | The developer can later select the completed story in Recently done to read its result. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — real CLI closes the story, Recently done selection opens its assessment in expanded Intent |
| 5 | The developer can see what the check cost. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes each of the four cost entries |
| 6 | The developer can do this without invoking the check separately. | slice 3 | |
| 7 | The results show how the check performs on real stories. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts and dashboard/tests/intent/intent-story-coverage.spec.ts — Caught and Insufficient evidence outcomes remain visible on their completed stories |
| 8 | The results show what the check costs on real stories. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — the done story exposes the recorded test runtime, effort, and elapsed time |
| 9 | The results inform a later decision about whether automatic use remains worthwhile. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts and dashboard/tests/intent/intent-story-coverage.spec.ts — persisted outcomes and costs are readable together for later evaluation |
| 10 | Wrap-up invokes the installed `dough-intent-coverage` skill. | slice 3 | |
| 11 | Invocation occurs after execution completion is established. | slice 3 | |
| 12 | Invocation occurs before the before-cleanup commit. | slice 3 | |
| 13 | The invocation supplies the story section. | slice 3 | |
| 14 | The invocation supplies the story’s plan when one exists. | slice 3 | |
| 15 | The invocation supplies the completed work’s revision. | slice 3 | |
| 16 | Prefer a plausible protection gap for an important story promise when a review has raised one. | slice 3 | |
| 17 | The retrospective can supply that gap. | slice 3 | |
| 18 | Another review of the story can also supply that gap. | slice 3 | |
| 19 | Otherwise, the skill selects the most important promise from the story’s key examples. | slice 3 | |
| 20 | `complete` stores the returned report verbatim. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — report test compares both JSON and the shared parser to exact CRLF text |
| 21 | The storage location is the story’s done record beside the backlog. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — the real complete CLI writes the file in the done directory beside the scratch backlog |
| 22 | Each done record holds at most one result. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — report and repeat test asserts one record and no second result |
| 23 | The existing rolling 30-day cleanup removes a stored result with its done record. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — expiry test sees only the new record and recent legacy record in the done directory |
| 24 | Done records without a result remain valid. | slice 1 | observed: tests/support/product-backlog-complete-done-record.test.mjs — queued completion without options writes the schema-version-1 record with no assessment |
| 25 | Older done records without a result remain valid. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — expiry test catalogs an older result-less record with its exact blob |
| 26 | Wrap-up stores whatever outcome the skill returns. | slice 3 | |
| 27 | This includes **Insufficient evidence**. | slice 3 | |
| 28 | This includes unavailable cost entries. | slice 3 | |
| 29 | This includes the reasons for those unavailable cost entries. | slice 3 | |
| 30 | If invocation returns no report, wrap-up stores an unavailable result. | slice 3 | |
| 31 | That unavailable result names the reason. | slice 3 | |
| 32 | Wrap-up continues closure when invocation returns no report. | slice 3 | |
| 33 | The check never blocks remaining cleanup decisions. | slice 3 | |
| 34 | The check never delays remaining cleanup decisions. | slice 3 | |
| 35 | Selecting a completed story from Recently done shows its stored result in Intent’s story summary. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — expands the selected completed story's Intent summary and sees the saved report |
| 36 | The summary shows the outcome. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes Outcome: Caught |
| 37 | The summary shows the promise. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes the removed-file promise |
| 38 | The summary shows the fault. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes the fault and its literal markup |
| 39 | The summary shows the evidence. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes assertion failure and restored pass evidence |
| 40 | The summary shows test runtime as recorded. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes the measured 2.1 s test runtime |
| 41 | The summary shows human effort as recorded. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes human effort and its unavailable reason |
| 42 | The summary shows agent effort as recorded. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes estimated agent effort and its basis |
| 43 | The summary shows invocation-to-report elapsed time as recorded. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report includes measured invocation-to-report elapsed time |
| 44 | The summary preserves recorded units. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report retains seconds and minutes |
| 45 | The summary preserves recorded measured labels. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report retains the test runtime and elapsed measured labels |
| 46 | The summary preserves recorded estimated labels. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report retains the agent effort estimated label |
| 47 | The summary preserves recorded unavailable values. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts and dashboard/tests/intent/intent-story-coverage.spec.ts — the unavailable human effort and unavailable test runtime text survive |
| 48 | A story without a result shows no assessment. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — expanded shallow completed story with no result has no heading |
| 49 | Repeating wrap-up for the same story leaves one result. | slice 3 | |
| 50 | Repeating `complete` leaves one result. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — retry with a different result is refused and leaves the original bytes |
| 51 | Wrap-up skips the check when the done record already holds a result. | slice 3 | |
| 52 | The done record remains the durable published fact described by ADR 0008. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — persisted record owns the report while the catalog row carries only its blob and metadata |
| 53 | The dashboard reads the result from the done record the same way it reads the title. | slice 2 | observed: dashboard/src/useIntentStoryLens.ts useDoneStory — the same done record supplies title and result through useDoneDetails |
| 54 | Bounded retrospective corrections are excluded because they add no story promise to check. | slice 3 | |
| 55 | Context-only instructions are excluded because they add no story promise to check. | slice 3 | |
| 56 | Coverage assesses at most one promise per story. | slice 3 | |
| 57 | Test repair is outside scope. | slice 3 | |
| 58 | Creating new finding records is outside scope. | slice 3 | |
| 59 | The manual skill’s outcomes are unchanged. | slice 3 | |
| 60 | The manual skill’s cost entries are unchanged. | slice 3 | |
| 61 | Deciding whether automatic use continues is outside this story. | slice 3 | |
| 62 | A planned feature story has completed. | slice 3 | |
| 63 | Its retrospective identified a weak assertion for its main promise. | slice 3 | |
| 64 | Wrap-up checks that promise. | slice 3 | |
| 65 | The check returns **Caught**. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — supplies a Caught report through the CLI; manual invocation premise in Plan 503 |
| 66 | The report records a 2.1 s measured test runtime. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — supplies the 2.1 s measured test runtime in the report |
| 67 | The report records unavailable human effort. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — supplies unavailable human effort in the report |
| 68 | The report records estimated agent effort. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — supplies estimated agent effort in the report |
| 69 | The report records measured elapsed time. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — supplies measured elapsed time in the report |
| 70 | The developer selects the story in Recently done. | slice 2 | observed: dashboard/tests/support/intentCompletedStory.ts — selects the published Story A card in Recently done before opening Intent |
| 71 | The developer sees the same outcome. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report text includes the same Caught outcome |
| 72 | The developer sees the same test runtime with its label. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report text includes the same test runtime and measured label |
| 73 | The developer sees the same human effort entry with its label. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report text includes the same human effort entry and unavailable reason |
| 74 | The developer sees the same agent effort entry with its label. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report text includes the same agent effort entry and estimated label |
| 75 | The developer sees the same elapsed time entry with its label. | slice 2 | observed: dashboard/tests/intent/intent-story-completed.spec.ts — exact report text includes the same elapsed time entry and measured label |
| 76 | A guidance-only feature story has completed. | slice 3 | |
| 77 | Its promise has no maintained assertion. | slice 3 | |
| 78 | The check returns **Insufficient evidence**. | slice 2 | observed: dashboard/tests/intent/intent-story-coverage.spec.ts — supplies an Insufficient evidence report through the actual complete CLI |
| 79 | The report names the missing assertion. | slice 2 | observed: dashboard/tests/intent/intent-story-coverage.spec.ts — report input names the missing maintained assertion for wrap-up guidance |
| 80 | The done record stores the report. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — Insufficient evidence report is read verbatim from the CLI-written record |
| 81 | Recently done shows **Insufficient evidence**. | slice 2 | observed: dashboard/tests/intent/intent-story-coverage.spec.ts — exact text assertion shows the same Insufficient evidence outcome |
| 82 | Recently done shows the reason. | slice 2 | observed: dashboard/tests/intent/intent-story-coverage.spec.ts — exact text assertion shows the same missing assertion reason |
| 83 | The check is interrupted before returning a report. | slice 3 | |
| 84 | The done record holds an unavailable result. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — expiry test parses the new record's unavailable result |
| 85 | The result names the interruption. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — expiry test compares the exact interruption reason |
| 86 | Closure finishes. | slice 3 | |
| 87 | Recently done shows the result as unavailable. | slice 2 | observed: dashboard/tests/intent/intent-story-coverage.spec.ts — unavailable completion has a visible Unavailable result under Intent coverage |
| 88 | Recently done shows the interruption reason. | slice 2 | observed: dashboard/tests/intent/intent-story-coverage.spec.ts — unavailable completion displays the exact interruption reason |
| 89 | A bounded retrospective correction closes. | slice 3 | |
| 90 | The check does not run. | slice 3 | |
| 91 | The done record has no assessment. | slice 1 | observed: tests/support/product-backlog-complete-done-record.test.mjs — no-option completion retains the existing record shape with no result |
| 92 | Wrap-up repeats for a story whose done record already holds a result. | slice 3 | |
| 93 | No second check runs. | slice 3 | |
| 94 | The record still holds one result. | slice 3 | |
| 95 | A done record was completed 31 days ago. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — expiry setup supplies a 31-day-old report-bearing record through MakeMe |
| 96 | The next `complete` removes that record. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — next complete removes the old record from the directory and catalog |
| 97 | The stored result is removed with it. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs — expiry removes the record file that contained the report |
