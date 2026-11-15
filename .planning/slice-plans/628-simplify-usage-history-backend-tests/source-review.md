# Source-only review

Fresh generalPurpose reviewer (agent `87789b85-b384-45ef-9276-93e96ee62235`),
launched with no conversation inheritance on 2026-11-15. Its input contained
only the selected story's Goal, Scope, key examples and exclusions for
SEED-362#simplify-usage-history-backend-tests. No plan, return, product, proof,
suspected omission or current-slice scope was supplied. It read no project
files and changed none; the completed return is retained below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading a usage-history backend test sees only the native session facts that case proves. | slice 5 |  |
| 2 | Codex rollouts and Claude transcripts come from MakeMe builders (including user, assistant, worker, and session-meta rows; builder defaults keep the data valid, including in-window timestamps). | slice 5 |  |
| 3 | Cases stop importing the harness `at` constant. | slice 5 |  |
| 4 | Overlapping development-driver cases collapse so the family is much shorter and still keeps every distinct behavior check. | slice 5 |  |
| 5 | Maintaining usage-history proof gets cheaper without changing what the dashboard does. | slice 5 |  |
| 6.1 | Shared MakeMe builders exist behind `makeMe` in `Distribution/tests/support/` for a Codex rollout. | slice 1 | observed: Distribution/tests/support/codexRolloutTestData.mjs → makeMe.aCodexRollout via launchMakeMe.mjs |
| 6.2 | Shared MakeMe builders exist behind `makeMe` in `Distribution/tests/support/` for a Claude transcript. | slice 2 |  |
| 7.1 | A case names the session it asserts. | slice 1 | observed: Codex-group cases: forSession / writeCodexSession session facts |
| 7.2 | A case names the turns it asserts. | slice 1 | observed: Codex-group cases: withResponse/withTurnContext turn ids |
| 7.3 | A case names the responses with their usage counters it asserts. | slice 1 | observed: Codex-group cases: withResponse usage counters (e.g. codex-usage own/worker counters) |
| 7.4 | A case names the workers or subagents it asserts. | slice 1 | observed: codex-usage: worker/grandchild spawnedFrom/withParent |
| 7.5 | A case names the launch input it asserts. | slice 1 | observed: launch() / keepLaunchStore session-turn launch facts without case-supplied at |
| 7.6 | A case names the other facts it asserts. | slice 1 | observed: codex-coverage withRow unsupported events; retained-usage settings; reconciliation conflicts |
| 8.1 | The builder derives surrounding rows. | slice 1 | observed: CodexRolloutBuilder.please derives session_meta and collected rows |
| 8.2 | The builder derives ids. | slice 1 | observed: Builder derives response/session ids from forSession/withResponse |
| 8.3 | The builder derives parent links. | slice 1 | observed: spawnedFrom/withParent derive parent_thread_id and spawn source links |
| 8.4 | The builder derives in-window timestamps. | slice 1 | observed: usageHistoryDefaultAt / response timestamp default 2026-11-14T10:00:00.000Z |
| 9 | Builder modules import no dashboard runtime module, as the test data architecture requires. | slice 1 | observed: codexRolloutTestData.mjs: no dashboard runtime import (typedef-free; rows only) |
| 10.1 | The import harness writes a built session to its native file. | slice 5 |  |
| 10.2 | The import harness runs the import. | slice 5 |  |
| 11 | The harness default timestamp is no longer exported to cases. |  | G1 |
| 12 | Usage-history launch setup gets in-window defaults from the builders, not from a case-supplied `at`. | slice 1 | observed: retainedUsageTest.ts launch() defaults launchedAt to usageHistoryDefaultAt |
| 13.1 | Consolidate the family: merge cases whose setup and assertions repeat the same behavior. | slice 5 |  |
| 13.2 | Consolidate the family: regroup specs by concern. | slice 5 |  |
| 14 | Each distinct behavior one of the 47 starting tests proves keeps an observation in a surviving case. | slice 5 |  |
| 15.1 | Update shared helpers under `dashboard/tests/usage-history/` so they describe the new construction boundary. | slice 5 |  |
| 15.2 | Update the builder comment in `usageHistoryTestData.mjs` so it describes the new construction boundary. | slice 5 |  |
| 15.3 | Update the test data architecture guide so it describes the new construction boundary. | slice 5 |  |
| 16 | Any spec this family gains on trunk before execution finishes follows the same builders (such as SEED-357's usage specs). | slice 5 |  |
| 17 | No dashboard product change. | slice 5 |  |
| 18 | A defect the consolidated tests reveal is handled under the project failure policy, not by weakening the assertion. | slice 5 |  |
| 19 | No other backend family migrates: none builds these native rows. | slice 5 |  |
| 20 | Paid native-host evidence helpers in `Distribution/tests/support/` stay as they are. | slice 5 |  |
| 21 | Kept in the case: malformed, unsupported, or deliberately contradictory wire rows and exact bytes under proof. | slice 1 | observed: codex-coverage: withRow unsupported events + appendFileSync truncated JSONL literal |
| 22 | Kept in the case: timestamps, ids, and counters the case asserts, including out-of-window times. | slice 1 | observed: codex-usage: timestamp 2026-09-15T15:59:59.000Z asserted; other counters named in case |
| 23 | Kept in the case: filesystem layout under proof (such as a compressed `.zst` archive or a Claude `subagents/` directory); raw `nativeFile` remains only there. | slice 1 | observed: codex-usage .zst archive nativeFile; codex-coverage partial path + empty broken.zst nativeFile |
| 24 | Key example — Codex own response: a case proving that a task's own response is charged to it builds a rollout for the launched session with one response on the launch's first turn and its counters, then asserts the task usage; it writes no `session_meta` row, no timestamp, and no `at` import. | slice 1 | observed: codex-usage attributes own responses…: builder rollout with responses/counters; no session_meta/timestamp/at import in case |
| 25.1 | Key example — Claude streaming and worker join: the case names the launch. | slice 2 |  |
| 25.2 | Key example — Claude streaming and worker join: the case names the two streamed usage snapshots. | slice 2 |  |
| 25.3 | Key example — Claude streaming and worker join: the case names the worker's usage; the transcript builder supplies the launch-input row with its reporting context, the attachment row, and the `uuid`/`parentUuid` chain. | slice 2 |  |
| 26 | Key example — Time under assertion: a case proving that a response before the import window is excluded states that response's timestamp (`2026-09-15T15:59:59.000Z`); every other row takes the builder's in-window default. | slice 1 | observed: codex-usage: withResponse(..., { timestamp: "2026-09-15T15:59:59.000Z" }) |
| 27 | Key example — Damaged evidence stays visible: a case proving that a truncated JSONL line is reported as damaged keeps the broken bytes literal in the case beside builder-made valid rows. | slice 1 | observed: codex-coverage: appendFileSync(file, "{\"type\":\"token_usage_record\"") beside builder rows |
| 28 | Key example — Consolidation keeps behavior: two starting cases that each prove replay idempotence on their own setup become one assertion in a surviving case, and the plan's inventory names that survivor. | slice 4 |  |
| 29 | Key example — Consolidation keeps behavior (distinct survivor): a behavior only one starting case proved keeps its own case (such as bounded memory on a long Claude parent chain). | slice 2 |  |
| 30 | Key example — Measured result: after execution, the family has fewer test cases and fewer lines than the 47 tests and 4,481 lines above, with no new `at` import, `nativeFile` used only for layout under proof, and the focused backend run of the family is green. | slice 5 |  |
| 31 | Exclusion: do not change dashboard product behavior as part of this work. | slice 5 |  |
| 32 | Exclusion: do not weaken assertions to dispose of defects the consolidation reveals; handle them under the project failure policy. | slice 5 |  |
| 33 | Exclusion: do not migrate any other backend family onto building these native rows. | slice 5 |  |
| 34 | Exclusion: do not change paid native-host evidence helpers in `Distribution/tests/support/`. | slice 5 |  |
| 35 | Exclusion / kept-in-case boundary: do not move malformed, unsupported, or deliberately contradictory wire rows and exact bytes under proof into builder defaults alone; they stay in the case. | slice 1 | observed: same as 21: malformed/unsupported stay in case |
| 36 | Exclusion / kept-in-case boundary: do not hide asserted timestamps, ids, and counters—including out-of-window times—behind builder defaults when the case asserts them. | slice 1 | observed: same as 22: asserted times stay in case |
| 37 | Exclusion / kept-in-case boundary: do not relocate filesystem layout under proof out of the case; raw `nativeFile` remains only there. | slice 1 | observed: same as 23: nativeFile layout only |
