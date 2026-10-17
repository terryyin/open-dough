# Unify and streamline the dashboard E2E test strategy

**Identity:** SEED-136#unify-and-streamline-dashboard-e2e
**Source:** [selected story](../../seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e)

## Goal and scope

Apply one documented two-tier strategy, browser journeys and boundary tests,
to the whole existing dashboard suite so that the same behavior is proved by
fewer browser journeys and less repeated setup, with a measured runtime at
most half the baseline the story records: summed hosted browser-suite step
time ≤ 1,244 s at twelve shards, a local full run ≤ 380 s at 8 workers, and
fewer than 900 selected browser-tier tests. Publish the strategy in
`dashboard/tests/README.md` and map every removed or relocated case to the
test that now proves it.

Included: a boundary-tier server launcher without Vite; relocation of the 158
browserless spec files; one proof that dev and preview serve the same local
boundaries; shared setup and delta assertions across the browser families
that publish an origin per file; presentation-only checks folded into the
journey that shows them or moved down; the production-watcher journeys'
repeated builds; the measurement and proof map.

Excluded: CI job layout, caching, shards, and `longest-first` rebalancing
(SEED-136#restore-ci-under-three-minutes); the shell suite and native host
checks; new feature coverage; a component test harness unless a relocated
check needs one; any test with weaker assertions, retries, or more workers.

Assumptions: Playwright stays the one runner; the hosted "after" measurement
is read from the CI runs this story's publication triggers, at the existing
twelve shards; the local "after" run uses the same machine class and worker
count as the baseline, compared relatively when the machine is loaded.

## Design and existing solutions

- **Playwright as the runner for both tiers** (reuse). 60 of 150 support
  files import `@playwright/test`; the quiet reporter, proof record, suite
  deadline, process-group cleanup, and file-level shard split all hang off
  the one configuration. A `node --test` tier under `npm test` would need a
  second copy of the fakes or a decoupling of 60 files; excluded for this
  story. A boundary test differs from a journey by what it starts, not by
  its runner.
- **Local boundaries mount without Vite** (change). `localBoundaryPlugin`
  hands each boundary's install function a Connect-style `middlewares.use`
  and the HTTP server (for WebSocket upgrades). A small entry,
  `dashboard/server/boundaryServer.ts`, mounts the same install functions on
  a plain `node:http` server and prints its address like Vite does, so
  `startDashboardServer({ mode: "boundary" })` reuses `startOnOwnAddress`,
  `fakeGhEnv`, the synthetic hosts, and `processGroup` unchanged. One child
  process per test keeps the suite's environment isolation (22 `HOME` and
  `homedir()` reads and module-level configuration state in the server),
  which an in-process mount would have to re-prove; in-process mounting is
  considered and deferred.
- **Node runs the server's TypeScript directly** (decision). Strip-only
  type loading fails on `doneMarks.ts:52` (a parameter property);
  `node --experimental-transform-types` loads both plugins. The boundary
  entry runs under that flag with the experimental warning disabled. CI and
  `.node-version` pin Node 24.21; the `engines` range drops `^20.19.0`,
  which lacks the flag, in slice 1. Terry may object to that narrowing.
- **One mount proof for two serving modes** (change). 23 files repeat their
  tests under dev and preview Vite servers; the strategy keeps one spec that
  proves both modes mount the same boundaries and answers the same request.
- **Shared journey setup** (change). 41 browser files publish their own
  origin with production backlog commands in `beforeAll`; the strategy shares
  one origin and preview server per file through the existing
  `publishLaunchJourney` and `dashboardTest` fixtures, asserting the common
  card shape once.
- **Strategy home** (reuse). `dashboard/tests/README.md` is the suite's
  maintained contract; the strategy is feature-local documentation, not an
  ADR or North Star topic. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  applies (fast feedback, one representation, PFE); no conflict.

## Preparation observations and decisive premises

Observed 2026-10-17 in this preparation workspace at `88f6d3f8`, Node 24.21.0,
after `npm ci`; scratch files lived in the job's temporary directory and the
workspace was left unchanged.

