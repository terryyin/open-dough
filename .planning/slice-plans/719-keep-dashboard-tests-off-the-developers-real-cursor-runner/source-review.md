# Source-only review

The fresh, no-history Codex agent `/root/source_review` received only the
selected seed's Goal, observed defect, Scope, key examples, and Scope limits
as transcribed in its launch in this execution's conversation. It was asked
to read no other project files and change nothing. Its numbered return is
retained below with the coordinator's allocation.

For 6–11, each named entry starts with its own disposable `HOME` under
`tmpdir()`, which `homedir()` observes in an executing case that leaves
`HOME` alone. For 12–23, the conditions apply wherever the phase occurs.

The reviewer identified the prior Vite configuration and its
`POST /release-handoffs` and `GET /sessions` requests as defect context.
Publishing the ephemeral port only through `cursor-runner.json` explains
the isolation mechanism. The typed-handler changes belong to SEED-413.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | `createComparisonRenderer` compiles comparison markup. | slice 1 | observed: slice 1 plan proof at 7ce5da1c7 and the comparison renderer regression case |
| 2 | Starting the renderer leaves the Dashboard’s local server boundaries unmounted. | slice 1 | observed: slice 1 plan proof at 7ce5da1c7 and the comparison renderer regression case |
| 3 | With a live runner address in `HOME`’s `cursor-runner.json`, starting and closing the renderer sends zero requests to that runner. | slice 1 | observed: slice 1 plan proof at 7ce5da1c7 and the comparison renderer regression case |
| 4 | That journey creates no files under `incidents/`. | slice 1 | observed: slice 1 plan proof at 7ce5da1c7 and the comparison renderer regression case |
| 5 | That journey creates no `projects-development.json`. | slice 1 | observed: slice 1 plan proof at 7ce5da1c7 and the comparison renderer regression case |
| 6 | Playwright backend through `runnerConfig.mjs`. | slice 2 | observed: seed-412-home-proof-runner.log, backend npm setup, spec load and worker rows |
| 7 | Playwright frontend through `runnerConfig.mjs`, including the retained Playwright spec in a mixed frontend run. | slice 2 | observed: seed-412-home-proof-runner.log, frontend direct and both mixed frontend retained workers |
| 8 | Playwright e2e through `runnerConfig.mjs`. | slice 2 | observed: seed-412-home-proof-runner.log, e2e npm setup, spec load and worker rows |
| 9 | Playwright `--list` through `runnerConfig.mjs`, including discovery even though no cases execute. | slice 2 | observed: seed-412-home-proof-runner.log, backend, frontend and e2e direct --list spec-load rows |
| 10 | Standalone Vitest Browser Mode through `dashboard/frontend.vitest.config.mts`. | slice 2 | observed: seed-412-home-proof-runner.log, standalone Vitest browser command via --configLoader runner |
| 11 | Vitest Browser Mode invoked by `scripts/test-frontend.mjs`, including a `.mounted.spec.ts` in a mixed frontend run. | slice 2 | observed: seed-412-home-proof-runner.log, both mixed frontend mounted browser command rows |
| 12 | The run installs its disposable `HOME` before global setup begins. | slice 2 | observed: seed-412-home-proof.mjs, runLifecycle observation and inspect assertion for global setup load |
| 13 | The run installs its disposable `HOME` before workers load. | slice 2 | observed: seed-412-home-proof-runner.log, same distinct home on Playwright main and different worker PIDs |
| 14 | The run installs its disposable `HOME` before test modules load. | slice 2 | observed: seed-412-home-proof-runner.log, spec load rows in actual test and listing launches |
| 15 | Workers inherit the disposable `HOME`. | slice 2 | observed: seed-412-home-proof-runner.log, retained and independent Playwright worker rows |
| 16 | Vitest browser commands inherit the disposable `HOME`. | slice 2 | observed: seed-412-home-proof.mjs, disposableHomeProof registered command and inspect assertions |
| 17 | Spawned test children inherit the disposable `HOME`, including Git, shell fakes, and spawned servers. | slice 2 | observed: seed-412-home-proof.mjs, Node child HOME and Git config marker assertions plus mounted-boundary-server.spec.ts worker and child recovery case |
| 18 | When `PLAYWRIGHT_BROWSERS_PATH` is unset, the run resolves it using the pre-change home before switching `HOME`. | slice 2 | observed: seed-412-home-proof-runner.log, pre-change home cache path in default Playwright, direct Vitest and mixed runs |
| 19 | When `PLAYWRIGHT_BROWSERS_PATH` is already set, the supplied value is preserved. That follows from Scope’s qualification “when unset.” | slice 2 | observed: seed-412-home-proof-runner.log, explicit mixed registry path observed in both engines |
| 20 | Chromium launches from the preserved browser cache in the executing journey. | slice 2 | observed: seed-412-home-proof.mjs, browser connected assertion and Chromium executing Vitest command |
| 21 | The owning run removes its disposable home when it exits. | slice 2 | observed: seed-412-home-proof.mjs, inspect asserts each observed home absent on normal command exit |
| 22 | In the mixed `scripts/test-frontend.mjs` journey, the retained Playwright spec and `.mounted.spec.ts` Vitest spec use distinct run-owned homes. | slice 2 | observed: seed-412-home-proof-runner.log, distinct home values and two live directories during both mixed retained workers |
| 23 | In that mixed journey, each runner removes only its own home, leaving the other runner’s home available while that runner is active. | slice 2 | observed: seed-412-home-proof-runner.log, both mixed sequences show only the live Vitest home after Playwright exits and inspect verifies exit cleanup |
| 24 | The dashboard test processes leave the developer’s real home data unread, including the real Dashboard configuration, credentials, and session records, subject to the story’s explicit use of the preserved browser cache. | slice 2 | observed: runnerConfig.mjs before setup, Vitest config before test startup, synthetic Cursor address and Git marker unread by tested workers and child processes |
| 25 | The dashboard test processes leave the developer’s real home data unwritten. | slice 2 | observed: seed-412-home-proof.mjs, inspect asserts seeded address bytes and invoking home entries unchanged |
| 26 | With a logging listener configured in the invoking home’s `.open-dough/dashboard/cursor-runner.json`, `readCursorRunnerAddress()` returns `undefined` in a Playwright backend, frontend, or e2e case or a Vitest Browser Mode case that leaves `HOME` alone. | slice 2 | observed: seed-412-home-proof-runner.log, runner:null in all Playwright worker and Vitest command observations |
| 27 | The outer logging listener receives zero requests during that journey. | slice 2 | observed: seed-412-home-proof.mjs, logging listener and inspect zero requests assertion |
| 28 | A spec or fixture that chooses its own scratch home keeps that home during the case. Scope identifies `dashboardServer.ts` and explicit `process.env.HOME` assignment as examples. | slice 2 | observed: seed-412-home-proof.mjs, explicit fixture-home visible to worker and child; mounted-boundary-server.spec.ts, worker and child recovery case |
| 29 | Restoring `process.env.HOME` after the explicit override returns it to the run’s disposable home. | slice 2 | observed: seed-412-home-proof.mjs, explicit override finally and restored homedir assertion |
| 30 | The change adds zero wrapper files to `dashboard/test-support/`. | slice 2 | observed: Slice 2 Git diff adds no test-support paths |
| 31 | The minimal framework-startup code for `HOME` and `PLAYWRIGHT_BROWSERS_PATH` stays in the existing `runnerConfig.mjs` and `dashboard/frontend.vitest.config.mts`. | slice 2 | observed: Slice 2 Git diff confines setup to runnerConfig.mjs and frontend.vitest.config.mts |
| 32 | Production `homedir()` defaults remain as specified by ADR 0008. | slice 2 | observed: Slice 2 Git diff leaves production files untouched, including runnerPaths.ts and machineHome.ts under ADR 0008 |
| 33 | The change introduces no test-support firewall framework. Scope limits identify the dropped canary server, `NODE_OPTIONS --import` TCP preload, listener registry, and custom Chromium CONNECT proxy. | slice 2 | observed: Slice 2 Git diff contains environment setup and exit cleanup only |
