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

Exclusions: This plan gives no shared-observation promise to story-specific reads (`stateOf`, recorded lookups, verification);
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
Status: done
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

Accepted proof (2026-10-31): `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/agent-launch-codex-observation-sharing.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-wait.spec.ts dashboard/tests/boundary/shared-observation.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-status.spec.ts --reporter=list`
→ 11 passed after refactoring; `dashboard/tests/agent-launch-sessions-unanswered.spec.ts`
(503 keeps listed sessions; a hidden page aborts its read) passed. Before the
test-only refactor, the whole `dashboard/tests/boundary` directory (882), 146 UI
journeys over the session list and alerts, and `bash scripts/test.sh` passed.

Learnings:
- The observation key is the catalog array reference, this server's machine
  document write count, and the identity of every `*.json` in the machine
  folder. So record writes by any process stay visible on the next read, and
  only native-session and installation facts take the 1 s window. Nothing in
  the observation itself writes a machine document. Slice 4's measurement
  confirms one observation per window on this machine.
- The test harness defaults `DOUGH_SESSIONS_REUSE_MS` to 1 ms. Journeys that
  freeze page time expect each pace to show a native change. Reuse specs pass
  `sessionsReuseMs: 1_000`, and in-flight joining runs everywhere.
- The latest settled observation, about 9 MB serialized on this machine, stays
  in memory until the next demand. Slice 4's heap measurement includes it.
- The first CI run on slice 1 (`41188326936`) failed only `lint` and
  `dashboard (8/12)`. Both stopped at the npm install step with "npm source
  stalled: acquisition deadline exceeded", which is infrastructure. Every other
  job passed, including the shards with slice 1's specs. Slice 2's push reruns
  them.

### 3. A viewer holding the current observation receives an unchanged answer
Type: Behavior
Status: done
Proof: boundary spec (example 3), body size under 1 KB when unchanged; the
existing session-list UI journeys green with the poll sending its revision;
`FeedbackMaintenanceSettings` and `launchRecordActions` reads (no revision)
still receive full answers.

Behavior: The page's poll sends the revision of its last full answer. A
matching revision → `{unchanged: true, revision}`, and the page keeps its
records and facts while counting the read as settled. A differing or absent
revision → the full shared body with its revision.

Accepted proof (2026-10-31): `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/agent-launch-sessions-unchanged.spec.ts --reporter=list`
→ 1 passed. A held revision is answered `{revision, unchanged: true}` under
1 KiB. No revision, or an older one, gets the full body, which leads with its
revision (the SHA-256 of the rest). A Done mark changes the revision.
`dashboard/tests/agent-launch-session-state-pace.spec.ts --repeat-each=3`
→ 6 passed. A quiet pace's answer is unchanged, with every entry kept, and a
changed state comes back in full. The readers that send no revision
(`agent-terminal-done-reopen`, the `feedback-maintenance` specs) still get full
answers. Before the refactor, the whole `dashboard/tests/boundary` directory
(884), 146 UI journeys, and 53 specs that intercept sessions passed.

Learnings:
- The page sends its revision in the `x-open-dough-sessions-revision` header.
  A query string would stop `**/__agent-launch` route globs from matching.
- Unchanged answers need quiet machine documents. The page's own
  `reconciledAt` writes after a start make the next poll or two full.
- Equal attempt content can serialize in a different key order, depending on
  whether it came from memory or was re-read. That costs an extra full answer,
  never a stale one.
- CI run `41191328229` on slice 2 failed only `test (1/3)` and
  `dashboard (2/12)`, both at the npm install stall that hit slice 1's run. Every
  other job passed, `lint` included.

### 4. Cursor held-session reads share one runner read, and final cost is measured
Type: Behavior
Status: done
Proof: example 6 spec with `cursorRunnerHeldReads.ts`; the existing
`cursor-runner-sessions*.spec.ts` and `cursor-session-classification.spec.ts`
green; the example 7 measurement recorded here against the baseline.

