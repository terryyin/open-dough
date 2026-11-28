# Keep full Dashboard frontend runs connected to their browser

**Identity:** SEED-413#keep-full-frontend-runs-connected

**Source:** [Keep full Dashboard frontend runs connected to their browser](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#keep-full-frontend-runs-connected)

## Goal and scope

Every full `npm run test:dashboard:frontend` run starts and reports every
selected file, locally and in CI. Capture a natural closure of the Vitest
orchestrator's connection with the event that precedes it, name the cause,
and remove it. The seed's Scope and Key examples are the acceptance source.

Excluded:

- Rerunning dropped files or whole runs as a fix.
- Changing worker counts (two locally, the runner's cores in CI) or
  serializing the two Chromium instances without the coordinator's
  agreement.
- Spec content, test selection, the backend group, and the ordinary failing
  cases seen in the measured window.
- Renderer memory growth, unless the capture shows it causes the closure.
  Slice 3's A/B showed that it does (2026-11-28).

## Current decisions

- **Story Branch Mode.** The hosted probe needs a workflow that runs only on
  the story branch. No slice acts from trunk.
- **A natural closure attributes the cause.** A forced reproduction can show
  a mechanism. Slice 5 starts only from an event captured before a natural
  closure. The seed records why: two mechanisms were reproduced and guarded,
  and the closure continued.
- **Capture and probe are temporary.** The capture is gated by an
  environment variable that only the probe workflow and the local capture
  command set, so `ci.yml` and the ordinary frontend command keep running
  the unchanged path on the same revisions. Both the capture and the probe
  workflow are deleted before the story branch lands. `ci.yml` is not
  edited: Distribution's `ci-browser-groups.test.mjs` and
  `ci-container-workflow.sh` check its frontend job's suite line, and an
  earlier capture that changed that line failed both (run `46026014984`).
- **Hosted is the primary capture route.** The closure rate is measured
  there. Local runs give the pre-change baseline for the seed's local
  example and may capture a closure as well.
- **No hiding.** Accept no fix that retries, reruns, or swallows a closure.
  The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written, including to any other failure a probe job shows.
- **Timing comparisons are relative.** Compare runs on the same host class
  under similar load, and record load averages with every local timed run.

## Decisive premises

Read at `6baaf31bb` with Vitest 5.1.0, `@vitest/browser` 5.1.0,
`@vitest/browser-playwright` 5.1.0 and Vite 8.3.8. The worktree resolves
`node_modules` from the integration checkout.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The run stops because the orchestrator's Vitest socket closes, not because the heartbeat ends it | Slice 1's capture target | Job `140834871152` (run `46098331829`, `99e48eb35`, 2026-11-28): the error comes from the WebSocket `close` handler at `@vitest/browser/dist/index.js:3101` through `Socket.socketOnClose`, with no heartbeat message. The installed source at that line rejects the orchestrator RPC's pending `createTesters`. | Settled. The TCP socket closed under a live server. |
| The closure occurs often enough in hosted jobs to capture | Slice 2's probe size | `gh run list --workflow ci.yml --limit 120` and each failed `dashboard-frontend` job log, read 2026-11-28: 13 closures in 85 completed runs between 2026-11-27 12:14 and 2026-11-28 02:37 UTC. | Settled at about 15%. Thirty jobs miss it with a chance under 1%. |
| The HMR reload guard does not stop the natural closure | Slice 5's starting point and slice 6 | Same job `140834871152`: `295 passed (332)` on `99e48eb35`, whose config contains `keepVitestOrchestratorOpen`. | Settled. |
| An earlier capture instrument is recoverable | Slice 1 | `git show 4bf8e5f05^:dashboard/test-support/support/frontendDisconnectCapture.ts` returns its 249 lines. It observes provider lifecycle, orchestrator navigations, page close or crash, and Chromium exit. | Settled. It records no Vite server events, which slice 1 adds. |
| A second workflow file on the story branch runs beside `ci.yml` and breaks no repository check | Slice 2's probe | `ci.yml` runs on every story-branch push (the runs above). A search of the test sources found readers of `ci.yml` by name and none that list the workflows directory. | Settled at `b9a8173d4`: both workflows ran, and the only failed `ci.yml` job (run `46103818368`) was `dashboard-frontend` with the closure. |
| The capture does not suppress the closure | Slice 2 | Slice 2 at `b9a8173d4`: two of ten hosted attempts and seven of eight local runs closed with the capture on. | Settled for slice 1's capture. Slice 3 re-observes it for its page-side additions. |
| The closure reproduces locally at two workers | Slice 2's local baseline and the seed's first example | Seed evidence at `67d52b5fa` and neighbors (2026-11-27): five of eight runs. One four-worker run at `003a5f4d0` finished. | Settled at `b9a8173d4`: seven of eight runs closed (slice 2). Local runs can therefore capture the cause and discriminate slice 5's repair. |
| What closes the orchestrator socket | Slice 5's repair | Slice 2's nine closures: the orchestrator page unloads gracefully 9–90 ms after the next file's tester connects. There is no Vite message, no earlier HMR loss, no crash or page close, and no committed main-frame navigation. | Settled by slice 3: renderer growth reaches Chromium's per-process mapping limit, and forcing the GC per file removes the closures (eight of eight clean). |

## Outside-in proof

| Promise (seed Key example) | Owner | Observation |
| --- | --- | --- |
| Eight consecutive full local runs each start and report every file | Slice 5 | Eight timed local runs at two workers with load averages, against slice 2's local baseline |
| Thirty consecutive hosted jobs on the repaired revision each report every file | Slice 6 | One probe round of thirty jobs with the capture off |
| A failing file is reported while every other file still runs | Slice 5 | Scratch failing assertion, reverted |
| A real connection drop fails the run and names the unstarted file | Slice 5 | Scratch renderer kill, reverted |
| Worker counts and wall time preserved | Slices 5 and 6 | The same local and hosted runs, with unchanged worker settings, against slice 2's durations |
| The ineffective closure guards leave | Slice 6 | The config and harness without the history guard, the SEED-430 decision on trunk, and the hosted round |
| The probe's ordinary failure is repaired, per the failure policy | Slice 4 | A reproduction that fails for the right reason, then repeated runs of the file under load and slice 5's full runs |

## Ordered slices

### 1. The capture records what happens around the orchestrator socket

Type: Behavior (early probe)
Status: done

Behavior: A frontend run with the capture variable set → one ordered,
timestamped log holds, for the orchestrator page, its main-frame
navigations, page close and crash, browser disconnect and Chromium exit,
each Vitest API connect and disconnect (`DEBUG=vitest:browser*`), and, from
the Vite server, each HMR socket open and close with its close code and
each full-reload message it sends. Without the variable the run is
unchanged.

Proof:

- Restore the instrument from `4bf8e5f05^` behind the environment gate and
  add the Vite server events. Log paths without query strings and no socket
  payloads.
- Run one existing spec with one worker and the capture on. The log shows
  the normal order: connect, tests, provider teardown, HMR close 1001, API
  disconnect, Chromium exit 0.
- Run the same spec with the capture off. The config resolves the ordinary
  provider and writes no capture log.
- `npm run typecheck:dashboard` passes.

Learnings (delivered):

- Capture contract: `OPEN_DOUGH_FRONTEND_CAPTURE=<absolute log path>` turns it
  on and writes one JSON Lines event per line (`at`, `elapsedMs`, `event`).
  Vitest's `vitest:browser` debug lines appear only when `DEBUG='vitest:browser*'`
  is also set before Vitest starts; the config cannot enable that debugger.
- The normal single-spec order at one worker: browser-open, page-open,
  main-frame navigated to `/__vitest_test__/`, api-connect orchestrator, two
  hmr-open, api-connect tester, provider-close, hmr-close 1001 (tester),
  page-close, api-disconnect tester, hmr-close 1001 (orchestrator),
  api-disconnect orchestrator, browser-disconnected, chromium-exit 0,
  provider-closed. Each run has one HMR and one API socket for the
  orchestrator and one each for the tester frame.
- The raw TCP close of an API socket reports `hadError: true` even in a
  normal teardown, so that flag cannot separate a failing closure.
- No full-reload was sent in the normal run; that event's line is checked by
  typecheck and by the same send wrapper that filters `connected`.

### 2. Probe rounds and local baselines record the closure's chronology

Type: Behavior (early probe)
Status: done

Behavior: Full frontend runs with the capture on, on hosted runners and
locally → runs end with `VITEST_BROWSER_CONNECTION_CLOSED`, and their capture
logs record the server-side events before the orchestrator socket closed,
with hosted and local timing baselines. Refined 2026-11-28: this slice was
planned to name the cause. Its stop rule applied, and naming the cause moved
to slice 3.

Proof:

- Add `.github/workflows/probe-frontend-connection.yml`. It triggers on
  pushes to the story branch only and runs the `dashboard-frontend` job's
  steps as a matrix of thirty attempts, `fail-fast: false` and
  `max-parallel: 5`, with the capture variable set. It uploads each capture
  log. Five parallel jobs beside the fifteen of `ci.yml` stay inside the
  account's twenty.
- On the first push, confirm that `ci.yml` and the probe both ran on that
  revision and that no `ci.yml` job failed because of the added files.
- Meanwhile run up to eight full local runs at two workers with the capture
  on, under the local gate below. Record each run's result, wall time and
  load. This is the local baseline.
- Cancel the remaining probe jobs once a captured closure names its
  preceding event. Record in this plan the run and job, the revision, and
  the decisive log excerpt. Record the durations of the completed probe
  jobs as the hosted timing baseline.
- Stop rule: if thirty hosted jobs and eight local runs give no closure, or
  a captured closure shows no preceding event, stop. The repair does not start.
  Record what was captured and return the plan for replanning. A probe job
  that fails another way follows the failure policy and does not count as a
  capture.

Progress:

- The probe workflow `.github/workflows/probe-frontend-connection.yml`
  copies the frontend job's anchored steps, ignores `.planning/**` pushes so
  plan updates launch no probe round, and switches the capture with its
  workflow-level `PROBE_CAPTURE`. Eight local tests that read workflow files
  pass with it present; none lists the workflows directory.
- Since slice 3, a probe round runs only for a push whose head commit
  message contains `[probe]`, so code pushes launch no unplanned round. A
  round launched by slice 3's first code push (run `46113713441`) was
  cancelled at once.

Captured closures (2026-11-28, `b9a8173d4`, capture on):

- Hosted probe run `46103818435`: attempts 2 (job `140851982667`) and 10
  (job `140851982749`) closed, after 179 and 279 files. Attempt 8
  (job `140851982644`) ran every file and failed one ordinary case,
  `intent-reading-place.spec.ts:141` (an unexpected story re-read after
  Development and back), which attempt 2 also failed. Seven attempts passed in
  187–280 s, the hosted timing baseline. Attempts 11–30 were cancelled once
  the repeated captures settled the stop below. The ordinary `ci.yml` run
  `46103818368` on the same revision also closed (`280 passed (332)`).
- Local baseline at two workers: seven of eight runs closed. Walls and
  results: 164 s (323 files), 168 s (183), 138 s (186), 220 s (329), 199 s
  (294), 173 s (229), 192 s (all 332, the one clean run), 178 s (228). The
  one-minute load ranged 4.7–7.3, with no other full suite running.
- Every one of the nine captured closures has the same chronology. The next
  file's tester connects (`api-connect tester`). 9–90 ms later the
  orchestrator's Vitest API socket closes cleanly (`hadError: false`, unlike
  the reset of a normal teardown). In the same 1–7 ms, one of the HMR sockets
  opened at startup, apparently the orchestrator page's own, and the new
  tester's HMR socket close with 1001 (going away). Decisive excerpt, hosted
  attempt 2: `37.620 api-connect tester`, `37.702 api-disconnect
  orchestrator hadError false`, `37.709 hmr-close 187 1001`,
  `37.709 hmr-close 12 1001`.
- No capture shows a Vite message sent (no `hmr-send` in any run), an earlier
  close of the orchestrator's HMR socket, a page crash, a page close, or a
  committed main-frame navigation before the closure. That rules out every
  candidate the premise table named. The closing file differs each time
  (`intent-project-scope-history-recovery`, `story-reference-done`,
  `published-read-of-another-project`, `intent-scope-timing-history-gaps`,
  `agent-roster-collection`, `intent-ci-history-chart-marks`,
  `intent-code-browse-java`, `intent-story-outside-locations`,
  `intent-story-result-browser`).

Outcome (2026-11-28): the stop rule applied. Closures were captured, but the
event before each one is an ordinary tester start, and the server-side
capture cannot see what begins the orchestrator document's graceful unload.
The developer approved the replan the same day: slice 3 adds page-side
capture, and slice 4 repairs the probe's ordinary failure.

### 3. The page-side capture names what begins the orchestrator's unload

Type: Behavior (early probe)
Status: done

Behavior: A full frontend run with the capture on ends with a closure → the
same log also holds, from inside each orchestrator page, what began its
unload. Navigation requests come with their reason and URL path. The log
also holds when the frame starts loading and its lifecycle events,
`beforeunload` and `pagehide`, the orchestrator's console messages, and each
WebSocket `close()` call made by page script with its call stack. Without the
capture variable the run is unchanged.

Proof:

- Extend slice 1's capture. Open a CDP session on each orchestrator page
  (`Page.frameRequestedNavigation`, `Page.frameStartedNavigating` or
  `frameStartedLoading`, `Page.lifecycleEvent`, `Network.webSocketClosed`,
  `Inspector.detached`, `Inspector.targetCrashed`). Add an init script that
  reports `beforeunload`, `pagehide` and `WebSocket.prototype.close` callers
  through a binding. Log paths without query strings and no payloads.
- Run one spec with one worker and the capture on. The log shows the
  page-side events in teardown order, and no close stack outside teardown.
- Run up to eight full local runs at two workers with the capture on, under
  the local gate below. Stop at the first closure whose page-side events name
  what began the unload: a navigation request with its reason, a page-script
  `close()` with its stack, or a detach or crash. Record the run, the
  revision, the decisive excerpt and the named cause in this plan.
- Only if the local runs give no closure, push once with `[probe]` in the
  head commit message.
  Cancel the round at the first named cause.
- Stop rule: if a captured closure shows no page-side event before the
  unload, or eight local runs and one hosted round give no closure, stop.
  Slice 5 does not start. Record what was captured and return the plan for
  replanning.

Page-side finding (2026-11-28, uncommitted capture on `9248fad65`, local
run 1 of the series: load 3.7, 145 s, `206 passed (332)`, closed during
`intent-ci-status-homepage.spec.ts`):

- The server saw the orchestrator API socket close cleanly
  (`api-disconnect orchestrator hadError false`, 144484 ms) first. 3 ms
  later the page reported all four of its sockets failed at once: HMR and
  Vitest API, in both the top frame and the new tester frame. Its console
  logged `WebSocket connection to '/' failed` and the same for
  `/__vitest_browser_api__`, then Vite's client logged `server connection
  lost. Polling for restart...` and requested a top-frame `reload`
  (144496 ms). The renderer detached 57 ms after that.
- In the 107 ms between the new tester's connect and the close, the page
  shows no script `close()`, no navigation request, no `beforeunload` or
  `pagehide`, and no detach or crash. The reload is Vite's reaction to the
  dropped connections, not their cause. The drop starts in Node's socket
  handling or in Chromium's network layer.
- The capture also showed three orchestrator pages for two workers. The
  third, opened at 8.6 s, is the one that closed.

Refined 2026-11-28 with the developer's approval: the slice's remaining work
names the side that drops the sockets.

Remaining proof:

- On each Vite upgrade socket (HMR and Vitest API), record whether the peer
  ended it (`end` before `close`, a remote FIN) or local code called
  `destroy()` or `end()`, and the caller's stack for a local call. Also
  record socket `error` events with their codes. Log paths without query
  strings and no payloads.
- Run one spec with one worker and the capture on. The teardown order now
  shows which side closes each socket.
- Run up to seven more full local runs at two workers under the local gate.
  Stop at the first closure whose server-side events name the closing side,
  with the local caller's stack when it is the server. Record the decisive
  excerpt and the named cause.
- Stop rule: if a closure shows neither a remote end nor a local call, or
  the runs give no closure, stop. Record what was captured, and return the
  plan for replanning.

Server-side finding (2026-11-28, uncommitted capture on `5bf4f3bbd`, local
run `s3b-local-1`: load 4.1, 126 s, closed at 207 of 332 files):

- The orchestrator's Vitest API socket first received a WebSocket close
  frame from the browser with code 1001 (Going Away). Within about 1 ms the
  same page's two HMR sockets and its new tester socket received 1001 as
  well. Before that frame the server called no `destroy()` or `end()`, saw
  no error and got no bare remote end. `ws` then answered with its own close
  frame and `end()`, the browser reset the connection (`ECONNRESET`), and
  Vitest reported the disconnect.
- Chromium therefore drops every socket of one orchestrator page at once,
  while that page's script keeps running (it logs the failures and Vite
  polls afterwards). The cause sits inside Chromium, below page script. The
  specs' own `cdp()` calls (device metrics, emulated media, one URL block in
  `agent-roster-collection.spec.ts`) explain no whole-page drop by reading.

Refined again 2026-11-28 with the developer's approval: the slice's
remaining work reads Chromium's own record of why it closed the sockets.

Remaining proof (NetLog):

- With the capture variable set, launch Chromium with `--log-net-log` to a
  per-browser file in the evidence location (default capture mode, no
  bytes), and log each spec `cdp()` command's method and the page it
  targets. Without the variable the launch arguments are unchanged.
- Run one spec with one worker. The NetLog file is written and parses.
- Run up to six more full local runs at two workers under the local gate.
  Stop at the first closure. Read the NetLog for the orchestrator's sockets
  at the closure time: the close source and reason, and any network-service,
  socket-pool or proxy event that precedes it. Record the decisive excerpt
  and the named cause.
- Stop rule: if NetLog shows no event before the close, or the runs give no
  closure, stop. Record what was captured and return the plan for
  replanning.

Named cause (2026-11-28, developer-approved A/B in place of the NetLog run):

- Public reports match these captures. When one page runs many files,
  Chromium's renderer reaches a per-process limit and drops every socket of
  that page with 1001 while its script runs on. The limit is shared-memory
  mappings: each tester iframe's 304 revalidation of a module leaves a 2 MiB
  mapping. Reports: SigNoz/components#377, niranjan94/kinako#93,
  toolboxmd/chromeria#873 and vitest-dev/vitest#11968.
- Vitest 5.1.0 already carries a forced Chromium GC for this Chromium bug
  (crbug 530892387). It runs only on Linux and only below 4 GB of free disk.
  Hosted attempt 2 logged its check 180 times, all `triggered: false`.
- A/B at `6d4f86ac3`, eight full local runs at two workers, capture on,
  with `VITEST_CHROMIUM_GC_DISK_THRESHOLD_GB=1000000
  VITEST_CHROMIUM_GC_FORCE=1`. The GC triggered for every file. All eight runs
  reported all 332 files with no closure and no failure, in 191–243 s
  (median about 217 s) at one-minute load 3.7–10.2. The same series without
  the GC had seven closures in eight runs, at load 4.7–7.3. Its one complete
  run took 191 s.
- Upstream fix: vitest-dev/vitest#11914, released in v5.1.1 on 2026-11-17.
  It lets tester iframes reuse cached modules during `vitest run`, which
  removes the per-file 304s. The cache stays off for watch mode,
  `persistentContext`, the `preview` provider, request-interception mocks
  and `vi.mock` factory shims. The latest release is 5.1.2.
- Slice 5's repair is therefore inside Vitest. Under slice 5's rule it waits
  for the developer's choice between upgrading Vitest and forcing the GC
  (or both).

### 4. A deep spec read stays unread after Development and back

Type: Behavior
Status: done

Behavior: Under full-run load, `intent-reading-place.spec.ts:141` ("the deep
spec read with Changes only on, out collapsed and Purpose scrolled is shown
the same after Development and back") → returning from Development shows the
same read without reading the story again. The case fails only when a real
re-read happens.

Proof:

- Evidence: probe attempts 2 and 8 (run `46103818435`) failed at line 166,
  `expect(mounted.reads).toEqual([])`, with the received value
  `["story text dashboard/tests/boundary/deep/long.spec.ts"]`.
- Diagnose the cause in [rounds](../../../.claude/skills/dough-execute-plan/references/diagnosis-rounds.md)
  as needed. Reproduce it with a minimal observation that fails for that
  reason, for example the file repeated under parallel load or a determinate
  timing trigger.
- Repair the cause in the product or the test, whichever holds the defect.
  Rerunning is not a repair.
- The file passes repeatedly under the same load that reproduced it, and it
  passes in slice 5's full local and hosted runs.
- Developer decision, 2026-11-28: this repair belongs to this plan, under the
  failure policy's rule for any failure a probe job shows. The seed's
  exclusion still covers the ordinary failures from the earlier measured
  window.

Delivered (2026-11-28): the test held the defect. `StoryReviewFileDiff`
reads the file's diff, then its texts for the omitted context, with
`.story-review-code` `aria-busy` while that second read runs. The case cleared
`mounted.reads` before that read finished, so a late or cancelled read
counted as a re-read. The case now waits for `aria-busy` to be `false`
first, through the shared `diffContextReading` reader, which the notes spec
also uses now. Proof: a 300 ms delay on the text read reproduced the CI
failure at line 166 before the change and passed after it. The file passed
20 runs in a row under one CPU burner per core (load 5–25). The full runs
in slice 5 carry the remaining proof that it passes in a whole run.

### 5. Full frontend runs finish every file

Type: Behavior
Status: done

Behavior: The full frontend group runs under ordinary load, locally at two
workers and on hosted runners → every selected file starts and reports. A
file with a failing test is reported failed while every other file runs. A
connection that really drops still fails the run and names the file that
never ran.

Proof:

- Developer decision (2026-11-28): upgrade `vitest`, `@vitest/browser` and
  `@vitest/browser-playwright` to 5.1.2, for vitest-dev/vitest#11914, with
  no forced GC. Change nothing else unless the upgrade requires it. If
  closures remain after the upgrade, fall back to forcing the GC
  (`VITEST_CHROMIUM_GC_DISK_THRESHOLD_GB` and `VITEST_CHROMIUM_GC_FORCE`) in
  the frontend runner, and record why.
- No focused check discriminates the cause: it needs a whole run's growth
  in one page. The repeated full runs below are the proof.
- Delete the capture and set the probe workflow's capture variable off.
- Run eight consecutive full local runs at two workers. Each reports every
  file, and wall times stay within the noise of slice 2's local runs at
  comparable load.
- Make one scratch observation that a failing assertion in one file leaves
  the other files running, and one that killing a Chromium renderer mid-run
  fails the run and names the unstarted file. Revert both.
- The upgrade changes the Vitest that the backend group shares, so run its
  full local suite once.
- The hosted proof moved to slice 6 (2026-11-28), so one round proves the
  final state.

Delivered (2026-11-28): Vitest 5.1.2 alone repairs the closure, so the GC
fallback stays unused. The 5.1.1 and 5.1.2 notes needed no config or
runner change. #11914's module cache applies to this config: `vitest run`,
no `persistentContext`, not the `preview` provider, import-map mocks. Only
the modules mocked by the two `vi.mock` factory specs
(`navigation/frame-board-look`, `review/story-review-diff-grammar-failure-mount`)
skip the cache. The capture is deleted, and the frontend config equals
`origin/main`.

- Eight full local runs at two workers, ordinary path: each reported all
  332 files with no closure and no failure, in 143–203 s (median about
  173 s) at one-minute load 3.7–7.4. Slice 2's series had seven closures in
  eight runs.
- A scratch failing assertion gave `1 failed | 331 passed (332)`.
  `kill -9` on one renderer at 70 s failed the run with
  `VITEST_BROWSER_CONNECTION_CLOSED`, named
  `navigation/story-card-selection.spec.ts`, and listed the 295 unstarted
  files. Both scratch edits are reverted.
- The backend group's full suite passed (524, one opt-in skip, 373 s). The
  eight Distribution workflow-reader tests pass.

### 6. The closure's ineffective guards leave, and hosted runs finish every file

Type: Behavior
Status: planned

Behavior: Vitest 5.1.2 runs the frontend group → the guards added against
mechanisms the closure never took are gone, and every hosted job reports
every file. Developer direction (2026-11-28): find the efforts that fixed
the wrong things, then remove and simplify them.

Inventory and decisions:

- `historyTraversalGuard.ts` (`6a5ce378a`, on trunk) replaces
  `history.back`, `forward` and `go` in every frontend file, through the
  config's `setupFiles`. It guards a forced mechanism that no natural
  closure took. Its commit left the hosted cause unconfirmed, and nothing
  but its own `test-harness/history-traversal-guard.spec.ts` uses it. No
  case was refused in the eight clean A/B runs. It leaves with its spec and
  its `setupFiles` entry. This is test harness only, so the destructive
  later-outcome check finds no user-visible path.
- `keepVitestOrchestratorOpen` (`cfa5f8396`) and its diagnosis record are on
  the unlanded SEED-430#follow-published-progress-from-local-git branch, not
  on trunk. Slice 3 shows Vite's reload only follows the socket drop. That
  execution owns its branch, so this story leaves its work untouched and
  records the decision where SEED-430 reads it on trunk: the guard and that
  diagnosis record do not land.
- The seed's evidence and scope bullets about the two guarded mechanisms
  are settled by wrap-up.

Proof:

- Delete the guard, its spec and its `setupFiles` entry.
  `npm run typecheck:dashboard` passes.
- Record the SEED-430 decision in its seed section on this branch, in a
  region its branch has not changed (pre-test with `git merge-file`), and
  leave its state block alone. It reaches trunk when this story lands, and
  SEED-430's freshness check absorbs it. If SEED-430 lands first, the guard
  reaches trunk, and this branch's freshness check brings it here, where
  this slice deletes it with its imports.
- Push once with `[probe]` in the head commit message. The probe's thirty
  jobs, with the capture off, each report every file, and the ordinary
  `dashboard-frontend` job passes. Their durations stay within the spread of
  slice 2's hosted baseline (187–280 s).
- Delete the probe workflow. `git diff origin/main --stat` then shows
  neither the workflow nor the capture.

Progress (2026-11-28): the guard, its spec and its `setupFiles` entry are
deleted, and the SEED-430 decision is in its seed section (a `git merge-file`
pre-test against its branch merges cleanly). A whole-product search found no
other closure workaround: every remaining config setting predates the
closure work or serves another purpose, and the three specs that call
`history.back()` predate the guard. One full local run then reported all
331 files (953 tests) in 148 s at load 4.6.

## Local gate and delivery

- Run full local frontend runs from a fully awake machine on AC power, per
  [AGENTS.md](../../../AGENTS.md), as
  `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run test:dashboard:frontend`.
  These runs are the story's proof, named here, and not an added gate.
- Before each series, apply
  [choose expensive proof before launch](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#choose-expensive-proof-before-launch).
  Record host load and competing worktree runs. One full local suite runs
  at a time across worktrees, so a series may queue.
- If slice 5 changes shared runner code (`groupVitest.mjs` or
  `dashboard-group-run.mjs`), the backend group shares that path. Run its
  full local suite once before landing.
- Keep the default test timeout. A changed test follows
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md).

North Star:
[Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
The repair keeps the frontend group on Vitest Browser Mode and adds no
Playwright test runner.
[Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
also applies. The capture is temporary and leaves with the story, slice 6
removes guards that the evidence does not support, and the repair adds no
test-support wrapper.

## Plan review

Refined 2026-11-28 after slice 2's stop, with the developer's approval. The
plan now has six slices: two done or delivering early probes (1 and 2), one
further early probe (3), one independent repair (4), the closure repair (5)
and the guard decision (6). Each has one outcome and one proof loop.

- Slice 3 narrows to what the server side cannot see, and it reuses slice
  1's gate and slice 2's local closure rate (seven of eight). It captures
  locally first, keeping the hosted round as the fallback. Its stop rule
  returns the plan again if the page side shows nothing.
- Slice 4 is independent of the closure. It comes before slice 5 so that
  slice 5's runs judge the closure repair without this case's noise, and so
  that slice 5's full runs also prove slice 4.
- Slice 5's approach and size still follow from the cause slice 3 names,
  under
  [slice sizing](../../../.agents/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices).
- Readiness: ready for continued execution, within the existing Take.
