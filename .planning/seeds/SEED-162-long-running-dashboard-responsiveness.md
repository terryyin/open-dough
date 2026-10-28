---
id: SEED-162
status: active
planted: 2026-10-28
planted_during: Terry's report of dashboard memory growth and unresponsive session controls
trigger_when: Long-running dashboard use grows memory or leaves session controls or observations unresponsive
scope: story
---

# SEED-162: Long-running dashboard responsiveness

## Why This Matters

Terry reports substantial dashboard memory use after long sessions and partial
unresponsiveness around the terminal header, including Mark as done. A
developer needs to keep observing and interacting with ongoing work without
periodic dashboard reloads or terminating valid sessions to recover resources.

The [investigation](../../docs/dashboard-memory-investigation.md) confirms
unbounded raw terminal capture and browser repository-text retention, a
successful-response starvation case in the real Cursor sessions list, and
screen-queue delay that one busy client imposes on an all-session read. A
separately held Done request reproduces a disabled Done button while Maximize
still works. The original incident's exact host, memory owner, and failure
trace remain unknown; the fix must distinguish verified mechanisms from that
remaining diagnosis.

## Selected Story

<a id="keep-long-running-dashboard-sessions-responsive"></a>

### Keep long-running dashboard sessions responsive with bounded memory

**Identity:** SEED-162#keep-long-running-dashboard-sessions-responsive
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected","assessment":"not-ready","reasons":["An execution approach and slice plan with memory, queue and interaction budgets and mapped proof have not been selected."],"basis":{"document":"97a15cc5b5c01dbde61cdd21a391bae379a71593c59c62d524393f4ba0bbffe8"}}
```

**Beneficiary:** A developer leaving the dashboard open while agents produce
terminal output and published project revisions change.

**Goal:** Memory retained for diagnostics, cached repository text, and pending
terminal/session observations stays bounded for a fixed working set, while
session observations progress and the terminal header's controls remain usable.
Done reports a truthful outcome or an explicit unresolved operation rather
than silently remaining disabled indefinitely.

**Scope:** Resolve the confirmed retention and observation mechanisms on this
journey: lifetime raw PTY capture, stale revision text, output/screen queue
pressure, unnecessary startup observation after its job ends, and overlapping
Cursor-session polling that discards every slow success. Trace the original
partial-control report far enough to distinguish a stalled main thread,
pending/failed request, confirmation state, or a host operation; repair a
confirmed violation on that path. Measure browser renderer, dashboard server,
Cursor runner, and native-agent processes separately. Use a bounded synthetic
workload and explicit memory/queue/interaction budgets established during slice
planning, with production incident evidence when available.

**Key examples / evaluation:**

- A kept terminal has completed startup, emits many redraws, is detached, and
  is reopened. Diagnostic retention reaches its declared cap, queued work
  drains after finite output, and the correct screen reappears. A client
  exiting before readiness still explains its startup failure with bounded
  useful diagnostics. Successful startup releases observation that is no
  longer needed.
- One of two clients receives 64 KiB in 2,048 small chunks while the other is
  quiet. The server's session-observation path remains within its declared
  bound, reflects coherent completed screens, and recovers without treating a
  still-running client as stopped. Compare against the observed 2.388-second
  all-session read and the one-chunk control.
- The Running Cursor sessions section is expanded and each valid read takes
  longer than 50 ms. Completed observations appear and outstanding demand
  stays bounded. Collapse or departure ends owned demand; background/return
  behavior preserves recovery. The current 38-request/37-answer reproduction
  must no longer stay on Reading indefinitely.
- New project revisions are read across the browser session until repository
  text exceeds the declared byte budget. Old entries can be evicted and
  reread; the current snapshot remains revision-correct, and post-GC retained
  memory plateaus for the fixed test working set.
- During output and during a deliberately held Done response, the confirmation,
  marking, and request states remain observable. Maximize/Restore and Close
  respond within the chosen interaction target. A settled Done answer closes
  the panel as intended; a lost or late answer leaves an explicit recoverable
  state without duplicate native operations or claiming a persisted done intent
  failed. Exercise the affected host once known and preserve the other hosts'
  existing Done semantics.

**Constraints:** Preserve output order, synchronized updates, startup/paste
confirmation, reconnect/replay, and the intentional lifetime of kept sessions.
Closing a panel does not acquire permission to terminate a kept session. A
memory budget must not silently drop live terminal output or substitute stale
project facts. Cache and session changes preserve
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
repository records own durable workflow facts; local caches remain rebuildable.

**Existing solutions and evidence:** The server's `RevisionMemo` already
evicts after 500 entries; browser `fileContentCache` has no limit. The browser
terminal already disposes xterm, parser hooks, observers, and sockets on
cleanup. Reconnection has a separate modeled screen, while inspected raw
`processExit` consumers explain startup exits. Reuse these boundaries before
adding a new store, polling framework, or lifecycle mechanism. The research
report names the source paths, measurements, and proof boundaries.

**Deferred promises:** A general performance dashboard, production telemetry
service, vendor-agent memory optimization, session-retention policy redesign,
or a dashboard-wide rewrite is outside this story. A native multi-hour incident
reproduction is useful evidence when available, not a reason to postpone the
already-confirmed bounded repairs.

**Effort hypothesis:** L, medium confidence: several independently measured
mechanisms cross browser, WebSocket, and runner observation boundaries. Slice
planning must give each change owned proof and safe checkpoints; one large
stress test is not sufficient evidence for the whole journey.

**Depends on:** No blocking story prerequisite. Existing dashboard read-recovery
candidates cover different failures; shared read code alone creates no wait.

**Safe stopping point:** A landed bounded-retention or observation correction
keeps its measured value and existing session semantics if later increments
are deferred. The story is complete only when its stated memory and control
outcomes are proved or an explicit scope decision changes them.

**Next preparation:** Select the execution approach and budgets, map regression
proof to the existing HTTP/WebSocket and synthetic-host fixtures, and settle
the incident-observation probe in slice planning. No executable plan or
implementation is supplied by this research-and-backlog request.

## Breadcrumbs

- [Dashboard investigation and measured reproductions](../../docs/dashboard-memory-investigation.md).
- [Dashboard test strategy](../../dashboard/tests/README.md), including isolated
  HOME/host ownership, no leaked processes, and focused selections.
- [Published-read recovery candidates](SEED-118-dashboard-reading-reliability.md)
  are related context, not duplicate ownership of this session/memory outcome.
