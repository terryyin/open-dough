# Source review

**Launch:** fresh general-purpose sub-agent, no conversation inheritance, on
2026-11-18 before slice 1 delegation. **Input:** the story's Goal, Scope and
Key examples from the [seed section](../../seeds/SEED-340-test-preparation-outside-case-budgets.md#declare-every-worker-preparation-with-its-own-budget)
and the plan's Correction input paragraphs (recovery coordinates omitted). No
plan slicing, product or proof was given; the reviewer read no files.

Unnumbered context returned: six retrospective gaps motivate the correction;
the Codex observation helper is in scope without its own checkable result;
product behavior, other worker resources and new benchmarks are excluded; the
60-second worker budget is an existing baseline; the one-worker run is the
journey for 1 and 5, not a rule.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A preparation-page case runs first or after a case with a different history, on the same worker pool (Goal; Key example 1; Correction input) | slice 1 | observed: dashboard/backend-tests/runtime/kept-history-worker.spec.ts "kept and ordinary histories share one worker": fresh one-worker nested run, ordinary→kept→ordinary all on worker 0 (title/workerIndex toEqual); local worker registration breaks it (kept on 1) |
| 2 | Preparing a cold (kept) history gets the 60-second worker budget (Goal; Key example 2) | slice 2 | observed: kept-history-worker.spec.ts "every worker preparation takes the cold allowance" (keptStory, keptIntentStory, keptSummaryComparisonStory registrations in pageTest.workerPreparationFixtures equal coldInputPreparation; reverting one fails) and "kept setup finishes before the private origin starts" (nested run, each kept fixture ends before its case origin starts); keptComparedStoryBranch cold since slice 1 |
| 3 | Preparing a queued origin, including the native Codex queued origin, gets the 60-second worker budget (Goal; Key example 2; Correction input) | slice 2 | observed: kept-history-worker.spec.ts "every worker preparation takes the cold allowance": the pooled queuedCodexOriginReady equals coldInputPreparation; nested run prepares it only in the case that takes it; other queued origins in serverInputWorkerFixtures already cold |
| 4 | Each case keeps its full 30-second budget for its private setup and assertions; preparation never extends it (Goal; Key example 2; Correction input; Scope) | slice 6 | observed: test-preparation-budget.spec.ts "a cold run prepares both hosts origins before the first case": held layouts complete with no case reported, and each of the 3 cases own origin setup starts after both bases complete (case intervals attached separately); case timeout stays the 30 s default |
| 5 | Each case has its own writable origin, checkout, HOME and server, even when cases share a worker (Key examples 1, 3; Correction input) | slice 1 | observed: kept-history-worker.spec.ts: three distinct origins on one worker, kept completion only in the kept origin; each origin is a per-case dough-start-* machine dir that also holds that case HOME and checkout (startOrigin.ts:126-128), served by the case-scoped dashboard |
| 6 | The redundant (superseded) preparation-page opt-ins are removed (Scope; Correction input) | slice 4 | observed: git grep finds no queuedClaudePreviewTest/queuedCodexPreviewTest in preparationPage.ts readers (slice 3, cae9596) and no queuedClaudeBoundaryTest/queuedClaudeBoundaryReady (slice 4); remaining readiness opt-ins (responsiveStart.ts, Codex-start fixtures, native queuedCodexOriginReady readers, custom dashboard fixtures) supply real readiness to their own consumers per the plan |
| 7 | The pooled fixture declarations are finished, so every worker preparation is declared with its own budget (Scope; title) | slice 2 | observed: kept-history-worker.spec.ts "every worker preparation takes the cold allowance": every non-option registration in pageTest.workerPreparationFixtures (published mains, server inputs and queued origins, kept stories, kept compared branch, launchJourney) equals coldInputPreparation; serverMode (option value) and comparisonRenderer (renderer resource, no input preparation) keep plain worker scope |
| 8 | A custom landed-CI boundary server prepares the bundle (Key example 3) | slice 4 | observed: test-preparation-boundary.spec.ts "a custom landed-CI boundary start has its bundle prepared and requests no app": nested custom-boundary.proof.ts run, no app trace entries, server bundle completed before Fixture startServer; removing dashboardBoundaryReady from startServer failed it |
| 9 | A development notification server starts from source and makes zero app or bundle requests (Key example 3) | slice 7 | |
| 10 | All three runner groups accept both queued host layouts (Key example 3; Correction input) | slice 6 | observed: Backend: same cold run holds claude and codex layouts; Integrated navigation/story-destination-repeat-cue.spec.ts 1/1 and E2E intent/intent-ci-comparison-retry.spec.ts 2/2 request both keys, and withholding each key from each group setup failed naming the key (4 runs, restored byte-identical) |
| 11 | The later-revision override still works (Key example 3) | slice 6 | observed: test-preparation-budget.spec.ts same cold run: overriding case revisions equal the Claude case revisions plus "changed review", main is last, tree unchanged |
| 12 | Exactly one runtime proof exists for each distinct preparation promise, and one cold run covers timing, private copies and the later-revision override (Scope; Key example 3; Correction input) | slice 7 | |
| 13 | The original scenario assertions and real Git history are kept unchanged (Correction input) | slice 7 | |
