# Dashboard memory and partial responsiveness investigation

Date: 2026-10-28 (Asia/Singapore). Source examined:
`f18004383c6e3ca4b109574bf879cba529a82065`. Follow-up controlled research used
`9b4a7a8212390fb627a92b213a5c8ef9c7f08e41`; the dashboard source was unchanged
between these revisions.

The report is that the dashboard consumes substantial memory after long use,
and controls above a session terminal, including **Mark as done**, sometimes
stop responding. The terminal is suspected; the host, browser, memory owner,
time to failure, and exact button state remain unconfirmed.

This investigation found two reproducible retention mechanisms, reproduced a
stale session-list failure in the real browser page, and measured slow queued
screen reads. A separately held Done response reproduced a disabled Done
button while other controls worked. The original incident's exact cause and
memory-owning process remain unconfirmed. No product code or live session
state was changed. The selected fix is queued as
[SEED-162#keep-long-running-dashboard-sessions-responsive](../.planning/seeds/SEED-162-long-running-dashboard-responsiveness.md#keep-long-running-dashboard-sessions-responsive).

## Findings, ordered for follow-up

| Finding                                                | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Confidence and likely effect                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every terminal retains all raw output                  | [`LiveTerminalClient.watch`](../dashboard/server/liveTerminalClient.ts) appends every PTY chunk to `captured` (line 114), with no limit or successful-start reset. The full string becomes `processExit`'s result.                                                                                                                                                                                                                                                                                                    | Confirmed retention. Memory grows with cumulative output for the lifetime of a live client, including ANSI redraw traffic. Applies to kept, detached clients too. The dashboard process or Cursor runner owns it, depending on the attachment.                                              |
| Repository file cache never evicts                     | [`fileContentCache.ts`](../dashboard/src/fileContentCache.ts) holds a module-level Map keyed by repository, revision, and path. `rememberFile` only adds/replaces entries; there is no delete, clear, byte budget, or revision retirement. [`repositoryFileReads.ts`](../dashboard/src/repositoryFileReads.ts) uses it for ordinary snapshot reads.                                                                                                                                                                   | Confirmed retention. A browser page can keep old file text as new revisions/projects are read. Actual production bytes and reuse of identical strings still need measurement.                                                                                                               |
| Expanded Running Cursor sessions polls at 20 Hz        | [`RunningCursorSessions.tsx`](../dashboard/src/RunningCursorSessions.tsx), lines 27 and 69–85, starts a request every 50 ms while the sidebar and section are open. It has no in-flight limit, cancellation of pending reads, or document-visibility check. [`heldSessions.ts`](../dashboard/server/hosts/cursor/heldSessions.ts) reads held screens and joins saved records per call.                                                                                                                                | Confirmed browser failure: 37 valid answers were discarded while the list stayed on Reading, because each arrived after the next poll started. Original-incident contribution remains unconfirmed.                                                                                          |
| Terminal output has no end-to-end flow control         | [`joinedSockets.ts`](../dashboard/server/joinedSockets.ts) forwards output without a byte watermark or parser acknowledgment. [`terminalBridge.ts`](../dashboard/server/hosts/cursor/terminalBridge.ts) forwards both sockets similarly. [`useAttachedTerminal.ts`](../dashboard/src/useAttachedTerminal.ts) writes each received chunk to xterm; its callback reports readiness, not consumed bytes. [`KeptClientScreen.write`](../dashboard/server/keptClientScreen.ts) queues chunks in an uncapped Promise chain. | Confirmed absence of application-level flow control. Under sustained output or a slow/hidden browser, queued strings, callbacks, transport buffers, and parser work are plausible sources of memory and input latency. No overload trace was captured.                                      |
| Launch-time screen parsing continues after startup     | [`LiveTerminalClient`](../dashboard/server/liveTerminalClient.ts) feeds both the idle/replay screen and `LaunchInstruction` for a launched kept client. [`LaunchInstruction`](../dashboard/server/launchInstruction.ts) retains its separate headless terminal and continues queueing readiness evaluations after announcing its first screen and entering its instruction; disposal occurs on client cleanup.                                                                                                        | Measured: after one instruction entry, 512 later output chunks caused 512 additional readiness evaluations. A candidate for ending observation once startup and handoff are fully settled, with care around paste handling and readiness.                                                   |
| Mark as done can look stuck while awaiting its request | [`requestMarkDone`](../dashboard/src/sessionRecordRequests.ts) awaits `postJson`; [`postJson`](../dashboard/src/agentLaunchClient.ts) supplies no browser timeout/abort. [`useMarking`](../dashboard/src/pageSessions.ts) keeps the marking state until the Promise settles. [`doneMarks.ts`](../dashboard/server/doneMarks.ts) includes state reads and host-specific operations; some native operations already have deadlines.                                                                                     | A held-response browser probe kept Done disabled for 60 seconds of virtual time while Maximize worked. Releasing the response completed the mark and closed the panel. This distinguishes a pending operation from a general UI stall; it does not identify what held the original request. |

The browser attachment does explicitly dispose xterm, sockets, parser hooks,
touch handlers, and ResizeObserver on cleanup (`useAttachedTerminal.ts`,
lines 215–225). Its installed xterm default scrollback is 1,000 lines
(`node_modules/@xterm/xterm/src/common/services/OptionsService.ts`). This does
not bound the separate raw transcript or queued, unparsed data. Server
`RevisionMemo` already limits its in-memory cache to 500 entries; it is a lower
priority than the browser's unlimited file cache.

The upstream [xterm flow-control guide](https://xtermjs.org/docs/guides/flowcontrol/)
describes producer overload causing sluggishness and input loss, and explains
why WebSocket delivery needs application-level acknowledgments of parsed
output. That supports investigating this mechanism; it does not prove it
caused this dashboard incident.

## Isolated measurements

A short Node v24.21.0 probe imported the real source modules. A synthetic PTY
emitted independent ASCII chunks into `LiveTerminalClient` with no browser,
headless screen, native agent, or live session attached. Explicit garbage
collection preceded every measurement. The probe exercised `watch()` and
checked the public `processExit` result after synthetic exit.

| Cumulative terminal output | Retained JS heap |
| -------------------------- | ---------------: |
| Before output              |        20.69 MiB |
| 8 MiB                      |        28.73 MiB |
| 16 MiB                     |        36.75 MiB |
| 32 MiB                     |        52.79 MiB |

All 33,554,432 emitted characters were still present in the exit result. The
approximately 32.10 MiB heap increase isolates the raw-capture mechanism from
browser rendering and screen parsing. This is an accelerated retention probe,
not a native long-session reproduction or a claim about bytes per second in use.

A second probe called the real browser cache API in Node with 256 distinct
revision keys and 64 KiB of independent text each. All 256 entries, including
the oldest, survived garbage collection. Heap increased from 52.79 to
69.00 MiB, approximately 16.21 MiB for 16 MiB of stored text. This proves the
cache's retention behavior, not its production browser footprint.

Read-only process observations found production at this same source revision,
roughly 319–347 MiB RSS after about 24 minutes, and a separate Cursor runner
at roughly 96 MiB RSS after about one hour. These snapshots do not establish
growth. The runner was started from an earlier deployment (`0f017335a0fc`),
whose source directory was no longer present; its loaded implementation was
not verified against today's source. Agent child processes are separate memory
owners. The live browser renderer was not attributable through the available
tab connection, so no live browser heap or incident trace was collected.
The controlled browser probes below used an isolated test browser.

Three sequential, same-origin GETs of the live Cursor sessions endpoint
returned 200 with 11,464-byte bodies in 37.3, 19.2, and 18.7 ms. These were
light-load samples only, with no concurrent polling or terminal stress.
They do not reproduce the slow-answer scenario. An initial request without
the required Origin header was refused with 403; it is excluded from timings.

## Deeper controlled research

All follow-up probes used Node v24.21.0 and the source revision above in an
isolated worktree. The browser probes used Chromium 153.0.8010.12, the normal
production build, real local boundaries, temporary HOME/repositories, and the
existing synthetic Cursor host. They did not connect to live agent sessions.

### Small chunks delay the server screen and all-session reads

The probe called the real `KeptClientScreen.write` with the same 65,536 ASCII
bytes split into different numbers of chunks, then wrote a nine-byte marker,
awaited `settled()`, and verified the marker on the modeled screen.

| Chunks for the same 64 KiB | Time until the screen settled |
| -------------------------: | ----------------------------: |
|                          1 |                       8.59 ms |
|                        128 |                     151.98 ms |
|                        512 |                     595.12 ms |
|                      2,048 |                   2,335.24 ms |

The Promise chain submits each chunk only after xterm's previous asynchronous
write callback. This is approximately one scheduling delay per chunk in this
experiment. It is a queue-drain measurement, not sustained native-agent
throughput. The visible buffer's line limit does not bound this input queue.

A second probe exercised the real `TerminalAttachments.keep` and `held` APIs
with two synthetic PTYs and real screen models. With both quiet, `held()`
returned both screens in 0.05 ms. Sending the same 2,048-chunk, 64 KiB burst to
only one client made that all-session read take **2,387.58 ms**, although the
other client stayed quiet. `held()` uses `Promise.all`, so one client's queued
screen delays every returned session.

The Cursor runner's `/sessions` handler awaits that all-client read;
`runnerClient.getJson` allows two seconds without a socket answer. Thus these
measured queue delays can exceed that request's wait even with little raw
output. A runner HTTP timeout was not exercised by this probe; that final
connection remains an inference from the real call path. Expanded 50 ms
polling can amplify such waits into overlapping requests.

### Startup observation keeps doing work

A real `LiveTerminalClient` with keep and launch input entered its instruction
once. Its readiness callback had run once at startup, then 513 times after
512 further chunks. Reading the idle/replay screen after those chunks took
591.93 ms. Both headless models remain active after successful entry. Before
removing startup observation, account for `handoff`, pasted-instruction
confirmation, and whether first-screen settlement actually completed startup.

Immediate disposal with one or 512 queued screen writes did settle in a
separate bounded check. That probe did not support a disposal-induced stuck
Promise; do not present that speculation as a confirmed defect.

### Polling can prevent every successful answer from appearing

In the real page, an intercepted Cursor sessions response was fulfilled with
valid `{runner: "running", sessions: []}` only after the next request arrived.
The experiment observed **38 requests and 37 successful answers**, while the
expanded section still rendered **Reading the Cursor runner…**. This confirms
that responses slower than the poll interval can keep losing the sequence
check. Collapsing the section stopped its interval; the remaining held request
was released before teardown. The artificial response order isolates this
behavior without attributing the original incident to a particular backend.

### A pending Done request reproduces the partial-control symptom

The real page opened a synthetic working Cursor session. The probe accepted
the in-place Done confirmation, held its HTTP request, advanced the browser
clock by **60,000 ms**, and observed **Marking as done…** with the header's
Done button disabled. Maximize and Close remained enabled, and clicking
Maximize changed the control to Restore. The probe then released the request:
the real boundary returned 200 and the panel closed.

This explains one way only Done can appear unresponsive, without a frozen
main thread. It is not a backend-stall reproduction: the test deliberately
held transport. Cursor Done is a local acknowledgement (`cursorHost.localDone`);
it does not wait for a native rename or stop. Claude's manual rename already
has a five-second wait, Codex rename has a ten-second signal, and native stop
has its own bound. Do not generalize the artificial pending request into a
claim that those native operations have no timeouts. Capture the affected
host and network state in an actual recurrence.

The two disposable browser journeys passed in 3.283 and 1.894 seconds,
respectively, with retries zero; both runner and strict reporter passed. An
earlier run passed their assertions but failed strict reporting on an inherited
`NO_COLOR`/`FORCE_COLOR` warning. Removing the conflicting `NO_COLOR` environment
setting produced the clean run. No product changes were made between runs.
The reproduction files were removed before landing; the experiments and
results above are the durable research evidence.

## Repair direction

Bound the raw terminal diagnostic capture first. The inspected consumers of
`processExit` are in [`terminalKeep.ts`](../dashboard/server/terminalKeep.ts),
where output explains a client that exits around startup. Reconnection uses
the separately modeled screen. Establish the required failure-diagnostic
contract, then retain a bounded tail and/or release startup capture after a
successful keep. Keep useful early-exit errors, readiness, paste submission,
and replay behavior intact. Do not silently discard live terminal output as
a substitute for flow control.

Next, replace overlapping poll demand with a bounded schedule that can publish
a completed observation, and remove avoidable per-chunk screen scheduling and
post-startup observation. Preserve output order, synchronized-frame readiness,
and reconnection. Select end-to-end flow control only with measured queue
budgets and multi-socket/detached-session behavior accounted for.

For the file cache, a byte budget with eviction is another concrete candidate.
Reads already have a cache-miss path; validate rereads after eviction, current
snapshot correctness, project switching, and recovery before selecting the
policy. Neither candidate requires changing durable project workflow state.

## Remaining incident diagnosis and implementation preparation

1. **Attribute memory and versions.** Record browser/renderer, dashboard server,
   Cursor runner, and native-agent PIDs separately, with exact source/build
   identities. Sample RSS, JS heap, external/ArrayBuffer bytes, output bytes,
   and session counts over time. Record both post-GC retained size and peaks.
   Keep the serving build fixed during comparisons.
2. **Capture the reported button failure.** On a disposable session of the
   affected host, record click dispatch, enabled/confirmation/marking state,
   main-thread long tasks, and the `/__agent-launch/done` request. If no
   request is sent, inspect main-thread and interaction state; if sent, time
   admission, record I/O, host state reads, rename/stop, response, and render.
   Use Close/maximize on the same panel as additional responsiveness controls.
3. **Separate long-term retention from overload.** Compare terminal closed,
   attached and quiet, attached with a fixed output rate, and detached while
   producing the same output. Repeat with the Running Cursor section collapsed
   and expanded, then with the page backgrounded. Use bounded synthetic output
   and stop when the cause is isolated rather than stressing live agents.
4. **Instrument queues.** Count captured bytes, queued screen chunks/bytes,
   time to parse, WebSocket `bufferedAmount`, oldest pending output age,
   in-flight polls, and poll duration. Track launch-observer lifetime and the
   browser file cache's entry/byte totals across revision refreshes.
5. **Exercise slow reads and lifecycle.** Hold a Cursor sessions answer beyond
   50 ms and confirm list progress plus a bounded request count. Repeatedly
   open/switch/close/reconnect terminals; after settling and GC, inspect
   retained terminals, sockets, DOM nodes, listeners, and headless screens.
   Verify Mark as done remains usable during output and held/failed native
   operations, with truthful outcomes and no duplicate native action.
6. **Prove a repair at its observable boundary.** Use the existing synthetic
   host and HTTP/WebSocket fixtures for startup errors, bounded retained
   diagnostics, slow polls, and overload handling. Add one representative
   browser journey for terminal-header responsiveness where needed. Run the
   relevant specs only, following `dashboard/tests/README.md`; this preliminary
   research ran no full suite and produced no product regression tests.

Success means memory plateaus for a fixed working set, queues drain after
finite output, terminal controls respond under the chosen measured load,
done requests settle truthfully, and attach/detach/replay preserve intended
session behavior. Choose numerical budgets from the first baseline and the
intended interaction target; this report establishes no arbitrary product SLO.

Preserve [ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
derived caches remain disposable, repository records own durable workflow
facts, and closing a terminal panel preserves the intended host/session
lifetime. Do not change session keep policy merely to reclaim memory.
