# Keep long-running dashboard sessions responsive with bounded memory

**Identity:** SEED-162#keep-long-running-dashboard-sessions-responsive
**Source:** [Selected story](../../seeds/SEED-162-long-running-dashboard-responsiveness.md#keep-long-running-dashboard-sessions-responsive)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer leaving the dashboard open while agents produce terminal output
and published project revisions change keeps diagnostics, cached repository
text, and pending terminal/session observations within declared budgets for a
fixed working set. Session observations progress, terminal-header controls
remain usable, and Done reports a truthful outcome or an explicit unresolved
operation rather than silently remaining disabled indefinitely.

Resolve the confirmed retention and observation mechanisms on this journey:
lifetime raw PTY capture, post-startup launch observation, uncapped screen
write queues, overlapping Cursor-session polling that discards slow successes,
unlimited browser repository-text retention, and pending Done that can leave
only that control looking stuck. Measure browser renderer, dashboard server,
Cursor runner, and native-agent processes separately when comparing memory.
Preserve output order, synchronized updates, startup/paste confirmation,
reconnect/replay, kept-session lifetime, and ADR 0008 (repository records own
durable facts; local caches remain rebuildable). Closing a panel does not
authorize terminating a kept session. Do not silently drop live terminal
output or substitute stale project facts to meet a budget.

**Excluded:** a general performance dashboard, production telemetry service,
vendor-agent memory optimization, session-retention policy redesign, a
dashboard-wide rewrite, and end-to-end WebSocket parse-ack flow control unless
a later measurement shows the screen-queue bound alone cannot keep interaction
within the budgets below. A native multi-hour incident reproduction is useful
evidence when available, not a gate on the confirmed repairs.

## Existing solution and architectural direction

PFE across the dashboard session, terminal, and authenticated-read path found
existing owners for each confirmed mechanism. Change those owners; do not add
a parallel store, polling framework, or lifecycle service.

- **Reuse / change** `LiveTerminalClient` (`dashboard/server/liveTerminalClient.ts`)
  for raw `captured` growth and `processExit` text.
  `settleKeep` / `terminalKeep.ts` are the inspected consumers that need early
  exit explanation; reconnection already uses the separately modeled screen.
  Bound the capture and release it after a successful keep rather than
  inventing a second transcript store.
- **Change** `LaunchInstruction` lifetime on the same client: after successful
  startup handoff it currently keeps a headless evaluator on every later chunk.
  End that observation once startup and paste/handoff obligations are settled;
  dispose through the existing release path, not a new observer registry.
- **Change** `KeptClientScreen.write` (`dashboard/server/keptClientScreen.ts`):
  its uncapped Promise chain is the measured queue. Bound or coalesce pending
  writes while preserving order and synchronized-frame readiness so
  `TerminalAttachments.held()` / runner `/sessions` cannot be stalled by one
  busy sibling. Do not replace headless xterm or invent a second screen model.
- **Change** `RunningCursorSessions.tsx` demand: today a 50 ms `setInterval`
  starts a new read without awaiting or aborting the previous (`latest`
  sequence discards late successes). Keep the section's existing expand /
  collapse ownership; replace overlapping demand with at most one in-flight
  read and stop owned demand on collapse or sidebar departure. Visibility
  pause is in scope when cheap; do not add a general polling framework.
- **Change** browser `fileContentCache.ts` using the same disposable-cache
  idea as server `RevisionMemo` (entry FIFO) and especially `RetainedAnswers`
  (byte budget + LRU). Reads already miss and reread via
  `repositoryFileReads.ts`. Add an in-browser byte budget with eviction; do
  not couple the browser Map to the on-disk retained-answers store or change
  durable workflow records.
- **Change** the shared Done marking path (`requestMarkDone` /
  `sessionRecordRequests.ts`, `useMarking` / `pageSessions.ts`, `postJson`) so
  a pending or late answer leaves an explicit recoverable state while Maximize
  and Close stay usable. Host-specific Done semantics (Cursor local
  acknowledgement; Claude/Codex native rename bounds) stay with
  `doneMarks.ts` / each host. Do not claim a failed persisted done intent when
  the request never completed, and do not duplicate native operations on
  recovery.

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
derived caches remain disposable; repository records own durable workflow
facts; panel close preserves intended host/session lifetime. No North Star
topic is warranted. Research evidence and source paths live in
[docs/dashboard-memory-investigation.md](../../../docs/dashboard-memory-investigation.md).

## Budgets (current decisions)

Chosen from the investigation baselines so execution and proof share one
declared working set. Adjust only with a recorded learning if measurement
disproves them.

| Concern | Budget |
| --- | --- |
| Raw capture while keep/exit is unsettled | At most **256 KiB** retained diagnostic text (tail), enough for startup-exit explanation |
| After successful keep | Release raw capture; reconnection and live attach use the modeled screen / sockets, not the lifetime string |
| Screen write queue | One busy client's pending chain must not keep `held()` / all-session reads above **500 ms** for the 64 KiB / 2,048-chunk synthetic shape that previously took ~2.3 s; quiet siblings stay coherent and are not treated as stopped |
| Running Cursor observation | **At most one** in-flight sessions read while the section is open; schedule the next only after the prior settles (minimum gap may remain ~50 ms); collapse, sidebar close, or departure ends owned demand; document-visibility pause when cheap |
| Browser file cache | **16 MiB** total retained text, LRU (or equivalent) eviction; miss path rereads; current revision snapshot stays correct |
| Interaction under load | Maximize/Restore and Close remain usable during sustained output and during a held Done request; Done either completes and closes as today or surfaces an explicit recoverable unresolved state without duplicate native work |

Process attribution when comparing memory: record browser/renderer, dashboard
server, Cursor runner, and native-agent RSS/heap separately. Post-GC retained
size for the fixed synthetic working set must plateau after each owning slice's
repair; peaks may be noted but do not replace the plateau check.

## Observed premises and proof limits

Preparation inspected revision
`0e6bc17a7db19c239755582bb69423c1f8dac0fa` in
`/Users/terryyin/git/open-dough/.worktrees/keep-long-running-dashboard-sessions-responsive`.
Controlled measurements cited below were recorded against dashboard source
unchanged between `f18004383c6e3ca4b109574bf879cba529a82065` and
`9b4a7a8212390fb627a92b213a5c8ef9c7f08e41` in
[docs/dashboard-memory-investigation.md](../../../docs/dashboard-memory-investigation.md).

- `LiveTerminalClient.watch` still appends every PTY chunk to `captured` with
  no limit or successful-keep reset; `processExit` resolves that full string.
  `settleKeep` awaits `processExit` only on the early-exit path. Consuming
  operation: keep settlement / startup-exit explanation.
- Investigation Node probe: 32 MiB synthetic output raised retained heap by
  ~32 MiB with all characters still present in the exit result. That settles
  unbounded capture growth for this mechanism; it is not a native multi-hour
  or browser-renderer attribution.
- `LaunchInstruction` still receives `launch?.write` after announcing
  `firstScreen`. Investigation: after one instruction entry, 512 further chunks
  caused 512 additional readiness evaluations. Consuming operation: post-startup
  observation lifetime.
- `KeptClientScreen.write` still chains uncapped `pending` Promises. Probe:
  64 KiB in 2,048 chunks settled in ~2.3 s vs ~8.6 ms as one chunk; with two
  synthetic PTYs, one busy client delayed `held()` to ~2.39 s while the other
  stayed quiet. Consuming operation: screen settle and runner all-session read.
- `RunningCursorSessions` still uses `refreshMs = 50` with `setInterval(read)`
  and `mine === latest` without in-flight limit. Browser probe: 38 requests /
  37 successful answers while the UI stayed on Reading. Existing
  `cursor-runner-sessions` journeys cover happy-path follow of later answers
  under batch-held-then-release; they do not yet discriminate continuous
  slower-than-interval fulfillment.
- `fileContentCache.rememberFile` still only `set`s into a module Map. Probe:
  256 × 64 KiB independent keys all survived GC (~16 MiB retained). Server
  `RevisionMemo` (500 entries) and `RetainedAnswers` (default 64 MiB disk LRU)
  remain the eviction patterns to mirror in the browser, not shared stores.
- Done path: `postJson` is a bare `fetch`; `useMarking` stays marking until the
  Promise settles. Held-response browser probe kept Done disabled for 60 s of
  virtual time while Maximize still toggled to Restore; releasing the request
  closed the panel. Cursor Done is a local acknowledgement. This settles the
  pending-request partial-control mechanism; it does not attribute the original
  production incident's host or backend stall.
- Proof routes to extend (commands unpaid once dependencies are installed):
  `npm run test:dashboard --` with focused paths under
  [dashboard/tests/README.md](../../../dashboard/tests/README.md)
  (`boundary/agent-terminal-cursor-exit.spec.ts`,
  `boundary/kept-client-screen-replay.spec.ts`,
  `boundary/cursor-recovery-frame.spec.ts`,
  `cursor-runner-sessions.spec.ts`,
  `agent-terminal-done.spec.ts` + `holdDoneRequests`). No discriminating
  bound/starvation/eviction proofs exist yet; slices add them. This preparation
  checkout had no `node_modules`; fixture discrimination of the new proofs is
  an execution obligation, not a blocked premise for the approach.

No outstanding infrastructure premise or human-owned decision blocks this plan.
Full WebSocket parse-ack flow control stays deferred unless a slice-3 learning
shows the queue bound insufficient. Original-incident process attribution is
evidence when available, not a readiness gate.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Diagnostic capture stays within 256 KiB before keep/exit; successful keep releases it; early exit still explains with useful bounded text | 1 | Boundary/module probe: emit more than the budget into a watched client → retained/`processExit` length ≤ budget (tail); successful keep path leaves capture released; existing early-exit explanation specs stay green with text still present under the cap |
| After successful startup handoff, further output does not keep launch readiness evaluation running | 2 | In-process count: after `firstScreen` / instruction entry settles, N further chunks produce no additional launch readiness evaluations (or observer disposed); paste/handoff and recovery-frame regressions stay green |
| 64 KiB / 2,048-chunk burst settles and does not stall a quiet sibling's all-session read beyond 500 ms; screens stay coherent; running client not treated as stopped | 3 | Boundary probe on real `KeptClientScreen` / `TerminalAttachments.held()` matching the investigation shape; marker appears; quiet sibling included; compare against prior ~2.3 s baseline |
| Expanded Running Cursor publishes completed observations under >50 ms answers; outstanding demand bounded; collapse ends demand; no indefinite Reading under the 38/37 shape | 4 | Journey or route fixture: each fulfill waits past the next interval; list leaves Reading with a completed observation; request count stays bounded; collapse stops further owned reads |
| Repository text over 16 MiB evicts old entries, rereads correctly, current snapshot revision-correct; post-GC retained size plateaus for the fixed key set | 5 | In-process or journey: many revision keys past budget → oldest miss and reread; current pin correct; retained size plateaus after GC |
| During output and held Done, Maximize/Close usable; settled Done closes as intended; lost/late answer → explicit recoverable state without duplicate native Done | 6 | Extend `agent-terminal-done` hold journey: Maximize toggles under hold; release completes; separate late/failed fetch leaves recoverable UI; Cursor local-done semantics preserved; Claude/Codex Done regressions touched by the shared path stay green |

## Ordered slices

### 1. Bound and release raw terminal diagnostic capture
Type: Behavior
Status: done
Proof: Accepted —
`env -u NO_COLOR FORCE_COLOR=0 npm run test:dashboard -- dashboard/tests/boundary/live-terminal-diagnostic-capture.spec.ts dashboard/tests/boundary/agent-terminal-cursor-exit.spec.ts --reporter=list`
(4 passed). Probe: over-budget emit retains ≤256 KiB useful tail for
`processExit`; successful `settleKeep` releases capture so later output does
not accumulate. Early-exit explanation regressions remain green.

Behavior: A kept client is watched and emits more output than the diagnostic
budget before keep settles, or exits during startup → retained diagnostic text
stays within 256 KiB (useful tail) and still explains the early exit → after a
successful keep, raw capture is released so further redraw traffic does not
accumulate a lifetime string → detach/reopen and replay continue to use the
modeled screen.

Change `LiveTerminalClient` capture policy only. Do not drop live socket output
or change keep permission rules.

Learnings: Quiet Playwright reporter fails on `NO_COLOR`+`FORCE_COLOR` Node
warnings; focused dashboard proof needs `env -u NO_COLOR`. Capture ownership
lives in `terminalDiagnosticCapture.ts`; successful-keep release is
`settleKeep` → `keptAndRelease`.

### 2. End launch observation after successful startup handoff
Type: Behavior
Status: done
Proof: Accepted —
`env -u NO_COLOR FORCE_COLOR=0 npm run test:dashboard -- dashboard/tests/boundary/launch-instruction-observation.spec.ts dashboard/tests/boundary/cursor-recovery-frame.spec.ts dashboard/tests/boundary/cursor-recover-submitted-chip.spec.ts --reporter=list`
(5 passed). After entry+announce, further chunks add no readiness evaluations;
handoff hold and recovery/paste regressions stay green. End observation only
when `entered && announced` (not announce alone).

Behavior: A launched kept client has announced its first screen and entered its
instruction → further PTY chunks do not keep the launch readiness observer
evaluating → handoff, pasted-instruction confirmation, and recovery-frame
behavior still work → disposal remains on the existing client cleanup /
`releaseIdle` path.

Interim: slice 1 may already reduce capture growth; this slice owns stopping
post-startup observation work.

### 3. Bound screen write queues under multi-client pressure
Type: Behavior
Status: done
Proof: Accepted —
`env -u NO_COLOR FORCE_COLOR=0 npm run test:dashboard -- dashboard/tests/boundary/kept-client-screen-write-queue.spec.ts dashboard/tests/boundary/kept-client-screen-replay.spec.ts --reporter=list`
(8 passed). Burst settle ~12 ms; busy+quiet `held()` ~17 ms (was ~2.39 s);
replay/synchronized-frame green. Do not seal coalesce on `settled()` (defeats
idle-watch coalesce). Queue coalesce alone meets the 500 ms budget; deferred
WebSocket parse-ack flow control not selected.

Behavior: One of two kept clients receives the bursty 64 KiB shape while the
other is quiet → pending screen work drains so all-session `held()` returns
within 500 ms with coherent completed screens → the busy client is not treated
as stopped → output order and synchronized updates remain correct.

Prefer coalesce-or-bound on the existing `pending` chain over a new queue
service. If measurement shows this bound insufficient for attach-path
responsiveness, record a learning before selecting deferred WebSocket parse-ack
flow control.

### 4. Publish completed Running Cursor observations under bounded demand
Type: Behavior
Status: done
Proof: Accepted —
`env -u NO_COLOR FORCE_COLOR=0 npm run test:dashboard -- dashboard/tests/cursor-runner-sessions.spec.ts dashboard/tests/cursor-runner-sessions-demand.spec.ts --reporter=list`
(8 passed). Slow >50 ms fulfills publish under at most one owned read; collapse
ends demand; visibility pause/resume works; existing follow journeys green.
Bounded-demand journey lives in `cursor-runner-sessions-demand.spec.ts`.

Behavior: The Running Cursor section is expanded and each valid read takes
longer than 50 ms → completed observations appear and the UI does not remain on
Reading indefinitely under the overlapping-poll shape → at most one in-flight
read is owned → collapsing the section or leaving the sidebar ends that demand
→ background/return may pause and recover without unbounded backlog.

### 5. Bound browser repository file cache with eviction
Type: Behavior
Status: done
Proof: Accepted —
`env -u NO_COLOR FORCE_COLOR=0 npm run test:dashboard -- dashboard/tests/boundary/file-content-cache-budget.spec.ts --reporter=list`
(3 passed). Over-budget writes keep retained ≤ 16 MiB with oldest miss/reread;
pinned snapshot stays revision-correct; retained bytes plateau for the fixed set.

Behavior: The browser session reads repository text across many revisions until
retained cache bytes would exceed 16 MiB → older entries can be evicted and
reread on miss → the current pinned snapshot remains revision-correct → retained
memory plateaus for that working set.

Mirror disposable-cache semantics; do not write durable workflow state into the
cache or share the server retained-answers directory.

### 6. Keep terminal-header controls truthful under pending Done
Type: Behavior
Status: done
Proof: Accepted —
`env -u NO_COLOR FORCE_COLOR=0 npm run test:dashboard -- dashboard/tests/agent-terminal-done.spec.ts dashboard/tests/agent-terminal-done-pending.spec.ts dashboard/tests/agent-session-cursor-done.spec.ts dashboard/tests/agent-terminal-done-codex-page.spec.ts dashboard/tests/boundary/agent-terminal-done-codex-boundary.spec.ts dashboard/tests/agent-launch-story-card-done.spec.ts dashboard/tests/boundary/agent-launch-done.spec.ts --reporter=list`
(18 passed). Maximize/Close under hold; release closes; wait-bound/failed leave
recoverable unresolved without refused-intent wording or duplicate native stop;
Cursor/Claude/Codex Done regressions green. Pending/late journeys live in
`agent-terminal-done-pending.spec.ts`. Process attribution (9.x) reused from
`docs/dashboard-memory-investigation.md` (no new RSS measurement this slice).

Behavior: During terminal output and during a deliberately held Done response →
confirmation and marking states stay observable → Maximize/Restore and Close
respond → a settled Done answer closes the panel as today → a lost or late
answer leaves an explicit recoverable unresolved state without duplicate native
operations or claiming a persisted done intent failed → exercise Cursor (known
local-done path) and preserve Claude/Codex Done semantics on the shared path.

## Concern evidence

Slice-plan refinement was not needed: six Behavior slices each own one proof
loop along the story's key examples, Structure was unnecessary because each
change lands in the existing owner, budgets and deferred flow-control are
recorded as current decisions, and no repeated special-case design spans
slices beyond the shared LiveTerminalClient lifetime already split by distinct
proof (capture vs launch observation).

Remaining slice-specific concerns: none identified. Interim behavior is named
only where slice 2 follows slice 1 on the same client without blocking either
proof.

## Story obligations

### G1. Outside this story: a general performance dashboard
Reported: slice 1 — "Outside this story: a general performance dashboard"
Story clause: "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Disposition: excluded "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Commitment: 25.1

### G2. Outside this story: a production telemetry service
Reported: slice 1 — "Outside this story: a production telemetry service"
Story clause: "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Disposition: excluded "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Commitment: 25.2

### G3. Outside this story: vendor-agent memory optimization
Reported: slice 1 — "Outside this story: vendor-agent memory optimization"
Story clause: "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Disposition: excluded "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Commitment: 25.3

### G4. Outside this story: session-retention policy redesign
Reported: slice 1 — "Outside this story: session-retention policy redesign"
Story clause: "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Disposition: excluded "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Commitment: 25.4

### G5. Outside this story: a dashboard-wide rewrite
Reported: slice 1 — "Outside this story: a dashboard-wide rewrite"
Story clause: "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Disposition: excluded "A general performance dashboard, production telemetry service, vendor-agent memory optimization, session-retention policy redesign, or a dashboard-wide rewrite is outside this story."
Commitment: 25.5