| Premise | Consuming observation and result | Consequence / remaining owner |
| --- | --- | --- |
| The local boundaries mount on a plain HTTP server without Vite | `authenticatedReadPlugin().configureServer({ middlewares, httpServer })` with a four-line `use` chain on `node:http`, `HOME` a scratch directory: ready in 14 ms; `GET <diagnostics endpoint>` answered 404 `{"error":"Unknown catalog source."}` from the real handler; `closeServer()` returned. | Settled for the read boundary. Slice 1 mounts both boundaries and proves the launch boundary's WebSocket upgrade through a relocated terminal spec in slice 3. |
| Node loads the server's TypeScript | `import("./dashboard/server/agentLaunchPlugin.ts")` under default stripping fails `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` at `doneMarks.ts:52`; under `--experimental-transform-types` both `agentLaunchPlugin` and `authenticatedReadPlugin` load. | The boundary entry runs under that flag; `engines` narrows in slice 1. |
| Which specs never open a page | 158 files contain no `page` token; they import `pageTest.ts` and drive `startDashboardServer` with `rawHttp.ts` or the terminal clients. 447 declarations, 676 selected tests, 1,252 s of the local run's 5,165 s summed test time. | Slices 1–3 relocate exactly these files; a file found to open a page stays a journey. |
| Relocation shortens the browserless families | Hypothesis. Their 676 tests average 1.85 s with servers started per `describe`; how much is Vite boot is unmeasured. | Slice 1 records the relocated family's summed test time and wall time before and after from proof records; a saving under 30 % keeps relocation for build independence and re-plans the measured target with Terry. |
| Browserless specs do not need the production build | Preview-mode browserless specs pass `prebuilt: builtDashboardDir`; the boundary entry serves no assets. `globalSetup` still builds once per run for the journeys. | Build time stays a browser-tier cost; its placement is the next story's. |
| Shard discovery follows moved files | `testFiles.mjs` reads `tests/` with `recursive: true`; `tests/support/dashboard-test-files.test.mjs` protects discovery; stale `longest-first` entries are ignored. | Relocated files move to `dashboard/tests/boundary/` and stay sharded; `longest-first` is not edited here. |
| The launch boundary starts a Cursor runner at install | `installAgentLaunchMiddleware` returns `ready: ensureCursorRunner()`; tests control it through `HOME` and `PATH` fakes (`cursorRunnerHosts.ts`). | The boundary entry keeps the per-test child process and environment; no in-process mount. |
| Production-watcher journeys build real production | `production-watcher*.spec.ts` set `test.setTimeout(360_000)`; `support/productionWatcher.ts` polls builds for up to 180 s; 7 tests took 516 s locally, 74 s each. | Slice 5 shares one watcher and its builds per file and asserts deltas. |
| Hosted and local baselines | Run 38838738715: twelve shards, suite steps 162–240 s, 2,488 s summed, 4 min 28 s wall. Local: 759 s wall at 8 workers, 1,631 passed, 5,165 s summed, median 1.7 s. | Targets in the story; slice 7 compares at the same shard count and worker count. |

## Outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Boundary tests run without a browser or Vite boot per test | 1: relocated `agent-completion-*` boundary specs pass with `mode: "boundary"`; no Vite process appears in their server output; proof record shows their summed time before and after. |
| Relocated boundary variants (key example 1) | 2, 3: every browserless file runs from `dashboard/tests/boundary/`; a scratch change to one refusal message fails exactly its boundary tests. |
| Dev and preview mount the same boundary | 4: one spec answers the same launch request under real dev and preview servers; the 23 mode loops are gone. |
| Synchronization and real time (key example 4) | 5: production-watcher journeys wait on the watcher's own output events for one shared build; their summed time falls below a third of 516 s. |
| Consolidated siblings (key example 2) | 6: `agent-launch-card-*` and the other origin-publishing journeys share one origin and server per file; `publishLaunchJourney` calls per run fall from 41; a scratch regression in one card behavior fails one named test. |
| Presentation-only check (key example 3) | 7: `dashboard-header` viewport and font checks become one journey plus the cheapest layout proof; nothing deleted without a named replacement proof. |
| Published strategy; every retained test still runs | 1 drafts, 8 finalizes `dashboard/tests/README.md`; `npm run test:dashboard` and the twelve CI shards run both tiers green. |
| Measured result and proof map (key example 5) | 8: local run at 8 workers ≤ 380 s; hosted run's summed suite steps ≤ 1,244 s; fewer than 900 selected browser-tier tests; the map of removed or relocated cases recorded below. |
| Rejection constraints: no weaker assertions, no retries, no more workers | Every slice: `retries: 0` and worker settings unchanged in the config diff; removed assertions named in the proof map with their replacement. |

## Ordered slices

### 1. Boundary tier proves one family without Vite
Type: Behavior
Status: planned
Proof: The six browserless `agent-completion-*` specs, moved to
`dashboard/tests/boundary/`, pass with `startDashboardServer({ mode:
"boundary" })`, whose child is `node --experimental-transform-types
dashboard/server/boundaryServer.ts`; their server output names no Vite; a
proof record of those files before and after shows their summed test time and
wall time; the whole suite stays green; `engines` reads `^22.13.0 || >=24`;
the README gains the two-tier strategy section.

