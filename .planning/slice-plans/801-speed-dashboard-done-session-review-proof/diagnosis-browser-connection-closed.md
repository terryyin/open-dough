# Diagnosis: browser-connection-closed

Round 1 (CI repair agent), started 2026-11-24.

## Failure signature

- CI run 45308457713 attempt 1, job "dashboard-frontend / shard 1/2"
  (138158057255), SHA 0c1017fe3. Local copy of the log:
  `.git/worktrees/get-fast-proof-of-finding-and-reviewing-done-ses/open-dough/evidence/ci-45308457713-shard1.log`.
- 453/453 tests passed; Vitest reports 1 unhandled error:
  `Failed to run the test .../intent/intent-home-activation.spec.ts` caused by
  `[vitest] Browser connection was closed while running tests`
  (`VITEST_BROWSER_CONNECTION_CLOSED`), then `[birpc] rpc is closed, cannot
  call "createTesters"`.
- Test Files 166 passed (182): 16 files reported no cases (intent-candidates-client-replies,
  intent-ci-comparison-gaps, -head, -scope-running, -strict-mode,
  intent-ci-history-chart-marks, intent-ci-status-layout, intent-home-activation,
  intent-read-reuse-story, intent-revision-notice, intent-revision-planning-only,
  intent-summary-story-comparison-presentation-bindings,
  navigation/development-intent-frame-keyboard, review/story-review-diff-styled-rendering,
  review/story-review-diff-word-emphasis-decoration, review/story-review-page-source).
  So one browser session (one of the CI workers = runner cores) lost its
  connection and its queued files never started; the other sessions ran to the
  end. `createTesters` failing means the close came between files, not inside a
  test.
- Log has no memory/OOM/kill lines; Duration 126.96s, normal.

## Attribution

- Branch shard-1 changes: review/story-review-action-mount.spec.ts (new mount
  spec), navigation/board-frame-mount.ts (history.replaceState of roster view,
  restored onTestFinished), board-frame-observation-supply, intent page objects.
  No `window.close`, `window.open`, `location.*` assignment or top navigation
  in the branch's shard-1 specs/support or in intent-home-activation.spec.ts.
- Trunk: the last 30 main CI runs have no failure (0 failed); the 25 most recent
  failed CI runs on any branch (incl. main 45117534561) have 0 occurrences of
  `VITEST_BROWSER_CONNECTION_CLOSED` / "Browser connection was closed" in their
  failed-job logs. First sighting.

## Repeat batch 1 (local reproduction of shard 1/2)

- Hypothesis: a shard-1 spec (most likely a branch-new mount spec) closes or
  crashes its browser session between files; if so, shard 1/2 at CI's split
  with 4 workers reproduces "Browser connection was closed" locally.
