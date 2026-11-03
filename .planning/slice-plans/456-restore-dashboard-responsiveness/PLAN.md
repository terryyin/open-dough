# Restore dashboard responsiveness and reliable GitHub access

**Identity:** SEED-225#restore-dashboard-responsiveness
**Source:** [story](../../seeds/SEED-225-restore-dashboard-responsiveness.md#restore-dashboard-responsiveness)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer in the production dashboard keeps the Board, Intent, and the
Sessions sidebar usable while the dashboard's own refreshes run, and when a
published read or the local service fails, keeps the labelled last snapshot,
recovers without a reload, and can read evidence that locates the failure
after the preview was replaced.

Included: a durable, bounded, sanitized incident record of failed upstream
reads and self-observed stalls under `~/.open-dough/dashboard/`, listed by
the existing diagnostics read across processes; the Sessions observation
split into identified fragments so an unchanged poll re-observes only what
moved; the regular sessions answer reduced to the live overview with history
read on demand; and a repeatable replay that measures the targets.

Excluded (deferred promises in the story): Intent inventory before proof and
bounded fan-out; request-owner handoff changes and serving the old preview
until its replacement is ready; proxy access logging, dial retry, and process
supervision; retained-answer cache scan changes. Scope limits: no metrics UI
beyond the diagnostics read; no change to the request owner's wire protocol;
no visible Sessions sidebar change beyond when history loads.

Assumptions: the SEED-118 cache-validation story stays separate; published
Git remains the workflow authority and local evidence supplements it
([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).

## Existing solutions and decisions

- **Failed-read history** is per-process memory, newest 100, sanitized, read
  through `GET /__authenticated-read-diagnostics?source=<id>` under the
  same-origin admission ([diagnostics](../../../dashboard/server/readDiagnostics.ts),
  [sanitization](../../../dashboard/server/readDiagnosticSanitize.ts),
  [attribution](../../../dashboard/server/readDiagnosticContext.ts)). Reuse
  the entry shape, categories, sanitization, admission, and the two
  diagnostics boundary specs; add a durable source behind the same read.
- **Queue wait is already observable.** A failed call reports `startedAtMs`
  and, once dispatched, `askedAt` ([requests](../../../src/skills/dough-execute-plan/scripts/github-requests.mjs)),
  and `Server-Timing` already splits admission, `gh`, and rest per request
  ([timing](../../../dashboard/server/readTiming.ts)). Derive queue wait and
  dispatch phase from these; add no owner protocol field.
- **Owner identity** is the endpoint directory's generation record
  `owner.N.json` (pid, protocol, socket name, caller token). Evidence may
  name the owner pid and generation number only; the token and socket path
  stay out, as the existing contract requires.
- **Machine home** `~/.open-dough/dashboard/`
  ([home](../../../dashboard/server/machineHome.ts)) holds this user's
  operational documents. The incident record lives there as its own
  append-and-prune file set, not through the machine JSON store's
  read-modify-write lock ([store](../../../dashboard/server/machineJsonStore.ts)),
  which exists for documents several processes edit.
- **Event-loop delay** comes from `perf_hooks.monitorEventLoopDelay`
  (settled below), load from `os.loadavg()`, process age from
  `process.uptime()`.
- **Sessions observation** is one shared observation keyed by the catalog
  and the machine-document revision, reused for one second, re-run on every
  later demand ([observation](../../../dashboard/server/machineSessionObservation.ts),
  [sharing](../../../dashboard/server/sharedObservation.ts)). Its body joins
  the kept records with each host's native listing and per-record workspace
  checks ([join](../../../dashboard/server/launchStates.ts)), then serializes
  and hashes the whole. The machine JSON store already answers unchanged
  files from memory by file identity; the fragments below extend that idea
  to the observation.
- **Test harness.** Boundary mode starts the local boundaries on a plain
  HTTP server with a fake `gh`, a fake `claude`, and a temporary HOME
  ([harness](../../../dashboard/tests/support/dashboardServer.ts)); the
  unchanged-poll spec and the owner-replacement fixtures exist
  ([unchanged](../../../dashboard/tests/boundary/agent-launch-sessions-unchanged.spec.ts),
  [owner replacement fixtures](../../../src/skills/dough-execute-plan/scripts/github-request-owner-replacement-test-fixtures.mjs)).

## Architecture direction

The story's seed records the two consequential changes. For the plan:

- **Incident record** (`dashboard/server/incidentRecord.ts`): one bounded
  append-and-prune record per user under the machine home, with entries
  `failed-read`, `stall`, `process-started`, and `process-ended`, each with
  wall-clock `at`, the writing process's pid, dashboard revision, and
  process age. The existing diagnostics history writes each failure it
  records to it as well; a `stall` entry is written by a
  `dashboard/server/eventLoopWatch.ts` that samples the histogram on a
  sparse timer. Writes are asynchronous and never awaited on a request
  path; pruning keeps the newest N entries and B bytes. The diagnostics
  read answers the in-memory history merged with the record, newest first,
  with the record's start and dropped count, and marks a process whose
  `process-started` has no `process-ended` as lost.
- **Observation fragments** (`machineSessionObservation.ts`): the body
  becomes fragments with their own identity and digest: catalog and launch
  documents (identity: the machine-document revision), each host's listing
  (identity: its own reuse window, since a process listing has no stable
  stat), workspaces, and derived facts. The answer revision is the digest of
  fragment digests; an unchanged poll recomputes only fragments whose
  identity moved and never re-serializes the retained history.
- **Two audiences:** the regular answer carries the live overview, meaning
  open sessions, attempts still needing attention, and the done sessions
  the Board's Recently done cards and the sidebar's collapsed section show;
  the history is answered by the same boundary with an explicit
  `history` ask when a page expands Recently done sessions or opens a
  retained session's report. The browser keeps one read module and one
  revision rule ([reads](../../../dashboard/src/machineSessionsReads.ts)).

## Outside-in proof

| Example | Signal |
| --- | --- |
| 1 Evidence survives replacement | Boundary: three failed reads of distinct categories, server closed and restarted on the same machine directory; the diagnostics read on the new server lists them with category, queue wait, owner pid and generation, newest first |
| 2 A stall is attributable | Boundary: a test-only 2 s block in the server; the next diagnostics read shows one `stall` with delay ≥ 1,900 ms, load average, revision, process age, and an `at` within the block's second |
| 3 A lost process reads as lost | Boundary: server killed with SIGKILL; the next server's diagnostics read marks that pid's record `lost` |
| 4 Unchanged poll stays cheap | Replay: ~1,000 records and attempts, no change; poll with held revision answered `unchanged` within 250 ms wall and 20 ms event-loop time; a concurrent trivial request within 20 ms |
| 5 Live overview, history on demand | Boundary and page: 1,000 done and five open; regular answer holds the five and the shown done sessions; expanding Recently done sessions or opening a done report reads the history and renders as before |
| 6 One state change | Replay: one native state change; next answer's revision differs and only that Session entry differs; within the unchanged target plus one host listing |
| 7 Recovery across owner replacement | Page: snapshot A shown with time; owner replaced while a read is queued; the read fails local, snapshot A stays labelled, the failure is in the record, the page recovers without reload and without a duplicate dispatch |
| 8 Evidence is safe | Boundary: a failure carrying the secret marker and a socket path; neither appears in the diagnostics answer nor in the record file |

Commands (from this worktree, after `setup-native`):
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`
for Playwright; `bash scripts/test.sh <paths>` for node tests. Local gates:
slices 4–6 change the shared sessions read path and slice 1 the shared
read boundary, so run the full `npm test` (Homebrew Bash 5 first on PATH,
under `caffeinate -i`) and the whole dashboard suite on the final state
before publishing, classifying failures under external load as the
project's memory describes. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written: a failing or flaky test is a defect to fix, reproducing on main
is attribution not exemption, CI failing on a published revision is the
publisher's to repair through to final CI, never rerun-until-green, stop
only for product, design, or credential judgment, and preserve another
active owner's uncommitted repair.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A failed, dispatched call reports `askedAt` and `startedAtMs`, so queue wait is derivable without a protocol change | slice 1's queue-wait field | `github-requests.mjs` lines 98–130: `#failed({cause, startedAtMs, askedAt: answer.askedAt, answer})` on a told failure | settled by code read; slice 1's proof asserts the field on a held-then-failed read, and a missing value changes the field to "not dispatched" |
| Owner identity is readable from the endpoint generation record | slice 1's owner fields | `/tmp/dough-github-requests-501/<id>/owner.1.json` holds `pid`, `protocol`, `socket`, `token` | settled 2026-11-03; token and socket are excluded by the restriction |
| The runtime histogram measures a block without loop time of its own | slice 2 | `node -e` block of 300 ms inside a timer: max 313 ms, p99 313 ms, Node v24.21.0 | settled 2026-11-03 |
| The Claude listing bounds an unchanged poll's wall time | slice 5's target | `claude agents --json --all` on this machine: 0.16–0.20 s, 1,176 entries | settled 2026-11-03; target set to 250 ms wall |
| The unchanged poll's cost is the full re-observation | slices 5–6 | production: unchanged poll 390–580 ms, trivial request p99 130 ms during polls vs 1.1 ms without | settled 2026-11-03 |
| The boundary harness can hold ~1,000 records and attempts cheaply | slice 4 | not yet observed: the fixture writes the machine documents directly in the test HOME | early probe inside slice 4: if seeding 1,000 records takes over a minute or the harness refuses, the slice records why and the sizing changes before slices 5–6 |

## Ordered slices

### 1. Failed reads outlive the process
Type: Behavior
Status: done
Proof: `boundary/authenticated-read-incident-record.spec.ts` (and its
`-bounds` companion) with a
restart on the same machine directory (examples 1 and 8): the diagnostics
answer lists the earlier process's failures newest first with `category`
(`local` | `upstream` | `unknown`), `queueWaitMs`, `dispatched`, `ownerPid`,
`ownerGeneration`, record start, and dropped count; the secret marker and
socket path appear in neither the answer nor the file; a bounds case prunes
to the configured entry and byte limits; `authenticated-read-owner-failures`
and the two diagnostics specs stay green. Document the record in
`dashboard/GITHUB-REQUESTS.md` beside the diagnostics paragraph.

Behavior: a process retains failed reads → it is replaced → the next
process's diagnostics read lists them with their attribution.

### 2. A self-observed stall and a lost process are recorded
Type: Behavior
Status: planned
Proof: boundary spec with a test-only block endpoint or env hook (examples
2 and 3): one `stall` entry with delay, load average, revision, process age;
`process-started` and `process-ended` entries around a clean close; a
SIGKILLed server is marked `lost` by its successor's read. Sampling cost:
the histogram's own resolution, no synchronous file work on the loop.

Behavior: the event loop is blocked past the threshold → the next
diagnostics read shows the stall; a process ends without closing its record
→ it reads as lost.

### 3. Recovery across an owner replacement keeps the snapshot and leaves evidence
Type: Behavior
Status: planned
Proof: page spec built on the owner-replacement fixtures (example 7): the
page shows revision A with its retrieval time; the owner is replaced while
a read is queued before dispatch; the read fails `local`, the snapshot stays
labelled, one `failed-read` entry names the old owner, and the page's
existing recovery completes the read without a reload and without a second
dispatch of a post-dispatch loss. Preserves the eight-call cap and the
directed cooldown, asserted by the existing shared-request-owner spec.

Behavior: a queued read loses its owner → the read fails as local, the page
keeps its snapshot, and recovers once the new owner answers.

### 4. A repeatable replay reports the Sessions baseline
Type: Behavior
Status: planned
Proof: a boundary-mode measurement spec (or `scripts/` node script using the
harness) seeds ~1,000 done records and attempts plus five open sessions in
the test HOME, then reports startup, cold full answer size and time, an
unchanged poll's wall and event-loop time (histogram), one state change,
and a concurrent trivial request's p99, as a table in its output. Run it
on the unchanged code first and keep that table in this plan's learnings as
the baseline; its numbers must be within noise of the production baseline
(unchanged 390–580 ms, stall ≈130 ms). This slice is the early probe for
the fixture premise above.

Behavior: the replay is run → it prints the measures the story targets,
reproducibly.

### 5. The observation re-observes only what moved
Type: Structure
Status: planned
Proof: examples 4 and 6 on the replay: unchanged poll within 250 ms wall
and 20 ms event-loop time, concurrent trivial request within 20 ms; a single
native state change yields a new revision whose body differs only in that
entry; `agent-launch-sessions-unchanged`, `-fresh`, `shared-observation`,
the codex observation specs, and `system-settings-feedback-maintenance-unchanged`
stay green, as does the notification observer's use of `machineSessions`.
Enables slice 6.

Structure: `observeMachineSessions` becomes fragments with identities and
digests (launch documents by machine-document revision; each host's listing
by its own reuse window; workspaces; derived facts), the answer revision is
the digest of fragment digests, and the serialized history is kept per
fragment instead of rebuilt per demand.

### 6. The regular answer is the live overview; history is read on demand
Type: Behavior
Status: planned
Proof: example 5 as a boundary case (regular answer holds the five open and
the shown done sessions; a `history` ask returns the rest) and a page
journey (Recently done sessions expanded shows the retained list; opening a
done session's report renders as before; Mark as done, delete, reattach,
and fresh action-time checks on a retained session still work). Consumers:
every reader of `records` with `doneAt` in `dashboard/src`
(`sessionShown`, `launchRecord`, `completionReport`, `nativeSessionShown`,
`SessionsSidebarSessionEntry`, `sessionRecovery`, `sessionRecordActions`,
`SessionEntry`, `SessionDetails`, `sessionCapabilities`, `PageFrame`) are
traced with the consumer-trace script; the `agent-launch-*` page and
boundary suites stay green. Replay reports the regular answer size and the
cold time against the 300 ms target. Update `dashboard/AGENT-LAUNCH-HISTORY.md`.

Behavior: a page polls → it receives the live overview; it expands Recently
done sessions or opens a retained session → that history is read then.

## Current decisions

- Evidence names the owner by pid and generation only; token and socket
  path never leave the endpoint directory.
- The incident record is its own append-and-prune file set under the
  machine home, written asynchronously; the machine JSON store's lock is
  not used for it.
- The host listing keeps a reuse window rather than an identity; the
  unchanged-poll target is wall time bounded by that listing plus 20 ms of
  event-loop time.
- The history ask reuses the sessions endpoint with an explicit parameter,
  not a second endpoint.
- Slices 1–3 are a safe stopping point: evidence and recovery land without
  the sessions change. Slices 4–6 are the second.

## Learnings

- 2026-11-03 production baseline (1,023 records, 1,034 attempts): cold
  full answer 9.67 MB in 0.42 s; unchanged polls 0.39–0.58 s; trivial
  request p99 130 ms during polls, 1.1 ms p90 without; Claude listing
  0.16–0.20 s for 1,176 entries; machine load average 31–33 on 16 cores.

- 2026-11-03 slice 1: the incident record is `dashboard/server/incidentEntry.ts`
  (entry schemas; add `stall`, `process-started`, `process-ended` to its
  discriminated union), `incidentRecordFiles.ts` (append-and-prune files under
  `~/.open-dough/dashboard/incidents/`), and `incidentRecord.ts` (process
  fields, serialized write queue). The diagnostics answer keeps `failures`
  (this process, oldest first) and adds `record` (`startedAt`, `dropped`,
  cross-process `failures` newest first, filtered by source); slice 2's
  source-less stall and lifecycle entries need their own place in `record`.
  Failure classes are named `failureCategory` because `category` already names
  the read category. The owner identity reaches the failure callback from the
  link's standing record as `{pid, generation, protocol}`. Accepted proof:
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/boundary/authenticated-read-diagnostics.spec.ts dashboard/tests/boundary/authenticated-read-diagnostics-bounds.spec.ts dashboard/tests/boundary/authenticated-read-incident-record.spec.ts dashboard/tests/boundary/authenticated-read-incident-record-bounds.spec.ts dashboard/tests/authenticated-read-owner-failures.spec.ts`
  (16 passed) and the wider authenticated-read/shared-request-owner family
  (218 passed). Once full, each append re-reads and rewrites up to 512 KiB;
  off the request path, revisit with a prune margin if stall bursts make it
  matter.

## Concern evidence

Refinement ran as part of planning: the first draft had the replay after
the observation change; it was moved before it so the baseline is observed
on unchanged code, and the fixture-size premise became slice 4's early
probe. Remaining concerns: none beyond that probe, which the plan bounds.
Slice 6 is the largest (client consumers of done records); its
consumer-trace obligation is named in its proof.

## Story obligations

### G1. A failure queued for writing is lost when its process ends
Reported: slice 1 — "a failure queued for writing when the process is killed is lost"
Story clause: "Each failed upstream read the dashboard waited on"
Disposition: receiving slice 2

### G2. An append during another process's prune can be lost uncounted
Reported: slice 1 — "An entry another process appends between a prune's read and its rename is lost and not counted"
Story clause: "how many entries it dropped at its bound"
Disposition: no user cost "can read evidence that locates the failure even after the production preview was replaced": the loss needs two dashboard processes of one user appending within the same prune's read-and-rename window; production runs one preview per user, and the replaced preview has stopped writing before its successor starts, so the evidence of a replacement incident is not lost
