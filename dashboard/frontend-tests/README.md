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

| Folder | Behavior |
| --- | --- |
| `configuration/` | Project setup, system settings, appearance and usage history. |
| `intent/` | Intent browsing, Proof, CI comparisons and timing history. |
| `launches/` | Launch choices, instructions, startup and launch recovery. |
| `navigation/` | Dashboard frame, header, board movement and destinations. |
| `review/` | Story review, comparisons and diffs. |
| `sessions/` | Session listings, status, completion and history. |
| `stories/` | Story content, notes and execution progress. |
| `terminals/` | Terminal attachment, input, selection and recovery. |
| `test-harness/` | Tests of browser measurement, touch and mount helpers. |

Reusable harness helpers and fixtures live in [Dashboard Test Support](../test-support/).
Use the shared [MakeMe library](../../Distribution/tests/README.md#test-data-architecture)
for domain data.

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

The mounted phone-board specs in `navigation/` render the production app with prepared
service answers in the browser. They deliver touch events directly, control
the transition and click-suppression clocks, and measure the real layout.
[`e2e/navigation/phone-board.spec.ts`](../../e2e/navigation/phone-board.spec.ts)
covers the published-project load, board gesture wiring, vertical reading and
the thin indicator's real hit target through the built app.

Each backend service family a built-app spec talks to has one substitute
module beside `frontendServiceSubstitutes.ts` in `../test-support/support/`
(settings, launches and attempts, transcription, session actions). It keeps
the answers as state the page's accepted requests change, records what the
page asked, and refuses, fails or holds one answer when a case needs to
observe recovery. Held answers go through `frontendSubstituteAnswers.ts`,
which releases any still held when the page's case ends. Arrange the project's
stories and machine reads through `frontendServiceState.ts`.

## Mounted dashboard support

Mounted board specs, such as the `stories/story-notes-*.mounted.spec.ts`
family, mount the production app through
[`mounted-dashboard/`](../test-support/mounted-dashboard/):
`mountAnsweredDashboard` answers the board's service requests from prepared
answers, and `mountDefaultDashboard` mounts the default board. Any unanswered
`/__` request fails the case by name, so a family answers every service its
board reads.

- Arrange data in Node through a command in
  `../test-support/support/mountedDashboardCommands.ts` (MakeMe and the
  service state import Node modules), and pass the result to the mount.
- Each service rule both engines answer from lives once, free of Playwright
  and Node, such as `frontendStoryNotesRule.ts` and
  `frontendStoryReviewRule.ts`; control and region names live once in
  `../test-support/*Names.ts`.
- Run every mount, input, `runFor` and held-answer release through
  `actSettled` in `mountedActInput.ts`, which settles React before the case
  observes the page. A page still changing after its round cap fails the
  case with `UnsettledPageError`, which names the cap.
- Only the next notes answer can be held, through `holdNextNotes`, to observe
  pending and recovery states. A second hold fails by name, and a hold still
  kept at cleanup is abandoned as an aborted request.
- The board's revision stream is unreachable, so the banner reads
  `disconnected` and the board reads project changes through its check
  schedule.
- A mount is not a reload: every mount clears `localStorage`, resets the board
  position and sets history to `/`, and carries from an earlier mount only the
  services passed in, such as its notes rule. One cleanup tears all mounts
  down and restores the page.

A case stays on a built-app page only when its behavior needs the real page:
a real page load or reload, native input the mount cannot deliver, or a live
socket, such as the attached terminal that Story notes must leave connected.

Representative workflows live in
[`../../e2e/`](../../e2e/README.md).

## Running the tests

`npm run test:dashboard:frontend` runs the full group. Specs named
`*.mounted.spec.ts` use Vitest browser mode with Playwright Chromium.
Retained specs use Playwright, whose setup prepares the app and comparison
mount builds on demand. Both engines share the group's worker limit and
`OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS` settings. The unfiltered local run takes full-suite admission.
Failed runs keep their output under `test-results/`.

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
