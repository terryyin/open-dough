# Independent source review

Launch `/root/source_review`, a fresh agent without inherited conversation.
The only project input was the Goal and Scope from the [selected story](../../seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#type-check-reports-after-a-lint-failure).

The reviewer identified the already delivered type-check behavior and preservation
of the workflow and other checks as source context.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The maintained check accepts the delivered condition of the `lint` job’s dashboard type-check step. The step runs once dependencies are installed and the run is not cancelled, whatever the lint steps did. (Scope) | slice 1 | observed: Slice 1 proof table, delivered guard; delivered.cases and delivered.log.run.json |
| 2 | The maintained check fails when a changed condition names a lint step and makes the type-check depend on lint. (Goal and Scope) | slice 1 | observed: Slice 1 proof table, extra lint dependency; names-lint.log and names-lint.log.run.json |
| 3 | The maintained check fails when a changed condition skips the type-check after an earlier failure through another mechanism. (Scope) | slice 1 | observed: Slice 1 proof table, earlier-failure guards; requires-success.log and forbids-failure.log with their run records |
| 4 | The maintained check also fails for any other departure from the delivered condition. The two named cases illustrate the rule that “Any other condition fails the check.” (Scope) | slice 1 | observed: Slice 1 proof table, other departures; condition-absent.log, cancellation-absent.log and names-lint-tools.log with their run records |
