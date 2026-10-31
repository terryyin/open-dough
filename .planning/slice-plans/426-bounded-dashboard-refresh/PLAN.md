# Keep dashboard refresh work bounded across viewers

**Identity:** SEED-202#bounded-dashboard-refresh
**Source:** [Refined story](../../seeds/SEED-202-bounded-dashboard-refresh.md#bounded-dashboard-refresh)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Serve every viewer's `/sessions` refresh, the Running Cursor sessions list,
and the notification observer from one bounded shared observation. Reuse the
parsed machine documents, and send small unchanged answers. Session state must
stay as current and correct as today. The source owns the complete scope,
decisions (1 s settled reuse, join-in-flight Cursor reads, unchanged answers,
bounded wait with a retryable answer), deferred promises, and key examples.

Exclusions: GitHub revision-check sharing (sibling story
`SEED-202#shared-github-revision-checks`). This plan gives no shared-observation
promise to story-specific reads (`stateOf`, recorded lookups, verification);
they get the document reuse for free. Terminal streams and browser-side
retention are also out of scope.

Useful stopping points: after slice 1, every refresh parses each document at
most once while it is unchanged. After slice 2, viewers share one observation.
After slice 3, unchanged refreshes are small. Slice 4 adds Cursor-list sharing
and the final measurement.

## Design and reuse

Consistent with Accepted
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
parsed documents and observations are disposable, in-memory, per-server
derived state, and every read still consults the file. Under
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
completion is equivalent state at lower measured cost (baseline in the source).
No ADR conflict, and no North Star topic is warranted.

PFE:

- **Document reuse** lives in `dashboard/server/machineJsonStore.ts`
  `readMachineJson`, the single reader for both documents, so both stores
  gain it at once. Each read runs `stat` (bigint `ino`, `mtimeNs`, `size`). A
  matching identity returns the held parse; otherwise read, parse, validate,
  and replace the held entry. A failed parse holds nothing, so an unreadable
  file is answered unreadable on every read, exactly as today. Hold one entry
  per file path. Retention filtering stays in callers at read time
  (`launchRecordStore.ts`). The parsed document must be treated as immutable:
  callers already map or filter rather than mutate. Execution checks this for
  `replaceMachineJson` callers, which receive `stored`. The authoritative read
  under the write lock bypasses the held parse and must not mutate a shared
  value.
- **Shared outstanding work** gets a small dashboard owner, not
  `OutstandingReads` from
  `src/skills/dough-execute-plan/scripts/github-request-outstanding.mjs`.
  That module removes its entry when its bound fires, and `waitFor` aborts the
  read once no requester waits. The native observation takes no signal (see
  premises), so that would let a second observation start while the first
  still runs, and would end the observer's demand when browsers leave. The
  owner holds at most one in-flight promise per kind until it settles,
  whatever its waiters do, plus the latest settled result with its settle
  time. Each waiter races the in-flight promise against its own wait bound
  (the `readWaitLimitMs` 30 s read wait through `configuredLimit`, shortened
  in tests) and its own request abort. A failed observation keeps no result.
- **One machine-session observation** is a new owner beside `AgentLaunches`.
  It produces the whole `/sessions` body: records, attempts, creations,
  catalog facts, starts, alerts availability, and workspaces. It serializes
  the body once per observation, and its revision is the SHA-256 of that
  serialization. `launchBoundaryAnswer.ts` "sessions" writes the shared
  serialized body (or the unchanged answer). `sessionAlerts.ts` reads the same
  observation's records. Keep `savedSessionServices.refresh()` inside the
  observation, once per observation.
- **Cursor evidence**: `heldCursorSessionEvidence` is reached by the list
  endpoint, by `sessionAdmission.ts`, and by Cursor session observation
  (`hosts/cursor/sessions.ts`, inside `withStates`). Share at the evidence
  level, joining an in-flight read only, so all three consumers benefit and
  the list's live cadence keeps current labels.

Common rule: one shared derived observation per kind, validated against
machine evidence on each use. There are no per-consumer caches and no
parallel representations.

## Outside-in proof

| Source example | Owner | Observable proof |
| --- | --- | --- |
| 1 concurrent viewers + observer share one observation | Slice 2 | New boundary spec beside `agent-launch-codex-observation-concurrency.spec.ts`: 8 concurrent `GET /sessions` against held Codex reads. Every answer has equal records and attempts, and native `thread/read` calls equal one observation's count, not 8×. The notification observer joining the held observation adds no calls. |
| 2 settled reuse within 1 s, fresh after | Slice 2 | Same spec: an ask 400 ms after settle adds no native calls. An ask after 1.5 s adds one observation's calls (window timing through `configuredLimit`). |
| 3 unchanged answer | Slice 3 | Boundary spec: an ask with the held revision gets an unchanged body under 1 KB. After a record write (Done mark), the revision differs and the full body returns. A UI spec (existing session-list journey) shows unchanged sessions still listed and a changed state shown after the next poll. |
| 4 cross-process replacement; unreadable replacement | Slice 1 | Boundary spec using two servers' shared machine folder (pattern of `agent-launch-records.spec.ts`): server B records a launch, and server A's next `/sessions` includes it. Overwrite by rename with same-size invalid JSON after a good read: the answer is unreadable (no records) and the file is left in place. Existing unreadable-store tests in `agent-launch-records.spec.ts` and `launch-attempt-retention.spec.ts` stay green. |
| 5 slow observation, departing waiter, bounded wait | Slice 2 | Boundary spec with held native reads and a shortened wait bound: three waiters, one aborted. The others still receive the answer when it is released within the bound. Past the bound they get a retryable 503, no second observation starts while the first runs, and the next ask after release succeeds. The UI keeps prior sessions on 503 (existing unanswered path, `agentLaunchClient.ts` `readMachineSessions`). |
| 6 Running Cursor lists in several browsers | Slice 4 | `cursor-runner-sessions-demand.spec.ts` extension using `cursorRunnerHeldReads.ts`: three overlapping list asks while a runner `GET /sessions` is held produce one forwarded runner read, and every list shows the same sessions after release. |
| 7 memory settles, counts independent of viewer count | Slice 4 (whole plan) | Rerun the source's baseline probe (below) on the final state: parse counts per refresh ≤1 per changed document, and native observation once per window at ×1/×3/×8. Peak heap at ×8 near ×1 plus answer bytes, settling at baseline. Record the numbers and the load in this plan. |
| Document reuse lowers parse count | Slice 1 | The read-count probe: an unchanged `/sessions` body shows 0 parses of each document after the first, and a changed file shows 1. |

Baseline probe (scratch, not committed). Run it in the preparation or
execution worktree with dependencies installed:
`node --experimental-transform-types --import <tmp>/count.mjs <tmp>/probe.mjs <worktree>`
for read counts, and `node --expose-gc --experimental-transform-types <tmp>/heap.mjs <worktree>`
for heap and timing at ×1/×3/×8. The scripts are reconstructable from the
description: an `fs.readFile` counter over `~/.open-dough/dashboard/` via
`syncBuiltinESMExports`, and `AgentLaunches` and `heldCursorSessions` called
directly after `initializeProjectConfiguration("production")`. Compare
relatively under load, as the project's test-speed guidance requires.

## Decisive premises

Observed 2026-10-31 in this preparation's worktree
(`claude/keep-dashboard-refresh-work-bounded-across-viewe` at `a073c2cd`),
Node 24.21.0, darwin, with the integration checkout's dependencies symlinked
temporarily (same `package-lock.json`, removed afterwards):

- **Reads per refresh** (consumer: slice 1 and 2 acceptance). The read-count
  probe through the real modules showed `attempts` 1× `launch-attempts.json`,
  `machineSessions` 2× `agent-launches.json`, `creations` 1×, and the
  held-Cursor read 1×. Settled.
- **Cost and size** (consumer: example 7 baseline, slice 3 value). The heap
  probe with production projects (1,108 records, 1,090 attempts) showed
  ×1 607 ms / 79 MiB, ×3 1,789 ms / 159 MiB, ×8 6,398 ms / 532 MiB, settling
  near 19 MiB. The body serializes to 4.79 MB of records plus 4.41 MB of
  attempts. Load averages were 22–27. Settled.
- **Replacement changes file identity** (consumer: slice 1 invalidation). A
  same-size write through temp-file rename changed both `ino` and `mtimeNs`
  (node `statSync` bigint, APFS). The only writers of either document are
  dashboard server modules through `replaceMachineJson` rename (grep of
  `src`, `dashboard/server`, `scripts`). On Linux CI filesystems, rename also
  assigns the new file's inode. Slice 1's cross-process spec observes this
  in CI. Settled locally; CI observation belongs to slice 1's own proof.
- **Native observation takes no abort signal, and the GitHub outstanding
  reader drops entries at its bound** (consumer: slice 2 owner design).
  `withStates(folder, records)` has no signal parameter
  (`dashboard/server/launchStates.ts:42`). `OutstandingReads.#started` calls
  `#ended` when its bound fires, and `waitFor` aborts when the last waiter
  leaves (`github-request-outstanding.mjs`). So waiters are bounded, and the
  observation runs to settlement while blocking a second one, in a dashboard
  owner. Settled by reading the code that decides the design; slice 2's held
  read proof observes "no second observation while the first runs".
- **Count proof route through a real server** (consumer: slice 2 examples 1,
  2, and 5). Ran
  `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts --reporter=list`
  with the integration checkout's `node_modules` symlinked (removed
  afterwards). Both tests passed in 11.7 s: a boundary-mode server with the
  Codex native fixture serves the observer's `machineSessions` path, and the
  spec reads the fixture's `native.calls`. The new count spec uses this same
  route. Settled.