Behavior: a developer runs the relocated family → it starts the local
boundaries on a plain HTTP server per test → the same requests get the same
answers faster, with no production build or Vite boot required by those tests.

### 2. Read, project, proof-record and landing boundary specs relocate
Type: Behavior
Status: planned
Proof: The 28 `authenticated-read-*` browserless files and the ~56 other
browserless files outside `agent-launch-*`, `agent-terminal-*` and
`cursor-*` run from `dashboard/tests/boundary/` in boundary mode; a scratch
edit to one read refusal fails only its boundary tests; `npm run
test:dashboard` is green.

Behavior: pre: these specs each boot Vite → trigger: relocation → result: the
same boundary behavior is proved per request without a browser or Vite.

### 3. Launch, terminal and Cursor boundary specs relocate
Type: Behavior
Status: planned
Proof: The 58 browserless `agent-launch-*`, 10 `agent-terminal-*` and the
browserless `cursor-*` files run in boundary mode, including the WebSocket
terminal attachments and the Cursor runner lifecycle; the mode loops in these
files are reduced to one serving mode pending slice 4; suite green.

Behavior: pre: launch and terminal boundary tests run twice under Vite →
trigger: relocation → result: each runs once at the boundary with the
synthetic hosts, terminal upgrades included.

### 4. Both serving modes mount the same boundaries, proved once
Type: Behavior
Status: planned
Proof: One spec starts a real dev server and a real preview server, sends the
same launch and read requests to each, and gets the same answers; no other
spec loops over serving modes (`grep` for the mode loop finds only this spec);
the test count attributable to mode repetition is gone from the proof record.

Behavior: pre: dev and preview equivalence is re-proved in 23 files → trigger:
the strategy's "prove common behavior once" → result: one proof owns it.

### 5. Production-watcher journeys share one build
Type: Behavior
Status: planned
Proof: `production-watcher*.spec.ts` and `production-cursor-runner.spec.ts`
start one watcher per file and step its states from its own output events;
their summed test time in a proof record is below 172 s (a third of 516 s);
each failure scenario still fails on a scratch regression of the watcher.

Behavior: pre: seven journeys each build production from scratch → trigger:
shared watcher with delta assertions → result: the same exclusions, updates,
failures and recovery are proved on one build chain.

### 6. Origin-publishing journeys share setup and assert deltas
Type: Behavior
Status: planned
Proof: The 41 files calling `publishLaunchJourney` in `beforeAll` share one
origin and preview server per file through the existing fixtures, with the
card's common shape asserted in one named test; single-test files of the same
journey merge where they share preconditions; `publishLaunchJourney` is
called at most once per remaining file; a scratch regression in a card
behavior fails exactly one test; the `agent-launch-*` browser family's
summed test time falls measurably from 1,483 s minus its relocated share.

Behavior: pre: siblings each publish an origin and re-assert common shape →
trigger: consolidation → result: one setup, one common proof, delta
assertions, same regression protection.

### 7. Presentation checks join their journeys
Type: Behavior
Status: planned
Proof: `dashboard-header.spec.ts`'s viewport and font matrix and the
`responsive-session-*`, `dashboard-columns-*` and `side-panel-*` checks are
each either one journey with a state change or a single cheapest layout proof;
the proof map names the replacement of every removed case; suite green.

Behavior: pre: static layout is asserted repeatedly across widths and fonts →
trigger: review under the strategy → result: the layout rule is proved once
where it is cheapest and the user journey keeps its state change.

### 8. Strategy published with measured result and proof map
Type: Behavior
Status: planned
Proof: `dashboard/tests/README.md` states the two tiers, placement rules,
synchronization rule, and how to add a test to each; a local full run at 8
workers finishes ≤ 380 s with every selected test passing; the hosted run of
the published revision shows summed browser-suite step time ≤ 1,244 s at
twelve shards; the proof record lists fewer than 900 browser-tier selections;
the proof map below lists every removed or relocated case.

Behavior: pre: baseline recorded → trigger: campaign complete → result: a
developer reads one strategy and sees the measured, mapped reduction.

## Current decisions

- Playwright is the runner for both tiers; boundary specs live in
  `dashboard/tests/boundary/` and keep the `.spec.ts` suffix so discovery and
  sharding are unchanged.
- The boundary server child runs under `node --experimental-transform-types
  --disable-warning=ExperimentalWarning`; `engines` becomes
  `^22.13.0 || >=24` in slice 1.
- `retries: 0`, worker counts, and shard counts stay as they are; no
  `longest-first` edit in this story.
- The proof map is recorded in this plan under `## Proof map`, one line per
  removed or relocated case with its replacement proof, as slices complete.

## Learnings

None yet.
