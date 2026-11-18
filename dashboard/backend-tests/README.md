# Dashboard Backend Test

Focused dashboard server and test-runtime tests live here, beside [Dashboard Test Support](../test-support/)
and `../frontend-tests/`. They prove server behavior, its variants and
failures at stable public boundaries: HTTP, WebSocket, stored-file, command
and module boundaries, without a browser workflow. Use the shared
[MakeMe library](../../Distribution/tests/README.md#test-data-architecture) for domain data.

Their product collaborators are the boundary under test, real Git origins,
and the installed start. Only external boundaries are substituted, and each
spec names its substitutes: GitHub through the synthetic `gh` and
`FakeGitHub`, agent hosts through the synthetic `claude`, `codex` and
`cursor`, and the notification sender through the synthetic
`terminal-notifier`. A case that needs a browser to observe a product rule
belongs to a representative workflow in [`../../e2e/`](../../e2e/README.md),
and a presentation case in `../frontend-tests/`.

## Which entry a case uses

Prove the boundary the server mounts, in this process. Call that boundary's
exported install, mounted on an HTTP server the test owns
(`../test-support/support/inProcessBoundaryHttp.ts`). The authenticated-read
fixture (`../test-support/support/inProcessAuthenticatedRead.ts`) is that mount
with a private `HOME` and a synthetic `gh`. The request stays a loopback
HTTP request, so origin refusal, status, body, and response headers are the
boundary's. Give the process the private `HOME` and the synthetic hosts the
case names. A case that needs a clean slate installs a new boundary. One
install shared across cases is a choice, as one server shared across cases
is today.

Start the live server (`../test-support/support/dashboardServer.ts`,
`startDashboardServer`) when the proof is a property that install does not
have:

- a separate process: its environment, a preload, a pid, a signal, a
  process group, or that a child did or did not start, including a restart
  that must be a new process
- a connection the handler does not own: a WebSocket upgrade, a stream held
  open on the socket, or the server closing while that connection is up
- the server program: that dev, preview, and the boundary server mount the
  same boundaries, or how that process reports its address and closes

A launch or terminal case uses the live server only for one of those
proofs. Its request result, the files it writes, and whether a host ran are
the boundary plus the machine directory.

A lower function is the entry when its result is the whole fact the case
adds, and a boundary case already covers the admission once. The function
needs a stable domain result, such as whether a path matches a declared
location. A case whose facts are a status, a body, or that a host was not
asked stays on the boundary. Looking below the boundary is the usual result
of making a suite cheaper. A faster call that drops the admission is a
different case.

Bringing existing live-server cases across to this entry is
[Reach dashboard backend checks through the mounted boundary](../../.planning/seeds/SEED-403-reach-dashboard-backend-checks-through-the-mounted-boundary.md#reach-dashboard-backend-checks-through-the-mounted-boundary).

The test runtime's own contracts are proved here too, in `runtime/`: the
runners' reporter, selection, settings, output and cleanup, which run
Playwright itself on substitute specs (`../test-support/fixtures/`), and the shared
page fixture's drain, settled-page wait and held-read observation, whose
boundary is a page the harness opens rather than a product workflow.

## Running

`npm run test:dashboard:backend` runs only this group from its own
configuration (`../backend.playwright.config.ts`). Its global setup
(`../test-support/support/backendGlobalSetup.ts`) runs the fixture executables once,
gives the run a GitHub request root that admits no owner, and registers only
the artifacts backend specs request: the server bundle, the app build a
preview or static server serves, the installed start origins, the published
main sources and the story-columns history. A spec requesting any other run
artifact fails naming it. The run reads its own
`OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS`, keeps a failed run in `test-results/<start time>/` here, and
takes local full-suite admission only when unfiltered. Select files or tests
as with any group, for example
`npm run test:dashboard:backend -- sessions/ --grep 'alert'`; a direct
`npx playwright test --config <repository>/dashboard/backend.playwright.config.ts`
behaves the same from any working directory.

CI runs this group as its own producer, the `dashboard-backend` job's shards
(`.github/workflows/ci.yml`), and publishes its cases under the
**Dashboard Backend Test** entry.

## Placement

Every backend `*.spec.ts` and case-definition module belongs to one service
feature folder. Choose the feature whose behavior the test proves,
irrespective of an older filename prefix. Harness fixtures that several
groups share stay in Dashboard Test Support. The browser suite's feature folders reuse
the same domain vocabulary where it still names protected service behavior.

| Folder | Responsibility |
| --- | --- |
| `configuration/` | Project registration, machine settings, credentials and preferences. |
| `launches/` | Work initiation, startup choices, reconciliation and automatic triggers. |
| `sessions/` | Session discovery, status, recovery, completion, reports and history. |
| `terminals/` | Interactive attachment, input, dictation, resizing and reconnection. |
| `review/` | Story comparisons, diffs, commit ranges and landed runs. |
| `intent/` | Purpose browsing, Proof, CI judgments, timing and optimization candidates. |
| `observation/` | Published-source consistency, freshness, refresh and read recovery. |
| `runtime/` | Serving, production updates and test harness operation. |