- **Retryable answer handled by the page** (consumer: slice 2 example 5 UI
  postcondition). `readMachineSessions` answers `undefined` on a non-OK
  response, and the poll keeps known records. That is a code read; existing
  specs intercept `**/__agent-launch` with `page.route`, so slice 2's UI step
  can observe it. If the page drops records, the fix is client handling inside
  slice 2. That would not change the approach or sizing, so it is not
  decisive.

## Slices

### 1. Each machine document is parsed at most once while unchanged
Type: Behavior
Status: done
Proof: new cross-process replacement and unreadable-replacement boundary
cases (example 4), plus `agent-launch-records.spec.ts`,
`launch-attempt-retention.spec.ts`, and `agent-launch-preparation-store-failure.spec.ts`
green. The read-count probe shows a parse only after a file change.

Behavior: Unchanged launch-record and attempt documents → any number of
reads within or across refreshes → one parse each, with identical answers.
A replacement by any process is observed on the next read. An invalid
replacement is answered unreadable and never served from the earlier parse.
The write path keeps its lock and atomic replacement.

Accepted proof (2026-10-31): `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/agent-launch-records.spec.ts dashboard/tests/boundary/agent-launch-records-replaced.spec.ts dashboard/tests/boundary/machine-json-reuse.spec.ts --reporter=list`
→ 12 passed (cross-server read and same-size unreadable replacement in
`agent-launch-records-replaced.spec.ts`; parse counts through a schema
`superRefine` counter in `machine-json-reuse.spec.ts`). The whole
`dashboard/tests/boundary` directory passed (876) before the test-only
refactor. Scratch probe on this machine's real documents: the first refresh
parses 2 documents, unchanged refreshes 0, a renamed replacement 1 (was 4 per
refresh).

