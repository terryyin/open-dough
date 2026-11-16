# Source-only review

Reviewer launch: `/root/source_review`, fresh general-purpose agent, `fork_turns: none`.
Input: original selected story Goal, Scope, Deferred promises, Key examples and
Architecture text, transcribed into the launch message; no plan, product, proof,
implementation return or suspected omission. Reviewer was instructed to read no
files and change nothing. The actual launch and numbered return are retained in
this execution conversation. These are the returned ids and qualified texts.

Shared qualification for ids 5–12: each report includes coordinator and worker
figures and their combined total; peaks remain per agent. Ids 28–38 apply to
Cursor using retained transcript evidence. Sample figures retain their original
windows and family boundaries. Ids 54–57 apply when reading history.

Unnumbered context: reproduce effort per host without another audit; equivalent
outcomes, proof and human effort inform improvement. UI, automatic trials or
matching, inferred scores, invoices, new pricing and account-wide completeness
are deferred. Aggregation does not change smaller-story policy. Native snapshots
suffice; no new paid sessions. Compare outcome/proof before interpreting effort.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A read-only local command reports one selected execution. | slice 1 | observed: agent-effort-report.spec.ts selected launch: actual Node CLI/readable+JSON and unchanged home bytes |
| 2 | The command compares a baseline and candidate. | slice 5 | |
| 3 | Selection identifies “the task and its native turn boundary, or an explicitly bounded native session family.” | slice 1 | observed: agent-effort-report.spec.ts selected launch and bounded Claude family: task turn/native family half-open bounds |
| 4 | Ambiguous matches are “explained for correction rather than silently choosing the latest run.” | slice 1 | observed: agent-effort-coverage.spec.ts ambiguous story: error names exact usable task ids |
| 5 | Reports include requests. Published-audit reproduction retains original windows and family boundaries; the Codex SEED-324 family `01a1d22f…` example expects **2,083 requests** in its original audit window. | slice 5 | |
| 6 | Reports include total input. | slice 1 | observed: agent-effort-report.spec.ts selected launch totalInput140 and Claude disjoint64; agent-effort-coverage.spec.ts partial input24 |
| 7 | Reports include cached input. | slice 1 | observed: agent-effort-report.spec.ts selected launch cachedInput70; agent-effort-coverage.spec.ts missing cached counter unavailable |
| 8 | Reports include uncached input. | slice 1 | observed: agent-effort-report.spec.ts selected launch uncachedInput60; agent-effort-coverage.spec.ts known fresh components under missing cache reads |
| 9 | Reports include recorded cache writes, “including lifetime splits.” | slice 1 | observed: agent-effort-report.spec.ts bounded Claude cache lifetimes=6/14; agent-effort-coverage.spec.ts missing lifetime known3/7 partial |
| 10 | Reports include output. | slice 1 | observed: agent-effort-report.spec.ts selected launch output13 excludes next-task900; agent-effort-coverage.spec.ts stored output4 |
| 11 | Reports include peak input per agent. “Peaks are maxima, never summed across agents.” The Claude Code SEED-324 session `296b888d…` example expects a coordinator peak of **752,562 input tokens**. |  | G2 |
| 12 | Reports include observed idle-wake requests. Their counts “use an explicit conservative evidence rule and describe exposure, not requests proved wasteful.” |  | G3 |
| 13 | “Failed, cancelled and later-turn work stays in its owning execution.” |  | G1 |
| 14 | Responses are counted once: “copied ancestor responses and repeated streaming rows count once,” and “Repeating a selection cannot double-charge its responses.” | slice 5 | |
| 15 | “Requested and observed model/effort are distinct.” In the Claude Code example, “the request at launch does not replace those facts.” | slice 2 | observed: agent-effort-settings.spec.ts Codex maxima: requested-model/high separate from observed-one/medium/default and observed-two/low/fast |
| 16 | “Observed changes remain visible.” For Claude Code session `296b888d…`, **Fable/medium** and **Opus/high** are reported separately. | slice 2 | observed: agent-effort-peaks.spec.ts Claude maxima distributions; claude-sample-summary.json122Fable/medium+158Opus/high |
| 17 | Reports name the host. | slice 1 | observed: agentEffortReport.ts host from selected task or explicit host; bounded Claude test observes definition/host selection |
| 18 | Reports name the service tier. | slice 2 | observed: agent-effort-settings.spec.ts default/fast distribution changes; claude-sample-summary.json standard tier |
| 19 | Reports name the selection/window. | slice 1 | observed: agent-effort-report.spec.ts taskId/rootTurnId and explicit from/until assertions |
| 20 | Reports name the accounting definition. | slice 1 | observed: agent-effort-report.spec.ts Claude definition; agentEffortReport.ts Codex inclusive definition and accounting explanation |
| 21 | Reports name their sources. The lost-native-files example further requires recoverable stored counters to appear “with their provenance.” | slice 1 | observed: agent-effort-report.spec.ts native sources; agent-effort-coverage.spec.ts stored-session-contribution history source |
| 22 | Reports name the guidance version; “Missing guidance evidence is unknown.” | slice 2 | observed: agent-effort-settings.spec.ts historical guidance unknown with isolated cwd VERSION changes; actual sample unknown |
| 23 | “A maintainer-supplied version is labelled as supplied, not observed.” | slice 2 | observed: agent-effort-settings.spec.ts --guidance-version0.7.8 explicitly supplied provenance |
| 24 | “Never use today’s installation as evidence about a historical run.” | slice 2 | observed: agentEffortReport/Observations/CLI inspected no VERSION read; historical guidance test independent cwd VERSION changes leave unknown |
| 25 | “Missing ownership, native files, counters or wake evidence remains a named gap.” Examples retain both a missing Cursor worker and lost native files as gaps; the latter identifies “peak/wake/ownership evidence that cannot be reconstructed.” | slice 4 |  |
| 26 | Reports distinguish “known subtotals” from “complete totals.” | slice 1 | observed: agent-effort-report.spec.ts contradictory-worker partial; agent-effort-coverage.spec.ts partial input/lifetime and missing-native provenance |
| 27 | “Unavailable is not zero.” The Cursor example reinforces that a missing worker is “not a zero cost.” | slice 4 |  |
| 28 | Cursor token usage is reported as unavailable. |  | G4 |
| 29 | Cursor unobservable wakes are reported as unavailable. | slice 4 | |
| 30 | Cursor provides reproducible transcript counts. | slice 4 | |
| 31 | Cursor provides reproducible worker counts. | slice 4 | |
| 32 | Cursor provides reproducible byte measures. “Transcript bytes are not token or live-context estimates.” | slice 4 | |
| 33 | Cursor provides reproducible tool-call counts. | slice 4 | |
| 34 | Cursor provides reproducible Read-call counts, “including skill and plan reads.” SEED-313 session `a6169ce7…` expects **eight PLAN.md reads** from its retained transcript. | slice 4 | |
| 35 | Cursor provides reproducible Task-call counts. | slice 4 | |
| 36 | Cursor provides reproducible AwaitShell-call counts. | slice 4 | |
| 37 | Cursor provides reproducible TodoWrite-call counts. SEED-313 session `a6169ce7…` expects **15 TodoWrite calls** from its retained transcript. | slice 4 | |
| 38 | Cursor workflow counting resolves “recorded dynamic-tool wrappers.” | slice 4 | |
| 39 | A comparison shows per-host figures. The linked-continuation example also retains “per-host measures.” | slice 5 | |
| 40 | A comparison shows deltas “for like, known measures.” | slice 5 | |
| 41 | A comparison shows settings differences. | slice 5 | |
| 42 | A comparison shows coverage differences. | slice 5 | |
| 43 | A comparison includes supplied outcome notes. | slice 5 | |
| 44 | A comparison includes supplied proof notes. | slice 5 | |
| 45 | A comparison includes supplied human-intervention notes. | slice 5 | |
| 46 | A comparison “makes no automatic improvement or causal claim.” In the misleading-saving example, candidate tokens fall while effort differs or supplied proof/intervention notes show more rescue: the report shows those differences and deltas “without declaring an improvement.” | slice 5 | |
| 47 | “Unknown or mismatched evidence does not prevent inspecting the known figures.” In the lost-native-files example, recoverable stored counters remain visible. | slice 1 | observed: agent-effort-coverage.spec.ts lost native file retains stored request1/input20/output4 partial with provenance |
| 48 | “Explicitly linked split-story continuations can be grouped for one delivered outcome.” | slice 5 | |
| 49 | Grouping retains each execution’s figures. With “two linked continuation executions on one side and a baseline execution on the other,” the report shows each execution and keeps per-agent peaks. | slice 5 | |
| 50 | That linked-continuation comparison shows “the deduplicated group total.” | slice 5 | |
| 51 | Selecting Codex SEED-324 family `01a1d22f…` with the original audit window reproduces **11 threads**. | slice 5 | |
| 52 | The same selection reproduces **436,806,678 tokens**. | slice 5 | |
| 53 | Whole-execution figures appear separately from the original audit window. Selecting the entire Codex execution “reports its later work too, with a different boundary explicitly named.” | slice 5 | |
| 54 | It does not launch agents. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 55 | It does not call provider APIs. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 56 | It does not refresh Usage. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 57 | It does not rewrite history. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 58 | Reuse the native readers already used by Usage. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 59 | Reuse the response reconciliation already used by Usage. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 60 | Reuse the task ownership already used by Usage. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 61 | “Expose their read phase separately from persistence.” | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 62 | “Extend no workflow authority.” | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 63 | Extend no application database. | slice 1 | observed: compareAgentEffort.ts → agentEffortReport.ts → usageScan.ts inspected local-only read path, shared native readers/collectResponses/associations; actual CLI unchanged-byte assertions; importer remains sole writer, no state/schema extension |
| 64 | “Keep host-specific observation separate from shared accounting.” | slice 4 | |
