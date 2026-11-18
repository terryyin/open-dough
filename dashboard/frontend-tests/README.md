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
  `../../Distribution/tests/support/comparisonMountPage.ts` or take `comparisonRenderer`
  from `pageTest.ts`; they render actual components and CSS from prepared
  answers (`intent/`).

Each backend service family a built-app spec talks to has one substitute
module beside `frontendServiceSubstitutes.ts` in `../tests/support/`
(settings, launches and attempts, transcription, session actions). It keeps
the answers as state the page's accepted requests change, records what the
page asked, and refuses, fails or holds one answer when a case needs to
observe recovery. Held answers go through `frontendSubstituteAnswers.ts`,
which releases any still held when the page's case ends. Arrange the project's
stories and machine reads through `frontendServiceState.ts`.

Dashboard harness helpers and fixtures stay in `../tests/`. Use the shared
[MakeMe library](../../Distribution/tests/README.md#test-data-architecture) for domain data.
A spec moved from an integrated feature folder keeps that folder name here
(`intent/`, `configuration/`, `launches/`, `sessions/`), beside the specs extracted earlier at this root; a module that
registers cases for a spec moves with it. Representative workflows live in
[`../../e2e/`](../../e2e/README.md).

`npm run test:dashboard:frontend` runs the full group. Specs named
`*.mounted.spec.ts` use Vitest browser mode with Playwright Chromium.
Retained specs use Playwright, whose setup prepares the app and comparison
mount builds on demand. Both engines share the group's admission, worker limit
and `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS` settings. Failed runs keep their output under `test-results/`.

Select by file, `--grep`, or both, for example
`npm run test:dashboard:frontend -- intent/ --grep 'wording'`. A mounted
spec matches its physical filename and the filename without `.mounted`, so a
file filter continues to work as its cases move. Use `--list --reporter=line`
to see the selection. The direct command
`npx playwright test --config <repository>/dashboard/frontend.playwright.config.ts`
runs retained specs from any working directory and accepts Playwright-specific
options.

CI runs this group as its own producer, the `dashboard-frontend` job, and
publishes its cases under the **Dashboard Frontend Test** entry and the frontend test proof
artifact.

`.github/workflows/ci.yml` declares each group's shards.
