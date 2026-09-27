# Dashboard browser tests

This directory holds the dashboard's one Playwright suite, run from the
repository root with `npm run test:dashboard`. Every run builds the app once; each page
journey (`dashboardTest.ts`) then serves that build from its own
preview server with a synthetic `gh` on its PATH (`fixtures/fake-gh`)
that answers from the test's own fake GitHub (`support/fakeGitHub.ts`,
published through `publishedOrigin.ts` or
`committedOrigin.ts`), which can also fail, hold, or rate-limit an
answer. The same fake stands in for GitHub's avatar host, from which the
server fetches credited humans' avatars (`avatarAnswers.ts`). Only GitHub's
answers are replaced; the
local read boundary, the `gh` invocation, reading, the shared backlog
interpretation, and the page are the real ones, and a browser request to
GitHub itself fails the test. The boundary specs
(`authenticated-read-*.spec.ts`) and
`authenticated-project-overview.spec.ts` also start their own dev and
built-preview servers. Every server binds a port the operating system
chooses, so the suite can run beside another checkout's suite on the same
machine, and a server that cannot start fails its test with its own output
(`support/dashboardServer.ts`). Nothing here ever calls the real `gh` CLI or contacts
GitHub. Select one journey with, for example,
`npm run test:dashboard -- --grep 'published overview'` or
`npm run test:dashboard -- --grep 'authenticated project overview'`.

A passing run prints nothing (`support/quietReporter.ts`). A failing
spec is shown with its error, output, and retained trace; a passing spec that
writes output, or output from the run itself such as global setup, fails the
run and is shown. Keep specs and their helpers silent.

The automatic-freshness journeys (`auto-refresh*.spec.ts`) pause the
page's clock and step it with the helpers in `autoRefreshJourney.ts`, so
the 15-second pace, the 30-second target, hidden-page pauses, and a rate
limit's directed wait are observed in page time; they read the fake GitHub's
`gh` call log to prove what was and was not asked. Assert that no `gh` call
was made only after real network turns (`checksAskedWhilePassing`, or
`expect.poll`), and give each scenario its own revisions: the boundary answers
a repeated pinned revision from memory without calling `gh`.