Learnings: held documents are deep-frozen, so a mutating reader throws instead
of corrupting other readers' answers; none was found. A file modified less
than 1 s ago is parsed but not held, because Linux file times are coarse and a
freed inode can be reused, so two quick same-size writes could otherwise share
an identity. Slice 2's settled-reuse window absorbs those extra parses.

### 2. Viewers and the notification observer share one machine-session observation
Type: Behavior
Status: planned
Proof: new boundary spec for examples 1, 2, and 5 with the Codex native
fixture's call counts and held reads; the existing `session-alerts-helper.spec.ts`
and `agent-launch-session-listing.spec.ts` green; a UI check that a 503
keeps the listed sessions.

Behavior: Several `/sessions` asks and the observer poll at the same moment
or within 1 s of a settled observation → one observation (one
`savedSessionServices.refresh`, one native listing per host) serves all.
Each waiter is bounded by the read wait, and past it receives a retryable
503. A departing waiter leaves the observation running for the others. A
project catalog change starts a new observation. The body is serialized once
per observation.

### 3. A viewer holding the current observation receives an unchanged answer
Type: Behavior
Status: planned
Proof: boundary spec (example 3), body size under 1 KB when unchanged; the
existing session-list UI journeys green with the poll sending its revision;
`FeedbackMaintenanceSettings` and `launchRecordActions` reads (no revision)
still receive full answers.

Behavior: The page's poll sends the revision of its last full answer. A
matching revision → `{unchanged: true, revision}`, and the page keeps its
records and facts while counting the read as settled. A differing or absent
revision → the full shared body with its revision.

### 4. Cursor held-session reads share one runner read, and final cost is measured
Type: Behavior
Status: planned
Proof: example 6 spec with `cursorRunnerHeldReads.ts`; the existing
`cursor-runner-sessions*.spec.ts` and `cursor-session-classification.spec.ts`
green; the example 7 measurement recorded here against the baseline.

Behavior: Overlapping held-session evidence asks from the list endpoint,
session admission, and Cursor session observation → one runner `GET
/sessions` and one parse (through slice 1) shared while it is outstanding.
The next ask after it settles reads again, so the list's live cadence keeps
current labels.

## Current decisions

- Settled reuse window: 1 s for the machine-session observation. Cursor
  evidence joins an in-flight read only.
- Waiter bound: the existing 30 s read wait, then a retryable 503. There is no
  separate waiter cap.
- The revision is the hash of the shared serialized body. The unchanged answer
  carries only the revision.

## Plan review

Refinement was not needed: each slice is one outcome with its own proof loop.
Dependencies run forward: slice 2 relies on slice 1 only for cost, slice 3 on
slice 2's shared body, and slice 4 on slice 1. No preparatory Structure is
hidden. This review found no remaining slice-specific concern. The one design
question (reuse `OutstandingReads` or own the in-flight work) was settled
during planning from that module's bound and departure code.

## Local verification

Slices 1 and 2 change the shared read path behind most boundary specs: every
launch-record and attempt read goes through the reused parse. So before the
final publication, run the whole dashboard suite (`npm run test:dashboard`)
and `npm test` on the final state, not only the focused specs. Each slice
otherwise runs its focused specs through the project's test runner.
