# Source review

Replaced after Terry's 2026-11-16 Evaluation amendment: a second fresh
general-purpose agent reviewed the amended Goal, Scope, Scope limits, Key
examples and Evaluation (job tmp `story-amended.md`), keeping the earlier ids;
it merged the deferrals into X1–X2 and added X3a–X3b. First review:
2026-11-16, fresh general-purpose agent without conversation
inheritance, before slice 1 delegation. Input: the selected story section's
Goal, Scope, Scope limits, Key examples and Evaluation, verbatim from
`.planning/seeds/SEED-388-measure-and-control-agent-launch-cost.md#count-claude-code-work-after-a-developer-reply`;
instructed to read no project files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer or maintainer reading System settings → Usage sees the whole cost of a dashboard launch on Claude Code and Codex, including the work after they answered, chose an option or nudged it. | slice 2 | observed: real store recomputed from backup at 0a58de1 (job tmp final/clean-store.json, final/evalc-clean.out): no launch index decreased or became unpriced (compare.ts, unpriced.ts vs the pre-story backup); 184 Claude and 155 Codex launches rose |
| 2a | A later developer input in a launch's session belongs to that launch. | slice 1 | observed: token-index-developer-reply.spec.ts (Claude reply "1": 6,850) and dashboard/backend-tests/usage-history/token-index-developer-reply-codex.spec.ts (Codex reply "yes": 2 responses/400) |
| 2b.1 | Claude Code: the root responses of a later-input turn count in the launch's Token index. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts 'a Claude Code reply's root response and the worker it starts count in the launch': index 6,850 includes reply root 2,950 |
| 2b.2 | Claude Code: the subagent responses of a later-input turn count in the launch's Token index. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts same test: worker joined after the reply adds 1,950 to the launch index |
| 2b.3 | Codex: the root responses of a later-input turn count in the launch's Token index. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply-codex.spec.ts 'a Codex reply turn's responses count in the launch': responses 2, output 400 |
| 2b.4 | Codex: the worker responses of a later-input turn count in the launch's Token index. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply-codex.spec.ts 'a Codex worker spawned in the reply turn counts once in the launch': worker entry responses 1, output 70 |
| 2c | One rule serves both tools. | slice 1 | observed: dashboard/server/nativeTaskCorroboration.ts input(): one active-task rule called by codexTaskReader and claudeTaskReader (nativeTaskFacts.ts) |
| 2d | A later-turn worker counts once. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply-codex.spec.ts Codex worker test: exactly one worker entry with responses 1 |
| 2e | Responses a worker copies from its ancestors are not counted as that worker's own. | slice 1 | observed: dashboard/backend-tests/usage-history copied-ancestor cases in codex-usage.spec.ts / codex-coverage.spec.ts green unchanged in the consumer run |
| 3a | The launch keeps later inputs until an input in the same session starts another task. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts 'a Claude Code workflow typed after an execution…' and '…slash workflow without arguments…': execution output 400 stops at /dough-land |
| 3b.1 | A recognised Open Dough workflow invocation in the same session starts another task. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts same two tests: /dough-land typed or as an argless slash command counts in dough-land (1,600) |
| 3b.2 | Another dashboard launch's reporting context in the same session starts another task. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts 'another dashboard launch's reporting context after a Claude Code reply…': outputs {A: 400, B: 1,600}, 4 associations |
| 3c | From the task-starting input onward, the turns belong to the new task. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts same two tests: dough-land task holds the land and later 'ok' responses (700+900) |
| 3d | No response counts in two tasks. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts same two tests: exactly 4 associations for 4 responses |
| 4a | A response whose turn cannot be shown to belong to any task stays an explained coverage gap. | slice 1 | observed: Codex unresolved and contradictory-lineage cases in codex-usage.spec.ts / codex-coverage.spec.ts green in the consumer run; the Claude unresolved-native-task-lineage assertion was removed from claude-usage.spec.ts by slice 1 and is carried to wrap-up's intent-coverage check |
| 4b | No turn is charged to a launch by time window alone. | slice 1 | observed: dashboard/server/nativeTaskFacts.ts: turns added only from the reader's ordered user inputs, no timestamp comparison |
| 5 | A reported completion does not end the launch; later inputs after it still count in the launch. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts 'a Claude Code reply after the launch's completion report still counts in the launch': index 4,900 |
| 6a | A launch with a single input keeps its value. | slice 1 | observed: token-index-refresh-claude.spec.ts and token-index-refresh.spec.ts values unchanged, green in the consumer run |
| 6b.1 | Which launches Usage shows stays unchanged. | slice 1 | observed: no change to chart, tariff, pricing or task-detail code (diff limited to native task reading); token-index specs green unchanged in the consumer run |
| 6b.2 | The tariff stays unchanged. | slice 1 | observed: no change to chart, tariff, pricing or task-detail code (diff limited to native task reading); token-index specs green unchanged in the consumer run |
| 6b.3 | Pricing stays unchanged. | slice 1 | observed: no change to chart, tariff, pricing or task-detail code (diff limited to native task reading); token-index specs green unchanged in the consumer run |
| 6b.4 | Coverage gaps stay as they are, apart from turns that a task now owns. | slice 1 | observed: gap code unchanged; recovered-boundaries and coverage specs green unchanged in the consumer run |
| 6b.5 | The chart stays unchanged. | slice 1 | observed: no change to chart, tariff, pricing or task-detail code (diff limited to native task reading); token-index specs green unchanged in the consumer run |
| 6b.6 | Task detail stays unchanged. | slice 1 | observed: no change to chart, tariff, pricing or task-detail code (diff limited to native task reading); token-index specs green unchanged in the consumer run |
| 7a | Retained records are recomputed from the native transcripts still on the machine. | slice 2 | observed: real store recomputed from backup at 0a58de1 (job tmp final/clean-store.json, final/evalc-clean.out): importer reread retained transcripts; 2a–2d figures from the recomputed store |
| 7b | A launch whose transcripts are gone keeps its recorded value. | slice 2 | observed: dashboard/backend-tests/usage-history/recovered-corroboration.spec.ts first test: after rmSync of the transcripts and reimport, the task keeps its title and output 108 |
| 8a | Claude Code executions with a later developer input match their transcript cost from launch until the next task-starting input, except responses lost to a separate reader gap (measured 94 of 111 within 1%, 106 within 3%). | slice 2 | observed: real store recomputed from backup at 0a58de1 (job tmp final/evalc-clean.out): 94 of 111 within max(1%, 1,000), 106 within 3%; below-cost cases SEED-334 and SEED-124 are the reader gaps X3a, X3b; two live sessions |
| 8b | None of the 84 Codex launches with a later developer turn leaves that turn's responses without a task. | slice 2 | observed: real store recomputed from backup at 0a58de1 (job tmp final/clean-store.json, final/evalc-clean.out): 427 Codex launches, 159 with a later developer turn, 0 with an unclaimed later developer turn |
| 8c | The two Codex examples gain their later-turn root and worker responses. | slice 2 | observed: real store recomputed from backup at 0a58de1 (job tmp final/clean-store.json, final/evalc-clean.out): SEED-324 01a1d22f 6.23M → 31.31M (later root 22.36M, later workers 2.71M); SEED-073 01a1d285 29.84M → 80.26M (later root 29.69M, later workers 25.05M) |
| X1 | Deferred: splitting a launch's cost by turn, or showing the developer's inputs in task detail. |  | E1 |
| X2 | Deferred: changing how sessions started outside the dashboard are recovered as tasks. |  | E2 |
| X3a | Deferred to its own story: second-level background agents whose responses a reader gap loses. |  | G4 |
| X3b | Deferred to its own story: rows split at U+2028/U+2029 that a reader gap loses. |  | G5 |
