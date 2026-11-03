---
id: SEED-225
status: active
planted: 2026-11-03
planted_during: Terry Yin's report of a less responsive production dashboard and more frequent GitHub access outages
trigger_when: Dashboard interaction stalls or published work becomes temporarily unreadable
scope: story
---

# SEED-225: Restore dashboard responsiveness and reliable GitHub access

## Selected Stories

<a id="restore-dashboard-responsiveness"></a>

### Restore dashboard responsiveness and reliable GitHub access

**Identity:** SEED-225#restore-dashboard-responsiveness
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/456-restore-dashboard-responsiveness/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"427ab701f1b8ee070beebb40936cc73efd97f9b7aca168c03e41d3c26d12c69a","plan":"ee6ff6532cc34a5b7fed8411e8f51ba3abc185078e9b1ea03eb678e05e3241f2"}}
```

**Goal.** A developer working in the production dashboard, on this Mac or
through the Tailscale proxy from another device, keeps the Board, Intent,
and the Sessions sidebar usable while the dashboard's own refreshes run,
and, when a published read or the local service fails, keeps the last
successful snapshot labelled with its revision and retrieval time, recovers
eligible reads without a reload, and can read evidence that locates the
failure even after the production preview was replaced. The business
contribution is a dashboard Terry can trust during the day instead of
reloading it, and incidents that can be attributed and fixed instead of
re-investigated from nothing.

**Why now.** Terry reports a substantial responsiveness regression and more
frequent GitHub access outages. Refinement on 2026-11-03 reproduced one cost
every open page pays and found that no evidence of the reported outages
survives: the proxy writes only errors, the preview's own output goes to the
watcher's terminal, and the failed-read history lives in the memory of a
process that is replaced on every deployment. The Intent summary regression
the investigation found is already corrected by the one-walk derivation
(`edbaad4a2`, closed and deployed at 10:27 on 2026-11-03).

#### Facts, hypotheses, and what settles them

Facts, each from a local observation on 2026-11-03 unless cited otherwise:

- **Sessions polling cost (reproduced).** The production answer carries
  9.67 MB of JSON for 1,023 session records and 1,034 attempts. A cold full
  answer took 0.42 s. Each poll naming the held revision, outside the
  one-second reuse window, took 0.39–0.58 s to answer 96 bytes, because the
  server observes, serializes, and hashes the whole snapshot again before it
  can say nothing changed. While those polls ran, the same process answered
  a trivial request in 130 ms at the 99th percentile against 1.1 ms at the
  90th percentile without them: each poll blocks the event loop for roughly
  130 ms. Every visible page polls every 15 seconds
  ([schedule](../../dashboard/src/revisionCheckSchedule.ts), `checkIntervalMs`),
  and the proxy log shows a second device polling through Tailscale.
  [Observation](../../dashboard/server/machineSessionObservation.ts) ·
  [State join](../../dashboard/server/launchStates.ts)
- **Loopback failures (proxy log).** Since 2026-10-31 the proxy logged
  21 loopback 502s: on 10-31 three dial timeouts of 17–143 s on launch
  endpoints, one reset, and fifteen "connection refused" between 13:33 and
  14:07 while nothing listened on 4173; on 11-03 one 33 s dial timeout on
  the terminal WebSocket at 09:42 and one broken pipe on Mark as done at
  10:06. It also logged about thirty sessions polls the browser abandoned
  while the server was still answering, 0.4–3.1 s in. No machine sleep or
  wake coincides with any of them (`pmset -g log`). Proxy error log under
  `~/.open-dough/dashboard/tailscale/`.
- **No surviving evidence.** The current preview, started 10:27, reports
  zero retained failed reads; its predecessor's history went with it. The
  proxy access log is empty by configuration, the watcher log has no
  timestamps, and the preview's stdout and stderr are piped to the
  watcher's terminal only. [Diagnostics](../../dashboard/server/readDiagnostics.ts) ·
  [Preview process](../../dashboard/server/productionProcess.mjs)
- **Process versions.** The running GitHub request owner started on
  2026-11-01 at 22:06 from a deployment that predates the idle-exit greeting
  race fix `30231a246`; the preview started 2026-11-03 at 10:27 contains
  that fix and the one-walk correction. Both speak the same protocol.
- **Intent inventory bundles proof.** The locations answer carries each
  location's proof, so the inventory waits for the proof tree and its blob
  reads ([inventory](../../dashboard/server/intentLocationsRead.ts),
  [proof](../../dashboard/server/intentProofRead.ts)). On Doughnut the
  configured location holds 94 feature files and its proof directory one
  JSON file, so a cold folder summary at a new revision costs about 95
  reads through the eight shared slots: roughly six seconds of saturated
  queue at the observed 0.5 s per `gh` call.
- **Machine load.** This 16-core Mac showed a one-minute load average of
  31–33 during refinement, from concurrent agent sessions and test suites.
- **Native listing cost.** `claude agents --json --all`, which every
  observation runs for the Claude host, took 0.16–0.20 s and listed 1,176
  entries, exited sessions included. The runtime's event-loop delay
  histogram measured a deliberate 300 ms block as 313 ms, so self-observed
  stalls are measurable without sampling on the loop itself.

Hypotheses, each with the cheapest observation that settles it:

- **The tens-of-seconds loopback stalls are the preview process not
  accepting connections.** Candidate causes are whole-machine CPU
  starvation under load like the above and a long synchronous block inside
  the server. The reproduced poll stall is 130 ms, so polling alone does
  not explain 33 s. Settled only by evidence recorded at the next incident:
  event-loop delay and load average sampled by the preview itself and kept
  past its replacement. This story records that evidence.
- **The "Published work could not be read" outages are reads that waited
  past the 30-second bound.** Queue time behind Intent fan-out, an owner
  replacement, a rate limit, or the loopback stall above would each do it.
  The Intent estimate of about six seconds per cold Doughnut revision does
  not reach 30 s on its own. Settled by the same recorded evidence: each
  failed read's queue wait, dispatch phase, owner identity, and upstream
  status or its absence.
- **Intent still pauses during the 94-file journey after the one-walk
  correction.** Unobserved in a browser. Settled by a browser interaction
  measurement; deferred below with the Intent path.

#### Alternatives considered

Four materially different ways to reach the goal were compared against it
and its constraints (machine-local evidence only, published Git as the
workflow authority, no new GitHub requests, no credentials in evidence):

1. **Fix the three investigated code paths** (the original proposal:
   diagnostics plus owner handoff, Intent inventory before proof with bounded
   fan-out, Sessions history off the polling path). Complete but large, and
   two of its three paths address costs whose contribution to the reported
   incidents is unproven.
2. **Evidence first, plus the cost reproduced today** (recommended).
   Record incident evidence that survives replacement and attributes each
   failure, and remove the per-poll rebuild and the history payload that
   every open page pays every 15 seconds. Smallest scope that moves both
   halves of the goal on facts, and it supplies the evidence that decides
   whether the deferred paths are needed.
3. **Deployment-only changes.** Enable the proxy's access log with
   durations, let the proxy retry dialing for a bounded time so a
   replacement gap no longer answers 502, and supervise the preview with a
   health check. Simpler and existing, and it would have absorbed the
   fifteen connection-refused errors on 10-31. It records nothing about the
   server's own state, cannot explain a 33 s dial timeout, and the
   dashboard's documented contract keeps the proxy a thin admission layer.
   Kept as a deferred proposal pending evidence.
4. **Push or watch-based Sessions instead of polling.** Materially
   different transport, but the reproduced cost is in re-observing to learn
   that nothing changed, not in the transport; a change signal from the
   machine documents and host listings removes the cost under either
   transport. Not favored.

Two mechanisms borrowed from other domains inform option 2, each a candidate
rather than evidence:

- **Flight data recorder.** A bounded recorder, separate from the systems it
  observes, keeps the last stretch of parameters past the crash of the
  thing it observes, and investigators align it with the control tower's
  transcript by a shared clock. Mapped here: the preview and owner are the
  aircraft systems, a bounded owner-only incident file under
  `~/.open-dough/dashboard/` is the recorder, event-loop delay, load, owner
  identity, queue wait, and dispatch phase are the parameters, and the
  proxy error log is the tower transcript aligned by wall-clock time. Where
  it breaks: a recorder samples continuously at high rate from its own
  power; here sampling costs the event loop it measures and a killed Node
  process writes no final entry, so sampling must stay sparse and cheap,
  and a record that ends without a closing entry reads as "process lost",
  never as "no incident".
- **Git's index stat cache.** Git answers "what changed" by trusting each
  file's recorded identity and re-reading only files whose identity moved,
  with a racy-recent guard. Mapped here: each launch document and each
  host's listing keeps its last observed identity and serialized fragment,
  and an unchanged poll re-observes only the sources whose identity moved.
  The machine JSON store already applies this to its files. Where it
  breaks: native host session state is a process or directory listing, not
  a file with a stable stat, so each host needs its own cheap change signal
  or a short reuse window, as today.

#### Strongest doubt and the scope decision

The purpose rests on three assumptions: that the regression comes from the
dashboard rather than the machine it shares with test suites and agents;
that each investigated path matters to what Terry perceives; and that the
evidence captured will attribute the next outage. The strongest doubt: the
story could deliver all three original paths and still not restore what
Terry experiences, because nothing retained ties any of them to the reported
incidents, while a story that size runs long before any feedback. The
scope below therefore owns the evidence that makes the next incident
attributable and the one cost reproduced today, and records the rest as
deferred promises that this story's evidence will confirm or retire.
Terry can reverse this by naming a deferred path to bring back; it would
then be refined on this story's evidence.

**Scope.**

Required behavior:

- **Incident evidence that outlives the process.** Each failed upstream
  read the dashboard waited on, and each stall the preview observes in
  itself above a stated threshold, is recorded in a bounded, sanitized,
  owner-only machine-local record that a preview replacement does not
  clear. A failed read's entry names its category as a local failure, an
  upstream refusal, or unknown, with the queue wait, dispatch phase, the
  owner identity it asked through, the owner's reported version, and the
  upstream status, rate-limit evidence, or their absence. A stall entry
  carries the measured event-loop delay, the load average, the dashboard
  revision, and the age of the process. Every entry carries wall-clock
  time so it aligns with the proxy error log.
- **Evidence readable in place.** The existing diagnostics read lists the
  retained record across processes, newest first, and says when the record
  began and how many entries it dropped at its bound.
- **Sessions stay cheap to refresh.** A poll naming the revision the page
  holds is answered without re-serializing the retained history: the
  server re-observes only sources whose identity changed since the last
  observation. The regular answer carries the live overview the Board,
  the Sessions sidebar, and the open Session entries show, and the
  historical remainder is read when a developer opens or acts on a
  retained session or expands the Recently done sessions section. A
  poll's work stays off the request path of other viewers, within the
  targets below.
- **Repeatable baselines.** A local replay with roughly 1,000 records and
  attempts reports startup, an unchanged poll, one active state change,
  and the latency of a concurrent trivial request, before and after, so
  the targets below are measured, not asserted.

Preserved behavior, verified by key examples: the last successful snapshot
stays shown with its revision and retrieval time while a read fails; the
existing bounded visible-page recovery re-asks eligible reads without a
reload once the owner is reachable again, including across an owner
replacement; historical reports, reattachment, Mark as done, deletion, and
fresh action-time checks on retained sessions remain available; the
eight-call cap and the GitHub-directed cooldown are unchanged.

Required restrictions, each with its independent reason:

- The evidence record is readable only by this user and names no token,
  credential, socket path, repository path outside the configured project,
  or raw error text, because it sits beside credentials on a shared machine
  and the diagnostics contract already forbids those fields.
- The record is bounded in size and count and its writing is asynchronous
  and sparse, because it must not become the stall it measures or fill the
  disk.
- Recording and reading evidence make no GitHub request, because the
  allowance belongs to the launching person.

Deferred promises (not rejected; naturally supported behavior stays):

- Intent inventory shown independently of Proof, with proof read for the
  visible selection and fan-out bounded so Board and CI reads keep
  progressing, and a browser measurement of the 94-file journey. Judged on
  this story's evidence of queue waits behind Intent reads.
- Controlled request-owner handoff that preserves holds and in-flight
  ownership, mixed-version handoff tests, and serving the old preview until
  its replacement is ready. Judged on this story's evidence of owner
  turnover and replacement gaps at incidents.
- Proxy access logging, dial retry, and process supervision (alternative 3).
- Retained-answer cache scan changes, after event-loop delay is measured.

Scope limits: no new metrics product or UI beyond the diagnostics read; no
change to the Sessions sidebar's visible behavior beyond when history
loads; no change to the request owner's protocol.

Boundary assumptions: the [SEED-118 cache-validation story](SEED-118-dashboard-reading-reliability.md#show-cards-before-expensive-cache-validation)
stays separate and is not a prerequisite. Published Git remains the
authority for workflow facts and local evidence stays separate under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Plans, delegation briefs, and repair handoffs carry the project's
[Failing and flaky tests policy](../../AGENTS.md#failing-and-flaky-tests).

**Baselines and targets.** Production on 2026-11-03 with 1,023 records and
1,034 attempts; targets apply to the replay at that scale and to production.

| Measure | Baseline | Target |
| --- | --- | --- |
| Unchanged poll, wall time | 390–580 ms | at most 250 ms, bounded by one host listing (0.16–0.20 s for 1,176 Claude entries today) |
| Unchanged poll, event-loop time | about 130 ms | at most 20 ms |
| Trivial request during a poll, p99 | 130 ms | at most 20 ms |
| First full answer, cold | 420 ms | at most 300 ms |
| Regular answer size | 9.67 MB | live overview only; history read on demand |
| Failed reads retained across a preview replacement | none | all within the bound, newest first |
| Stall entry for a self-observed stall | none | present with delay, load, revision, process age |

**Key examples.**

1. **Evidence survives replacement.** The preview has retained three failed
   reads, one each of local, upstream, and unknown category → the watcher
   replaces the preview with a new deployment → the diagnostics read on the
   new preview lists those three entries with their categories, queue
   waits, owner identities, and times, before any new failure.
2. **A stall is attributable.** The preview's event loop is blocked for
   two seconds in a test → the next diagnostics read shows one stall entry
   with the measured delay, the load average, the dashboard revision, and
   the process age, with a time that can be aligned to a proxy error logged
   in the same second.
3. **A lost process reads as lost.** A preview is killed without ending
   its record → the next preview's diagnostics read shows that record
   ending without a closing entry and labels it as process lost, not as a
   quiet period.
4. **Unchanged poll stays cheap.** The replay holds roughly 1,000 retained
   records and attempts, and no launch document or host listing has
   changed → a page polls with the revision it holds → the answer is
   "unchanged" within 250 ms of wall time and 20 ms of event-loop time,
   and a trivial request sent during that poll is answered within 20 ms.
5. **Live overview, history on demand.** The same replay has 1,000 done
   records and five open sessions → a page loads → its regular answer
   carries the five open sessions and the done sessions the Board's
   Recently done cards and the sidebar's collapsed section need; expanding
   Recently done sessions or opening a done session's report reads that
   history then, and the report shows as before.
6. **One state change, nothing else recomputed.** The replay changes one
   open session's native state → the next poll answers a new revision whose
   content differs from the previous answer only in that Session entry,
   within the unchanged-poll target plus that one session's observation.
7. **Recovery without a reload, across an owner replacement.** The page
   shows revision A with its retrieval time; the request owner is replaced
   while a read is queued before dispatch → the read fails as local, the
   snapshot stays shown labelled A with its time, the failure is in the
   evidence record, and the page's existing recovery re-asks once the new
   owner answers, without a reload or a duplicate dispatch of an ambiguous
   post-dispatch loss.
8. **Evidence is safe.** A failed read's raw error names the socket path
   and includes a token fragment → the recorded entry names the safe
   category and status only; the diagnostics read, and the file itself,
   contain neither.

**Architecture.** Two consequential changes, both design rather than ADR
proposals and both within Accepted decisions:

- **Durable local incident evidence is a new machine-local responsibility.**
  Today failed-read history is per-process memory
  ([diagnostics](../../dashboard/server/readDiagnostics.ts)), the owner
  stores only rate-limit waits in its `/tmp` directory, and self-observed
  stalls are not observed at all. The record moves to a bounded,
  owner-only document under `~/.open-dough/dashboard/`, the home of the
  machine's other operational documents, which [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  keeps separate from published workflow records: evidence supplements the
  published view and owns none of its facts. It is an append-and-prune log
  of events, not a read-modify-write document, so it does not borrow the
  machine JSON store's locking discipline; the dashboard process writes
  it asynchronously, and the request owner's facts reach it through the
  answers the dashboard already receives (owner identity, version, queue
  wait, dispatch phase), not through a new owner protocol. Event-loop
  delay comes from the runtime's own histogram so sampling costs no loop
  time of its own. The existing diagnostics read and sanitization keep
  their contract and gain a second source.
- **Sessions observation splits into identified fragments and two
  audiences.** The shared observation ([observation](../../dashboard/server/machineSessionObservation.ts))
  re-derives one snapshot per demand; it becomes a set of fragments keyed
  by source identity (each launch document's identity, each host's
  listing), re-observed only when that identity moves, with the answer's
  revision derived from fragment revisions. The answer gains an audience:
  the live overview every page polls, and the history a page reads on
  demand through the same boundary. The browser keeps reading one boundary
  and one revision rule; nothing moves to the browser, following the North
  Star's observation-and-presentation split
  ([North Star](../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)).
  No Accepted decision conflicts; [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
  judges the result by the measured targets above.