- Command: in a temp worktree at 0c1017fe3,
  `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT=1/2 npm run test:dashboard:frontend -- --workers 4`
  under `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
- Conditions: macOS, 16 cores, load average ~6 at start.
- Stopping count: 5 runs, or the first reproduction.
- Result: 0/5 reproductions. Every run `Test Files 182 passed (182)` (so the
  local split selects the same 182 files as CI), no "Browser connection" or
  "crashed" lines. Load average at start of runs: 5.5, 10.0, 10.8, 10.2, 9.2
  (16 cores). Logs: `/Users/terryyin/.claude/jobs/7a4cc949/tmp/diag-logs/shard1-run{1..5}.log`
  (job tmp; temp worktree removed after the round).

## Vitest 5.1.0 mechanics (read from node_modules)

- `@vitest/browser` dist/index.js ~3091: the orchestrator WebSocket `close`
  handler destroys the session, then rejects pending calls with
  "Browser connection was closed ... Was the page closed unexpectedly?".
- `@vitest/browser-playwright` openBrowserPage: `page.on("crash")` calls
  `session?.fail(...)` with "page crashed ... ran out of memory"; its own comment
  says otherwise a crash "is only visible as a websocket disconnect". If the ws
  close is handled first the session is already destroyed, so the crash message
  is silent. A renderer crash therefore matches the CI signature exactly; a
  heartbeat timeout (frozen browser) would have printed a different message.
- vitest chunks/index.Di8au7q4.js `runNextTest`: shared file queue; after each
  file `maybeCollectChromiumGarbage` runs (Linux + chromium + isolate only)
  and forces `HeapProfiler.collectGarbage` when TMPDIR has < 4 GiB free,
  citing https://issues.chromium.org/issues/530892387 (Chromium crashes when
  Playwright's `--disable-dev-shm-usage` shared-memory files in /tmp run out).
  `reject` then cancels: other pages finish their current file and the queue
  is dropped. That is why 16 files show no cases and why the close happened
  in the last ~seconds of the run (last passes at 01:58:02.63-.64, error at
  .65): the dying page had finished a file and was asking for the next.

## Hypotheses

1. Test closes/navigates its page: ruled out as far as code search goes (no
   window.close/open/top navigation in shard-1 branch specs or support or the
   named file; the named file never started). Would also be deterministic per
   file order and should have reproduced in 5 local runs with the same files.
2. Chromium renderer crash on the Linux runner (memory or /tmp shared-memory
   exhaustion, the Vitest-documented Chromium issue): leading. Consistent with
   the signature, with zero prior occurrences on main (30 runs) or in the last
   25 failed runs on any branch, and with macOS not reproducing (no Linux
   /tmp-shm path, no GC hook). Not yet proven: the CI log has no memory or
   disk data.

## Unrelated defects found

None.

## Leading hypothesis and next discriminating experiment

Leading: a one-off Chromium renderer crash on the CI runner, not attributable
to this branch's tests. Next discriminating experiment (CI only; macOS cannot
exercise it): a separate probe workflow file (keep ci.yml) running
dashboard-frontend shard 1/2 at this SHA N times (stopping count e.g. 10)
with `DEBUG=vitest:browser*,vitest:browser:gc`, plus `df -h /tmp` and `free -m`
before/after, to see whether "the page crashed" is logged and how close /tmp
and memory get to their limits. If it never reproduces in 10 runs, treat as
infrastructure; if it does with the crash line and low /tmp or memory, the
repair is environmental (e.g. Playwright launch arg or TMPDIR on a larger
disk, or lower CI workers), not a spec change.

Round 1: ~15 active minutes (repair agent; coordinator owns the slice clock).
No temporary diagnostic edits; nothing parked in the tested tree.

## Round 2: hosted CI instrumentation probe

Round 2 (diagnosis agent, fresh context from this record), started 2026-11-24.
Experiment kind switched from local repetition to hosted CI instrumentation.

- Hypothesis: the close is a Chromium renderer crash on the Linux runner
  from memory or /tmp (Playwright `--disable-dev-shm-usage` shared memory)
  exhaustion. If so, reruns of dashboard-frontend shard 1/2 at 0c1017fe3 on
  ubuntu-24.04 reproduce "Browser connection was closed" with Vitest's
  `vitest:browser:playwright` page-crash debug line and low free memory or
  /tmp space sampled during the run. 0 reproductions means a transient
  runner fault.
- Instrument: separate workflow `.github/workflows/probe-browser-closed.yml`
  on branch `probe/browser-connection-closed` only (ci.yml unchanged), same
  setup steps as `browser-test-group.yml`, `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT=1/2`,
  default workers; `DEBUG=vitest:browser:pool,vitest:browser:playwright,vitest:browser:gc`
  to a file (grep excerpts only in the log); `df -h /tmp /dev/shm` and
  `free -m` before and after, plus 2-second sampling of available memory
  and /tmp, /dev/shm free during the run (minimums reported).
- Stopping count: 10 runs (10 matrix jobs, one fresh runner each,
  fail-fast off), or all of them; no reruns.
- Probe: commit cd6f65ef1 (0c1017fe3 + the probe workflow only), probe
  run 45310628537, jobs `probe 1`..`probe 10`, all success. ci.yml triggers
  on push to every branch, so the push also started CI run 45310628462; it
  was cancelled at once (not a sample). Branch, worktree and remote branch
  deleted after the round. Job logs:
  `/Users/terryyin/.claude/jobs/7a4cc949/tmp/diag-logs/probe/probe-{1..10}.log`
  (job tmp).
- Conditions: GitHub ubuntu-24.04 runners, nproc 4 (so 4 Vitest browser
  sessions, as in CI), 16 GB RAM, 3 GB swap, `/tmp` on the 145 GB root
  (84 GB free), `/dev/shm` tmpfs 7.9 GB; TMPDIR unset (Vitest uses /tmp);
  10 parallel jobs, nothing else on each runner.
- Result: 0/10 reproductions. Each run `Test Files 182 passed (182)`,
  472 tests, Duration 87.4-103.0 s (the failing CI attempt took 126.96 s);
  no "Browser connection was closed", no page-crash debug line, no
  unhandled error. Sampled minimums over all runs: available memory
  10.6 GB (of 16), /tmp free ~84 GB, /dev/shm free 7.8 GB, load average
  at most ~9.4 on 4 cores. `vitest:browser:gc` logged
  `triggered: false` after every file (threshold 4 GiB free in /tmp vs
  ~84-90 GB available).

### Round 2 conclusions

- Hypothesis 2 (renderer crash from memory or /tmp shared-memory
  exhaustion) refuted as a load-driven cause on this shard: headroom is an
  order of magnitude above Vitest's own GC threshold and memory never fell
  below 10.6 GB available. A one-off renderer or runner-host fault remains
  the only explanation consistent with 1 occurrence in 11 hosted runs of
  this SHA's shard 1/2 (the original plus 10 probes), 0/5 local runs, 0 in
  the last 30 main runs and 0 in the last 25 failed runs on any branch.
- Environments ruled out with counts: macOS local 4 workers 0/5 (round 1);
  GitHub ubuntu-24.04, default workers, 0/10 (round 2).
- No environment repair is indicated: TMPDIR, `/dev/shm` use, Chromium
  launch args or fewer workers would change resources that were never
  near a limit.
- Disposition recommendation: treat as an infrastructure (transient
  runner) fault for this story and rerun the failed shard once as the
  applicable final CI for 0c1017fe3; no spec or CI change in this story.
  Optional finding, outside this story: let the next occurrence answer
  itself by enabling `DEBUG=vitest:browser:playwright` (page-crash line,
  small output) in `browser-test-group.yml`'s run step.
- Temporary diagnostic edits: none in the execution checkout; the probe
  lived only on the deleted branch. Parked changes: none from this
  diagnosis (the checkout's uncommitted files belong to another agent).
- Unrelated defects found: none.
- Leading hypothesis: transient Chromium/runner fault on the original
  runner. Next discriminating experiment if it recurs: the debug flag
  above in ci.yml's producer, so the recurrence logs whether the page
  crashed or the WebSocket alone dropped.
- Round 2 active time: about 10 minutes (plus CI wait); round count and
  cumulative minutes are on the coordinator's slice clock for diagnosis
  `browser-connection-closed`.
