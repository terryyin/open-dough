# Source-only review

Fresh general-purpose reviewer (agent `81c88f6d-1837-43ab-9712-dc51f5372a94`),
launched with no conversation inheritance on 2026-11-15. Its input contained
only SEED-354#remove-configuration-only-tests Goal, Scope, Examples, and Test
guidance already updated. No plan, return, product, proof, suspected omission,
or current-slice scope was supplied. It read no project files and changed none.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer can change internal configuration and test data without editing assertions that merely duplicate those values. | slice 5 |  |
| 2 | Meaningful behavior remains protected when configuration or test data changes. | slice 5 |  |
| 3 | Review unit tests and relevant end-to-end tests across Distribution, dashboard backend, frontend and integrated UI, and e2e for assertions whose only subject is configuration, constant data, fixture shape, or builder output. | slice 5 |  |
| 4 | Remove configuration/data-only tests and redundant constraints. | slice 5 |  |
| 4.1 | Exact worker/shard counts that freeze implementation choices. | slice 3 |  |
| 4.2 | Workflow literals that freeze implementation choices. | slice 1 | observed: Removed deadline-epoch, artifact-name, browser roster/YAML regexes, frontend-entry/retention, path-ignore lists, feature-group directory set, attempt-fragment name literal, hand-written job labels; Distribution + ci-time family green after consistent shard/deadline/retention/rename |
| 5 | Keep or reshape proof when a configuration or data value produces meaningful behavior worth protecting, by observing that behavior rather than copying its inputs. | slice 5 |  |
| 6 | When a behavior test’s expected output copies a configured value, derive that expectation from the configuration it reads. | slice 1 | observed: ci-proof-actions missingTail from summary expect; jobForRoot from producers; ci-time rows from readWorkflowJobs; PR-head revision via runAttempt |
| 7 | Keep a check that two settings agree with each other (for example a summary’s declared parts and the matrix that writes them), because it catches an inconsistent change. | slice 1 | observed: Kept needs=producers and declared parts=matrix lengths; inconsistent expect still fails declaration+actions |
| 8 | Do not delete behavior tests merely because their setup uses configuration or data. | slice 5 |  |
| 9.1 | Preserve checks such as independent concurrent reports. | slice 1 | observed: Kept cutoff behavior, frontend report incompleteness, multi-producer proof replay, shard partition proofs |
| 9.2 | Preserve checks such as complete selection/proof. | slice 4 |  |
| 9.3 | Preserve checks such as useful validation behavior. | slice 5 |  |
| 10 | Do not replace removed assertions with another snapshot of the same data. | slice 5 |  |
| 11 | Remove tests that only restate shipped skill and reference wording (the former `*-guidance.test.mjs` family), because they keep the same text in a second place. |  | G1 |
| 12 | Keep tests that run a documented example, embedded recipe, or formatter block through the code that consumes it. | slice 5 |  |
| 13 | Treat rendered style values (`toHaveCSS`) as observed results, not removal candidates. |  | G2 |
| 14 | Treat files the product writes after a user action as observed results, not removal candidates. |  | G3 |
| 15 | During the audit, apply the already-updated test-automation wording to examples found in the suite. | slice 5 |  |
| 16 | Check whether that wording clearly tells authors and reviewers when to remove an assertion and when to keep or rewrite it to verify observable behavior. | reporting |  |
| 17 | Flag any example the wording does not resolve and suggest a focused clarification. | reporting |  |
