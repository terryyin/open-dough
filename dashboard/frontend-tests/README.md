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

- Mounted production-component specs import `test` from
  `../../tests/support/comparisonMountPage.ts` or take `comparisonRenderer`
  from `pageTest.ts`; they render actual components and CSS from prepared
  answers (`intent/`).

Dashboard harness helpers and fixtures stay in `../tests/`. Use the shared
[MakeMe library](../../tests/README.md#test-data-architecture) for domain data.
A spec moved from an integrated feature folder keeps that folder name here
(`intent/`), beside the specs extracted earlier at this root; a module that
registers cases for a spec moves with it. Representative workflows live in
[`../../e2e/`](../../e2e/README.md).

`npm run test:dashboard:frontend` runs only this group from its own
configuration (`../frontend.playwright.config.ts`): its global setup prepares
only the app and comparison mount builds (`../tests/support/frontendGlobalSetup.ts`),
it reads its own `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT`, `_TIMES`,
`_PROOF_RECORD` and `_DEADLINE_MS`, keeps a failed run in
`test-results/<start time>/` here, and takes local full-suite admission only
when unfiltered. Select files or tests as with any group, for example
`npm run test:dashboard:frontend -- intent/ --grep 'wording'`; a direct
`npx playwright test --config <repository>/dashboard/frontend.playwright.config.ts`
behaves the same from any working directory.

CI runs this group as its own producer, the `dashboard-frontend` job, dealt
by its own duration list (`../frontend.longest-first`), and publishes its
cases under the **Dashboard Frontend Test** entry and the frontend test proof
artifact.

The [dashboard test guide](../tests/README.md) owns placement across the
roots; the [shard guide](../tests/shards.md) owns each group's allocation and
timing.
