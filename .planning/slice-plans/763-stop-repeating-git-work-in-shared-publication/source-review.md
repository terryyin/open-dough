# Source-only review

The fresh source reviewer `source_review` received only the selected SEED-421 Goal, Current behavior, Scope, and Key examples in its launch. The execution conversation retains the launch input and the numbered return.

The original case is [the blank Default main launch test](../../../dashboard/backend-tests/launches/declared-blank-launch-publication.spec.ts). The source retains the prior timings and the decision to preserve the existing test. Retirement was an area to consider within its current ownership and containment checks. Full suites before implementation landing are a delivery gate.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The existing blank Default main launch test starts fewer Git processes than the original trace’s 61 when the launch declares a worktree and publishes an unchanged-base candidate. Goal, Current behavior, and Key examples. | slice 3 |  |
| 2 | The same test completes within the 5 s default timeout at representative load around 25. Goal and Key examples. | slice 3 |  |
| 3 | Shared publication reuses Git observations while valid, including repeated reads of immutable candidate facts for the same commit. Goal and Scope. | slice 1 | observed: s1-after-single.trace start 28 and s1-baseline-single.trace starts 28–29, candidate tree reads 2 to 1 with the unchanged installed-publisher journey passing |
| 4 | Immutable candidate facts are reused only for the same commit. Scope. | slice 1 | observed: publication-misplaced-agent-profile.test.mjs, hold of different candidate IDs after initial and retry replay |
| 5 | Publication freshly observes the authorized target at every boundary that requires fresh remote evidence, including observing newer trunk when it advances before a push succeeds. Scope and Key examples. | slice 2 | observed: s2-after-single.trace root starts 37–38 and 42–43; exact named remote and missing target in execution-increment-publication-confirmation.test.mjs, refetch on competing push in execution-increment-comparison.test.mjs |
| 6 | Ordinary push remains available. Scope. | slice 2 | observed: s2-after-single.trace exact ordinary push and matching receipt from the unchanged declared blank launch case |
| 7 | Publication keeps retry bounded. Scope. | slice 2 | observed: execution-increment-managed-delivery-transport.test.mjs bounded rejection and confirmation timeout with one receive-pack after recovery, and publication-racing-suffix.test.mjs second rejection stop |
| 8 | Publication retains its refusal behavior. Scope. | slice 1 | observed: publication-completed-identity.test.mjs and publication-misplaced-agent-profile.test.mjs, refusal holds original or rewritten candidate before publication |
| 9 | Publication retains reporting-only recovery. Scope. | slice 3 |  |
| 10 | Retirement remains safe under its ownership and containment checks. Scope. | slice 3 |  |
| 11 | Retirement preserves another writer’s work. Scope. | slice 3 |  |
| 12 | The accepted comparison survives branch retirement in the blank Default main journey. Key examples. | slice 3 |  |
| 13 | The accepted comparison’s pins survive branch retirement in that journey. Key examples. | slice 3 |  |
| 14 | The accepted comparison survives an exact reporting retry in that journey. Key examples. | slice 3 |  |
| 15 | The accepted comparison’s pins survive exact reporting retry in that journey. Key examples. | slice 3 |  |
| 16 | Deleting the launch record removes those pins. Key examples. | slice 3 |  |
| 17 | When trunk advances before a push succeeds, publication checks the rewritten candidate. Key examples. | slice 1 | observed: publication-misplaced-agent-profile.test.mjs, rewrite after updated first fetch or rejected push holds new candidate with unchanged competing trunk and no receipt |
| 18 | Publication retains the rewritten candidate before retry. Key examples. | slice 2 | observed: execution-increment-comparison.test.mjs beforePush comparison for attempt 1 matches the rewritten accepted SHA |
| 19 | Publication retains that candidate’s actual suffix base before retry. Key examples. | slice 2 | observed: execution-increment-comparison.test.mjs beforePush comparison for attempt 1 uses the competing target SHA as the actual suffix base |
| 20 | A second push rejection preserves the work. Key examples. | slice 2 | observed: publication-racing-suffix.test.mjs second rejection preserves the once-rewritten candidate and existing target, with one reconciliation |
| 21 | When recording a prepared pair, the receiver confirms remote containment before accepting the landing. Scope and Key examples. | slice 3 |  |
| 22 | Recording a prepared pair with existing healthy pins requires no repeated pin writes. This is the concrete case of reusing valid ref writes. Goal and Key examples. | slice 3 |  |
| 23 | A reporting retry after acceptance returns the same receipt. Scope and Key examples. | slice 3 |  |
| 24 | The test keeps its default timeout setting. Scope. | slice 3 |  |
| 25 | The existing test assertions are preserved. Scope. | slice 3 |  |
| 26 | The retirement fixture keeps its pruning check. Scope. | slice 3 |  |
