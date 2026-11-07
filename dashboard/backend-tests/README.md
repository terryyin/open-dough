# Dashboard Backend Test

Browser-free dashboard tests live here, beside `../tests/` and
`../frontend-tests/`. They exercise HTTP, WebSocket, stored-file, command and
module boundaries. Shared fixtures remain in `../tests/`.

All three roots run once through `npm run test:dashboard`, with the same global
setup, build and twelve CI shards. Run only this suite with
`npm run test:dashboard -- backend-tests/`.

The [dashboard test guide](../tests/README.md) owns test placement, external
boundaries, synchronization, prerequisites and failure handling. The
[shard guide](../tests/shards.md) owns the shared allocation and timing history.
