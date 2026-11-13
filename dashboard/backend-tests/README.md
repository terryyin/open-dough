# Dashboard Backend Test

Focused dashboard server and test-runtime tests live here, beside `../tests/`
and `../frontend-tests/`. They prove server behavior, its variants and
failures at stable public boundaries: HTTP, WebSocket, stored-file, command
and module boundaries, without a browser workflow. Use the shared
[MakeMe library](../../tests/README.md#test-data-architecture) for domain data.

Their collaborators are real: the dashboard server or its bundled boundary
server, real Git origins and the installed start. Only external boundaries
are substituted, and each spec names its substitutes: GitHub through the
synthetic `gh` and `FakeGitHub`, agent hosts through the synthetic `claude`,
`codex` and `cursor`, and the notification sender through the synthetic
`terminal-notifier`. A case that needs a browser to observe a product rule
stays an integrated journey in `../tests/`, and a presentation case belongs
in `../frontend-tests/`.

The test runtime's own contracts are proved here too, in `runtime/`: the
runners' reporter, selection, settings, output and cleanup, which run
Playwright itself on substitute specs (`../tests/fixtures/`), and the shared
page fixture's drain, settled-page wait and held-read observation, whose
boundary is a page the harness opens rather than a product workflow.

## Running

`npm run test:dashboard:backend` runs only this group from its own
configuration (`../backend.playwright.config.ts`). Its global setup
(`../tests/support/backendGlobalSetup.ts`) runs the fixture executables once,
gives the run a GitHub request root that admits no owner, and registers only
the artifacts backend specs request: the server bundle, the app build a
preview or static server serves, the installed start origins, the published
main sources and the story-columns history. A spec requesting any other run
artifact fails naming it. The run reads its own
`OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS`, keeps a failed run in `test-results/<start time>/` here, and
takes local full-suite admission only when unfiltered. Select files or tests
as with the umbrella, for example
`npm run test:dashboard:backend -- sessions/ --grep 'alert'`; a direct
`npx playwright test --config <repository>/dashboard/backend.playwright.config.ts`
behaves the same from any working directory.

Until CI switches to the separate groups, `npm run test:dashboard` still
selects these files exactly once beside the other two roots, with shared
setup and thirteen CI shards; their seconds stay in `../longest-first`.

## Placement

Every backend `*.spec.ts` and case-definition module belongs to one service
feature folder. Harness fixtures that several groups share stay in
`../tests/`. A check moved from an integrated journey keeps the feature
folder it had there and links the journey that still shows it on the page;
a module that registers cases moves with them. Choose the feature whose
behavior the test proves, irrespective of an older filename prefix. The
browser suite's [feature groups](../tests/feature-groups.md) reuse the same
domain vocabulary where it still names protected service behavior.

| Folder | Responsibility |
| --- | --- |
| `configuration/` | Project registration, machine settings, credentials and preferences. |
| `launches/` | Work initiation, startup choices, reconciliation and automatic triggers. |
| `sessions/` | Session discovery, status, recovery, completion, reports and history. |
| `terminals/` | Interactive attachment, input, dictation, resizing and reconnection. |
| `review/` | Story comparisons, diffs, commit ranges, landed runs and review marks. |
| `intent/` | Purpose browsing, Proof, CI judgments, timing and optimization candidates. |
| `observation/` | Published-source consistency, freshness, refresh and read recovery. |
| `runtime/` | Serving, production updates and test harness operation. |

The [dashboard test guide](../tests/README.md) owns test placement, external
boundaries, synchronization, prerequisites and failure handling. The
[shard guide](../tests/shards.md) owns the shared allocation and timing history.
