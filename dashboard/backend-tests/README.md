# Dashboard Backend Test

Browser-free dashboard tests live here, beside `../tests/` and
`../frontend-tests/`. They exercise HTTP, WebSocket, stored-file, command and
module boundaries. Use the shared
[MakeMe library](../../tests/README.md#test-data-architecture) for domain data.

All three roots run once through `npm run test:dashboard`, with the same global
setup, build and thirteen CI shards. Run only this suite with
`npm run test:dashboard -- backend-tests/`.

Every backend `*.spec.ts` and case-definition module belongs to one service
feature folder. Harness fixtures that several features share stay in
`../tests/`. The inventory below names each group; choose the feature whose
behavior the test proves, irrespective of an older filename prefix. The browser
suite's [feature groups](../tests/feature-groups.md) reuse the same domain
vocabulary where it still names protected service behavior.

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
