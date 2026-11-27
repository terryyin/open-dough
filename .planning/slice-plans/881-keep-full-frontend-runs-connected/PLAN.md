# Keep full Dashboard frontend runs connected to their browser

**Identity:** SEED-413#keep-full-frontend-runs-connected

**Source:** [Keep full Dashboard frontend runs connected to their browser](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#keep-full-frontend-runs-connected)

## Goal and scope

Every full `npm run test:dashboard:frontend` run starts and reports every
selected file, locally and in CI. Find what closes the Vitest browser
orchestrator's connection and remove that cause. The seed's Scope and Key
examples are the acceptance source.

Excluded:

- Rerunning dropped files or whole runs as a fix.
- Reducing the two-worker parallelism or serializing the two Chromium
  instances without the coordinator's agreement.
- Spec content, test selection, and the backend group.
- Renderer memory growth, unless the diagnosis shows it causes the closure.

## Current findings

Read at `32c1b08a1`, with Vitest 5.1.0, `@vitest/browser` 5.1.0,
`@vitest/browser-playwright` 5.1.0, Vite 8.3.8 and Playwright 1.65.0. The
worktree resolves `node_modules` from the integration checkout.

- `scripts/test-frontend.mjs` runs the group through
  `dashboard-group-run.mjs`. `prepareVitest` in
  `dashboard/test-support/support/groupVitest.mjs` calls
  `vitest.standalone()` and then `runTestSpecifications`.
  `dashboard/frontend.vitest.config.mts` declares two Chromium instances,
  `chromium` and `chromium-desktop`, with `isolate: true`.
- The reported error is raised by `@vitest/browser`'s WebSocket `close`
  handler (`dist/index.js:3091–3101`). That handler rejects the
  orchestrator's pending `createTesters` with `BrowserConnectionError`
  (`VITEST_BROWSER_CONNECTION_CLOSED`). The same module has a ping heartbeat
  that would first close the RPC with its own "did not respond to a
  heartbeat ping" error. The serialized code shows that the heartbeat did not
  fire first, so the socket closed from the browser side or the network
  layer.
- When the HMR socket of a page whose document is not unloading disconnects,
  Vite's client (`vite/dist/client/client.mjs:1076–1083`) logs `[vite] server
  connection lost. Polling for restart...` and then calls `location.reload()`
  once the server answers a ping. If the orchestrator page reloads, that
  would close its Vitest socket. The seed records the "server connection
  lost" line about 150 ms after a tester connected.

## Current decisions

- Execute in Trunk Mode or Story Branch Mode as the coordinator selects. No
  slice acts from trunk.
- Accept no fix that hides a closure (retries, reruns, swallowed errors). The
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written.
- Wall-time comparisons are relative and use the same host under similar
  load. Record load averages with every timed run.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The run stops because the orchestrator's Vitest socket closes, not because the heartbeat terminates it | Slice 1's instrumentation target | CI job `140371568061` (main run `45958801316`, `20c08633f`, 2026-11-27): `330 passed (331)` with `VITEST_BROWSER_CONNECTION_CLOSED` from the close handler at `@vitest/browser/dist/index.js:3101`, matching the installed 5.1.0 source read at `32c1b08a1` | Settled. The closer is on the browser or socket side. |
| The closure reproduces locally at two workers under ordinary load | Slice 1's reproduction | Seed evidence (2026-11-27): five of eight full runs stopped after 201–300 of 331 files. Baseline `67d52b5fa` stopped in one of its two runs. | Settled for that day's checkout. Slice 1 re-observes on the execution revision. |
| What closes the orchestrator socket (for example a Vite HMR disconnect that reloads the page, an upgrade refused by the Vitest or Vite server, or a navigation in the orchestrator) | Slice 2's fix | Open. Reaching it needs repeated full runs (about 10 minutes each) with browser and Vitest debug output. | Bounded by early probe slice 1. Slice 2 cannot start without its named cause. |

## Ordered slices

### 1. Name what closes the orchestrator connection

Type: Behavior (early probe)
Status: planned

Behavior: A full local frontend run at two workers stops with
`VITEST_BROWSER_CONNECTION_CLOSED` → the retained diagnostic output names the
event that closed the orchestrator socket and what triggered it. Examples
are the orchestrator page's navigations and reloads, its Vite HMR socket
closes, and refused upgrades on the Vite HTTP server. Each is timed against
`[vitest]` connect and disconnect debug lines.

Proof: Scratch instrumentation in the owned workspace only: `DEBUG=vitest:browser*,pw:browser`,
the Chromium console of the orchestrator and tester pages, and, if needed,
a temporary logging edit in `groupVitest.mjs`. Repeat full runs until a
closure reproduces, at most eight. Record in this plan the literal command,
the revision, load averages, the run that reproduced, and the decisive log
excerpt. Revert every scratch edit before recording or committing. If eight
runs give no closure, or the output cannot name the closer, stop. Slice 2
does not start, and the plan returns for replanning with that evidence.

### 2. Full frontend runs finish every file

Type: Behavior
Status: planned

Behavior: The full frontend group runs at two workers under ordinary local
load and in CI → every file starts and reports. A file with a failing test is
reported failed while every other file runs. A connection that really drops
still fails the run and names the file that never ran.

Proof:

- Remove the cause slice 1 names. Change the runner, config, or test
  support only as that cause requires.
- When the cause lives in this repository's runner or config and a focused
  check can discriminate it, add one that fails without the fix. Otherwise
  the repeated full runs below are the proof, and the plan records why no
  focused check can discriminate it.
- Run eight consecutive full local runs at two workers. Each reports all
  files, and wall times stay within the noise of slice 1's runs at
  comparable load.
- Make one scratch observation that a failing assertion in one file leaves
  the other files running.
- Make one scratch observation that killing a Chromium renderer mid-run
  fails the run and names the unstarted file. Revert both scratch edits.
- The publication's CI `dashboard-frontend` job reports every file.

## Proof ownership and local gate

| Promise (seed Key example) | Owner | Observation |
| --- | --- | --- |
| Eight consecutive full local runs each start and report every file | Slice 2 | Eight timed full runs with load averages, compared with slice 1's runs |
| CI's single shard reports every file | Slice 2 | The publication's `dashboard-frontend` CI job |
| A failing file is reported while other files still run | Slice 2 | Scratch failing assertion, reverted |
| A real connection drop fails the run and names the unstarted file | Slice 2 | Scratch renderer kill, reverted |
| Two-worker parallelism and wall time preserved | Slice 2 | Same timed runs, unchanged `--workers` |

Local gate: run the full frontend group under `caffeinate -s -i` with
Homebrew bash 5, from a fully awake machine on AC power (per `AGENTS.md`),
with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
These long runs are the story's proof, not an extra gate. Before launching
them, apply
[choose expensive proof before launch](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#choose-expensive-proof-before-launch).
Record host load and competing worktree runs, and do not run alongside
another heavy suite on the same host. If slice 2 changes shared runner code
(`groupVitest.mjs` or `dashboard-group-run.mjs`), the backend group shares
that path. Run its full local suite once before publishing.

North Star: [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
The fix keeps the frontend group on Vitest Browser Mode and adds no
Playwright test runner or test-support wrapper.
[Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
also applies. Any runner change only narrows or removes code. No new test
support is added.

## Plan review

Refinement was not needed. There are two slices. Each has one outcome and
one proof loop, and slice 2 depends on slice 1's finding.

This review found no slice-specific concern beyond the open closer premise,
and early probe slice 1 bounds that premise. Slice 2's approach and size
follow from the cause slice 1 names. If the cause is in Vitest or Vite itself
and needs a workaround or an upgrade, the plan returns for replanning with
slice 1's evidence, under
[slice sizing](../../../.agents/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices).
