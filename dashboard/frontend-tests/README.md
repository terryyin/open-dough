# Dashboard Frontend Test

Frontend-only dashboard specs live here, beside `../tests/` and
`../backend-tests/`. They exercise DOM and built-frontend UI behavior with
explicit route/WebSocket service substitutes, without starting
`dashboardServer`, `fake-gh`, `fake-claude`, `fake-codex`, or `FakeGitHub`.

- DOM-only specs import `test` from `../tests/support/pageTest.ts` and use
  `page.setContent(...)`.
- Built-app UI specs import `test` from `../tests/support/frontendApp.ts`,
  which requests the run's shared app build, serves it as static files and installs
  substitutes from `../tests/support/frontendServiceSubstitutes.ts`.

Dashboard harness helpers and fixtures stay in `../tests/`. Use the shared
[MakeMe library](../../tests/README.md#test-data-architecture) for domain data.
With ten or fewer extracted files, the tree stays flat (this layout).
Integrated service journeys remain in `../tests/`.

All three roots run through `npm run test:dashboard`, with shared setup and
thirteen CI shards. Run only this suite with
`npm run test:dashboard -- frontend-tests/`.

The [dashboard test guide](../tests/README.md) owns placement across the three
roots; the [shard guide](../tests/shards.md) owns shared allocation and timing.
