# E2E Test

Representative Open Dough product workflows live here: each starts from a
supported entry point, crosses the participating components and asserts an
observable product outcome. The dashboard page is the common entry point; a
workflow beginning elsewhere, such as a command an installed project runs,
belongs here too when its outcome needs the same real components.

## Real and substituted

What is real in every workflow: the built dashboard served by its own
preview (or development) server, the server's local read boundaries and
backlog interpretation, real Git repositories and origins, the files the
dashboard keeps under HOME, and the processes it launches.

What is substituted, and only at the product's external boundaries:

- GitHub, through the synthetic `gh` (`../dashboard/tests/fixtures/fake-gh`)
  answering from each test's own fake GitHub
  (`../dashboard/tests/support/fakeGitHub.ts`), which also stands in for
  GitHub's avatar host;
- the native agent hosts, through the synthetic `claude`, `codex` and
  `cursor` protocol stand-ins
  ([native-host fixtures](../dashboard/tests/native-host-fixtures.md)). They
  keep these workflows deterministic; they are not native skill-use
  acceptance, which remains with
  [ADR 0005](../docs/adrs/0005-cross-tool-validation-accepted.md);
- production deployments, through the watcher chains' own deployment
  fixtures (`runtime/production-watcher*.spec.ts`).

These hold for every workflow here; a spec's header names any boundary it
adds or replaces, such as a held answer, an injected fault or a second server.

## Placement

A workflow goes in `<feature>/<workflow>.spec.ts` under the
[feature folder](../dashboard/tests/feature-groups.md) whose behavior it
proves; a module that registers its cases lives beside it. A check whose
assertions are presentation, interaction or UI-recovery details that
controlled answers can supply belongs in
[Dashboard Frontend Test](../dashboard/frontend-tests/README.md); a server
variant, failure or test-runtime contract at a stable boundary belongs in
[Dashboard Backend Test](../dashboard/backend-tests/README.md). Specs still in
`../dashboard/tests/` are the interim **Dashboard Integrated UI Test** group
(`npm run test:dashboard:integrated`): detailed UI checks, or mixed specs,
awaiting that conversion. Workflows reuse the dashboard's fixtures, page objects and
[MakeMe builders](../tests/README.md#test-data-architecture) from
`../dashboard/tests/` and `../tests/support/`; follow
[journey writing](../dashboard/tests/writing-journeys.md) for waits, clocks
and fake GitHub answers.

## Running

`npm run test:e2e` runs only this group from its own configuration
(`playwright.config.ts`). Its global setup
(`../dashboard/tests/support/e2eGlobalSetup.ts`) runs the fixture executables
once, gives the run a GitHub request root that admits no owner, and registers
the artifacts workflows request: the app build, the server bundle, the
installed start origins, the published main sources and the story-columns
history. The serial production chains queue first as the
`chromium-deployments` project beside the `chromium` rest. The run reads its
own `OPEN_DOUGH_E2E_SPLIT`, `_TIMES`, `_PROOF_RECORD` and `_DEADLINE_MS`,
keeps a failed run in `test-results/<start time>/` here, and takes local
full-suite admission only when unfiltered. Select files or tests as usual,
for example `npm run test:e2e -- launches/ --grep 'Start'`; a direct
`npx playwright test --config <repository>/e2e/playwright.config.ts` behaves
the same from any working directory. Its listing, times and duration list
(`longest-first`) name specs relative to this directory; proof records name
them as `e2e/<path>`.

CI runs this group as its own producer, the `e2e` job's shards
([CI shards](../dashboard/tests/shards.md)), and publishes their cases under
the **E2E Test** entry (`e2e`). Its shard count, settings and duration list
change without touching the other groups'.