Behavior: Overlapping held-session evidence asks from the list endpoint,
session admission, and Cursor session observation → one runner `GET
/sessions` and one parse (through slice 1) shared while it is outstanding.
The next ask after it settles reads again, so the list's live cadence keeps
current labels.

Accepted proof (2026-10-31): `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/cursor-runner-sessions-sharing.spec.ts --reporter=list`
→ 1 passed. Three overlapping list asks and a sessions ask, made while a runner
read is held, forward exactly one runner `GET /sessions` and get identical
lists. With sharing bypassed the spec fails (4 vs 7). The next ask after it
settles reads again. All `*cursor*` specs plus the slice 2 sharing specs: 173
passed. `bash scripts/test.sh` passed.

Final measurement (scratch probes, not committed; this machine's real
documents copied into a temp HOME, `initializeProjectConfiguration("production")`).
Baseline runs at `7ad60a6f` and final runs alternated, at load averages
2.5–4.9. Times are medians of cycles 2–3.

| Asks | Baseline ms | Final ms | Baseline peak MiB | Final peak MiB | Parses per cycle (records/attempts) | Observations per cycle | Runner reads |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ×1 | 303–326 | 196–206 | 131–162 | 75 | 4/1 → 0/0 | 1 → 1 | 1 → 1 |
| ×3 | 826–845 | 186–204 | 255–297 | 70–71 | 12/3 → 0/0 | 3 → 1 | 3 → 1 |
| ×8 | 2,158–2,291 | 193–215 | 593–689 | 70–71 | 32/8 → 0/0 | 8 → 1 | 8 → 1 |
| held Cursor ×1/×3/×8 | 27 / 69–77 / 181–217 | 2 / 2 / 2 | 69 / 88–90 / 157–230 | 51–52 | records 1/3/8 → 0 | — | 1/3/8 → 1 |

- The unchanged answer is 96 B, against a 9,234,824 B full answer.
- A replaced attempts document is parsed once at any viewer count.
- Settled heap after GC is 51 MiB at every viewer count, stable over 10 more
  windows. Before the change it was 22 MiB. The ~29 MiB difference is the retained
  set that scope "Bounded admission" names: the held parsed documents
  (~13.4 MiB) and the latest machine observation (~15–19 MiB).
- Native host stores were absent from the temp HOME in both builds, so native
  listing cost on real native data is not in these numbers.

Learnings:
- `SharedObservation` with a 0 reuse window gives join-in-flight-only
  sharing. A stop's confirmation read still calls `readCursorRunnerSessions`
  directly, so it never joins a read that started before the hangup.
- The full dashboard suite failed locally only in the recently-done sidebar
  specs. They build their expected time text with Node's locale (`en_SG`)
  while Chromium renders `en_US`, and they fail the same way at `7ad60a6f`.
  This increment fixes them. Three `story-reference-done` failures under load
  (19.8) passed on a `--workers=2` rerun.

- CI repair after slice 4 (run `41195930489`, `dashboard (4/12)`): the npm
  stage's 45 s bound was being spent by npm's advisory (audit) request.
  Measured over the last 60 runs: the install step took a median of 4 s on
  2026-10-30 and 38 s on 2026-10-31, with 38 stalls across branches and main.
  `scripts/setup-native.mjs` now runs `npm ci --no-audit --no-fund`.
  `bash scripts/test.sh tests/native-setup.sh` failed before the fix and
  passes after it. A local `node scripts/setup-native.mjs npm` took 1.48 s.

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

## Execution complete

Product advice:
- Correction [SEED-202#consistent-shared-refresh](../428-consistent-shared-refresh/PLAN.md)
  is planned and ready. It covers four things: a page can be told "unchanged"
  while showing a state changed outside the poll; the settings view still
  downloads the full answer; Cursor joiners can miss a just-written record;
  and file identity is defined in two places. The independent outcome review
  found these. Recommend queueing it first, since finding 1 can leave a page
  stale indefinitely.
- Consider letting an explicit re-read (offers after a host change) skip
  settled reuse while still joining a running observation. Today it can get
  a result up to 1 s old and then wait 15 s. This is within the story's
  decided 1 s window, so it is advice, not a correction.
