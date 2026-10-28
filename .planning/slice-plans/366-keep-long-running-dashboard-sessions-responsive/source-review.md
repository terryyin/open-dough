# Source review — SEED-162#keep-long-running-dashboard-sessions-responsive

**Launch:** Fresh general-purpose source-only reviewer (no plan, product, or
proof). Input: selected story Goal, Scope, key examples, Constraints, and
Deferred promises from
`.planning/seeds/SEED-162-long-running-dashboard-responsiveness.md#keep-long-running-dashboard-sessions-responsive`
only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Memory retained for diagnostics stays bounded for a fixed working set | slice 1 | observed: `dashboard/tests/boundary/live-terminal-diagnostic-capture.spec.ts` — retained/`processExit` ≤ 256 KiB useful tail |
| 2 | Memory retained for cached repository text stays bounded for a fixed working set | slice 5 | observed: `file-content-cache-budget.spec.ts` — retained ≤ 16 MiB with eviction |
| 3 | Memory retained for pending terminal/session observations stays bounded for a fixed working set | slice 4 | observed: `cursor-runner-sessions-demand.spec.ts` — peak outstanding reads = 1 |
| 4 | Session observations progress (do not stall indefinitely under the retention/observation mechanisms in scope) | slice 4 | observed: demand journey leaves Reading and publishes held row; follow journeys green |
| 5 | The terminal header's controls remain usable | slice 6 | observed: `agent-terminal-done.spec.ts` Maximize/Close usable under held Done |
| 6 | Done reports a truthful outcome or an explicit unresolved operation, rather than silently remaining disabled indefinitely | slice 6 | observed: settled Done closes; held/failed leaves recoverable unresolved without refused-intent wording |
| 7.1 | Resolve lifetime raw PTY capture | slice 1 | observed: `TerminalDiagnosticCapture.retain` / `LiveTerminalClient.releaseDiagnosticCapture`; probe above |
| 7.2 | Resolve stale revision text | slice 5 | observed: pinned snapshot stays revision-correct under eviction pressure |
| 7.3 | Resolve output/screen queue pressure | slice 3 | observed: `kept-client-screen-write-queue.spec.ts` — busy+quiet `held()` ~17 ms under 500 ms |
| 7.4 | Resolve unnecessary startup observation after its job ends | slice 2 | observed: `launch-instruction-observation.spec.ts` — after entry+announce, 512 chunks add 0 readiness checks |
| 7.5 | Resolve overlapping Cursor-session polling that discards every slow success | slice 4 | observed: sequential in-flight demand in `RunningCursorSessions.tsx`; slow answers publish |
| 8.1 | Trace partial-control far enough to distinguish a stalled main thread | slice 6 | observed: Maximize still toggles under held Done (main thread responsive); Done waits on request |
| 8.2 | Trace partial-control far enough to distinguish a pending/failed request | slice 6 | observed: held/failed Done → explicit unresolved; distinct from refused mark |
| 8.3 | Trace partial-control far enough to distinguish confirmation state | slice 6 | observed: marking/confirmation remain observable during hold journeys |
| 8.4 | Trace partial-control far enough to distinguish a host operation; repair a confirmed violation | slice 6 | observed: Cursor local-done preserved; shared path unresolved repair without duplicate native stop |
| 9.1 | Measure browser renderer separately | slice 6 | observed: `docs/dashboard-memory-investigation.md` — browser/renderer attribution retained separately (not newly remeasured this slice) |
| 9.2 | Measure dashboard server separately | slice 6 | observed: investigation retained dashboard server RSS (~319–347 MiB) separate from other classes |
| 9.3 | Measure Cursor runner separately | slice 6 | observed: investigation retained Cursor runner RSS (~96 MiB) separately |
| 9.4 | Measure native-agent processes separately | slice 6 | observed: investigation measures native agents separately from dashboard/runner/browser |
| 10.1 | Kept terminal after startup/redraw/detach/reopen: diagnostic retention reaches its declared cap | slice 1 | observed: diagnostic-capture probe — over-budget emit retains ≤ `diagnosticCaptureBudgetBytes` |
| 10.2 | Queued work drains after finite output | slice 3 | observed: write-queue probe burst settles with marker (~12 ms) |
| 10.3 | The correct screen reappears | slice 3 | observed: `kept-client-screen-replay.spec.ts` synchronized-frame/replay preserved |
| 11 | A client exiting before readiness still explains its startup failure with bounded useful diagnostics | slice 1 | observed: diagnostic-capture probe retains useful tail; `agent-terminal-cursor-exit.spec.ts` early-exit explanation still green |
| 12 | Successful startup releases observation that is no longer needed | slice 2 | observed: `LaunchInstruction.observationDone` stops write/evaluate after entered+announced; screen dispose remains on `releaseIdle` |
| 13.1 | Uneven multi-client output: session-observation path remains within its declared bound | slice 3 | observed: write-queue `held()` within 500 ms under 64 KiB/2048-chunk busy sibling |
| 13.2 | Reflects coherent completed screens | slice 3 | observed: quiet sibling coherent and kept in write-queue probe |
| 13.3 | Recovers without treating a still-running client as stopped | slice 3 | observed: busy client remains kept after burst in write-queue probe |
| 14.1 | Expanded Running Cursor with slow reads: completed observations appear | slice 4 | observed: `cursor-runner-sessions-demand.spec.ts` publishes held row after >50 ms fulfills |
| 14.2 | Outstanding demand stays bounded | slice 4 | observed: peak outstanding owned reads = 1 in demand journey |
| 14.3 | Collapse or departure ends owned demand | slice 4 | observed: collapse stops further owned reads in demand journey |
| 14.4 | Background/return behavior preserves recovery | slice 4 | observed: hide pauses starts; show recovers in demand journey |
| 14.5 | 38-request/37-answer reproduction must no longer stay on Reading indefinitely | slice 4 | observed: demand journey leaves Reading with completed observation |
| 15.1 | Repository text past byte budget: old entries can be evicted and reread | slice 5 | observed: over-budget writes evict oldest; reread via rememberFile hits |
| 15.2 | Current snapshot remains revision-correct | slice 5 | observed: pin refreshed under pressure stays correct |
| 15.3 | Post-GC retained memory plateaus for the fixed test working set | slice 5 | observed: retained bytes stable across rounds; further keys leave retained ≤ budget |
| 16.1 | During output and held Done: confirmation state remains observable | slice 6 | observed: hold journeys keep confirmation/marking UI observable |
| 16.2 | Marking state remains observable | slice 6 | observed: useMarking unresolved/marking states surface in Terminal/FinalReport/entries |
| 16.3 | Request state remains observable | slice 6 | observed: pending hold vs unresolved vs refused distinguished in Done journeys |
| 17 | Maximize/Restore and Close respond within the chosen interaction target | slice 6 | observed: Maximize/Close under hold in agent-terminal-done.spec.ts |
| 18.1 | A settled Done answer closes the panel as intended | slice 6 | observed: release after hold closes panel; happy-path Done closes |
| 18.2 | A lost or late answer leaves an explicit recoverable state | slice 6 | observed: wait-bound / failed fetch → "Mark as done did not finish. Try again." |
| 18.2.1 | Without duplicate native operations | slice 6 | observed: late recovery keeps single native stop (claudeStopCalls length 1) |
| 18.2.2 | Without claiming a persisted done intent failed | slice 6 | observed: unresolved copy ≠ refused-intent wording |
| 19 | Preserve the other hosts' existing Done semantics | slice 6 | observed: Cursor local-done + Codex/Claude Done page/boundary specs green |
| 20 | Preserve intentional lifetime of kept sessions; closing a panel does not acquire permission to terminate a kept session | slice 6 | observed: Close under hold leaves keep/session lifetime rules unchanged; Cursor Done still local-only |
| 21 | A memory budget must not silently drop live terminal output | slice 1 | observed: `watch` still forwards every chunk to `idle`/`sockets`; only the diagnostic string is capped/released |
| 22 | A memory budget must not substitute stale project facts | slice 5 | observed: pin stays revision-correct; eviction rereads rather than serving stale |
| 23.1 | Repository records own durable workflow facts (ADR 0008) | slice 5 | observed: in-memory cache only; no durable workflow writes |
| 23.2 | Local caches remain rebuildable (ADR 0008) | slice 5 | observed: miss path rereads via repositoryFileReads; rebuildable |
| 24.1 | Preserve output order | slice 3 | observed: coalesce appends in arrival order; replay specs green |
| 24.2 | Preserve synchronized updates | slice 3 | observed: `kept-client-screen-replay.spec.ts` `?2026` / unfinished paint green |
| 24.3 | Preserve startup/paste confirmation | slice 2 | observed: `cursor-recovery-frame.spec.ts` + `cursor-recover-submitted-chip.spec.ts` paste/handoff/frame regressions green |
| 24.4 | Preserve reconnect/replay | slice 1 | observed: release leaves modeled screen/`idle` path unchanged; no replay owner change |
| 25.1 | Outside this story: a general performance dashboard | | G1 |
| 25.2 | Outside this story: a production telemetry service | | G2 |
| 25.3 | Outside this story: vendor-agent memory optimization | | G3 |
| 25.4 | Outside this story: session-retention policy redesign | | G4 |
| 25.5 | Outside this story: a dashboard-wide rewrite | | G5 |
