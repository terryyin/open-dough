# Prove Dashboard runtime behavior in fast unit cases

**Identity:** SEED-413#fast-runtime-unit-cases
**Source:** [Prove Dashboard runtime behavior in fast unit cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fast-runtime-unit-cases)

## Goal and scope

`dashboard/backend-tests/runtime/` gives feedback in seconds. Every surviving
case runs on Node Vitest in about 100 ms or less, with fewer cases than
today. Real process, Git, npm, build, browser and runner behavior is
proven by a limited number of named end-to-end checks.

Excluded, and owned by
[runner cutover](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner):
- the backend Playwright configuration and runner path;
- the `observation/` harness specs;
- the four `start-origin-*` specs;
- the launch-options specimen.

New CI jobs or shard changes are also excluded.

## Baseline

On 2026-11-27 at `07bc4aab5` (load average about 14, local, default
workers), this command took 3 min 23 s wall:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=<tmp>/runtime-proof.json \
  npm run --silent test:dashboard:backend -- dashboard/backend-tests/runtime
```

It ran 40 specs and 133 cases: 27 Playwright specs with 90 cases and 13
Vitest specs with 43 cases. Summed case time was 289.7 s; 102 cases took
over 100 ms. Seconds below are summed per spec, with case counts in
brackets.

| Slice | Specs (summed s [cases]) |
| --- | --- |
| 1 | `production-deployment` 23.5 [4], `production-qualification` 8.6 [4], `production-update-selection` 3.8 [3], `production-process` 0.1 [1] |
| 2 | `production-watcher-refusals` 22.9 [3], `production-watcher-preview` 10.2 [1] |
| 3 | `mounted-boundary-server` 10.6 [10], `serving-modes` 6.1 [6], `dev-server-cache-ownership` 4.1 [1], `boundary-server` 2.4 [2], `committed-origin-actions` 2.2 [2], `committed-origin-routing` 1.3 [5], `file-content-cache-budget` 0.1 [3], `chosen-port` 0.0 [4] |
| 4 | `fake-gh-in-process` 7.3 [8], `-scopes` 6.8 [3], `-modes` 5.9 [3], `-activation` 5.1 [3], `-wire` 3.3 [7], `fake-gh-client-lifecycle` 2.4 [6], `fake-gh-client` 0.5 [5] |
| 5 | `kept-history-worker` 33.0 [3], `dashboard-artifact-demand` 27.1 [7], `test-preparation-boundary` 10.0 [1], `test-preparation-dev-notifications` 6.9 [1], `dashboard-scheduling` 4.2 [2], `story-columns-prefix` 3.8 [2], `production-build-gate` 1.0 [2], `compile-cache` 0.5 [1], `test-preparation-budget` 0.0 [4], `kept-landed-ci-history` 0.0 [1] |
| 6 | `published-development-runtime` 11.4 [2], `production-publication-fixture` 9.4 [3], `production-application-source` 4.0 [2] |
| 7 | `runner-ownership` 24.4 [4], `quiet-reporter` 1.4 [6] |
| 8 | `first-open-waits-for-read` 21.0 [4], `settled-page` 3.3 [1], `observation-measurements` 1.0 [1], `page-teardown-drain` 0.1 [2] |

## Direction and current decisions

- [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  govern every slice. Apply [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md)
  before changing a test, and [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md)
  for any browser case slice 8 moves to E2E.
- Moving a file to Vitest imports is not enough. Plan 868 did that for the
  production specs, and they stayed at 4–21 s per case. Each slice changes
  the operation under test so that it takes the typed state it reads. A
  case composes that state with MakeMe builders and states its
  precondition in domain words. It does not mount a HOME, start a server,
  build, install, run a runner, or create a real origin.
- Tests are examples of independent rules, not a matrix. Keep one case per
  rule. Prove a table of shapes (frames, signals, modes, artifacts) in one
  table-driven case or through the shared rule once. Remove or merge a case
  only after naming its surviving owner in the slice's commit message.
- End-to-end owners: use an existing journey first. These cover
  deployment and watcher behavior:
  - `e2e/runtime/production-watcher.spec.ts`;
  - `production-watcher-updates.spec.ts`;
  - `production-watcher-failures.spec.ts`;
  - `production-watcher-setup-lifetime.spec.ts`.

  `Distribution/tests/test-runner/*.sh` covers runner process behavior;
  for example, `dashboard-concurrent-runs.sh` covers concurrent runs that
  keep their own builds and records. Add an end-to-end case only for real
  process behavior nothing else observes. Add at most one per slice and
  record it under the slice. Before removing a unit case on the strength
  of an E2E owner, check that the owner asserts the same result.
- No new request or server wrappers in test support. Remove support that
  has no remaining caller.
- No `test.slow()`. Keep the default timeout.
- Failures follow the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written. Carry it by link into every delegation brief and repair
  handoff.
- Local gate:
  - Dashboard typecheck.
  - Each slice's specs through
    `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <specs>`,
    with `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` set.
  - Any end-to-end spec the slice adds or relies on for a removal, through
    `npm run test:e2e -- <spec>`, or `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <script>`
    for `Distribution/tests/test-runner`.
  - Before landing changed shared test support, the full backend suite.

  Use Homebrew bash 5 under `caffeinate -s -i`, from a fully awake machine
  on AC power, per [AGENTS.md](../../../AGENTS.md).
- Measure relatively under load. Take the slice's before and after from
  the same proof-record command back to back, and record the load average.
  The per-case target is about 100 ms in the proof record's `durationMs`.
  Also record the spec files' Vitest elapsed time, so file-level setup
  cannot hide outside a case.

## Decisive premises

| Consuming operation | Observation and result | Remaining proof |
| --- | --- | --- |
| Each slice's measurement | The baseline command above ran at `07bc4aab5` on 2026-11-27. It wrote per-case `durationMs` for both engines into one proof record. | None. |
| A spec moves engine when it imports Vitest | `dashboard/backend.vitest.config.mts` includes backend specs selected by `isVitestFile`. In the baseline run, the 13 Vitest-importing specs ran under the `node` project. | None. |
| Slice 2 relies on E2E for the double failure | Read at `07bc4aab5`: `production-watcher-failures.spec.ts:180` asserts both causes, exit code 1, no "at" line for the failed commit, an emptied deployments directory and `expectProductionEnded`. The unit case also asserts that neither preview PID runs and that its URL refuses. | Before removal, read `expectProductionEnded`. If it does not cover both preview processes, keep that rule as one typed unit case. |
| Slice 7 relies on the concurrent-runs script | Read at `07bc4aab5`: `dashboard-concurrent-runs.sh` starts two `test:dashboard:backend` runs only. It asserts each run's own passing proof record, a private build and no standard-error output. `dashboard-repeat.sh` exercises the frontend and E2E commands, but not concurrently. | The frontend and E2E ownership cases keep their separation through typed run-directory and selection decisions. Add one real concurrent run for another group to the script only if that group's run directory or settings come from code the backend run does not exercise. |
| Comparable density | Plan 868 at `13d7e0492` moved 22 specs, including slices 1, 2 and 3's production and serving specs, in seven slices estimated at 10–25 active minutes each, and all were completed. | Track active time; an overrun follows execution's split rule. |

## Ordered slices

### 1. Decide production deployments from typed origin and checkout state
Type: Behavior
Status: done
Estimate: 15–20 active minutes.
Proof: The slice's specs run every case in about 100 ms or less on Node
Vitest, with fewer cases. The production watcher E2E journeys still pass.

Behavior: given typed origin main, local commits and edits, a published
range and a policy, the deployment operation selects origin main's commit
and verifies it before running its code. Qualification spans the
published range, including deletions and renames, and follows the
published policy. Update selection keeps the last activation as the
baseline across excluded or rejected ranges. Stopping a process group with
only an unreaped member succeeds. The pinned install, build and serve after
main advances, and cancellation that ends an installing checkout, stay
with the production watcher E2E journeys.

Result: 12 cases → 7, each 0–9 ms; spec files 31.94 s → 2.05 s in Vitest
(load 20.2 before, 18.1 after, back to back). The deployment, qualification,
update-selection and process-group-stop operations now take typed readings
(`publishedMainFrom`, `expectSelectedCommit`, `qualifyChangedPaths` over
`git diff -z` output, `updateSelection`, `signalProcessGroup` with injected
kill and `ps` reading). Added E2E case:
`e2e/runtime/production-qualification-git.spec.ts` "qualification reads a
published range with deletions, both rename ends and any file name from
origin, and removes its inspection while Git maintenance writes". The pinned
build's cartoon-only `image/webp` avatars and the replaced preview's
start/end incident entries are asserted in existing
`production-watcher.spec.ts` journeys. Install-time cancellation shares
`stageDeployment`'s abort with the build cancellation journey.

Learning: a preview ended by the watcher's SIGHUP records `process-started`
but no `process-ended` in its incident record (observed when the assertion
was tied to the preview's process group in "SIGHUP quietly ends production
and its checkouts…"). Pre-existing product behavior outside this story;
reported for a follow-up decision.

### 2. Refuse unusable watcher starts from typed state
Type: Behavior
Status: done
Estimate: 10–15 active minutes.
Proof: `production-watcher-refusals` cases run in about 100 ms or less.
`production-watcher-preview.spec.ts` is gone, with its behavior owned by
`production-watcher-failures.spec.ts:180`.

Behavior: invalid options, an origin without published main and an
occupied production port each refuse before any watcher process starts.
The case gives each as typed state. Retiring a case's live watcher and
detached Cursor runner before removing HOME is harness teardown, not a
product rule. Prove it where the harness owns it, or drop it when
`production-watcher-setup-lifetime.spec.ts` owns the same cleanup.

Result: `production-watcher-refusals` went from 4 cases at 2.1–6.4 s to 3
tests (7 table rows) at 0.1–10.5 ms (load 6.9 before, 16.1 after).
`productionWatcherStart.mjs` owns option parsing (`watcherOptions`) and the
occupied-port refusal (`expectUsablePort`, `loopbackPortOccupied`), so
`scripts/watch-dashboard.mjs` refuses before reading origin or staging.
`production-watcher-preview.spec.ts` is removed: `expectProductionEnded`
covers the only observable preview PID, because a failed candidate preview
stops before it reports one. Runner retirement at teardown is asserted in
`production-watcher.spec.ts`'s `afterAll`; the private `.vite` cache stays
with `published-development-runtime.spec.ts`. No E2E case added.

### 3. Prove serving boundaries without starting servers
Type: Behavior
Status: done
Estimate: 20–25 active minutes.
Proof: Every case in the six remaining slice-3 specs runs in about 100 ms
or less, with mode repeats merged.

Behavior:
- Boundary and dev serving mount the same launch, read, configuration and
  upgrade boundaries. Prove this once, from the boundary table each mode
  composes, instead of once per mode through started servers.
- A mounted server refuses a second start and releases a refused port.
- One project's configuration answers its own environment.
- Cache budget and chosen port stay as they are.

Dev cache ownership and Vite's HMR socket stay with one real dev-server
check only if no E2E journey observes them. Name that check.

Result: the six specs run every case in 0–149 ms (load 16 before, 20.8
after); `mounted-boundary-server` 10 → 7 cases, `serving-modes` 6 → 2,
`boundary-server` 2 → 3 typed cases. Typed seams: `localBoundaryPlugin`
takes its environment opener, `mountedBoundaries`/`processOnly`,
`seededProjects`, `runnerArguments`, `launchWait` takes its control file,
and `launchClaudeStartedBy` takes the Claude starter, so the pending
launch wait and its "uncertain, timed out" outcome are fast cases in
`dashboard/backend-tests/launches/launch-wait-control.spec.ts`. The
bundled boundary server's real start stays with
`observation/host-status.spec.ts`; HMR with `production-watcher.spec.ts`;
icons with `browser-identity.spec.ts` plus the one shared Vite config.
Added E2E case: `e2e/runtime/dev-server-cache-ownership.spec.ts` "one dev
server's optimized module survives another server's cache write" (moved;
no other journey runs two dev servers). The committed-origin specs moved
to slice 6.

Learning: `e2e/launches/agent-launch-claude-verification.spec.ts` `:85`,
`:176` and `dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts`
`:136`, `:141`, `:189`, `:225` fail identically at `5fc03cd` on this
machine (load 28–31): the Claude launch call is never seen within 5 s.
Diagnosed separately under the failure policy.

CI repair (run 45976416445): `dashboard-concurrent-runs.sh` sampled a
removed `serving-modes` case; it now samples
`observation/authenticated-read-revision-stream.spec.ts` "preview-mode with
Accept-Encoding: gzip…", outside this story's folder, which still requests
one private app build per run. The same run's dashboard-frontend browser
connection close belongs to `SEED-413#keep-full-frontend-runs-connected`.

### 4. Prove the fake gh client and in-process owner through its wire values
Type: Behavior
Status: done
Estimate: 20–25 active minutes.
Proof: Every case in the seven `fake-gh-*` specs runs in about 100 ms or
less, with the case count reduced.

Behavior:
- Frames, argv, binary and UTF-8 streams, status, headers and rate limits
  are decoded and admitted as values. Malformed frames are one table.
- Owner admission queues the ninth of eight calls and ends a held shared
  read after its last waiter leaves, driven by a controlled clock and
  typed calls.
- The three serving modes using one fast owner are one rule, not three
  started servers.
- SIGTERM and SIGINT retirement is one case over the signal.

Keep one real process case for child and temp-directory retirement. It
stays in this folder only if it runs in about 100 ms; otherwise it moves
to `Distribution/tests/test-runner`.

Result: the `fake-gh-*` specs went from 35 cases (37.9 s summed, load 14)
to 10 cases at 0–12 ms (load 14) in three Node Vitest specs; `fake-gh-client`,
`-client-lifecycle`, `-in-process-activation` and `-in-process-scopes`
are gone. Frames decode as values (`decodeFakeGhFrame`, one malformed
table); admission and held shared reads run on `ReadAdmission` and
`OutstandingReads` with a controlled clock; the three serving modes and
owner keying are typed cases. The one real check is
`Distribution/tests/test-runner/fake-gh-real-owner.sh`: signal and
mktemp retirement, the shell client's argv, binary stdout, local auth and
ignored curl configuration, and the real owner's preload, argv, bound and
poisoned API executable. Owner sharing across dashboards stays with
`observation/shared-request-owner.spec.ts`; the clock-controlled owner
with `e2e/observation/auto-refresh-rate-limit.spec.ts`. A diagnosis round
found the check's hang: a fake `mktemp` left on PATH by its own earlier
section.

### 5. Decide test preparation and shared artifact demand from typed requests
Type: Behavior
Status: done
Estimate: 20–25 active minutes.
Proof: Every case in the ten slice-5 specs runs in about 100 ms or less.
No case builds the app or a server bundle, or starts a nested proof run.

Behavior:
- Waiting workers see a shared artifact complete, fail or be
  interrupted. Prove each once through the demand coordinator, with a
  controlled build, not for each artifact and runner.
- Kept and ordinary histories share one worker, and kept setup finishes
  before the private origin starts. Prove both from the preparation plan
  computed from typed requests.
- Local production chains leave ordinary work a worker; CI keeps both.
- A custom boundary start and a development notification server request
  no app or bundle.
- A story-columns history starts from the run's prepared revisions.

The real build under concurrent runs stays with
`dashboard-concurrent-runs.sh`.

Result: 24 cases (61.9 s summed, load 8) became 17 cases at 65.6 ms
summed (load 13) in eight specs; `test-preparation-dev-notifications` and
`production-build-gate` are gone. Typed seams: `artifactDemand` in
`runArtifacts.ts` (one complete/fail/interrupt table over a controlled
build), `dashboardTestProjects` takes `ci`, `servedArtifacts(mode,
mounted)`, exported `serverInputKeys` and `matchingPrefix`, and
`preparationOrigin` waits for the queued origins. Added runner script:
`Distribution/tests/test-runner/production-build-gate.sh` (arrival and
immediate release of the native gate, whose source now lives in
`fixtures/production-build-gate.mjs`). Nested-run budget cases moved to
the per-host preparation journeys and `start-origin-*` specs. Accepted
limit: that the native Codex origin is prepared only for the case that
takes it rests on Playwright's lazy worker fixtures.

### 6. Prove published fixture sources and development runtime from typed inputs
Type: Behavior
Status: planned
Estimate: 15–20 active minutes.
Proof: Every case in the five slice-6 specs runs in about 100 ms or less.
None runs `npm ci` or pushes to a real origin, except a single real case
the slice names, if no E2E or runner script covers it.

Behavior:
- A committed origin route takes precedence after republication
  (`committed-origin-routing`, `committed-origin-actions`, moved from
  slice 3). `fixtureOriginRoute` writes HOME's routes as a series of Git
  config writes and unsets, so first let it compute each HOME's route list
  as data and write it once; prove the precedence on that list. Git's own
  longest-match stays with a named journey that fetches through the routes.
- A documentation-only publication pushes only its requested paths.
- Full-source and application fixtures keep live bytes and stay usable
  without a run owner.
- Locked development inputs need no second install.
- A changed lock needs a real `npm ci` and keeps dev dependencies.

### 7. Decide runner ownership and quiet reporting from typed run inputs
Type: Behavior
Status: planned
Estimate: 15–20 active minutes.
Proof: `runner-ownership` and `quiet-reporter` cases run in about 100 ms or
less. `dashboard-concurrent-runs.sh` passes.

Behavior:
- Each group's run, started by npm or by direct configuration from
  another working directory, records only its own selection under its own
  settings and run directory. Prove this from the run-directory and
  selection decisions.
- A spec asking for an artifact the group's setup does not register fails
  naming it.
- The quiet reporter's output rules are proven from reported events,
  including run output failing the run.

Concurrent real runs stay with the test-runner scripts, under the
slice-7 premise row.

### 8. Prove page waiting helpers once and leave the folder fast
Type: Behavior
Status: planned
Estimate: 20–25 active minutes.
Proof:
- Rerun the baseline command over the whole folder. It selects only
  Node Vitest specs.
- Every case runs in about 100 ms or less, with fewer cases than the 133
  at baseline.
- Record the case count and summed time.
- Rerun any E2E case this slice moves or adds.

Behavior:
- A membership check right after an open waits for a slower published-work
  read. It fails at once, naming the titles, when that read fails for good.
- A held detail read does not hold the check back.
- The settled page waits for cards and held preparation reads.
- Route handlers finish before teardown.
- A held group reaches its handlers only after every listed profile
  arrives.

Prove each waiting rule as a unit over typed read states where the helper
can take them. A rule that needs a real page moves to one named E2E case.
This slice removes the folder's last Playwright use and records the folder
result against the baseline.

## Concern evidence

Refinement was not needed. Each slice owns one family's proof loop. There
are eight slices, at the limit, and the density matches completed plan 868.
This review found no remaining slice-specific concern. Slices 3–5 and 8
carry the largest estimates; an overrun follows execution's split rule.
