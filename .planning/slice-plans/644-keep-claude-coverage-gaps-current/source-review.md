# Source review: Keep Claude coverage gaps current after Refresh

Launch: fresh general-purpose subagent (Sonnet), no conversation inheritance,
on 2026-11-15 before slice 1 delegation. Input: only the selected story's
**Goal** and **Scope** paragraphs from
`.planning/seeds/SEED-359-claude-code-task-token-usage.md#keep-claude-coverage-gaps-current-after-refresh`
at `1fef1e740`, with the instruction to read no other files, change nothing,
and return numbered commitments, qualifications, examples and exclusions.

Returned qualifications: 12 and 13 hold for unchanged native files; the
Refresh timings in 2 and 3 are named triggers, not an exhaustive list; 6.1 is
existing behavior used as the model, not a new promise.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: Terry, reading System settings → Usage, sees a dashboard launch marked partial only while its usage is actually missing. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts 'a Claude launch refreshed before its first response…': stored missing-root-transcript-usage while unanswered, coverage measured after the response |
| 2 | A Refresh taken before a launch's first response no longer leaves that launch partial once its responses arrive. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts 'a Claude launch refreshed before its first response…': after the response and Refresh, coverage {kind:measured} |
| 3 | A Refresh taken before a worker answers no longer leaves that launch partial once its responses arrive. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts 'a Claude worker that answers after a Refresh…': incomplete-worker-evidence clears once the worker answers; launch {kind:measured} once the nested worker answers |
| 4 | Once its responses arrive, such a launch is no longer left out of the moving average (it is included). | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts 'a Claude launch refreshed before its first response…': average [{at: day(10), value: 1_950}] once the tenth launch is measured |
| 5 | Scope: a bounded retrospective correction of View token usage for dashboard-launched Claude Code tasks (references: SEED-359 `#view-claude-code-task-token-usage`, commits 83276a56, 65210f8d, 3f463b92, bbc0be6e). | slice 2 | observed: branch diff 1fef1e740..HEAD limited to gap reconciliation, USAGE-HISTORY.md wording, the new backend spec and the trimmed e2e/configuration/system-settings-usage-tools.spec.ts |
| 6 | A session read again replaces the coverage gaps it recorded. | slice 1 | observed: dashboard/server/usageGapReconciliation.ts reconciledGaps drops a re-read session's stored gaps it no longer reports; observed by all three cases in dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts |
| 6.1 | This is the same way a session read again already replaces its usage contribution (existing behavior as the model). | slice 1 | observed: dashboard/server/usageHistory.ts writeUsageHistory passes the same 'replaced' sessionKey set used for contributions to reconciledGaps |
| 7 | A Claude worker's gap reaches its launch through the Claude session it belongs to. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts 'a Claude worker that answers after a Refresh…': gap sourced in subagents/agent-worker.jsonl gives SEED-7#claude-2 {partial,[missing-worker-evidence]} via gapSessions (usageGapReconciliation.ts) in TaskGaps.record |
| 8 | The usage-history contract names the stored cache-write split. | slice 1 | observed: dashboard/USAGE-HISTORY.md session contribution paragraph: 'the five-minute and one-hour cache writes while every response split them' |
| 9 | The usage-history contract names Claude's speed tier. | slice 1 | observed: dashboard/USAGE-HISTORY.md grouping sentence 'service tier (Codex service_tier, Claude speed)', which the contribution paragraph's 'service tier' refers back to |
| 10 | The Claude Code Usage end-to-end journey keeps only the case that needs real services. | slice 2 | observed: e2e/configuration/system-settings-usage-tools.spec.ts holds one journey 'Refresh brings in a Claude launch finished since the last check' (real import, choose Claude Code, Refresh, Nov 6/Nov 8 · 6,000); removed checks owned by dashboard/frontend-tests/system-settings-usage-tool.spec.ts, token-index-claude.spec.ts and system-settings-usage.spec.ts |
| 11 | No new product promise is made. | slice 2 | observed: slice 1 product diff (usageGapReconciliation.ts, usageHistory.ts, usageTaskGaps.ts) changes only gap replacement/attribution; slice 2 changes only e2e/configuration/system-settings-usage-tools.spec.ts |
| 12 | Codex answers stay as they are (for unchanged native files). | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-claude-gaps.spec.ts Codex case partial→measured after response; existing usage-history Codex specs pass (91 passed, npm run test:dashboard:backend -- usage-history) |
| 13 | The offline import's results stay as they are (for unchanged native files). | slice 1 | observed: existing usage-history import specs (import equals Refresh, byte stability, earlier stores) pass in the 91-pass usage-history backend run |
