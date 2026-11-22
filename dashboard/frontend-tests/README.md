# Dashboard Frontend Test

Frontend-only dashboard specs live here, beside [Dashboard Test Support](../test-support/) and
`../backend-tests/`. They exercise DOM and built-frontend UI behavior with
explicit route/WebSocket service substitutes, without starting
`dashboardServer`, `fake-gh`, `fake-claude`, `fake-codex`, or `FakeGitHub`.

## Placement

Put every spec and every module that registers test cases inside the folder
for the behavior it proves. The `dashboard/frontend-tests/` root is reserved
for this README and generated test output.

Use an existing feature group whenever it covers the behavior. Add a folder
only for a distinct area that none of the existing groups covers.

| Folder           | Behavior                                                      |
| ---------------- | ------------------------------------------------------------- |
| `configuration/` | Project setup, system settings, appearance and usage history. |
| `intent/`        | Intent browsing, Proof, CI comparisons and timing history.    |
| `launches/`      | Launch choices, instructions, startup and launch recovery.    |
| `navigation/`    | Dashboard frame, header, board movement and destinations.     |
| `review/`        | Story review, comparisons and diffs.                          |
| `sessions/`      | Session listings, status, completion and history.             |
| `stories/`       | Story content, notes and execution progress.                  |
| `terminals/`     | Terminal attachment, input, selection and recovery.           |
| `test-harness/`  | Tests of browser measurement, touch and mount helpers.        |

Reusable harness helpers and fixtures live in [Dashboard Test Support](../test-support/).

## Frontend test fixtures

- DOM-only specs import `test` from [pageTest.ts](../test-support/support/pageTest.ts) and use
  `page.setContent(...)`.
- Built-app UI specs import `test` from [frontendApp.ts](../test-support/support/frontendApp.ts),
  which requests the run's shared app build, serves it as static files and installs
  substitutes from `../test-support/support/frontendServiceSubstitutes.ts`.
- Mounted production-component specs import `test` from
  [comparisonMountPage.ts](../test-support/support/comparisonMountPage.ts) or take `comparisonRenderer`
  from `pageTest.ts`; they render actual components and CSS from prepared
  answers (`intent/`).

The mounted phone-board specs in `navigation/` render the production Board
in its scroll frame with typed published work and session data. They use
Chromium touch and keyboard input and measure the rendered layout.
[`e2e/navigation/phone-board.spec.ts`](../../e2e/navigation/phone-board.spec.ts)
covers the published-project load, board gesture wiring, vertical reading,
the thin indicator's real hit target and a reload's kept column through the
built app.

Each backend service family a built-app spec talks to has one substitute
module beside `frontendServiceSubstitutes.ts` in `../test-support/support/`
(settings, launches and attempts, transcription, session actions). It keeps
the answers as state the page's accepted requests change, records what the
page asked, and refuses, fails or holds one answer when a case needs to
observe recovery. Held answers go through `frontendSubstituteAnswers.ts`,
which releases any still held when the page's case ends. Arrange the project's
stories and machine reads through `frontendServiceState.ts`.

## Which entry a case uses

Mount the component that owns the behavior, in a Vitest browser-mode spec,
with typed inputs. A component that reads a service through a hook reads it
from the page's typed reads, which the case supplies, such as story notes
through `pageReadsSupplying({ storyNotes })` from
`test-support/component-mount/unreadPageReads.ts`. Use native keyboard or
pointer input only where native input is the behavior. Build domain data with the page-loadable MakeMe entry
(`Distribution/tests/support/pageMakeMe.mjs`).

Mount the component alone through `mountComponent`
([`component-mount/`](../test-support/component-mount/mountComponent.ts)),
which knows no component; a component that cannot stand alone is made to.
Operate it through small page objects beside the specs, one per part of the
component, as the Project Intent revision cases
(`intent/intent-revision-*.spec.ts`) do with
`intent/intent-browser-page.ts` and its siblings.

Act as the reader does, as soon as the page allows it. Render and deliver
input directly, with `IS_REACT_ACT_ENVIRONMENT` unset, and wait only for what
the action changes through retrying assertions (`expect.element`,
`expect.poll`). A synchronous read follows a retrying assertion on the same
render. Locator input such as `userEvent.click` already waits until its
target can take it. The Project Intent revision cases
(`intent/intent-revision-*.spec.ts`) are the example: rendering and
clicking without a settle wait cut their summed time by about a fifth.

Story Notes is the reference family:
`stories/story-notes-dialog.spec.ts` mounts the dialog,
`stories/story-notes-control.spec.ts` mounts the control, and one
step in
[`e2e/terminals/agent-terminal-lifetime.spec.ts`](../../e2e/terminals/agent-terminal-lifetime.spec.ts)
proves notes beside an attached terminal. Its service rules are proved in
`../backend-tests/review/`.

Dashboard Test Support is frozen: new cases add only MakeMe builders to
`../test-support/`. The retained Playwright specs keep the page objects they
use until their folders move to this entry.

Give every case a literal title. The runner names and selects cases from
the titles Vitest reads without running the file. Share common steps in a
helper and declare each case with its own title.

A case stays on a built-app page only when its behavior needs the real page:
a real page load or reload or native input the mount cannot deliver.

Representative workflows live in
[`../../e2e/`](../../e2e/README.md).

## Running the tests

`npm run test:dashboard:frontend` runs the full group. Specs that import
`vitest` use Vitest browser mode with Playwright Chromium. Retained specs use
Playwright, whose setup prepares the app and comparison
mount builds on demand. Both engines share the group's worker limit and
`OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS` settings. The unfiltered local run takes full-suite admission.
Failed runs keep their output under `test-results/`.

Select by file, `--grep`, or both, for example
`npm run test:dashboard:frontend -- intent/ --grep 'wording'`. Use `--list --reporter=line`
to see the selection. The direct command
`npx playwright test --config <repository>/dashboard/frontend.playwright.config.ts`
runs retained specs from any working directory and accepts Playwright-specific
options.

CI runs this group as its own producer, the `dashboard-frontend` job, and
publishes its cases under the **Dashboard Frontend Test** entry and the frontend test proof
artifact.

`.github/workflows/ci.yml` declares each group's shards.
