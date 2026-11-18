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
| 2 | Preparing a cold (kept) history gets the 60-second worker budget (Goal; Key example 2) | slice 2 | |
| 3 | Preparing a queued origin, including the native Codex queued origin, gets the 60-second worker budget (Goal; Key example 2; Correction input) | slice 2 | |
| 4 | Each case keeps its full 30-second budget for its private setup and assertions; preparation never extends it (Goal; Key example 2; Correction input; Scope) | slice 6 | |
| 5 | Each case has its own writable origin, checkout, HOME and server, even when cases share a worker (Key examples 1, 3; Correction input) | slice 1 | observed: kept-history-worker.spec.ts: three distinct origins on one worker, kept completion only in the kept origin; each origin is a per-case dough-start-* machine dir that also holds that case HOME and checkout (startOrigin.ts:126-128), served by the case-scoped dashboard |
| 6 | The redundant (superseded) preparation-page opt-ins are removed (Scope; Correction input) | slice 4 | |
| 7 | The pooled fixture declarations are finished, so every worker preparation is declared with its own budget (Scope; title) | slice 2 | |
| 8 | A custom landed-CI boundary server prepares the bundle (Key example 3) | slice 4 | |
| 9 | A development notification server starts from source and makes zero app or bundle requests (Key example 3) | slice 7 | |
| 10 | All three runner groups accept both queued host layouts (Key example 3; Correction input) | slice 6 | |
| 11 | The later-revision override still works (Key example 3) | slice 6 | |
| 12 | Exactly one runtime proof exists for each distinct preparation promise, and one cold run covers timing, private copies and the later-revision override (Scope; Key example 3; Correction input) | slice 7 | |
| 13 | The original scenario assertions and real Git history are kept unchanged (Correction input) | slice 7 | |
